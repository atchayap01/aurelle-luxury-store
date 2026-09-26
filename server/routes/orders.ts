import { Router, Response } from 'express';
import { db, OrderItem } from '../db.js';
import {
  optionalAuthenticateToken,
  authenticateToken,
  requireAdmin,
  AuthenticatedRequest
} from '../middleware/auth.js';

const router = Router();

// POST /api/orders - Create new order
router.post(
  '/',
  optionalAuthenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        items,
        shippingAddress,
        paymentMethod = 'Cash on Delivery'
      } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          error: 'Order must contain at least one item.'
        });
      }

      if (
        !shippingAddress ||
        !shippingAddress.fullName ||
        !shippingAddress.address ||
        !shippingAddress.city ||
        !shippingAddress.postalCode
      ) {
        return res.status(400).json({
          error: 'Complete shipping address is required.'
        });
      }

      const userEmail = (
        req.user?.email ||
        shippingAddress.email ||
        ''
      ).toLowerCase().trim();

      if (!userEmail) {
        return res.status(400).json({
          error: 'A valid customer email is required.'
        });
      }

      // Recalculate prices from MongoDB and validate stock
      const validatedItems: OrderItem[] = [];
      let calculatedSubtotal = 0;

      for (const item of items) {
        const prodId =
          item.productId ||
          item.id ||
          item._id;

        const product =
          await db.Products.findById(prodId);

        if (!product) {
          return res.status(400).json({
            error: `Product "${item.name || prodId}" is no longer available.`
          });
        }

        const requestedQty = Number(item.quantity);

        if (!requestedQty || requestedQty < 1) {
          return res.status(400).json({
            error: `Invalid quantity for ${product.name}.`
          });
        }

        if (product.stock < requestedQty) {
          return res.status(400).json({
            error: `Insufficient stock for "${product.name}". Only ${product.stock} available.`
          });
        }

        const itemTotal =
          product.price * requestedQty;

        calculatedSubtotal += itemTotal;

        validatedItems.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: requestedQty,
          image: product.images[0] || ''
        });
      }

      // Free shipping over ₹3,000
      const shippingFee =
        calculatedSubtotal >= 3000 ? 0 : 250;

      const discount = 0;
      const finalTotal =
        calculatedSubtotal +
        shippingFee -
        discount;

      // Deduct stock
      const deductedItems: OrderItem[] = [];

      for (const item of validatedItems) {
        const success =
          await db.decreaseStock(
            item.productId,
            item.quantity
          );

        if (!success) {
          // Roll back previously deducted items
          for (const previous of deductedItems) {
            await db.restoreStock(
              previous.productId,
              previous.quantity
            );
          }

          return res.status(400).json({
            error: `Stock changed during checkout for ${item.name}. Please review cart.`
          });
        }

        deductedItems.push(item);
      }

      // Create order
      const order = await db.Orders.create({
        userId: req.user?.id,
        userEmail,
        items: validatedItems,

        shippingAddress: {
          id:
            shippingAddress.id ||
            'addr-' +
              Math.random()
                .toString(36)
                .substring(2, 7),

          fullName:
            shippingAddress.fullName.trim(),

          phone:
            shippingAddress.phone
              ? shippingAddress.phone.trim()
              : '',

          address:
            shippingAddress.address.trim(),

          city:
            shippingAddress.city.trim(),

          state:
            (shippingAddress.state || '').trim(),

          postalCode:
            shippingAddress.postalCode.trim(),

          country:
            shippingAddress.country || 'India'
        },

        subtotal: calculatedSubtotal,
        shippingFee,
        discount,
        total: finalTotal,

        paymentMethod:
          paymentMethod === 'Card'
            ? 'Card'
            : 'Cash on Delivery',

        paymentStatus:
          paymentMethod === 'Card'
            ? 'Paid'
            : 'Pending',

        orderStatus: 'Order Placed'
      });

      return res.status(201).json({
        message: 'Your order has been placed successfully.',
        order
      });
    } catch (err: any) {
      return res.status(500).json({
        error:
          err.message ||
          'Failed to place order.'
      });
    }
  }
);

