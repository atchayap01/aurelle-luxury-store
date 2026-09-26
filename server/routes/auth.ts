import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db, Address } from '../db.js';
import {
  authenticateToken,
  generateToken,
  AuthenticatedRequest
} from '../middleware/auth.js';

const router = Router();

// Helper to remove password before sending user response
const sanitizeUser = (user: any) => {
  if (!user) return null;

  const { password, ...rest } = user;
  return rest;
};

// Register
router.post('/register', async (req, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
      phone
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: 'Name, email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters.'
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        error: 'Passwords do not match.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Please enter a valid email address.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await db.Users.findOne(
      u => u.email.toLowerCase() === normalizedEmail
    );

    if (existingUser) {
      return res.status(409).json({
        error: 'An account with this email already exists.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.Users.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone ? phone.trim() : '',
      role: 'user',
      addresses: [],
      wishlist: []
    });

    const token = generateToken(newUser, true);

    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: sanitizeUser(newUser)
    });
  } catch (err: any) {
    return res.status(500).json({
      error: err.message || 'Registration failed.'
    });
  }
});

// Login
router.post('/login', async (req, res: Response) => {
  try {
    const {
      email,
      password,
      rememberMe
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await db.Users.findOne(
      u => u.email.toLowerCase() === normalizedEmail
    );

    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password.'
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        error: 'Invalid email or password.'
      });
    }

    const token = generateToken(
      user,
      rememberMe !== false
    );

    return res.json({
      message: 'Welcome back to Aurelle.',
      token,
      user: sanitizeUser(user)
    });
  } catch (err: any) {
    return res.status(500).json({
      error: err.message || 'Login failed.'
    });
  }
});

// Current User
router.get(
  '/me',
  authenticateToken,
  (req: AuthenticatedRequest, res: Response) => {
    return res.json({
      user: sanitizeUser(req.user)
    });
  }
);

// Update Profile
router.put(
  '/profile',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, phone } = req.body;
      const userId = req.user!.id;

      const updated = await db.Users.findByIdAndUpdate(
        userId,
        {
          ...(name && { name: name.trim() }),
          ...(phone !== undefined && {
            phone: phone.trim()
          })
        }
      );

      return res.json({
        message: 'Profile updated successfully.',
        user: sanitizeUser(updated)
      });
    } catch (err: any) {
      return res.status(500).json({
        error: err.message || 'Profile update failed.'
      });
    }
  }
);

// Get Wishlist
router.get(
  '/wishlist',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id;

      const wishlistIds =
        await db.Users.getWishlist(userId);

      const products = await db.Products.find(
        p => wishlistIds.includes(p.id)
      );

      return res.json({
        wishlist: wishlistIds,
        products
      });
    } catch (err: any) {
      return res.status(500).json({
        error: err.message || 'Failed to retrieve wishlist.'
      });
    }
  }
);

// Toggle Wishlist
router.post(
  '/wishlist/toggle',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { productId } = req.body;

      if (!productId) {
        return res.status(400).json({
          error: 'Product ID is required.'
        });
      }

      const userId = req.user!.id;

      const result =
        await db.Users.toggleWishlist(
          userId,
          productId
        );

      if (!result.user) {
        return res.status(404).json({
          error: 'User not found.'
        });
      }

      return res.json({
        added: result.added,
        wishlist: result.wishlist,
        user: sanitizeUser(result.user),
        message: result.added
          ? 'Saved to your curated wishlist in your account.'
          : 'Removed from wishlist.'
      });
    } catch (err: any) {
      return res.status(500).json({
        error: err.message
      });
    }
  }
);

