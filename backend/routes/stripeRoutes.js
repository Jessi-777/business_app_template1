import express from 'express';
import Stripe from 'stripe';
import { protect } from '../middleware/authMiddleware.js';
import Order from '../models/Order.js';
import Affiliate from '../models/Affiliate.js';
import dotenv from 'dotenv';

dotenv.config(); // Make sure environment variables are loaded

const router = express.Router();

// ✅ Initialize Stripe with secret key and API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

// Create a Stripe checkout session
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { items, affiliateCode } = req.body; // [{ name, price, quantity, image }], affiliateCode (optional)

    // Track affiliate click if code provided
    let affiliate = null;
    if (affiliateCode) {
      affiliate = await Affiliate.findOne({ code: affiliateCode.toUpperCase(), status: 'active' });
      if (affiliate) {
        affiliate.recordClick();
        await affiliate.save();
      }
    }

    const line_items = items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: { 
          name: item.name,
          images: item.image ? [item.image.startsWith('http') ? item.image : `${process.env.CLIENT_URL}${item.image}`] : []
        },
        unit_amount: Math.round(item.price * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      metadata: {
        affiliateCode: affiliateCode || ''
      }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Stripe webhook to handle successful payments
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    
    try {
      // Get full session details with line items
      const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items', 'customer_details']
      });

      const affiliateCode = session.metadata?.affiliateCode;
      const totalAmount = session.amount_total / 100; // Convert from cents

      // Create order
      const orderNumber = `HNA-${Date.now()}`;
      
      // Extract items from Stripe's line_items
      const items = fullSession.line_items.data.map(item => ({
        name: item.description || item.price.product.name,
        quantity: item.quantity,
        price: item.price.unit_amount / 100, // Convert from cents
        image: item.price.product.images?.[0] || ''
      }));
      
      const orderData = {
        orderNumber,
        items,
        customer: {
          name: fullSession.customer_details?.name || 'Guest',
          email: fullSession.customer_details?.email || '',
          address: fullSession.customer_details?.address?.line1 || '',
          city: fullSession.customer_details?.address?.city || '',
          zipCode: fullSession.customer_details?.address?.postal_code || '',
          country: fullSession.customer_details?.address?.country || ''
        },
        totalPrice: totalAmount,
        paymentStatus: 'Paid',
        status: 'Processing'
      };

      // If affiliate code exists, process commission
      if (affiliateCode) {
        const affiliate = await Affiliate.findOne({ code: affiliateCode.toUpperCase(), status: 'active' });
        
        if (affiliate) {
          const commission = (totalAmount * affiliate.commissionRate) / 100;
          
          orderData.affiliate = {
            code: affiliateCode.toUpperCase(),
            affiliateId: affiliate._id,
            commission: commission,
            commissionPaid: false
          };

          // Record the sale for the affiliate
          affiliate.addSale(totalAmount);
          await affiliate.save();
        }
      }

      await Order.create(orderData);
      console.log(`✅ Order ${orderNumber} created with payment status: Paid`);
      
    } catch (error) {
      console.error('Error processing webhook:', error);
    }
  }

  res.json({ received: true });
});

export default router;

