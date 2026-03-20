import mongoose from 'mongoose';

const brandSchema = new mongoose.Schema(
  {
    // ── Identity ────────────────────────────────────────────────────────────
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
      // powers /store/:slug on HNA side
      // e.g. 'italylucas' → hnavault.com/store/italylucas
    },
    domain: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true
      // custom domain e.g. 'italylucasbrand.com'
      // brand owner points CNAME to your server
      // brandMiddleware reads this to identify which brand to serve
    },

    // ── Owner ───────────────────────────────────────────────────────────────
    // owner: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'User',
    //   required: true
    // },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },


    // ── Branding ────────────────────────────────────────────────────────────
    logo:         { type: String, default: '' },
    heroImage:    { type: String, default: '' },
    primaryColor: { type: String, default: '#6366f1' },
    accentColor:  { type: String, default: '#818cf8' },
    bio:          { type: String, default: '' },
    tagline:      { type: String, default: '' },

    // ── Social ──────────────────────────────────────────────────────────────
    socialLinks: {
      instagram: { type: String, default: '' },
      tiktok:    { type: String, default: '' },
      twitter:   { type: String, default: '' },
      youtube:   { type: String, default: '' },
    },

    // ── Platform settings ───────────────────────────────────────────────────
    plan: {
      type: String,
      enum: ['starter', 'pro', 'elite'],
      default: 'starter'
      // starter → HNA slug only (/store/italylucas)
      // pro     → custom domain + full storefront
      // elite   → custom domain + Stripe Connect + full analytics
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'suspended', 'inactive'],
      default: 'pending'
    },

    // ── Fulfillment ─────────────────────────────────────────────────────────
    vendorType: {
      type: String,
      enum: ['inhouse', 'external'],
      default: 'inhouse'
      // all brand orders route through JayR by default
    },

    // ── Revenue share ───────────────────────────────────────────────────────
    platformCommissionRate: {
      type: Number,
      default: 15, // HNA keeps 15% of brand revenue
      min: 0,
      max: 100
    },

    // ── Stripe Connect ──────────────────────────────────────────────────────
    stripeAccountId: {
      type: String,
      default: ''
    },
    stripeOnboardingComplete: {
      type: Boolean,
      default: false
    },

    // ── Stats ───────────────────────────────────────────────────────────────
    totalOrders:  { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    totalPaid:    { type: Number, default: 0 },

    // ── Admin notes ─────────────────────────────────────────────────────────
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);


export default mongoose.model('Brand', brandSchema);





// import mongoose from 'mongoose';

// const { Schema } = mongoose;

// const brandSchema = new mongoose.Schema({
//   name:            String,
//   slug:            String,
//   domain:          String,
//   owner:           { type: Schema.Types.ObjectId, ref: 'User' },
//   logo:            String,
//   heroImage:       String,
//   primaryColor:    String,
//   bio:             String,
//   socialLinks:     Object,
//   stripeAccountId: String,
//   plan:            String,  // 'starter' | 'pro' | 'elite'
//   status:          String,  // 'active' | 'pending' | 'suspended'
//   vendorType:      String,  // 'inhouse'
//   commissionRate:  Number,
// }, { timestamps: true });

// export default mongoose.model('Brand', brandSchema);

