import { pgTable, serial, text, integer, doublePrecision, real, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export interface ProductVariant {
  name: string;
  price?: number;
}

export interface OrderItem {
  productId: number;
  productName: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  brand: text('brand').notNull(),
  category: text('category').notNull(),
  price: doublePrecision('price').notNull(),
  initialPrice: doublePrecision('initial_price'),
  ratingValue: real('rating_value').default(4.8).notNull(),
  variants: jsonb('variants').$type<ProductVariant[]>().default([]).notNull(),
  stock: integer('stock').notNull().default(1),
  specifications: jsonb('specifications').$type<Record<string, string>>().default({}).notNull(),
  description: text('description').notNull(),
  images: jsonb('images').$type<string[]>().default([]).notNull(),
  status: text('status').notNull().default('ACTIVE'), // 'ACTIVE' | 'PENDING_IMAGES' | 'OUT_OF_STOCK'
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const promotions = pgTable('promotions', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  subtitle: text('subtitle'),
  promoType: text('promo_type').notNull(), // 'FLASH_SALE' | 'SEASONAL_DEAL'
  templateId: text('template_id').notNull().default('espresso-gold'), // 'espresso-gold' | 'sage-editorial' | 'brass-spotlight'
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  promoPrice: doublePrecision('promo_price').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: text('order_number').unique().notNull(),
  buyerName: text('buyer_name').notNull(),
  buyerPhone: text('buyer_phone').notNull(),
  buyerEmail: text('buyer_email').notNull(),
  deliveryNote: text('delivery_note').notNull(),
  items: jsonb('items').$type<OrderItem[]>().notNull(),
  totalAmount: doublePrecision('total_amount').notNull(),
  stage: text('stage').notNull().default('OrderInitiation'), // 'OrderInitiation' | 'OrderReceived' | 'OrderProcessed' | 'OrderDelivered' | 'OrderCancelled'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  invoiceNumber: text('invoice_number').unique().notNull(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  status: text('status').notNull().default('DRAFT'), // 'DRAFT' | 'PAID' | 'CANCELLED'
  issuedAt: timestamp('issued_at').defaultNow().notNull(),
  paidAt: timestamp('paid_at'),
});

export const emailLogs = pgTable('email_logs', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }),
  recipientEmail: text('recipient_email').notNull(),
  subject: text('subject').notNull(),
  body: text('body').notNull(),
  deliveryStatus: text('delivery_status').notNull().default('RECORDED_IN_APP'), // 'SENT_VIA_RESEND' | 'RECORDED_IN_APP'
  sentAt: timestamp('sent_at').defaultNow().notNull(),
});

// Relations
export const productsRelations = relations(products, ({ many }) => ({
  promotions: many(promotions),
}));

export const promotionsRelations = relations(promotions, ({ one }) => ({
  product: one(products, {
    fields: [promotions.productId],
    references: [products.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  invoice: one(invoices, {
    fields: [orders.id],
    references: [invoices.orderId],
  }),
  emails: many(emailLogs),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  order: one(orders, {
    fields: [invoices.orderId],
    references: [orders.id],
  }),
}));

export const emailLogsRelations = relations(emailLogs, ({ one }) => ({
  order: one(orders, {
    fields: [emailLogs.orderId],
    references: [orders.id],
  }),
}));
