# Stripe Webhook Setup for Affiliate Commissions

## Overview
When a customer completes payment through Stripe, HNA receives the full payment to your bank account. The system automatically:
1. Records the order with payment status "Paid"
2. If an affiliate code was used, calculates and tracks their commission
3. Updates affiliate stats (sales, revenue, conversion)
4. Stores commission as "unpaid" until you manually pay affiliates

## Setup Steps

### 1. Get Your Stripe Webhook Secret

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your webhook URL:
   ```
   https://your-domain.com/api/checkout/webhook
   ```
   (For local testing with Stripe CLI):
   ```
   http://localhost:5001/api/checkout/webhook
   ```
4. Select events to listen to:
   - `checkout.session.completed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (starts with `whsec_...`)

### 2. Add to Environment Variables

Add to your `.env` file:
```
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 3. Test Locally with Stripe CLI (Optional)

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:5001/api/checkout/webhook

# In another terminal, trigger a test event:
stripe trigger checkout.session.completed
```

## How It Works

### Customer Checkout Flow:
1. Customer adds items to cart
2. Customer enters affiliate code (optional) like "SARAH10"
3. Customer clicks "Proceed to Checkout"
4. System tracks affiliate click
5. Customer pays through Stripe → **Money goes to YOUR bank account**
6. Stripe sends webhook to your server
7. Server creates order with:
   - Payment status: "Paid"
   - Affiliate code, commission amount, affiliate ID
   - Commission marked as "unpaid"

### Affiliate Commission Flow:
- HNA gets 100% of payment in your bank account
- Commission is calculated (e.g., 10% = $4 on $40 order)
- Commission stored in database as "owed" to affiliate
- View all unpaid commissions in `/admin/affiliates`
- Click "💰 Pay" button when you transfer money to affiliate
- System marks commission as paid and updates affiliate balance

### Example:
- Customer buys $100 worth of products with code "SARAH10"
- **Stripe deposits $100 to YOUR bank account** (minus Stripe fees ~$3)
- Sarah (10% commission rate) is owed $10
- You see "$10" unpaid in admin dashboard
- When you PayPal/Venmo Sarah $10, click "💰 Pay" to mark it paid
- Sarah's unpaid balance goes to $0

## Admin Actions

### View Unpaid Commissions:
- Go to `/admin/affiliates`
- See "Commission Owed" card showing total unpaid
- Each affiliate row shows their unpaid amount

### Pay Commission:
1. Transfer money to affiliate via PayPal/bank/Venmo
2. Click "💰 Pay" button in affiliates table
3. Commission marked as paid in system

### View Orders with Affiliates:
- Go to `/admin/orders`
- "Affiliate" column shows code and commission
- Green "✓ Paid" appears after you pay commission

## Security Notes

- Never commit your webhook secret to git
- Webhook validates Stripe signature to prevent fraud
- Only `checkout.session.completed` events are processed
- Commissions only recorded for active affiliates
