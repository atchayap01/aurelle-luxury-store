import { Router, Response } from 'express';
import { db } from '../db.js';
import {
  authenticateToken,
  requireAdmin,
  AuthenticatedRequest
} from '../middleware/auth.js';

const router = Router();

// GET /api/admin/stats
router.get(
  '/stats',
  authenticateToken,
  requireAdmin,
  async (
    _req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const totalUsers =
        await db.Users.countDocuments();

      const totalProducts =
        await db.Products.countDocuments();

      const allOrders =
        await db.Orders.find();

      const totalOrders = allOrders.length;

      // Revenue excluding cancelled orders
      const validOrders = allOrders.filter(
        o => o.orderStatus !== 'Cancelled'
      );

      const totalRevenue =
        validOrders.reduce(
          (acc, curr) => acc + (curr.total || 0),
          0
        );

      const pendingOrdersCount =
        allOrders.filter(
          o =>
            o.orderStatus === 'Order Placed' ||
            o.orderStatus === 'Processing'
        ).length;

      const lowStockProducts =
        await db.Products.find(
          p => p.stock <= 5
        );

      // Recent 5 orders
      const recentOrders =
        allOrders.slice(0, 5);

      return res.json({
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        pendingOrdersCount,
        lowStockCount:
          lowStockProducts.length,
        lowStockProducts,
        recentOrders
      });
    } catch (err: any) {
      return res.status(500).json({
        error: err.message
      });
    }
  }
);

export default router;