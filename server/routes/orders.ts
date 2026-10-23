import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { orders, invoices, products, emailLogs } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { broadcastSSE } from '../sse.js';
import { sendOrderStatusEmail } from '../email.js';

const router = Router();

// GET /api/orders - list all orders for vendor
router.get('/', async (_req: Request, res: Response) => {
  try {
    const allOrders = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        buyerName: orders.buyerName,
        buyerPhone: orders.buyerPhone,
        buyerEmail: orders.buyerEmail,
        deliveryNote: orders.deliveryNote,
        items: orders.items,
        totalAmount: orders.totalAmount,
        stage: orders.stage,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        invoice: {
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          status: invoices.status,
          issuedAt: invoices.issuedAt,
          paidAt: invoices.paidAt,
        },
      })
      .from(orders)
      .leftJoin(invoices, eq(orders.id, invoices.orderId))
      .orderBy(desc(orders.createdAt));

    res.json(allOrders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to retrieve orders' });
  }
});

// GET /api/orders/track - buyer phone lookup
router.get('/track', async (req: Request, res: Response) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ error: 'Phone number parameter required' });
    }

    const cleanPhone = String(phone).trim();
    const matchedOrders = await db
      .select({
        id: orders.id,
        orderNumber: orders.orderNumber,
        buyerName: orders.buyerName,
        buyerPhone: orders.buyerPhone,
        buyerEmail: orders.buyerEmail,
        deliveryNote: orders.deliveryNote,
        items: orders.items,
        totalAmount: orders.totalAmount,
        stage: orders.stage,
        createdAt: orders.createdAt,
        updatedAt: orders.updatedAt,
        invoice: {
          id: invoices.id,
          invoiceNumber: invoices.invoiceNumber,
          status: invoices.status,
          issuedAt: invoices.issuedAt,
          paidAt: invoices.paidAt,
        },
      })
      .from(orders)
      .leftJoin(invoices, eq(orders.id, invoices.orderId))
      .where(eq(orders.buyerPhone, cleanPhone))
      .orderBy(desc(orders.createdAt));

    // Fetch related email logs for transparency
    const orderIds = matchedOrders.map(o => o.id);
    let logs: any[] = [];
    if (orderIds.length > 0) {
      logs = await db.select().from(emailLogs).orderBy(desc(emailLogs.sentAt));
    }

    const enriched = matchedOrders.map(order => ({
      ...order,
      emailLogs: logs.filter(l => l.orderId === order.id),
    }));

    res.json(enriched);
  } catch (error) {
    console.error('Error tracking orders:', error);
    res.status(500).json({ error: 'Failed to look up orders' });
  }
});

