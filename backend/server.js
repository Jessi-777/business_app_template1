import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import productRoutes         from './routes/productRoutes.js';
import orderRoutes           from './routes/orderRoutes.js';
import userRoutes            from './routes/userRoutes.js';
import stripeRoutes          from './routes/stripeRoutes.js';
import supplierRoutes        from './routes/supplierRoutes.js';
import affiliateRoutes       from './routes/affiliateRoutes.js';
import affiliatePortalRoutes from './routes/affiliatePortalRoutes.js';
import vendorPortalRoutes    from './routes/vendorPortalRoutes.js';
import brandRoutes           from './routes/brandRoutes.js';

import { resolveBrand }           from './middleware/brandMiddleware.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();
connectDB();

const app  = express();
const PORT = process.env.PORT || 5001;

/* ---------------------------------------------------
   Stripe Webhook (MUST come before express.json)
--------------------------------------------------- */
app.use('/api/checkout/webhook', express.raw({ type: 'application/json' }));

/* ---------------------------------------------------
   CORS
--------------------------------------------------- */
const allowedOrigins =
  process.env.NODE_ENV === 'production'
    ? [
        process.env.CLIENT_URL,
        'https://hnavault.com',
        'https://www.hnavault.com',
      ].filter(Boolean)
    : [
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5001',
      ];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow custom brand domains in production
    if (process.env.NODE_ENV === 'production') return callback(null, true);
    callback(new Error('CORS not allowed'));
  },
  credentials: true,
};

app.use(cors(corsOptions));

/* ---------------------------------------------------
   Body Parsers
--------------------------------------------------- */
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

/* ---------------------------------------------------
   Brand Middleware
   Reads hostname → sets req.brand on every request
--------------------------------------------------- */
app.use(resolveBrand);

/* ---------------------------------------------------
   Root Route
--------------------------------------------------- */
app.get('/', (req, res) => {
  res.json({ status: 'running', api: 'HNA Vault API', version: '1.0' });
});

/* ---------------------------------------------------
   Health Check
--------------------------------------------------- */
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

/* ---------------------------------------------------
   API Routes
--------------------------------------------------- */
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/checkout', stripeRoutes);

// Affiliate portal MUST come before general affiliate routes
app.use('/api/affiliates/portal', affiliatePortalRoutes);
app.use('/api/affiliates',        affiliateRoutes);

app.use('/api/suppliers',      supplierRoutes);
app.use('/api/vendors/portal', vendorPortalRoutes);

// Brand routes
// Public:  GET /api/brands/:slug
//          GET /api/brands/:slug/products
// Owner:   GET/PUT /api/brands/dashboard/me
// Admin:   GET/POST/PUT/DELETE /api/brands
app.use('/api/brands', brandRoutes);

/* ---------------------------------------------------
   DEV ONLY — Seed test order (single instance)
--------------------------------------------------- */
if (process.env.NODE_ENV !== 'production') {
  app.post('/api/test/seed-order', async (req, res) => {
    const Order = (await import('./models/Order.js')).default;
    const { orderNumber, vendorType, fulfillmentMethod, supplierName } = req.body;
    const order = await Order.create({
      orderNumber, vendorType, fulfillmentMethod,
      items:    [{ name: 'Hat', quantity: 1, price: 35 }],
      customer: { name: 'Test User', email: 'test@hna.com', address: '123 Test St' },
      totalPrice: 35, paymentStatus: 'Paid', status: 'Processing',
      supplier:  { name: supplierName },
      statusHistory: [{ status: 'Processing', updatedBy: 'seed', timestamp: new Date() }]
    });
    res.json(order);
  });
}

/* ---------------------------------------------------
   Error Middleware (MUST be last)
--------------------------------------------------- */
app.use(notFound);
app.use(errorHandler);

