import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import Vendor from '../models/Vendor.js';
import Order from '../models/Order.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-env';

/*
-----------------------------------------
AUTH MIDDLEWARE
-----------------------------------------
*/

const requireVendorAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.vendorId) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.vendorId = decoded.vendorId;
    next();
  } catch (err) {
    console.error('Vendor auth error:', err.message);
    return res.status(401).json({ message: 'Token expired or invalid' });
  }
};

/*
-----------------------------------------
EMAIL HELPER
Sends order notification to vendor email
-----------------------------------------
*/

const sendOrderNotificationEmail = async (vendorEmail, vendorName, order) => {
  try {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const itemsList = order.items
      .map(i => `• ${i.name} x${i.quantity} — $${i.price}`)
      .join('\n');

    await transporter.sendMail({
      from: `"HNA Orders" <${process.env.SMTP_USER}>`,
      to: vendorEmail,
      subject: `🆕 New Order #${order.orderNumber} — Action Required`,
      text: `
Hi ${vendorName},

You have a new order to fulfill on the HNA vendor portal.

ORDER #${order.orderNumber}
----------------------------
${itemsList}

SHIP TO:
${order.customer.name}
${order.customer.address}
${order.customer.city}, ${order.customer.zipCode}
${order.customer.country}

Log in to your vendor portal to view this order:
${process.env.CLIENT_URL || 'http://localhost:5173'}/vendor

— HNA Team
      `.trim(),
    });

    console.log(`Order notification sent to ${vendorEmail}`);
  } catch (err) {
    console.error('Email notification failed:', err.message);
  }
};

