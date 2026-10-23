import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { promotions, products } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { broadcastSSE } from '../sse.js';

const router = Router();

// GET /api/promotions - list active promotions with linked product info
router.get('/', async (req: Request, res: Response) => {
  try {
    const { active } = req.query;

    const baseQuery = db
      .select({
        id: promotions.id,
        title: promotions.title,
        subtitle: promotions.subtitle,
        promoType: promotions.promoType,
        templateId: promotions.templateId,
        productId: promotions.productId,
        promoPrice: promotions.promoPrice,
        isActive: promotions.isActive,
        createdAt: promotions.createdAt,
        product: {
          id: products.id,
          name: products.name,
          brand: products.brand,
          category: products.category,
          price: products.price,
          initialPrice: products.initialPrice,
          images: products.images,
          stock: products.stock,
          status: products.status,
        },
      })
      .from(promotions)
      .leftJoin(products, eq(promotions.productId, products.id))
      .orderBy(desc(promotions.createdAt));

    const results = active === 'true'
      ? await baseQuery.where(eq(promotions.isActive, true))
      : await baseQuery;

    res.json(results);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ error: 'Failed to retrieve promotions' });
  }
});

// POST /api/promotions - create and broadcast a promotion banner
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, subtitle, promoType, templateId, productId, promoPrice } = req.body;

    if (!title || !promoType || !productId || promoPrice === undefined) {
      return res.status(400).json({ error: 'Missing required promotion fields' });
    }

    const prodId = Number(productId);
    const newPrice = Number(promoPrice);

    // Run transaction: update product price and insert promotion
    const result = await db.transaction(async (tx) => {
      const [existingProduct] = await tx.select().from(products).where(eq(products.id, prodId));
      if (!existingProduct) {
        throw new Error('Linked product not found');
      }

      // If initialPrice not set, keep existing price as initialPrice
      const initialPrice = existingProduct.initialPrice ?? existingProduct.price;

      await tx.update(products).set({
        price: newPrice,
        initialPrice,
      }).where(eq(products.id, prodId));

      const [newPromo] = await tx.insert(promotions).values({
        title,
        subtitle: subtitle || '',
        promoType,
        templateId: templateId || 'espresso-gold',
        productId: prodId,
        promoPrice: newPrice,
        isActive: true,
      }).returning();

      return { newPromo, existingProduct, initialPrice };
    });

    // Broadcast SSE to all connected buyer storefronts
    broadcastSSE('promo:updated', {
      promotion: result.newPromo,
      product: {
        id: result.existingProduct.id,
        price: Number(promoPrice),
        initialPrice: result.initialPrice,
      },
    });

    res.status(201).json(result.newPromo);
  } catch (error: any) {
    console.error('Error creating promotion:', error);
    res.status(500).json({ error: error.message || 'Failed to create promotion' });
  }
});

// PATCH /api/promotions/:id/toggle - activate/deactivate
router.patch('/:id/toggle', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const [existing] = await db.select().from(promotions).where(eq(promotions.id, id));
    if (!existing) {
      return res.status(404).json({ error: 'Promotion not found' });
    }

    const [updated] = await db
      .update(promotions)
      .set({ isActive: !existing.isActive })
      .where(eq(promotions.id, id))
      .returning();

    broadcastSSE('promo:updated', { promotion: updated });
    res.json(updated);
  } catch (error) {
    console.error('Error toggling promotion:', error);
    res.status(500).json({ error: 'Failed to update promotion' });
  }
});

export default router;
