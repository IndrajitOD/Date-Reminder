import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    console.log('[Database] Using existing MongoDB connection');
    return;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  // Sanitize URI for logging without exposing credentials
  const sanitizedUri = uri.replace(/:([^@]+)@/, ':****@');
  console.log(`[Database] Connecting to MongoDB (${sanitizedUri})...`);

  try {
    const db = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    isConnected = db.connections[0].readyState === 1;
    console.log(`[Database] Successfully connected to MongoDB database: "${db.connection.name}"`);

    mongoose.connection.on('error', (err) => {
      console.error('[Database Error]:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] MongoDB connection disconnected');
      isConnected = false;
    });

    return db;
  } catch (error) {
    console.error('[Database Connection Error]:', error.message);
    throw error;
  }
}
