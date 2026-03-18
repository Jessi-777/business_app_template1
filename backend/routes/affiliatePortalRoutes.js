import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Affiliate from '../models/Affiliate.js';
import Order from '../models/Order.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'change-me-in-env';

/*
-----------------------------------------
AUTH MIDDLEWARE
-----------------------------------------
*/

const requireAffiliateAuth = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded.affiliateId) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    req.affiliateId = decoded.affiliateId;

    next();

  } catch (err) {
    console.error("Affiliate auth error:", err.message);
    return res.status(401).json({ message: 'Token expired or invalid' });
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

    const normalizedEmail = email.toLowerCase().trim();

    const affiliate = await Affiliate.findOne({ email: normalizedEmail });

    if (!affiliate) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (affiliate.status !== 'active') {
      return res.status(403).json({
        message: 'Account is not active. Contact support.'
      });
    }

    if (!affiliate.password) {
      return res.status(401).json({
        message: 'Portal access not set up. Contact admin.'
      });
    }

    const validPassword = await bcrypt.compare(password, affiliate.password);

    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { affiliateId: affiliate._id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeAffiliate = {
      _id: affiliate._id,
      name: affiliate.name,
      email: affiliate.email,
      code: affiliate.code,
      tier: affiliate.tier,
      status: affiliate.status,
      commissionRate: affiliate.commissionRate,
      totalSales: affiliate.totalSales,
      totalRevenue: affiliate.totalRevenue,
      totalCommission: affiliate.totalCommission,
      unpaidCommission: affiliate.unpaidCommission,
      paidCommission: affiliate.paidCommission,
      payments: affiliate.payments || [],
    };

    res.json({
      affiliate: safeAffiliate,
      token
    });

  } catch (error) {

    console.error("Affiliate login error:", error);

    res.status(500).json({
      message: 'Server error',
      error: error.message
    });

  }

});


/*
-----------------------------------------
GET CURRENT AFFILIATE
-----------------------------------------
*/

router.get('/me', requireAffiliateAuth, async (req, res) => {

  try {

    const affiliate = await Affiliate
      .findById(req.affiliateId)
      .select('-password');

    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate not found' });
    }

    res.json(affiliate);

  } catch (error) {

    console.error("Affiliate /me error:", error);

    res.status(500).json({
      message: 'Server error',
      error: error.message
    });

  }

});


/*
-----------------------------------------
MY SALES
-----------------------------------------
*/

router.get('/my-sales', requireAffiliateAuth, async (req, res) => {

  try {

    const affiliate = await Affiliate
      .findById(req.affiliateId)
      .select('code commissionRate');

    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate not found' });
    }

    const orders = await Order.find({
      'affiliate.code': affiliate.code,
      status: { $nin: ['cancelled', 'refunded'] }
    });

    const productMap = {};

    orders.forEach(order => {

      order.items.forEach(item => {

        if (!productMap[item.name]) {
          productMap[item.name] = {
            name: item.name,
            image: item.image || null,
            totalQuantity: 0,
            orders: 0,
            totalRevenue: 0
          };
        }

        productMap[item.name].totalQuantity += item.quantity;
        productMap[item.name].totalRevenue += item.price * item.quantity;
        productMap[item.name].orders += 1;

      });

    });

    const products = Object
      .values(productMap)
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.json({
      code: affiliate.code,
      commissionRate: affiliate.commissionRate,
      totalOrders: orders.length,
      products
    });

  } catch (error) {

    console.error("Affiliate sales error:", error);

    res.status(500).json({
      message: 'Server error',
      error: error.message
    });

  }

});


/*
-----------------------------------------
DEV PASSWORD SETUP
-----------------------------------------
*/

router.post('/set-password', async (req, res) => {

  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({
      message: 'Use admin authentication in production'
    });
  }

  try {

    const { affiliateId, password } = req.body;

    if (!affiliateId || !password) {
      return res.status(400).json({
        message: 'affiliateId and password required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await Affiliate.findByIdAndUpdate(
      affiliateId,
      { password: hashedPassword }
    );

    res.json({ message: 'Password set successfully' });

  } catch (error) {

    console.error("Set password error:", error);

    res.status(500).json({
      message: 'Server error',
      error: error.message
    });

  }

});


/*
-----------------------------------------
DEBUG ROUTE
-----------------------------------------
*/

router.get('/debug-affiliates', async (req, res) => {

  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ message: 'Not allowed' });
  }

  const affiliates = await Affiliate
    .find()
    .select('name email code status');

  res.json(affiliates);

});


export default router;