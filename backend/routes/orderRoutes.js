import express from 'express';
import { 
  createOrder, 
  getOrders, 
  getOrderById,
  updateOrder,
  deleteOrder,
  sendOrderToSupplier,
  getOrderAnalytics
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route - anyone can create order (for checkout)
router.post('/', createOrder);

// Protected routes - admin only
router.get('/', protect, admin, getOrders);
router.get('/analytics/stats', protect, admin, getOrderAnalytics);
router.get('/:id', protect, admin, getOrderById);
router.put('/:id', protect, admin, updateOrder);
router.delete('/:id', protect, admin, deleteOrder);
router.post('/:id/send-to-supplier', protect, admin, sendOrderToSupplier);

export default router;
