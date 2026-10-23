import { useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';

export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  initialPrice?: number | null;
  ratingValue: number;
  variants: { name: string; price?: number }[];
  stock: number;
  specifications: Record<string, string>;
  description: string;
  images: string[];
  status: 'ACTIVE' | 'PENDING_IMAGES' | 'OUT_OF_STOCK';
  createdAt: string;
}

export interface Promotion {
  id: number;
  title: string;
  subtitle?: string;
  promoType: 'FLASH_SALE' | 'SEASONAL_DEAL';
  templateId: string;
  productId: number;
  promoPrice: number;
  isActive: boolean;
  createdAt: string;
  product?: {
    id: number;
    name: string;
    brand: string;
    category: string;
    price: number;
    initialPrice?: number | null;
    images: string[];
    stock: number;
    status: string;
  };
}

export interface OrderItem {
  productId: number;
  productName: string;
  variant?: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  deliveryNote: string;
  items: OrderItem[];
  totalAmount: number;
  stage: 'OrderInitiation' | 'OrderReceived' | 'OrderProcessed' | 'OrderDelivered' | 'OrderCancelled';
  createdAt: string;
  updatedAt: string;
  invoice?: {
    id: number;
    invoiceNumber: string;
    status: 'DRAFT' | 'PAID' | 'CANCELLED';
    issuedAt: string;
    paidAt?: string | null;
  };
  emailLogs?: {
    id: number;
    recipientEmail: string;
    subject: string;
    body: string;
    deliveryStatus: string;
    sentAt: string;
  }[];
}

export async function fetchProducts(params: {
  category?: string;
  brand?: string;
  search?: string;
  status?: string;
  minPrice?: number;
  maxPrice?: number;
} = {}): Promise<Product[]> {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'ALL') query.set('category', params.category);
  if (params.brand && params.brand !== 'ALL') query.set('brand', params.brand);
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  if (params.minPrice) query.set('minPrice', String(params.minPrice));
  if (params.maxPrice) query.set('maxPrice', String(params.maxPrice));

  const res = await fetch(`${API_BASE}/api/products?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProductById(id: number): Promise<Product> {
  const res = await fetch(`${API_BASE}/api/products/${id}`);
  if (!res.ok) throw new Error('Failed to fetch product');
  return res.json();
}

export async function fetchPromotions(activeOnly = true): Promise<Promotion[]> {
  const res = await fetch(`${API_BASE}/api/promotions?active=${activeOnly}`);
  if (!res.ok) throw new Error('Failed to fetch promotions');
  return res.json();
}

export async function createProduct(productData: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(productData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create product');
  }
  return res.json();
}

export async function updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
  const res = await fetch(`${API_BASE}/api/products/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error('Failed to update product');
  return res.json();
}

export async function importCsvProducts(rows: any[]): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/api/products/import-csv`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rows }),
  });
  if (!res.ok) throw new Error('Failed to import CSV products');
  return res.json();
}

export async function createPromotion(promoData: {
  title: string;
  subtitle?: string;
  promoType: 'FLASH_SALE' | 'SEASONAL_DEAL';
  templateId: string;
  productId: number;
  promoPrice: number;
}): Promise<Promotion> {
  const res = await fetch(`${API_BASE}/api/promotions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(promoData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create promotion');
  }
  return res.json();
}

export async function createOrder(orderData: {
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  deliveryNote: string;
  items: OrderItem[];
}): Promise<{ order: Order; invoice: any }> {
  const res = await fetch(`${API_BASE}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) throw new Error('Failed to create order');
  return res.json();
}

export async function trackOrdersByPhone(phone: string): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/api/orders/track?phone=${encodeURIComponent(phone)}`);
  if (!res.ok) throw new Error('Failed to track orders');
  return res.json();
}

export async function fetchAllOrders(): Promise<Order[]> {
  const res = await fetch(`${API_BASE}/api/orders`);
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function updateOrderStage(id: number, stage: string): Promise<{ order: Order; invoice: any }> {
  const res = await fetch(`${API_BASE}/api/orders/${id}/stage`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stage }),
  });
  if (!res.ok) throw new Error('Failed to update order stage');
  return res.json();
}

export function useSSE(onEvent: (event: string, data: any) => void) {
  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE}/api/events`);

    const handleMessage = (e: MessageEvent, eventName: string) => {
      try {
        const parsed = JSON.parse(e.data);
        onEvent(eventName, parsed);
      } catch (err) {
        console.error(`Failed to parse SSE event ${eventName}:`, err);
      }
    };

    eventSource.addEventListener('promo:updated', (e) => handleMessage(e, 'promo:updated'));
    eventSource.addEventListener('product:updated', (e) => handleMessage(e, 'product:updated'));
    eventSource.addEventListener('order:updated', (e) => handleMessage(e, 'order:updated'));
    eventSource.addEventListener('stock:updated', (e) => handleMessage(e, 'stock:updated'));

    eventSource.onerror = (err) => {
      console.warn('SSE stream error, browser will retry automatically:', err);
    };

    return () => {
      eventSource.close();
    };
  }, [onEvent]);
}
