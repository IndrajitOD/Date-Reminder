import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import { initFirebaseAdmin } from './src/config/firebase.js';

// Route modules
import authRoutes from './src/routes/authRoutes.js';
import reminderRoutes from './src/routes/reminderRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import globalEventRoutes from './src/routes/globalEventRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// CORS configuration
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// Initialize Firebase Admin SDK
initFirebaseAdmin();

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Date Reminder Backend API v1',
    timestamp: new Date()
  });
});

// Mount modular REST APIs under /api/v1
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/reminders', reminderRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/global-events', globalEventRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

// Start server only after establishing database connection
async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('[Server Failed to Start]:', error.message);
    process.exit(1);
  }
}

startServer();
