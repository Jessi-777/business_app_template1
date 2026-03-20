import mongoose from 'mongoose';

const orderItemSchema = mongoose.Schema({
  product:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name:     { type: String, required: true },
  quantity: { type: Number, required: true },
  price:    { type: Number, required: true },
  image:    { type: String }
});

const orderSchema = mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    items:       [orderItemSchema],

    customer: {
      name:    { type: String, required: true },
      email:   { type: String, required: true },
      address: { type: String, required: true },
      city:    { type: String },
      zipCode: { type: String },
      country: { type: String }
    },

    totalPrice: { type: Number, required: true },

    affiliate: {
      code:             { type: String },
      affiliateId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Affiliate' },
      commission:       { type: Number, default: 0 },
      commissionPaid:   { type: Boolean, default: false },
      commissionPaidAt: { type: Date }
    },

    status: {
      type: String,
      required: true,
      enum: [
        'Pending',
        'Processing',
        'Sent to Supplier',
        'In Production',
        'Print Complete',
        'Shipped',
        'Delivered',
        'Cancelled'
      ],
      default: 'Pending'
    },

    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending'
    },

    supplier: {
      name:           { type: String },
      orderId:        { type: String },
      status:         { type: String },
      sentAt:         { type: Date },
      trackingNumber: { type: String }
    },

    // ─── Vendor Fulfillment ───────────────────────────────────────────
    vendorType: {
      type: String,
      enum: ['inhouse', 'external'],
      default: 'external'
    },
    fulfillmentMethod: {
      type: String,
      enum: ['ship_to_hna', 'ship_direct'],
      default: 'ship_direct'
    },
    vendorWebhookSent:   { type: Boolean, default: false },
    vendorWebhookSentAt: { type: Date },
    brandInsertAdded:    { type: Boolean, default: false },
    customerNotifiedAt:  { type: Date },
    trackingEnteredBy: {
      type: String,
      enum: ['vendor', 'hna']
    },
    statusHistory: [
      {
        status:    { type: String },
        updatedBy: { type: String },
        timestamp: { type: Date, default: Date.now }
      }
    ],
    // ─────────────────────────────────────────────────────────────────

    // ─── Brand (white-label platform) ────────────────────────────────
    // null     = HNA's own order
    // ObjectId = order placed on a partner brand's storefront
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      default: null
    },
    // ─────────────────────────────────────────────────────────────────

    notes:    { type: String },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    }
  },
  { timestamps: true }
);

orderSchema.index({ brand: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;



// import mongoose from 'mongoose';

// const orderItemSchema = mongoose.Schema({
//   product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
//   name: { type: String, required: true },
//   quantity: { type: Number, required: true },
//   price: { type: Number, required: true },
//   image: { type: String }
// });

// const orderSchema = mongoose.Schema(
//   {
//     orderNumber: { type: String, required: true, unique: true },
//     items: [orderItemSchema],
//     customer: {
//       name: { type: String, required: true },
//       email: { type: String, required: true },
//       address: { type: String, required: true },
//       city: { type: String },
//       zipCode: { type: String },
//       country: { type: String }
//     },
//     totalPrice: { type: Number, required: true },
//     affiliate: {
//       code: { type: String },
//       affiliateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Affiliate' },
//       commission: { type: Number, default: 0 },
//       commissionPaid: { type: Boolean, default: false },
//       commissionPaidAt: { type: Date }
//     },
//     status: {
//       type: String,
//       required: true,
//       enum: [
//         'Pending',
//         'Processing',
//         'Sent to Supplier',
//         'In Production',
//         'Print Complete',
//         'Shipped',
//         'Delivered',
//         'Cancelled'
//       ],
//       default: 'Pending'
//     },
//     paymentStatus: {
//       type: String,
//       enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
//       default: 'Pending'
//     },
//     supplier: {
//       name: { type: String },
//       orderId: { type: String },
//       status: { type: String },
//       sentAt: { type: Date },
//       trackingNumber: { type: String }
//     },

//     // ─── Vendor Fulfillment ───────────────────────────────────────────
//     vendorType: {
//       type: String,
//       enum: ['inhouse', 'external'],
//       default: 'external'
//     },
//     fulfillmentMethod: {
//       type: String,
//       enum: ['ship_to_hna', 'ship_direct'],
//       default: 'ship_direct'
//     },
//     vendorWebhookSent: { type: Boolean, default: false },
//     vendorWebhookSentAt: { type: Date },

//     // In-house path only — HNA marks true before entering tracking
//     brandInsertAdded: { type: Boolean, default: false },

//     // When tracking notification email was sent to customer
//     customerNotifiedAt: { type: Date },

//     // Who entered the tracking number
//     trackingEnteredBy: {
//       type: String,
//       enum: ['vendor', 'hna']
//     },

//     // Full audit log of all status changes
//     statusHistory: [
//       {
//         status: { type: String },
//         updatedBy: { type: String },
//         timestamp: { type: Date, default: Date.now }
//       }
//     ],
//     // ─────────────────────────────────────────────────────────────────

//     notes: { type: String },
//     priority: {
//       type: String,
//       enum: ['Low', 'Medium', 'High', 'Urgent'],
//       default: 'Medium'
//     }
//   },
//   { timestamps: true }
// );

// const Order = mongoose.model('Order', orderSchema);
// export default Order;



