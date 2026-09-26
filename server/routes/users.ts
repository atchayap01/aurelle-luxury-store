import { Router, Response } from 'express';
import { db } from '../db.js';
import {
  authenticateToken,
  requireAdmin,
  AuthenticatedRequest
} from '../middleware/auth.js';

const router = Router();

// GET /api/users - Admin only
router.get(
  '/',
  authenticateToken,
  requireAdmin,
  async (
    _req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const users = await db.Users.find();

      const safeUsers = users.map((u: any) => {
        const { password, ...safe } = u;
        return safe;
      });

      return res.json({
        users: safeUsers
      });
    } catch (err: any) {
      return res.status(500).json({
        error: err.message
      });
    }
  }
);

// GET /api/users/:id - Admin only
router.get(
  '/:id',
  authenticateToken,
  requireAdmin,
  async (
    req: AuthenticatedRequest,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      const user =
        await db.Users.findById(id);

      if (!user) {
        return res.status(404).json({
          error: 'User not found.'
        });
      }

      const { password, ...safe } = user;

      return res.json({
        user: safe
      });
    } catch (err: any) {
      return res.status(500).json({
        error: err.message
      });
    }
  }
);

// PUT /api/users/:id - Admin only
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
      const { role, name, phone } = req.body;

      const existing =
        await db.Users.findById(id);

      if (!existing) {
        return res.status(404).json({
          error: 'User not found.'
        });
      }

      // Prevent demoting the only admin
      if (
        existing.role === 'admin' &&
        role === 'user'
      ) {
        const adminCount =
          await db.Users.countDocuments(
            (u: any) => u.role === 'admin'
          );

        if (adminCount <= 1) {
          return res.status(400).json({
            error:
              'Cannot demote the only remaining administrator.'
          });
        }
      }

      const updated =
        await db.Users.findByIdAndUpdate(
          id,
          {
            ...(role && { role }),
            ...(name && {
              name: name.trim()
            }),
            ...(phone !== undefined && {
              phone: phone.trim()
            })
          }
        );

      if (!updated) {
        return res.status(404).json({
          error: 'User not found.'
        });
      }

      const { password, ...safe } = updated;

      return res.json({
        message: 'User updated successfully.',
        user: safe
      });
    } catch (err: any) {
      return res.status(500).json({
        error: err.message
      });
    }
  }
);

// DELETE /api/users/:id - Admin only
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

      const existing =
        await db.Users.findById(id);

      if (!existing) {
        return res.status(404).json({
          error: 'User not found.'
        });
      }

      if (existing.id === req.user!.id) {
        return res.status(400).json({
          error:
            'You cannot delete your own admin account.'
        });
      }

      await db.Users.findByIdAndDelete(id);

      return res.json({
        message: 'User account removed.'
      });
    } catch (err: any) {
      return res.status(500).json({
        error: err.message
      });
    }
  }
);

export default router;