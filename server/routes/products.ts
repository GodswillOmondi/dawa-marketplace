import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { products } from '../db/schema.js';
import { eq, desc, ilike, and, or, sql } from 'drizzle-orm';
import { broadcastSSE } from '../sse.js';

const router = Router();

// GET /api/products - list products with optional filters
router.get('/', async (req: Request, res: Response) => {
  try {
    const { category, brand, search, status, minPrice, maxPrice } = req.query;

    const conditions = [];

    if (status) {
      conditions.push(eq(products.status, String(status)));
    }

    if (category && category !== 'ALL') {
      conditions.push(eq(products.category, String(category)));
    }

    if (brand && brand !== 'ALL') {
      conditions.push(eq(products.brand, String(brand)));
    }

    if (search) {
      const q = `%${String(search).trim()}%`;
      conditions.push(
        or(
          ilike(products.name, q),
          ilike(products.brand, q),
          ilike(products.category, q),
          ilike(products.description, q)
        )
      );
    }

    if (minPrice) {
      conditions.push(sql`${products.price} >= ${Number(minPrice)}`);
    }

    if (maxPrice) {
      conditions.push(sql`${products.price} <= ${Number(maxPrice)}`);
    }

    const query = db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt));

    const result = conditions.length > 0
      ? await query.where(and(...conditions))
      : await query;

    res.json(result);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

// GET /api/products/:id - single product detail
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid product ID' });
    }

    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    res.status(500).json({ error: 'Failed to retrieve product' });
  }
});

// POST /api/products - create a product (Slice 2 & forward)
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, brand, category, price, initialPrice, variants, stock, specifications, description, images } = req.body;

    if (!name || !brand || !category || price === undefined) {
      return res.status(400).json({ error: 'Missing required product fields' });
    }

    const imageArray: string[] = Array.isArray(images) ? images : [];
    const status = imageArray.length >= 3 
      ? (stock <= 0 ? 'OUT_OF_STOCK' : 'ACTIVE') 
      : 'PENDING_IMAGES';

    const [newProduct] = await db.insert(products).values({
      name,
      brand,
      category,
      price: Number(price),
      initialPrice: initialPrice ? Number(initialPrice) : null,
      variants: variants || [],
      stock: Number(stock ?? 1),
      specifications: specifications || {},
      description: description || '',
      images: imageArray,
      status,
      ratingValue: 5.0,
    }).returning();

    broadcastSSE('product:updated', newProduct);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// PATCH /api/products/:id - update product
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updates = req.body;

    const [existing] = await db.select().from(products).where(eq(products.id, id));
    if (!existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const images = updates.images !== undefined ? updates.images : existing.images;
    const stock = updates.stock !== undefined ? Number(updates.stock) : existing.stock;

    let newStatus = updates.status || existing.status;
    if (images.length < 3) {
      newStatus = 'PENDING_IMAGES';
    } else if (stock <= 0) {
      newStatus = 'OUT_OF_STOCK';
    } else if (existing.status === 'PENDING_IMAGES' && images.length >= 3) {
      newStatus = 'ACTIVE';
    }

    const [updatedProduct] = await db
      .update(products)
      .set({
        ...updates,
        status: newStatus,
        stock,
        price: updates.price !== undefined ? Number(updates.price) : existing.price,
        initialPrice: updates.initialPrice !== undefined ? (updates.initialPrice ? Number(updates.initialPrice) : null) : existing.initialPrice,
      })
      .where(eq(products.id, id))
      .returning();

    broadcastSSE('product:updated', updatedProduct);
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// POST /api/products/import-csv - bulk upload
router.post('/import-csv', async (req: Request, res: Response) => {
  try {
    const { rows } = req.body;
    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or empty CSV rows' });
    }

    const itemsToInsert = rows.map((r: any) => {
      const imgList = Array.isArray(r.images) 
        ? r.images 
        : (r.images ? String(r.images).split(';').map(s => s.trim()).filter(Boolean) : []);
      const stock = parseInt(r.stock ?? '1', 10) || 0;
      const status = imgList.length >= 3 
        ? (stock <= 0 ? 'OUT_OF_STOCK' : 'ACTIVE') 
        : 'PENDING_IMAGES';

      return {
        name: String(r.name || 'Untitled Commercial Appliance'),
        brand: String(r.brand || 'Dawa Equips'),
        category: String(r.category || 'Commercial Espresso Machines'),
        price: parseFloat(r.price ?? '0') || 0,
        initialPrice: r.initialPrice ? parseFloat(r.initialPrice) : null,
        stock,
        variants: r.variants ? (typeof r.variants === 'string' ? JSON.parse(r.variants) : r.variants) : [],
        specifications: r.specifications ? (typeof r.specifications === 'string' ? JSON.parse(r.specifications) : r.specifications) : {},
        description: String(r.description || 'Verified refurbished commercial appliance.'),
        images: imgList,
        status,
        ratingValue: 4.8,
      };
    });

    const inserted = await db.insert(products).values(itemsToInsert).returning();
    broadcastSSE('product:updated', { count: inserted.length });
    res.status(201).json(inserted);
  } catch (error) {
    console.error('Error importing CSV products:', error);
    res.status(500).json({ error: 'Failed to import products from CSV' });
  }
});

export default router;