/*
-----------------------------------------
LOGIN
-----------------------------------------
*/

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password required' });
    }

    const vendor = await Vendor.findOne({ email: email.toLowerCase().trim() });

    if (!vendor) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (vendor.status !== 'active') {
      return res.status(403).json({ message: 'Account is not active. Contact support.' });
    }

    if (!vendor.password) {
      return res.status(401).json({ message: 'Portal access not set up. Contact admin.' });
    }

    const validPassword = await bcrypt.compare(password, vendor.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { vendorId: vendor._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeVendor = {
      _id:                  vendor._id,
      name:                 vendor.name,
      businessName:         vendor.businessName,
      email:                vendor.email,
      status:               vendor.status,
      capabilities:         vendor.capabilities,
      turnaroundDays:       vendor.turnaroundDays,
      minimumOrderQty:      vendor.minimumOrderQty,
      totalOrdersFulfilled: vendor.totalOrdersFulfilled,
      totalRevenuePaid:     vendor.totalRevenuePaid,
    };

    res.json({ vendor: safeVendor, token });

  } catch (error) {
    console.error('Vendor login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/*
-----------------------------------------
GET CURRENT VENDOR
-----------------------------------------
*/

router.get('/me', requireVendorAuth, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendorId).select('-password');
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json(vendor);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/*
-----------------------------------------
MY ORDERS
Returns orders where supplier.name matches
this vendor's businessName or name
-----------------------------------------
*/

router.get('/my-orders', requireVendorAuth, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendorId).select('name businessName');
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    const vendorName = vendor.businessName || vendor.name;

    const orders = await Order.find({
      'supplier.name': vendorName,
      status: { $in: ['Sent to Supplier', 'In Production', 'Print Complete', 'Shipped', 'Delivered'] }
    }).sort({ createdAt: -1 });

    res.json(orders);

  } catch (error) {
    console.error('Vendor my-orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/*
-----------------------------------------
UPDATE ORDER
Only available for in-house vendors.
External vendors (JayR) are read-only —
status updates come through /webhook/jayr
-----------------------------------------
*/

router.put('/orders/:id', requireVendorAuth, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendorId).select('name businessName');
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    const vendorName = vendor.businessName || vendor.name;

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Security: vendor can only touch their own orders
    if (order.supplier?.name !== vendorName) {
      return res.status(403).json({ message: 'Not authorized to update this order' });
    }

    // ✅ External vendors are read-only — JayR pushes status via webhook
    if (order.vendorType === 'external') {
      return res.status(403).json({
        message: 'This order is managed via API integration. Status updates must come through your webhook endpoint.'
      });
    }

    const { supplierStatus, trackingNumber, notes } = req.body;

    if (supplierStatus) order.supplier.status = supplierStatus;
    if (trackingNumber) {
      order.supplier.trackingNumber = trackingNumber.trim();
      order.trackingEnteredBy = 'hna';
    }
    if (notes) order.notes = notes;

    // Auto-advance main order status
    if (supplierStatus === 'in_production') order.status = 'In Production';
    if (supplierStatus === 'print_complete') order.status = 'Print Complete';
    if (trackingNumber && trackingNumber.trim() !== '') order.status = 'Shipped';

    // Append to audit log
    order.statusHistory.push({
      status: order.status,
      updatedBy: `vendor:${vendorName}`,
      timestamp: new Date()
    });

    if (order.status === 'Shipped') {
      await Vendor.findByIdAndUpdate(req.vendorId, {
        $inc: { totalOrdersFulfilled: 1 }
      });
    }

    await order.save();
    res.json(order);

  } catch (error) {
    console.error('Vendor order update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/*
-----------------------------------------
JAYR INBOUND WEBHOOK
JayR's system POSTs status updates here.
No vendor auth needed — uses shared API key.
POST /api/vendor/webhook/jayr
-----------------------------------------
*/

router.post('/webhook/jayr', express.json(), async (req, res) => {
  // Validate shared API key
  const apiKey = req.headers['x-api-key'];
  if (!apiKey || apiKey !== process.env.JAYR_API_KEY) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const { orderNumber, status, trackingNumber } = req.body;

  if (!orderNumber || !status) {
    return res.status(400).json({ message: 'orderNumber and status are required' });
  }

  try {
    const order = await Order.findOne({ orderNumber });
    if (!order) return res.status(404).json({ message: `Order ${orderNumber} not found` });

    // Map JayR's status values to HNA Order enum
    const statusMap = {
      in_production: 'In Production',
      print_complete: 'Print Complete',
      shipped: 'Shipped',
    };

    const mappedStatus = statusMap[status];
    if (!mappedStatus) {
      return res.status(400).json({ message: `Unknown status value: ${status}. Accepted: in_production, print_complete, shipped` });
    }

    order.status = mappedStatus;
    order.supplier.status = status;

    if (trackingNumber) {
      order.supplier.trackingNumber = trackingNumber.trim();
      order.trackingEnteredBy = 'vendor';
    }

    // Append to audit log
    order.statusHistory.push({
      status: mappedStatus,
      updatedBy: 'jayr_webhook',
      timestamp: new Date()
    });

    await order.save();
    console.log(`📡 JayR webhook: order ${orderNumber} → ${mappedStatus}`);
    res.json({ received: true, orderNumber, status: mappedStatus });

  } catch (err) {
    console.error('JayR inbound webhook error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

/*
-----------------------------------------
SET PASSWORD (dev only)
-----------------------------------------
*/

router.post('/set-password', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Use admin authentication in production' });
  }
  try {
    const { vendorId, password } = req.body;
    if (!vendorId || !password) {
      return res.status(400).json({ message: 'vendorId and password required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }
    const hashed = await bcrypt.hash(password, 12);
    await Vendor.findByIdAndUpdate(vendorId, { password: hashed });
    res.json({ message: 'Password set successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/*
-----------------------------------------
DEBUG ROUTE
-----------------------------------------
*/

router.get('/debug-vendors', async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Not allowed' });
  }
  const vendors = await Vendor.find().select('name businessName email status capabilities');
  res.json(vendors);
});

export default router;


// import express from 'express';
// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs';
// import nodemailer from 'nodemailer';
// import Vendor from '../models/Vendor.js';
// import Order from '../models/Order.js';

// const router = express.Router();
// const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-env';

// /*
// -----------------------------------------
// AUTH MIDDLEWARE
// -----------------------------------------
// */

// const requireVendorAuth = async (req, res, next) => {
//   try {
//     const authHeader = req.headers.authorization;
//     if (!authHeader || !authHeader.startsWith('Bearer ')) {
//       return res.status(401).json({ message: 'Unauthorized' });
//     }
//     const token = authHeader.split(' ')[1];
//     const decoded = jwt.verify(token, JWT_SECRET);
//     if (!decoded.vendorId) {
//       return res.status(401).json({ message: 'Invalid token' });
//     }
//     req.vendorId = decoded.vendorId;
//     next();
//   } catch (err) {
//     console.error('Vendor auth error:', err.message);
//     return res.status(401).json({ message: 'Token expired or invalid' });
//   }
// };

// /*
// -----------------------------------------
// EMAIL HELPER
// Sends order notification to vendor email
// -----------------------------------------
// */

// const sendOrderNotificationEmail = async (vendorEmail, vendorName, order) => {
//   try {
//     // Only send if SMTP is configured
//     if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return;

//     const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: process.env.SMTP_PORT || 587,
//       secure: false,
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//     });

//     const itemsList = order.items
//       .map(i => `• ${i.name} x${i.quantity} — $${i.price}`)
//       .join('\n');

//     await transporter.sendMail({
//       from: `"HNA Orders" <${process.env.SMTP_USER}>`,
//       to: vendorEmail,
//       subject: `🆕 New Order #${order.orderNumber} — Action Required`,
//       text: `
// Hi ${vendorName},

// You have a new order to fulfill on the HNA vendor portal.

// ORDER #${order.orderNumber}
// ----------------------------
// ${itemsList}

// SHIP TO:
// ${order.customer.name}
// ${order.customer.address}
// ${order.customer.city}, ${order.customer.zipCode}
// ${order.customer.country}

// Log in to your vendor portal to view and fulfill this order:
// ${process.env.CLIENT_URL || 'http://localhost:5173'}/vendor

// — HNA Team
//       `.trim(),
//     });

//     console.log(`Order notification sent to ${vendorEmail}`);
//   } catch (err) {
//     // Non-fatal — log but don't crash the request
//     console.error('Email notification failed:', err.message);
//   }
// };

// /*
// -----------------------------------------
// LOGIN
// -----------------------------------------
// */

// router.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ message: 'Email and password required' });
//     }

//     const vendor = await Vendor.findOne({ email: email.toLowerCase().trim() });

//     if (!vendor) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     if (vendor.status !== 'active') {
//       return res.status(403).json({ message: 'Account is not active. Contact support.' });
//     }

//     if (!vendor.password) {
//       return res.status(401).json({ message: 'Portal access not set up. Contact admin.' });
//     }

//     const validPassword = await bcrypt.compare(password, vendor.password);

//     if (!validPassword) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     const token = jwt.sign(
//       { vendorId: vendor._id },
//       JWT_SECRET,
//       { expiresIn: '7d' }
//     );

//     const safeVendor = {
//       _id:                  vendor._id,
//       name:                 vendor.name,
//       businessName:         vendor.businessName,
//       email:                vendor.email,
//       status:               vendor.status,
//       capabilities:         vendor.capabilities,
//       turnaroundDays:       vendor.turnaroundDays,
//       minimumOrderQty:      vendor.minimumOrderQty,
//       totalOrdersFulfilled: vendor.totalOrdersFulfilled,
//       totalRevenuePaid:     vendor.totalRevenuePaid,
//     };

//     res.json({ vendor: safeVendor, token });

//   } catch (error) {
//     console.error('Vendor login error:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// /*
// -----------------------------------------
// GET CURRENT VENDOR
// -----------------------------------------
// */

// router.get('/me', requireVendorAuth, async (req, res) => {
//   try {
//     const vendor = await Vendor.findById(req.vendorId).select('-password');
//     if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
//     res.json(vendor);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// /*
// -----------------------------------------
// MY ORDERS
// Returns orders where supplier.name matches
// this vendor's businessName or name
// -----------------------------------------
// */

// router.get('/my-orders', requireVendorAuth, async (req, res) => {
//   try {
//     const vendor = await Vendor.findById(req.vendorId).select('name businessName');
//     if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

//     const vendorName = vendor.businessName || vendor.name;

//     const orders = await Order.find({
//       'supplier.name': vendorName,
//       status: { $in: ['Sent to Supplier', 'In Production', 'Shipped', 'Delivered'] }
//     }).sort({ createdAt: -1 });

//     res.json(orders);

//   } catch (error) {
//     console.error('Vendor my-orders error:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// /*
// -----------------------------------------
// UPDATE ORDER
// Vendor marks in production, adds tracking,
// marks shipped — updates order status too
// -----------------------------------------
// */

// router.put('/orders/:id', requireVendorAuth, async (req, res) => {
//   try {
//     const vendor = await Vendor.findById(req.vendorId).select('name businessName');
//     if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

//     const vendorName = vendor.businessName || vendor.name;

//     const order = await Order.findById(req.params.id);
//     if (!order) return res.status(404).json({ message: 'Order not found' });

//     // Security: vendor can only update their own orders
//     if (order.supplier?.name !== vendorName) {
//       return res.status(403).json({ message: 'Not authorized to update this order' });
//     }

//     const { supplierStatus, trackingNumber, notes } = req.body;

//     // Update supplier sub-document
//     if (supplierStatus) order.supplier.status = supplierStatus;
//     if (trackingNumber) order.supplier.trackingNumber = trackingNumber;
//     if (notes)          order.notes = notes;

//     // Auto-advance main order status based on supplier action
//     if (supplierStatus === 'in_production') {
//       order.status = 'In Production';
//     }
//     if (trackingNumber && trackingNumber.trim() !== '') {
//       order.status = 'Shipped';
//       order.supplier.trackingNumber = trackingNumber.trim();
//     }

//     // Track fulfillment stats on vendor
//     if (order.status === 'Shipped') {
//       await Vendor.findByIdAndUpdate(req.vendorId, {
//         $inc: { totalOrdersFulfilled: 1 }
//       });
//     }

//     await order.save();
//     res.json(order);

//   } catch (error) {
//     console.error('Vendor order update error:', error);
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// /*
// -----------------------------------------
// SET PASSWORD (admin only in dev)
// -----------------------------------------
// */

// router.post('/set-password', async (req, res) => {
//   if (process.env.NODE_ENV === 'production') {
//     return res.status(403).json({ message: 'Use admin authentication in production' });
//   }
//   try {
//     const { vendorId, password } = req.body;
//     if (!vendorId || !password) {
//       return res.status(400).json({ message: 'vendorId and password required' });
//     }
//     if (password.length < 8) {
//       return res.status(400).json({ message: 'Password must be at least 8 characters' });
//     }
//     const hashed = await bcrypt.hash(password, 12);
//     await Vendor.findByIdAndUpdate(vendorId, { password: hashed });
//     res.json({ message: 'Password set successfully' });
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });

// /*
// -----------------------------------------
// DEBUG ROUTE
// -----------------------------------------
// */

// router.get('/debug-vendors', async (req, res) => {
//   if (process.env.NODE_ENV === 'production') {
//     return res.status(403).json({ message: 'Not allowed' });
//   }
//   const vendors = await Vendor.find().select('name businessName email status capabilities');
//   res.json(vendors);
// });

// export default router;