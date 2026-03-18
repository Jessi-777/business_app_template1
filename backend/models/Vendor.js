import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({

  // ── Identity ───────────────────────────────────────────────────────────────
  name: {
    type: String,
    required: true,
    trim: true
  },
  businessName: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },

  // ── Auth (portal login) ────────────────────────────────────────────────────
  password: {
    type: String, // bcrypt hashed — set via POST /api/vendors/portal/set-password
  },

  // ── Status ────────────────────────────────────────────────────────────────
  status: {
    type: String,
    enum: ['active', 'pending', 'inactive', 'suspended'],
    default: 'pending'
  },

  // ── Fulfillment capabilities ───────────────────────────────────────────────
  capabilities: [{
    type: String,
    enum: [
      'screen-printing',
      'embroidery',
      'dtg',           // Direct to Garment
      'sublimation',
      'heat-transfer',
      'cut-and-sew',
      'embossing',
      'patches'
    ]
  }],

  // ── Turnaround & minimums ──────────────────────────────────────────────────
  turnaroundDays: {
    type: Number,
    default: 7
  },
  minimumOrderQty: {
    type: Number,
    default: 1
  },

  // ── Location ──────────────────────────────────────────────────────────────
  address: {
    type: String,
    default: ''
  },
  city: {
    type: String,
    default: ''
  },
  state: {
    type: String,
    default: ''
  },
  country: {
    type: String,
    default: 'US'
  },

  // ── Order stats ───────────────────────────────────────────────────────────
  totalOrdersFulfilled: {
    type: Number,
    default: 0
  },
  totalRevenuePaid: {
    type: Number,
    default: 0
  },

  // ── Notes (admin only) ────────────────────────────────────────────────────
  notes: {
    type: String,
    default: ''
  }

}, { timestamps: true });

export default mongoose.model('Vendor', vendorSchema);