// Wishlist Synchronization
router.post(
  '/wishlist/sync',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { productIds, items } = req.body;

      const incomingList = Array.isArray(productIds)
        ? productIds
        : Array.isArray(items)
          ? items
          : [];

      const userId = req.user!.id;

      const result =
        await db.Users.syncWishlist(
          userId,
          incomingList
        );

      if (!result.user) {
        return res.status(404).json({
          error: 'User not found.'
        });
      }

      const products = await db.Products.find(
        p => result.wishlist.includes(p.id)
      );

      return res.json({
        message: result.addedCount > 0
          ? `Successfully synchronized ${result.addedCount} items to your account.`
          : 'Wishlist synchronized.',
        wishlist: result.wishlist,
        addedCount: result.addedCount,
        user: sanitizeUser(result.user),
        products
      });
    } catch (err: any) {
      return res.status(500).json({
        error:
          err.message ||
          'Wishlist synchronization failed.'
      });
    }
  }
);

// Explicit Add to Wishlist
router.post(
  '/wishlist/add',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { productId } = req.body;

      if (!productId) {
        return res.status(400).json({
          error: 'Product ID is required.'
        });
      }

      const userId = req.user!.id;

      const result =
        await db.Users.addToWishlist(
          userId,
          productId
        );

      if (!result.user) {
        return res.status(404).json({
          error: 'User not found.'
        });
      }

      return res.json({
        added: result.added,
        wishlist: result.wishlist,
        user: sanitizeUser(result.user),
        message: result.added
          ? 'Saved to your curated wishlist.'
          : 'Item already in wishlist.'
      });
    } catch (err: any) {
      return res.status(500).json({
        error: err.message
      });
    }
  }
);

// Explicit Remove from Wishlist
router.delete(
  '/wishlist/:productId',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { productId } = req.params;
      const userId = req.user!.id;

      const result =
        await db.Users.removeFromWishlist(
          userId,
          productId
        );

      if (!result.user) {
        return res.status(404).json({
          error: 'User not found.'
        });
      }

      return res.json({
        removed: result.removed,
        wishlist: result.wishlist,
        user: sanitizeUser(result.user),
        message: 'Item removed from wishlist.'
      });
    } catch (err: any) {
      return res.status(500).json({
        error: err.message
      });
    }
  }
);

// Add Address
router.post(
  '/addresses',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const {
        fullName,
        phone,
        address,
        city,
        state,
        postalCode,
        country,
        isDefault
      } = req.body;

      if (
        !fullName ||
        !phone ||
        !address ||
        !city ||
        !postalCode
      ) {
        return res.status(400).json({
          error:
            'Please fill in all required address fields.'
        });
      }

      const user = await db.Users.findById(
        req.user!.id
      );

      if (!user) {
        return res.status(404).json({
          error: 'User not found.'
        });
      }

      let currentAddresses = [
        ...(user.addresses || [])
      ];

      if (isDefault) {
        currentAddresses = currentAddresses.map(a => ({
          ...a,
          isDefault: false
        }));
      }

      const newAddress: Address = {
        id:
          'addr-' +
          Math.random()
            .toString(36)
            .substring(2, 9),
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        city: city.trim(),
        state: (state || '').trim(),
        postalCode: postalCode.trim(),
        country: country || 'India',
        isDefault:
          isDefault ||
          currentAddresses.length === 0
      };

      currentAddresses.push(newAddress);

      const updated =
        await db.Users.findByIdAndUpdate(
          user.id,
          {
            addresses: currentAddresses
          }
        );

      return res.status(201).json({
        message: 'Address saved successfully.',
        addresses: updated?.addresses || []
      });
    } catch (err: any) {
      return res.status(500).json({
        error: err.message
      });
    }
  }
);

// Delete Address
router.delete(
  '/addresses/:id',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;

      const user = await db.Users.findById(
        req.user!.id
      );

      if (!user) {
        return res.status(404).json({
          error: 'User not found.'
        });
      }

      const filtered = (user.addresses || []).filter(
        a => a.id !== id
      );

      const updated =
        await db.Users.findByIdAndUpdate(
          user.id,
          {
            addresses: filtered
          }
        );

      return res.json({
        message: 'Address removed.',
        addresses: updated?.addresses || []
      });
    } catch (err: any) {
      return res.status(500).json({
        error: err.message
      });
    }
  }
);

export default router;