// GET /api/orders
router.get(
  '/',
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const user = req.user!;

      const allOrders =
        await db.Orders.find();

      if (user.role === 'admin') {
        return res.json({
          orders: allOrders
        });
      }

      const userOrders =
        allOrders.filter(o =>
          Boolean(
            (o.userId &&
              o.userId === user.id) ||
            (o.userEmail &&
              o.userEmail.toLowerCase() ===
                user.email.toLowerCase())
          )
        );

      return res.json({
        orders: userOrders
      });
    } catch (err: any) {
      return res.status(500).json({
        error: err.message
      });
    }
  }
);

// GET /api/orders/:id
router.get(
  '/:id',
  optionalAuthenticateToken,
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      const order =
        await db.Orders.findById(id);

      if (!order) {
        return res.status(404).json({
          error: 'Order not found.'
        });
      }

      if (
        req.user &&
        req.user.role !== 'admin'
      ) {
        const isOwner =
          (order.userId &&
            order.userId === req.user.id) ||
          (order.userEmail &&
            order.userEmail.toLowerCase() ===
              req.user.email.toLowerCase());

        if (!isOwner) {
          return res.status(403).json({
            error:
              'You are not authorized to view this order.'
          });
        }
      }

      return res.json({
        order
      });
    } catch (err: any) {
      return res.status(500).json({
        error: err.message
      });
    }
  }
);

// PUT /api/orders/:id/status - Admin only
router.put(
  '/:id/status',
  authenticateToken,
  requireAdmin,
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const { id } = req.params;
      const {
        orderStatus,
        paymentStatus
      } = req.body;

      const validStatuses = [
        'Order Placed',
        'Processing',
        'Shipped',
        'Out for Delivery',
        'Delivered',
        'Cancelled'
      ];

      if (
        orderStatus &&
        !validStatuses.includes(orderStatus)
      ) {
        return res.status(400).json({
          error:
            `Invalid order status. Allowed: ${validStatuses.join(', ')}`
        });
      }

      const existing =
        await db.Orders.findById(id);

      if (!existing) {
        return res.status(404).json({
          error: 'Order not found.'
        });
      }

      // Restore stock when cancelling
      if (
        orderStatus === 'Cancelled' &&
        existing.orderStatus !== 'Cancelled'
      ) {
        for (const item of existing.items) {
          await db.restoreStock(
            item.productId,
            item.quantity
          );
        }
      }

      const updated =
        await db.Orders.findByIdAndUpdate(
          id,
          {
            ...(orderStatus && {
              orderStatus
            }),
            ...(paymentStatus && {
              paymentStatus
            })
          }
        );

      return res.json({
        message:
          'Order status updated successfully.',
        order: updated
      });
    } catch (err: any) {
      return res.status(500).json({
        error: err.message
      });
    }
  }
);

// DELETE /api/orders/:id - Cancel order
router.delete(
  '/:id',
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      const order =
        await db.Orders.findById(id);

      if (!order) {
        return res.status(404).json({
          error: 'Order not found.'
        });
      }

      const isAdmin =
        req.user!.role === 'admin';

      const isOwner =
        (order.userId &&
          order.userId === req.user!.id) ||
        (order.userEmail &&
          order.userEmail.toLowerCase() ===
            req.user!.email.toLowerCase());

      if (!isAdmin && !isOwner) {
        return res.status(403).json({
          error:
            'Unauthorized to cancel this order.'
        });
      }

      if (
        !isAdmin &&
        order.orderStatus !== 'Order Placed' &&
        order.orderStatus !== 'Processing'
      ) {
        return res.status(400).json({
          error:
            `Order cannot be cancelled because it is already marked as "${order.orderStatus}".`
        });
      }

      // Restore stock
      for (const item of order.items) {
        await db.restoreStock(
          item.productId,
          item.quantity
        );
      }

      const updated =
        await db.Orders.findByIdAndUpdate(
          id,
          {
            orderStatus: 'Cancelled'
          }
        );

      return res.json({
        message:
          'Order has been cancelled and inventory restored.',
        order: updated
      });
    } catch (err: any) {
      return res.status(500).json({
        error: err.message
      });
    }
  }
);

export default router;