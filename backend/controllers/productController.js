import Product from '../models/Product.js';
import cloudinary from '../config/cloudinary.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res) => {
  try {
    console.log('Creating product with data:', req.body);
    console.log('File uploaded:', req.file);
    
    const { 
      name, 
      description, 
      price, 
      compareAtPrice,
      cost,
      category, 
      countInStock, 
      sku,
      tags,
      printfulVariantId,
      printifyProductId,
      printifyVariantId
    } = req.body;

    // Handle image from request (if uploaded via multer)
    let imageUrl = '/assets/placeholder.png';
    let cloudinaryId = null;
    
    if (req.file) {
      imageUrl = req.file.path;
      cloudinaryId = req.file.filename;
    } else if (req.body.image) {
      imageUrl = req.body.image;
    }

    const product = new Product({
      name,
      description,
      price,
      compareAtPrice,
      cost,
      image: imageUrl,
      cloudinaryId,
      category,
      countInStock,
      sku: sku && sku.trim() !== '' ? sku : undefined, // Only set SKU if it has a value
      tags: tags ? (Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim())) : [],
      printfulVariantId,
      printifyProductId,
      printifyVariantId
    });

    const createdProduct = await product.save();
    console.log('Product created successfully:', createdProduct._id);
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    // Handle duplicate SKU error
    if (error.code === 11000 && error.keyPattern?.sku) {
      return res.status(400).json({ message: 'SKU already exists. Please use a unique SKU or leave it empty.' });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // If new image uploaded, delete old one from Cloudinary
      if (req.file && product.cloudinaryId) {
        try {
          await cloudinary.uploader.destroy(product.cloudinaryId);
        } catch (error) {
          console.error('Error deleting old image:', error);
        }
      }

      product.name = req.body.name || product.name;
      product.description = req.body.description || product.description;
      product.price = req.body.price !== undefined ? req.body.price : product.price;
      product.compareAtPrice = req.body.compareAtPrice !== undefined ? req.body.compareAtPrice : product.compareAtPrice;
      product.cost = req.body.cost !== undefined ? req.body.cost : product.cost;
      product.category = req.body.category || product.category;
      product.countInStock = req.body.countInStock !== undefined ? req.body.countInStock : product.countInStock;
      product.isActive = req.body.isActive !== undefined ? req.body.isActive : product.isActive;
      product.sku = req.body.sku && req.body.sku.trim() !== '' ? req.body.sku : undefined; // Only set SKU if it has a value
      product.printfulVariantId = req.body.printfulVariantId || product.printfulVariantId;
      product.printifyProductId = req.body.printifyProductId || product.printifyProductId;
      product.printifyVariantId = req.body.printifyVariantId || product.printifyVariantId;

      if (req.body.tags) {
        product.tags = Array.isArray(req.body.tags) ? req.body.tags : req.body.tags.split(',').map(t => t.trim());
      }

      if (req.file) {
        product.image = req.file.path;
        product.cloudinaryId = req.file.filename;
      } else if (req.body.image && req.body.image !== product.image) {
        product.image = req.body.image;
      }

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    // Handle duplicate SKU error
    if (error.code === 11000 && error.keyPattern?.sku) {
      return res.status(400).json({ message: 'SKU already exists. Please use a unique SKU or leave it empty.' });
    }
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Delete image from Cloudinary if exists
      if (product.cloudinaryId) {
        try {
          await cloudinary.uploader.destroy(product.cloudinaryId);
        } catch (error) {
          console.error('Error deleting image from Cloudinary:', error);
        }
      }

      await product.deleteOne();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload product image
// @route   POST /api/products/upload
// @access  Private/Admin
export const uploadProductImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    res.json({
      message: 'Image uploaded successfully',
      image: req.file.path,
      cloudinaryId: req.file.filename
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
