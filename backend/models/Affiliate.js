import mongoose from 'mongoose';

const affiliateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  tier: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
    default: 'Bronze'
  },
  commissionRate: {
    type: Number,
    default: 10, // percentage
    min: 0,
    max: 100
  },
  status: {
    type: String,
    enum: ['active', 'pending', 'inactive', 'suspended'],
    default: 'active'
  },
  totalSales: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  totalCommission: {
    type: Number,
    default: 0
  },
  unpaidCommission: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  conversions: {
    type: Number,
    default: 0
  },
  paymentInfo: {
    method: {
      type: String,
      enum: ['paypal', 'bank', 'venmo', 'cashapp', ''],
      default: ''
    },
    details: {
      type: String,
      default: ''
    }
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Virtual for conversion rate
affiliateSchema.virtual('conversionRate').get(function() {
  if (this.clicks === 0) return 0;
  return ((this.conversions / this.clicks) * 100).toFixed(2);
});

// Update tier based on total sales
affiliateSchema.methods.updateTier = function() {
  if (this.totalSales >= 100) {
    this.tier = 'Platinum';
    this.commissionRate = 20;
  } else if (this.totalSales >= 50) {
    this.tier = 'Gold';
    this.commissionRate = 15;
  } else if (this.totalSales >= 20) {
    this.tier = 'Silver';
    this.commissionRate = 12;
  } else {
    this.tier = 'Bronze';
    this.commissionRate = 10;
  }
};

// Add sale to affiliate
affiliateSchema.methods.addSale = function(revenue) {
  this.totalSales += 1;
  this.totalRevenue += revenue;
  this.conversions += 1;
  
  const commission = (revenue * this.commissionRate) / 100;
  this.totalCommission += commission;
  this.unpaidCommission += commission;
  
  this.updateTier();
};

// Record click
affiliateSchema.methods.recordClick = function() {
  this.clicks += 1;
};

export default mongoose.model('Affiliate', affiliateSchema);
