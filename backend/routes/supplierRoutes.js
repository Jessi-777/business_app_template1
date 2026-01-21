import express from 'express';
import Order from '../models/Order.js';
import { handleSupplierWebhook } from '../utils/supplierIntegration.js';

const router = express.Router();

/**
 * @desc    Printful webhook endpoint
 * @route   POST /api/suppliers/printful/webhook
 * @access  Public (but should verify Printful signature in production)
 */
router.post('/printful/webhook', async (req, res) => {
  try {
    const webhookData = req.body;
    
    // In production, verify the webhook signature
    // const signature = req.headers['x-printful-signature'];
    // if (!verifyPrintfulSignature(signature, webhookData)) {
    //   return res.status(401).json({ message: 'Invalid signature' });
    // }

    // Process the webhook
    const result = await handleSupplierWebhook('printful', webhookData);
    
    if (result.success && result.orderUpdate) {
      // Update order in database
      const order = await Order.findOne({ 'supplier.orderId': result.orderUpdate.supplierOrderId });
      
      if (order) {
        order.supplier.status = result.orderUpdate.status;
        if (result.orderUpdate.trackingNumber) {
          order.supplier.trackingNumber = result.orderUpdate.trackingNumber;
        }
        
        // Update main order status based on supplier status
        if (result.orderUpdate.status === 'fulfilled') {
          order.status = 'Shipped';
        } else if (result.orderUpdate.status === 'in_production') {
          order.status = 'In Production';
        }
        
        await order.save();
        
        res.status(200).json({ message: 'Webhook processed successfully' });
      } else {
        res.status(404).json({ message: 'Order not found' });
      }
    } else {
      res.status(400).json({ message: 'Failed to process webhook' });
    }
  } catch (error) {
    console.error('Printful webhook error:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * @desc    Printify webhook endpoint
 * @route   POST /api/suppliers/printify/webhook
 * @access  Public (but should verify Printify signature in production)
 */
router.post('/printify/webhook', async (req, res) => {
  try {
    const webhookData = req.body;
    
    // Process the webhook
    const result = await handleSupplierWebhook('printify', webhookData);
    
    if (result.success && result.orderUpdate) {
      // Update order in database
      const order = await Order.findOne({ 'supplier.orderId': result.orderUpdate.supplierOrderId });
      
      if (order) {
        order.supplier.status = result.orderUpdate.status;
        if (result.orderUpdate.trackingNumber) {
          order.supplier.trackingNumber = result.orderUpdate.trackingNumber;
        }
        
        // Update main order status based on supplier status
        if (result.orderUpdate.status === 'shipped') {
          order.status = 'Shipped';
        } else if (result.orderUpdate.status === 'in-production') {
          order.status = 'In Production';
        }
        
        await order.save();
        
        res.status(200).json({ message: 'Webhook processed successfully' });
      } else {
        res.status(404).json({ message: 'Order not found' });
      }
    } else {
      res.status(400).json({ message: 'Failed to process webhook' });
    }
  } catch (error) {
    console.error('Printify webhook error:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
