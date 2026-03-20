import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
  {
    name:           { type: String, required: true },
    description:    { type: String },
    price:          { type: Number, required: true },
    compareAtPrice: { type: Number },
    cost:           { type: Number },
    image: {
      type: String,
      default: '/assets/placeholder.png'
    },
    cloudinaryId: { type: String },
    category: {
      type: String,
      enum: ['Tops', 'Bottoms', 'Accessories', 'Outerwear', 'Other'],
      default: 'Other'
    },
    countInStock: { type: Number, required: true, default: 0 },
    isActive:     { type: Boolean, default: true },
    sku:          { type: String, unique: true, sparse: true },
    tags:         [{ type: String }],

    // ─── Print on demand ──────────────────────────────────────────────
    // Fulfillment handled by in-house vendor (JayR / Shirtzilla)
    // Printify/Printful fields kept but inactive — remove if never needed
    // printfulVariantId: { type: Number },
    // printifyProductId: { type: String },
    // printifyVariantId: { type: Number },

    // ─── Brand (white-label platform) ─────────────────────────────────
    // null     = HNA's own product
    // ObjectId = belongs to a partner brand (Italy Lucas, etc.)
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
      default: null
    },
  },
  { timestamps: true }
);

// Fast queries for brand storefront and admin brand filter
productSchema.index({ brand: 1, isActive: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;




// import mongoose from 'mongoose';

// const productSchema = mongoose.Schema(
//   {
//     name:           { type: String, required: true },
//     description:    { type: String },
//     price:          { type: Number, required: true },
//     compareAtPrice: { type: Number },
//     cost:           { type: Number },
//     image: {
//       type: String,
//       default: '/assets/placeholder.png'
//     },
//     cloudinaryId: { type: String },
//     category: {
//       type: String,
//       enum: ['Tops', 'Bottoms', 'Accessories', 'Outerwear', 'Other'],
//       default: 'Other'
//     },
//     countInStock: { type: Number, required: true, default: 0 },
//     isActive:     { type: Boolean, default: true },
//     sku:          { type: String, unique: true, sparse: true },
//     tags:         [{ type: String }],

//     // ─── Print on demand ──────────────────────────────────────────────
//     // Fulfillment handled by in-house vendor (JayR / Shirtzilla)
//     // Printify/Printful fields kept but inactive — remove if never needed
//     // printfulVariantId: { type: Number },
//     // printifyProductId: { type: String },
//     // printifyVariantId: { type: Number },

//     // ─── Brand (white-label platform) ─────────────────────────────────
//     // null     = HNA's own product
//     // ObjectId = belongs to a partner brand (Italy Lucas, etc.)
//     brand: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'Brand',
//       default: null
//     },
//   },
//   { timestamps: true }
// );

// // Fast queries for brand storefront and admin brand filter
// productSchema.index({ brand: 1, isActive: 1 });

// const Product = mongoose.model('Product', productSchema);
// export default Product;










// import mongoose from 'mongoose';

// const productSchema = mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     description: { type: String },
//     price: { type: Number, required: true },
//     compareAtPrice: { type: Number },
//     cost: { type: Number },
//     image: { 
//       type: String,
//       default: '/assets/placeholder.png'
//     },
//     cloudinaryId: { type: String },
//     category: { 
//       type: String,
//       enum: ['Tops', 'Bottoms', 'Accessories', 'Outerwear', 'Other'],
//       default: 'Other'
//     },
//     countInStock: { type: Number, required: true, default: 0 },
//     isActive: { type: Boolean, default: true },
//     sku: { type: String, unique: true, sparse: true },
//     tags: [{ type: String }],
//     printfulVariantId: { type: Number },
//     printifyProductId: { type: String },
//     printifyVariantId: { type: Number }
//   },
//   { timestamps: true }
// );

// const Product = mongoose.model('Product', productSchema);
// export default Product;
