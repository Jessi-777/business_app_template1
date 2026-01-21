import mongoose from 'mongoose';

const productSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    compareAtPrice: { type: Number },
    cost: { type: Number },
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
    isActive: { type: Boolean, default: true },
    sku: { type: String, unique: true, sparse: true },
    tags: [{ type: String }],
    printfulVariantId: { type: Number },
    printifyProductId: { type: String },
    printifyVariantId: { type: Number }
  },
  { timestamps: true }
);

const Product = mongoose.model('Product', productSchema);
export default Product;
