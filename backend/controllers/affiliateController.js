import Affiliate from '../models/Affiliate.js';
import Order from '../models/Order.js';

// @desc    Get all affiliates
// @route   GET /api/affiliates
// @access  Private/Admin
const getAffiliates = async (req, res) => {
  try {
    const affiliates = await Affiliate.find({}).sort({ totalRevenue: -1 });
    res.json(affiliates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get affiliate stats
// @route   GET /api/affiliates/stats
// @access  Private/Admin
const getAffiliateStats = async (req, res) => {
  try {
    const affiliates = await Affiliate.find({});
    
    const stats = {
      totalAffiliates: affiliates.length,
      activeAffiliates: affiliates.filter(a => a.status === 'active').length,
      totalSales: affiliates.reduce((sum, a) => sum + a.totalSales, 0),
      totalRevenue: affiliates.reduce((sum, a) => sum + a.totalRevenue, 0),
      totalCommission: affiliates.reduce((sum, a) => sum + a.totalCommission, 0),
      unpaidCommission: affiliates.reduce((sum, a) => sum + a.unpaidCommission, 0),
      totalClicks: affiliates.reduce((sum, a) => sum + a.clicks, 0),
      totalConversions: affiliates.reduce((sum, a) => sum + a.conversions, 0),
      tierBreakdown: {
        Bronze: affiliates.filter(a => a.tier === 'Bronze').length,
        Silver: affiliates.filter(a => a.tier === 'Silver').length,
        Gold: affiliates.filter(a => a.tier === 'Gold').length,
        Platinum: affiliates.filter(a => a.tier === 'Platinum').length
      }
    };
    
    // Calculate overall conversion rate
    stats.conversionRate = stats.totalClicks > 0 
      ? ((stats.totalConversions / stats.totalClicks) * 100).toFixed(2)
      : 0;
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get top performers
// @route   GET /api/affiliates/top
// @access  Private/Admin
const getTopAffiliates = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const topAffiliates = await Affiliate.find({ status: 'active' })
      .sort({ totalRevenue: -1 })
      .limit(limit);
    
    res.json(topAffiliates);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create new affiliate
// @route   POST /api/affiliates
// @access  Private/Admin
const createAffiliate = async (req, res) => {
  try {
    const { name, email, code, commissionRate } = req.body;
    
    // Check if affiliate already exists
    const existingAffiliate = await Affiliate.findOne({ 
      $or: [{ email }, { code: code.toUpperCase() }] 
    });
    
    if (existingAffiliate) {
      return res.status(400).json({ 
        message: 'Affiliate with this email or code already exists' 
      });
    }
    
    const affiliate = await Affiliate.create({
      name,
      email,
      code: code.toUpperCase(),
      commissionRate: commissionRate || 10
    });
    
    res.status(201).json(affiliate);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update affiliate
// @route   PUT /api/affiliates/:id
// @access  Private/Admin
const updateAffiliate = async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.params.id);
    
    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate not found' });
    }
    
    const { name, email, code, commissionRate, status, paymentInfo, notes } = req.body;
    
    if (name) affiliate.name = name;
    if (email) affiliate.email = email;
    if (code) affiliate.code = code.toUpperCase();
    if (commissionRate !== undefined) affiliate.commissionRate = commissionRate;
    if (status) affiliate.status = status;
    if (paymentInfo) affiliate.paymentInfo = paymentInfo;
    if (notes !== undefined) affiliate.notes = notes;
    
    const updatedAffiliate = await affiliate.save();
    res.json(updatedAffiliate);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete affiliate
// @route   DELETE /api/affiliates/:id
// @access  Private/Admin
const deleteAffiliate = async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.params.id);
    
    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate not found' });
    }
    
    await affiliate.deleteOne();
    res.json({ message: 'Affiliate removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Record affiliate click
// @route   POST /api/affiliates/click/:code
// @access  Public
const recordClick = async (req, res) => {
  try {
    const affiliate = await Affiliate.findOne({ code: req.params.code.toUpperCase() });
    
    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate not found' });
    }
    
    affiliate.recordClick();
    await affiliate.save();
    
    res.json({ message: 'Click recorded', code: affiliate.code });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Record affiliate sale
// @route   POST /api/affiliates/sale/:code
// @access  Private
const recordSale = async (req, res) => {
  try {
    const { revenue } = req.body;
    const affiliate = await Affiliate.findOne({ code: req.params.code.toUpperCase() });
    
    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate not found' });
    }
    
    affiliate.addSale(revenue);
    await affiliate.save();
    
    res.json({ 
      message: 'Sale recorded', 
      commission: (revenue * affiliate.commissionRate) / 100,
      newTier: affiliate.tier
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Mark commission as paid
// @route   POST /api/affiliates/pay/:id
// @access  Private/Admin
const payCommission = async (req, res) => {
  try {
    const affiliate = await Affiliate.findById(req.params.id);
    
    if (!affiliate) {
      return res.status(404).json({ message: 'Affiliate not found' });
    }
    
    const { amount } = req.body;
    const paymentAmount = amount || affiliate.unpaidCommission;
    
    affiliate.unpaidCommission = Math.max(0, affiliate.unpaidCommission - paymentAmount);
    await affiliate.save();
    
    res.json({ 
      message: 'Commission payment recorded',
      paid: paymentAmount,
      remaining: affiliate.unpaidCommission
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get affiliate sales report (products sold by each affiliate)
// @route   GET /api/affiliates/sales-report
// @access  Private/Admin
const getAffiliateSalesReport = async (req, res) => {
  try {
    const orders = await Order.find({ 'affiliate.code': { $exists: true, $ne: '' } })
      .populate('affiliate.affiliateId', 'name code tier')
      .sort({ createdAt: -1 });

    // Group by affiliate
    const reportMap = {};
    
    orders.forEach(order => {
      const affiliateCode = order.affiliate.code;
      
      if (!reportMap[affiliateCode]) {
        reportMap[affiliateCode] = {
          code: affiliateCode,
          name: order.affiliate.affiliateId?.name || 'Unknown',
          tier: order.affiliate.affiliateId?.tier || 'Bronze',
          products: {},
          totalOrders: 0,
          totalRevenue: 0,
          totalCommission: 0
        };
      }
      
      reportMap[affiliateCode].totalOrders++;
      reportMap[affiliateCode].totalRevenue += order.totalPrice;
      reportMap[affiliateCode].totalCommission += order.affiliate.commission || 0;
      
      // Group products
      order.items.forEach(item => {
        if (!reportMap[affiliateCode].products[item.name]) {
          reportMap[affiliateCode].products[item.name] = {
            name: item.name,
            image: item.image,
            totalQuantity: 0,
            totalRevenue: 0,
            orders: 0
          };
        }
        
        reportMap[affiliateCode].products[item.name].totalQuantity += item.quantity;
        reportMap[affiliateCode].products[item.name].totalRevenue += item.price * item.quantity;
        reportMap[affiliateCode].products[item.name].orders++;
      });
    });
    
    // Convert to array and sort products
    const report = Object.values(reportMap).map(affiliate => ({
      ...affiliate,
      products: Object.values(affiliate.products).sort((a, b) => b.totalRevenue - a.totalRevenue)
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);
    
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  getAffiliates,
  getAffiliateStats,
  getTopAffiliates,
  createAffiliate,
  updateAffiliate,
  deleteAffiliate,
  recordClick,
  recordSale,
  payCommission,
  getAffiliateSalesReport
};
