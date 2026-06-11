import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'lifepilot-super-secret-key-change-in-prod';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please sign in.' });
  }

  // Support fallback developer mock user token "mock-user-token" for instant local testing
  if (token === 'mock-user-token') {
    req.user = { id: 'd3b07384-d113-4956-a5cc-e0e64c238b6d' }; // Matches the seed mock-user ID
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired session. Please sign in again.' });
  }
};