// GET /api/invoices - list all invoices
router.get('/invoices', async (_req: Request, res: Response) => {
  try {
    const allInvoices = await db
      .select({
        id: invoices.id,
        invoiceNumber: invoices.invoiceNumber,
        status: invoices.status,
        issuedAt: invoices.issuedAt,
        paidAt: invoices.paidAt,
        order: {
          id: orders.id,
          orderNumber: orders.orderNumber,
          buyerName: orders.buyerName,
          buyerPhone: orders.buyerPhone,
          buyerEmail: orders.buyerEmail,
          deliveryNote: orders.deliveryNote,
          items: orders.items,
          totalAmount: orders.totalAmount,
          stage: orders.stage,
        },
      })
      .from(invoices)
      .leftJoin(orders, eq(invoices.orderId, orders.id))
      .orderBy(desc(invoices.issuedAt));

    res.json(allInvoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to retrieve invoices' });
  }
});

// POST /api/orders - checkout and generate DRAFT invoice
router.post('/', async (req: Request, res: Response) => {
  try {
    const { buyerName, buyerPhone, buyerEmail, deliveryNote, items } = req.body;

    if (!buyerName || !buyerPhone || !buyerEmail || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Missing required order fields or empty cart' });
    }

    const totalAmount = items.reduce((sum: number, it: any) => sum + (it.unitPrice * it.quantity), 0);
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    const { order, invoice } = await db.transaction(async (tx) => {
      const [newOrder] = await tx.insert(orders).values({
        orderNumber,
        buyerName,
        buyerPhone,
        buyerEmail,
        deliveryNote: deliveryNote || 'Standard Meetup/Inspection',
        items,
        totalAmount,
        stage: 'OrderInitiation',
      }).returning();

      const [newInvoice] = await tx.insert(invoices).values({
        invoiceNumber,
        orderId: newOrder.id,
        status: 'DRAFT',
      }).returning();

      return { order: newOrder, invoice: newInvoice };
    });

    // Send confirmation email / log
    await sendOrderStatusEmail({
      orderId: order.id,
      recipientEmail: buyerEmail,
      subject: `Order Initiated: ${order.orderNumber} - Dawa Equips Invoice Draft`,
      html: `
        <div style="font-family: sans-serif; color: #1A1110; max-width: 600px;">
          <h2 style="color: #1A1110; border-bottom: 2px solid #D4AF37; padding-bottom: 8px;">Order Confirmation #${order.orderNumber}</h2>
          <p>Dear ${buyerName},</p>
          <p>Thank you for initiating your order with <strong>Dawa Equips</strong>. We have generated a <strong>DRAFT Order Invoice</strong> (${invoice.invoiceNumber}).</p>
          <p>Our team will contact you via <strong>${buyerPhone}</strong> to confirm appliance inspection and delivery arrangements.</p>
          <div style="background: #FDFBF7; border: 1px solid #D4AF37; padding: 12px; border-radius: 4px; margin: 16px 0;">
            <p><strong>Total Amount:</strong> KES ${totalAmount.toLocaleString()}</p>
            <p><strong>Delivery Note:</strong> ${order.deliveryNote}</p>
          </div>
          <p style="color: #666; font-size: 12px;">Track your order progress anytime at our storefront using your phone number.</p>
        </div>
      `,
    });

    broadcastSSE('order:updated', { order, invoice });
    res.status(201).json({ order, invoice });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to place order' });
  }
});

// PATCH /api/orders/:id/stage - update order stage (fulfillment loop)
router.patch('/:id/stage', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { stage } = req.body;

    const [existing] = await db.select().from(orders).where(eq(orders.id, id));
    if (!existing) {
      return res.status(404).json({ error: 'Order not found' });
    }

    let invoiceStatus = 'DRAFT';
    if (stage === 'OrderDelivered') {
      invoiceStatus = 'PAID';
    } else if (stage === 'OrderCancelled') {
      invoiceStatus = 'CANCELLED';
    }

    const { updatedOrder, updatedInvoice } = await db.transaction(async (tx) => {
      const [orderResult] = await tx
        .update(orders)
        .set({ stage, updatedAt: new Date() })
        .where(eq(orders.id, id))
        .returning();

      const [invoiceResult] = await tx
        .update(invoices)
        .set({
          status: invoiceStatus,
          paidAt: stage === 'OrderDelivered' ? new Date() : null,
        })
        .where(eq(invoices.orderId, id))
        .returning();

      // If delivered, deduct stock from products
      if (stage === 'OrderDelivered' && Array.isArray(existing.items)) {
        for (const item of existing.items as any[]) {
          if (item.productId) {
            const [prod] = await tx.select().from(products).where(eq(products.id, item.productId));
            if (prod) {
              const newStock = Math.max(0, prod.stock - item.quantity);
              const newStatus = newStock === 0 ? 'OUT_OF_STOCK' : prod.status;
              await tx.update(products).set({ stock: newStock, status: newStatus }).where(eq(products.id, item.productId));
            }
          }
        }
      }

      return { updatedOrder: orderResult, updatedInvoice: invoiceResult };
    });

    // Send email update
    await sendOrderStatusEmail({
      orderId: updatedOrder.id,
      recipientEmail: updatedOrder.buyerEmail,
      subject: `Order Update #${updatedOrder.orderNumber}: Status changed to ${stage}`,
      html: `
        <div style="font-family: sans-serif; color: #1A1110;">
          <h2>Your Dawa Equips Order Status is now: ${stage}</h2>
          <p>Order Number: <strong>${updatedOrder.orderNumber}</strong></p>
          <p>Invoice Status: <strong>${updatedInvoice?.status}</strong></p>
          <p>Thank you for choosing Dawa Equips for verified refurbished commercial appliances.</p>
        </div>
      `,
    });

    broadcastSSE('order:updated', { order: updatedOrder, invoice: updatedInvoice });
    res.json({ order: updatedOrder, invoice: updatedInvoice });
  } catch (error) {
    console.error('Error updating order stage:', error);
    res.status(500).json({ error: 'Failed to update order stage' });
  }
});

export default router;
