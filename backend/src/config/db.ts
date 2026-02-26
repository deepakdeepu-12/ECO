import mongoose from 'mongoose';
import dns from 'dns';

// Force Node.js c-ares to prefer IPv4 — fixes querySrv ECONNREFUSED on Windows
dns.setDefaultResultOrder('ipv4first');

/**
 * Connect to MongoDB Atlas.
 * Logs success or failure — does not throw, so the server can still
 * serve in-memory fallback mode if the DB is unreachable.
 */
export const connectDB = async (): Promise<void> => {
  // Skip connection if MongoDB URI is not configured
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('<username>') || uri.includes('<password>')) {
    console.warn('⚠️  MongoDB URI not configured — using in-memory storage');
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 500,     // 500ms timeout for instant fallback
      socketTimeoutMS:          45000,   // close sockets after 45 s inactivity
      family:                   4,       // force IPv4 — avoids IPv6 SRV issues
    });
    console.log('✅ MongoDB Atlas connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', (err as Error).message);
    console.warn('⚠️  Running in in-memory fallback mode — data will not persist.');
  }
};
