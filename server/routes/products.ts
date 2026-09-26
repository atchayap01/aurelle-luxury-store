import { Router, Request, Response } from 'express';
import { db } from '../db.js';
import {
  authenticateToken,
  requireAdmin,
  AuthenticatedRequest
} from '../middleware/auth.js';

const router = Router();

// GET /api/products
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sort,
      featured,
      bestseller,
      inStock,
      page = '1',
      limit = '12'
    } = req.query;

    let products = await db.Products.find();

    // Category
    if (category && category !== 'All' && category !== 'all') {
      products = products.filter(
        p =>
          p.category.toLowerCase() ===
          (category as string).toLowerCase()
      );
    }

    // Search
    if (
      search &&
      typeof search === 'string' &&
      search.trim() !== ''
    ) {
      const q = search.trim().toLowerCase();

      products = products.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    // Price range
    if (minPrice) {
      const min = Number(minPrice);

      if (!isNaN(min)) {
        products = products.filter(
          p => p.price >= min
        );
      }
    }

    if (maxPrice) {
      const max = Number(maxPrice);

      if (!isNaN(max)) {
        products = products.filter(
          p => p.price <= max
        );
      }
    }

    // In stock
    if (inStock === 'true') {
      products = products.filter(p => p.stock > 0);
    }

    // Featured
    if (featured === 'true') {
      products = products.filter(
        p => p.featured === true
      );
    }

    // Bestseller
    if (bestseller === 'true') {
      products = products.filter(
        p => p.bestseller === true
      );
    }

    // Sorting
    switch (sort) {
      case 'price-asc':
        products.sort((a, b) => a.price - b.price);
        break;

      case 'price-desc':
        products.sort((a, b) => b.price - a.price);
        break;

      case 'newest':
        products.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        );
        break;

      case 'bestseller':
        products.sort(
          (a, b) =>
            (b.bestseller ? 1 : 0) -
            (a.bestseller ? 1 : 0)
        );
        break;

      case 'featured':
      default:
        products.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;

          return (
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
          );
        });

        break;
    }

    // Pagination
    const total = products.length;

    const pageNum = Math.max(
      1,
      parseInt(page as string, 10) || 1
    );

    const limitNum = Math.max(
      1,
      parseInt(limit as string, 10) || 12
    );

    const startIndex = (pageNum - 1) * limitNum;

    const paginatedProducts = products.slice(
      startIndex,
      startIndex + limitNum
    );

    return res.json({
      products: paginatedProducts,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum
    });
  } catch (err: any) {
    return res.status(500).json({
      error: err.message || 'Error fetching products'
    });
  }
});

// GET /api/products/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await db.Products.findById(id);

    if (!product) {
      return res.status(404).json({
        error: 'Product not found.'
      });
    }

    const related = (
      await db.Products.find(
        p =>
          p.category === product.category &&
          p.id !== product.id
      )
    ).slice(0, 4);

    return res.json({
      product,
      related
    });
  } catch (err: any) {
    return res.status(500).json({
      error: err.message
    });
  }
});

// POST /api/products - Admin only
router.post(
  '/',
  authenticateToken,
  requireAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        name,
        description,
        category,
        price,
        originalPrice,
        discount,
        images,
        stock,
        specifications,
        featured,
        bestseller
      } = req.body;

      if (
        !name ||
        !description ||
        !category ||
        price === undefined
      ) {
        return res.status(400).json({
          error:
            'Name, description, category, and price are required.'
        });
      }

      const imageList =
        Array.isArray(images) && images.length > 0
          ? images
          : [
              'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=1000&q=80'
            ];

      const newProduct = await db.Products.create({
        name: name.trim(),
        description: description.trim(),
        category,
        price: Number(price),
        originalPrice:
          originalPrice
            ? Number(originalPrice)
            : undefined,
        discount:
          discount
            ? Number(discount)
            : undefined,
        images: imageList,
        stock:
          stock !== undefined
            ? Number(stock)
            : 10,
        specifications:
          specifications || {},
        featured: Boolean(featured),
        bestseller: Boolean(bestseller)
      });

      return res.status(201).json({
        message: 'Product created successfully.',
        product: newProduct
      });
    } catch (err: any) {
      return res.status(500).json({
        error: err.message
      });
    }
  }
);

// PUT /api/products/:id - Admin only
router.put(
  '/:id',
  authenticateToken,
  requireAdmin,
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const existing =
        await db.Products.findById(id);

      if (!existing) {
        return res.status(404).json({
          error: 'Product not found.'
        });
      }

      const updated =
        await db.Products.findByIdAndUpdate(
          id,
          {
            ...updates,
            ...(updates.price !== undefined && {
              price: Number(updates.price)
            }),
            ...(updates.originalPrice !== undefined && {
              originalPrice:
                updates.originalPrice
                  ? Number(updates.originalPrice)
                  : undefined
            }),
            ...(updates.discount !== undefined && {
              discount:
                updates.discount
                  ? Number(updates.discount)
                  : undefined
            }),
            ...(updates.stock !== undefined && {
              stock: Number(updates.stock)
            })
          }
        );

      return res.json({
        message: 'Product updated successfully.',
        product: updated
      });
    } catch (err: any) {
      return res.status(500).json({
        error: err.message
      });
    }
  }
);

// DELETE /api/products/:id - Admin only
router.delete(
  '/:id',
  authenticateToken,
  requireAdmin,
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      const deleted =
        await db.Products.findByIdAndDelete(id);

      if (!deleted) {
        return res.status(404).json({
          error: 'Product not found.'
        });
      }

      return res.json({
        message: 'Product deleted successfully.',
        id
      });
    } catch (err: any) {
      return res.status(500).json({
        error: err.message
      });
    }
  }
);

export default router;