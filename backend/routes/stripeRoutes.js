import express from 'express';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import { protect } from '../middleware/authMiddleware.js';
import Order from '../models/Order.js';
import Affiliate from '../models/Affiliate.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// ✅ Initialize Stripe with secret key and API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15',
});

// ✅ Nodemailer transporter for vendor notifications
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Vendor config — Jar R @ Shirtzilla VS Hatsquatch
const VENDOR_EMAIL = 'shirtzillavs@gmail.com';
const VENDOR_CUT = 75;
const BUNDLE_NAMES = ['Hat', 'T-Shirt', 'Hoodie']; // must match your product names

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
        unit_amount: Math.round(item.price * 100),
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

  const isDevelopment = process.env.NODE_ENV !== 'production';
  const hasWebhookSecret = webhookSecret && !webhookSecret.includes('your_webhook_signing_secret');

  if (!isDevelopment || hasWebhookSecret) {
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
  } else {
    console.log('⚠️  DEV MODE: Webhook signature verification skipped');
    event = JSON.parse(req.body.toString());
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
      const totalAmount = session.amount_total / 100;

      const orderNumber = `HNA-${Date.now()}`;

      const items = fullSession.line_items.data.map(item => ({
        name: item.description || item.price.product.name,
        quantity: item.quantity,
        price: item.price.unit_amount / 100,
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

          affiliate.addSale(totalAmount);
          await affiliate.save();
        }
      }

      await Order.create(orderData);
      console.log(`✅ Order ${orderNumber} created with payment status: Paid`);

      // ✅ Notify Jar R if order contains bundle items
      const isBundleOrder = items.some(item =>
        BUNDLE_NAMES.some(b => item.name.toLowerCase().includes(b.toLowerCase()))
      );

      if (isBundleOrder) {
        await transporter.sendMail({
          from: `"HNA Store" <${process.env.EMAIL_USER}>`,
          to: VENDOR_EMAIL,
          subject: `New Bundle Order to Fulfill — ${orderNumber}`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:auto;color:#222">
              <h2 style="border-bottom:2px solid #000;padding-bottom:8px">
                New Bundle Order 🧢👕🧥
              </h2>
              <p>Hey Jar R! A bundle just sold. Here's what you need to fulfill:</p>
              <table style="width:100%;border-collapse:collapse;margin:16px 0">
                <tr style="background:#f5f5f5">
                  <td style="padding:10px;font-weight:bold">Order #</td>
                  <td style="padding:10px">${orderNumber}</td>
                </tr>
                <tr>
                  <td style="padding:10px;font-weight:bold">Items</td>
                  <td style="padding:10px">${items.map(i => `${i.quantity}x ${i.name}`).join('<br/>')}</td>
                </tr>
                <tr style="background:#f5f5f5">
                  <td style="padding:10px;font-weight:bold">Ship To</td>
                  <td style="padding:10px">
                    ${orderData.customer.name}<br/>
                    ${orderData.customer.address}<br/>
                    ${orderData.customer.city}, ${orderData.customer.zipCode} ${orderData.customer.country}
                  </td>
                </tr>
                <tr>
                  <td style="padding:10px;font-weight:bold">Order Total</td>
                  <td style="padding:10px">$${totalAmount.toFixed(2)}</td>
                </tr>
                <tr style="background:#f5f5f5">
                  <td style="padding:10px;font-weight:bold">Your Payout</td>
                  <td style="padding:10px;color:#2a7a2a;font-size:18px;font-weight:bold">
                    $${VENDOR_CUT}.00
                  </td>
                </tr>
              </table>
              <p style="background:#fffbe6;border-left:4px solid #f5c518;padding:12px;border-radius:4px">
                Please ship within <strong>3–5 business days</strong> and reply with a tracking number.
              </p>
              <p style="color:#888;font-size:12px;margin-top:32px">
                Questions? Reply to this email — HNA Team
              </p>
            </div>
          `,
        });
        console.log(`📧 Vendor email sent to Jar R for order ${orderNumber}`);
      }

    } catch (error) {
      console.error('Error processing webhook:', error);
    }
  }

  res.json({ received: true });
});

export default router;















// import express from 'express';
// import Stripe from 'stripe';
// import { protect } from '../middleware/authMiddleware.js';
// import Order from '../models/Order.js';
// import Affiliate from '../models/Affiliate.js';
// import dotenv from 'dotenv';
// import nodemailer from 'nodemailer';

// dotenv.config(); // Make sure environment variables are loaded

// const router = express.Router();

// // ✅ Initialize Stripe with secret key and API version
// const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
//   apiVersion: '2022-11-15',
// });

// // Create a Stripe checkout session
// router.post('/create-checkout-session', async (req, res) => {
//   try {
//     const { items, affiliateCode } = req.body; // [{ name, price, quantity, image }], affiliateCode (optional)

//     // Track affiliate click if code provided
//     let affiliate = null;
//     if (affiliateCode) {
//       affiliate = await Affiliate.findOne({ code: affiliateCode.toUpperCase(), status: 'active' });
//       if (affiliate) {
//         affiliate.recordClick();
//         await affiliate.save();
//       }
//     }

//     const line_items = items.map(item => ({
//       price_data: {
//         currency: 'usd',
//         product_data: { 
//           name: item.name,
//           images: item.image ? [item.image.startsWith('http') ? item.image : `${process.env.CLIENT_URL}${item.image}`] : []
//         },
//         unit_amount: Math.round(item.price * 100), // Stripe uses cents
//       },
//       quantity: item.quantity,
//     }));

//     const session = await stripe.checkout.sessions.create({
//       payment_method_types: ['card'],
//       line_items,
//       mode: 'payment',
//       success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
//       cancel_url: `${process.env.CLIENT_URL}/cart`,
//       metadata: {
//         affiliateCode: affiliateCode || ''
//       }
//     });

//     res.json({ url: session.url });
//   } catch (error) {
//     console.error('Stripe error:', error);
//     res.status(500).json({ message: error.message });
//   }
// });

// // Stripe webhook to handle successful payments
// router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
//   const sig = req.headers['stripe-signature'];
//   const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

//   let event;

//   // Skip webhook verification in development if secret is not configured
//   const isDevelopment = process.env.NODE_ENV !== 'production';
//   const hasWebhookSecret = webhookSecret && !webhookSecret.includes('your_webhook_signing_secret');

//   if (!isDevelopment || hasWebhookSecret) {
//     try {
//       event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
//     } catch (err) {
//       console.error('Webhook signature verification failed:', err.message);
//       return res.status(400).send(`Webhook Error: ${err.message}`);
//     }
//   } else {
//     // Development mode without webhook secret - parse body directly
//     console.log('⚠️  DEV MODE: Webhook signature verification skipped');
//     event = JSON.parse(req.body.toString());
//   }

//   // Handle the checkout.session.completed event
//   if (event.type === 'checkout.session.completed') {
//     const session = event.data.object;
    
//     try {
//       // Get full session details with line items
//       const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
//         expand: ['line_items', 'customer_details']
//       });

//       const affiliateCode = session.metadata?.affiliateCode;
//       const totalAmount = session.amount_total / 100; // Convert from cents

//       // Create order
//       const orderNumber = `HNA-${Date.now()}`;
      
//       // Extract items from Stripe's line_items
//       const items = fullSession.line_items.data.map(item => ({
//         name: item.description || item.price.product.name,
//         quantity: item.quantity,
//         price: item.price.unit_amount / 100, // Convert from cents
//         image: item.price.product.images?.[0] || ''
//       }));
      
//       const orderData = {
//         orderNumber,
//         items,
//         customer: {
//           name: fullSession.customer_details?.name || 'Guest',
//           email: fullSession.customer_details?.email || '',
//           address: fullSession.customer_details?.address?.line1 || '',
//           city: fullSession.customer_details?.address?.city || '',
//           zipCode: fullSession.customer_details?.address?.postal_code || '',
//           country: fullSession.customer_details?.address?.country || ''
//         },
//         totalPrice: totalAmount,
//         paymentStatus: 'Paid',
//         status: 'Processing'
//       };

//       // If affiliate code exists, process commission
//       if (affiliateCode) {
//         const affiliate = await Affiliate.findOne({ code: affiliateCode.toUpperCase(), status: 'active' });
        
//         if (affiliate) {
//           const commission = (totalAmount * affiliate.commissionRate) / 100;
          
//           orderData.affiliate = {
//             code: affiliateCode.toUpperCase(),
//             affiliateId: affiliate._id,
//             commission: commission,
//             commissionPaid: false
//           };

//           // Record the sale for the affiliate
//           affiliate.addSale(totalAmount);
//           await affiliate.save();
//         }
//       }

//       await Order.create(orderData);
//       console.log(`✅ Order ${orderNumber} created with payment status: Paid`);
      
//     } catch (error) {
//       console.error('Error processing webhook:', error);
//     }
//   }

//   res.json({ received: true });
// });

// export default router;

