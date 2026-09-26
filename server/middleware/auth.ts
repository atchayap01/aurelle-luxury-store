import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'aurelle_luxury_secret_key_2026';

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      error: 'Access token required. Please sign in.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const user = await User.findOne({ id: decoded.id }).lean();

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    req.user = user as IUser;
    next();
  } catch {
    return res.status(403).json({
      error: 'Invalid or expired session. Please sign in again.'
    });
  }
};

export const optionalAuthenticateToken = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    const user = await User.findOne({ id: decoded.id }).lean();

    if (user) {
      req.user = user as IUser;
    }
  } catch {
    // Optional authentication: continue as guest
  }

  next();
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Administrative privileges required.'
    });
  }

  next();
};

export const generateToken = (
  user: IUser,
  rememberMe = true
): string => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    {
      expiresIn: rememberMe ? '30d' : '24h'
    }
  );
};