/* ---------------------------------------------------
   Server Start
--------------------------------------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});



// import express from "express";
// import dotenv from "dotenv";
// import cors from "cors";
// import connectDB from "./config/db.js";

// import productRoutes from "./routes/productRoutes.js";
// import orderRoutes from "./routes/orderRoutes.js";
// import userRoutes from "./routes/userRoutes.js";
// import stripeRoutes from "./routes/stripeRoutes.js";
// import supplierRoutes from "./routes/supplierRoutes.js";
// import affiliateRoutes from "./routes/affiliateRoutes.js";
// import affiliatePortalRoutes from "./routes/affiliatePortalRoutes.js";
// import vendorPortalRoutes from "./routes/vendorPortalRoutes.js"; // ← ADD

// import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// import nodemailer from "nodemailer";

// import brandRoutes from './routes/brandRoutes.js';


// dotenv.config();
// connectDB();

// const app = express();
// const PORT = process.env.PORT || 5001;

// /* ---------------------------------------------------
//    Stripe Webhook (MUST come before express.json)
// --------------------------------------------------- */
// app.use("/api/checkout/webhook", express.raw({ type: "application/json" }));

// /* ---------------------------------------------------
//    CORS
// --------------------------------------------------- */
// const allowedOrigins =
//   process.env.NODE_ENV === "production"
//     ? [process.env.CLIENT_URL]
//     : [
//         "http://localhost:5173",
//         "http://localhost:5174",
//         "http://localhost:5175",
//         "http://localhost:5001",
//       ];

// const corsOptions = {
//   origin: function (origin, callback) {
//     if (!origin) return callback(null, true);

//     if (allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("CORS not allowed"));
//     }
//   },
//   credentials: true,
// };

// app.use(cors(corsOptions));

// /* ---------------------------------------------------
//    Body Parsers
// --------------------------------------------------- */
// app.use(express.json({ limit: "50mb" }));
// app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// /* ---------------------------------------------------
//    Root Route (Prevents Not Found /)
// --------------------------------------------------- */
// app.get("/", (req, res) => {
//   res.json({
//     status: "running",
//     api: "HNA Vault API",
//     version: "1.0",
//   });
// });

// /* ---------------------------------------------------
//    Health Check
// --------------------------------------------------- */
// app.get("/api/health", (req, res) => {
//   res.status(200).json({ status: "OK" });
// });

// /* ---------------------------------------------------
//    API Routes
// --------------------------------------------------- */
// app.use('/api/brands', brandRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/checkout", stripeRoutes);

// // Portal MUST come first
// app.use('/api/affiliates/portal', affiliatePortalRoutes);

// // General affiliates AFTER
// app.use('/api/affiliates', affiliateRoutes);

// app.use('/api/suppliers', supplierRoutes);

// // Vendor portal                               ← ADD
// app.use('/api/vendors/portal', vendorPortalRoutes);

// /* ---------------------------------------------------
//    Error Middleware
// --------------------------------------------------- */
// // DEV ONLY
// app.post("/api/test/seed-order", async (req, res) => {
//   if (process.env.NODE_ENV === "production") return res.status(403).end();
//   const Order = (await import("./models/Order.js")).default;
//   const { orderNumber, vendorType, fulfillmentMethod, supplierName } = req.body;
//   const order = await Order.create({ orderNumber, vendorType, fulfillmentMethod, items: [{ name: "Hat", quantity: 1, price: 35 }], customer: { name: "Test User", email: "test@hna.com", address: "123 Test St" }, totalPrice: 35, paymentStatus: "Paid", status: "Processing", supplier: { name: supplierName }, statusHistory: [{ status: "Processing", updatedBy: "seed", timestamp: new Date() }] });
//   res.json(order);
// });

// app.use(notFound);
// app.use(errorHandler);


// // DEV ONLY — seed test order
// app.post('/api/test/seed-order', async (req, res) => {
//   if (process.env.NODE_ENV === 'production') return res.status(403).end();
//   const Order = (await import('./models/Order.js')).default;
//   const { orderNumber, vendorType, fulfillmentMethod, supplierName } = req.body;
//   const order = await Order.create({
//     orderNumber, vendorType, fulfillmentMethod,
//     items: [{ name: 'Hat', quantity: 1, price: 35 }],
//     customer: { name: 'Test User', email: 'test@hna.com', address: '123 Test St' },
//     totalPrice: 35, paymentStatus: 'Paid', status: 'Processing',
//     supplier: { name: supplierName },
//     statusHistory: [{ status: 'Processing', updatedBy: 'seed', timestamp: new Date() }]
//   });
//   res.json(order);
// });
// /* ---------------------------------------------------
//    Server Start
// --------------------------------------------------- */
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });