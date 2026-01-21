import express from 'express';
import { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  uploadProductImage 
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Protected routes (admin only) - temporarily unprotected for development
// TODO: Re-enable authentication before deploying to production
const isDevelopment = process.env.NODE_ENV !== 'production';
if (isDevelopment) {
  router.post('/', upload.single('image'), createProduct);
  router.put('/:id', upload.single('image'), updateProduct);
  router.delete('/:id', deleteProduct);
  router.post('/upload', upload.single('image'), uploadProductImage);
} else {
  router.post('/', protect, admin, upload.single('image'), createProduct);
  router.put('/:id', protect, admin, upload.single('image'), updateProduct);
  router.delete('/:id', protect, admin, deleteProduct);
  router.post('/upload', protect, admin, upload.single('image'), uploadProductImage);
}

export default router;
