# Testing Stripe Webhooks Locally

## The Problem
Affiliate sales aren't recording because Stripe webhooks can't reach localhost.

## Quick Solution: Use Stripe CLI

### 1. Install Stripe CLI (if not installed)
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from: https://stripe.com/docs/stripe-cli
```

### 2. Login to Stripe
```bash
stripe login
```

### 3. Forward webhooks to your local server
```bash
stripe listen --forward-to localhost:5001/api/checkout/webhook
```

This will output a webhook signing secret like:
```
whsec_xxxxxxxxxxxxxxxxxxxxx
```

### 4. Update your `.env` with the webhook secret
Copy the `whsec_...` secret and update:
```
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
```

### 5. Restart your backend server
```bash
cd /Users/hom3/hna-vault/backend && node server.js
```

### 6. Keep Stripe CLI running
Leave the `stripe listen` command running in a terminal while you test.

## Testing Flow
1. Add an affiliate code in cart
2. Checkout with test card: `4242 4242 4242 4242`
3. The webhook will fire automatically
4. Check the Stripe CLI terminal - you'll see the webhook event
5. Check your affiliate sales report - the sale should appear!

## Test Card Numbers
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Any future expiry date, any 3-digit CVC

## Without Stripe CLI (Alternative)
The webhook signature verification is now disabled in development, but Stripe still won't be able to reach localhost. You'd need to:
1. Deploy your backend to Render/Heroku
2. Configure the webhook in Stripe dashboard
3. Point it to: `https://your-backend.com/api/checkout/webhook`

## Verifying It Works
After a test purchase:
```bash
# Check if order was created
curl http://localhost:5001/api/orders

# Check affiliate stats
curl http://localhost:5001/api/affiliates/stats
```
