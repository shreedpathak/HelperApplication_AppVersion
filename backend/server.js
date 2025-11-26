import app from './src/app.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import os from 'os';

dotenv.config();

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';
const MONGO_URI = process.env.MONGO_URI;

// CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Test route
// app.get('/ping', (req, res) => res.send('pong 🏓'));

// Get LAN IP for logs
const getLANIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal && iface.address.startsWith('192.168.')) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
};

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, HOST, () => {
      console.log('🚀 Server running on:');
      console.log(`   Local:    http://127.0.0.1:${PORT}`);
      console.log(`   Network:  http://${getLANIP()}:${PORT}`);
    });
  })
  .catch(err => console.error(err));
