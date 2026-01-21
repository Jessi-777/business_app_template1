import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import userRoutes from './routes/userRoutes.js';
import stripeRoutes from './routes/stripeRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import affiliateRoutes from './routes/affiliateRoutes.js';

dotenv.config();
connectDB();

const app = express();

// IMPORTANT: Stripe webhook needs raw body, so add it BEFORE other middleware
app.use('/api/checkout/webhook', express.raw({ type: 'application/json' }));

// CORS - allow development ports in development, restrict in production
const allowedOrigins = process.env.NODE_ENV === 'production' 
  ? [process.env.CLIENT_URL]
  : ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' })); // Increased limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/checkout', stripeRoutes);
app.use('/api/affiliates', affiliateRoutes);
app.use('/api/suppliers', supplierRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
