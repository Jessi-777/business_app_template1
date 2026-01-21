import mongoose from 'mongoose';

const orderItemSchema = mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Optional - for manual orders
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String }
});

const orderSchema = mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    items: [orderItemSchema],
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String },
      zipCode: { type: String },
      country: { type: String }
    },
    totalPrice: { type: Number, required: true },
    affiliate: {
      code: { type: String },
      affiliateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Affiliate' },
      commission: { type: Number, default: 0 },
      commissionPaid: { type: Boolean, default: false },
      commissionPaidAt: { type: Date }
    },
    status: { 
      type: String, 
      required: true,
      enum: ['Pending', 'Processing', 'Sent to Supplier', 'In Production', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending' 
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
      default: 'Pending'
    },
    supplier: {
      name: { type: String },
      orderId: { type: String },
      status: { type: String },
      sentAt: { type: Date },
      trackingNumber: { type: String }
    },
    notes: { type: String },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    }
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
