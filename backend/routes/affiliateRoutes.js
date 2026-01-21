import express from 'express';
import {
  getAffiliates,
  getAffiliateStats,
  getTopAffiliates,
  createAffiliate,
  updateAffiliate,
  deleteAffiliate,
  recordClick,
  recordSale,
  payCommission,
  getAffiliateSalesReport
} from '../controllers/affiliateController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/click/:code', recordClick);

// Admin routes - protected
router.get('/', protect, admin, getAffiliates);
router.get('/stats', protect, admin, getAffiliateStats);
router.get('/top', protect, admin, getTopAffiliates);
router.get('/sales-report', protect, admin, getAffiliateSalesReport);
router.post('/', protect, admin, createAffiliate);
router.put('/:id', protect, admin, updateAffiliate);
router.delete('/:id', protect, admin, deleteAffiliate);
router.post('/sale/:code', recordSale); // Can be called from checkout
router.post('/pay/:id', protect, admin, payCommission);

export default router;
