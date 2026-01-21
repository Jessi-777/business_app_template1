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
router.post('/sale/:code', recordSale); // Can be called from checkout

// Admin routes - temporarily unprotected for development
// TODO: Re-enable authentication before deploying to production
const isDevelopment = process.env.NODE_ENV !== 'production';
if (isDevelopment) {
  router.get('/', getAffiliates);
  router.get('/stats', getAffiliateStats);
  router.get('/top', getTopAffiliates);
  router.get('/sales-report', getAffiliateSalesReport);
  router.post('/', createAffiliate);
  router.put('/:id', updateAffiliate);
  router.delete('/:id', deleteAffiliate);
  router.post('/pay/:id', payCommission);
} else {
  router.get('/', protect, admin, getAffiliates);
  router.get('/stats', protect, admin, getAffiliateStats);
  router.get('/top', protect, admin, getTopAffiliates);
  router.get('/sales-report', protect, admin, getAffiliateSalesReport);
  router.post('/', protect, admin, createAffiliate);
  router.put('/:id', protect, admin, updateAffiliate);
  router.delete('/:id', protect, admin, deleteAffiliate);
  router.post('/pay/:id', protect, admin, payCommission);
}

export default router;
