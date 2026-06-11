import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import apiRouter from './routes/api';
import { checkDbConnection } from './db/connection';

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middleware
app.use(cors({
  origin: '*', // Allow connections from Next.js dev server or anywhere locally
  credentials: true
}));
app.use(express.json());

// API Base Endpoint
app.use('/api', apiRouter);

// Base Health Check
app.get('/', async (req: Request, res: Response) => {
  const isDbConnected = await checkDbConnection();
  res.json({
    status: 'online',
    app: 'LifePilot AI API Service',
    database: isDbConnected ? 'PostgreSQL (Connected)' : 'In-Memory DB Fallback (Active)',
    timestamp: new Date().toISOString()
  });
});

// Fallback Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'An internal server error occurred.'
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` LifePilot AI backend running on: http://localhost:${PORT}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`===================================================`);
});
