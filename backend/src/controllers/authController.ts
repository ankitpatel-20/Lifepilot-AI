import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { UserRepository, ProfileRepository } from '../db/connection';
import { AuthenticatedRequest } from '../middleware/auth';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'lifepilot-super-secret-key-change-in-prod';

export const registerUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required.' });
    }

    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await UserRepository.create(email.toLowerCase(), passwordHash, fullName);
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name
      }
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Server error. Failed to register user.' });
  }
};

export const loginUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Support developer instant local login (if email/password matches seed user, we can support direct auth)
    if (email === 'ankit@lifepilot.ai' && password === 'admin123') {
      const user = await UserRepository.findByEmail(email);
      if (user) {
        const token = 'mock-user-token';
        return res.json({
          message: 'Logged in successfully!',
          token,
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name
          }
        });
      }
    }

    const user = await UserRepository.findByEmail(email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    return res.json({
      message: 'Logged in successfully!',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Server error. Failed to log in.' });
  }
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const user = await UserRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const profile = await ProfileRepository.findByUserId(userId);

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        createdAt: user.created_at
      },
      profile
    });
  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Server error. Failed to fetch user details.' });
  }
};
