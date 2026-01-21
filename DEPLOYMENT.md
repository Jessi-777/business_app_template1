# HNA Vault Deployment Guide

## Prerequisites
1. **MongoDB Atlas Account** - Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Stripe Account** - Get API keys from [stripe.com](https://stripe.com)
3. **Cloudinary Account** - Get credentials from [cloudinary.com](https://cloudinary.com)
4. **Render Account** - Sign up at [render.com](https://render.com)
5. **Vercel Account** (optional) - Sign up at [vercel.com](https://vercel.com)

---

## Option 1: Deploy Everything on Render (Recommended for Simplicity)

### Step 1: Deploy Backend on Render

1. Go to [render.com](https://render.com) and click **New +** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `hna-backend`
   - **Region**: Oregon (or closest to you)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

4. Add Environment Variables (in Render dashboard):
   ```
   NODE_ENV=production
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hna-vault
   JWT_SECRET=your-super-secret-jwt-key-change-this
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   FRONTEND_URL=https://your-frontend.onrender.com
   ```

5. Click **Create Web Service**
6. Copy your backend URL (e.g., `https://hna-backend.onrender.com`)

### Step 2: Deploy Frontend on Render

1. Click **New +** → **Static Site**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `hna-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. Add Environment Variable:
   ```
   VITE_API_URL=https://hna-backend.onrender.com
   ```

5. Click **Create Static Site**

### Step 3: Update CORS in Backend

After deployment, update `backend/server.js` to allow your frontend URL:

```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-frontend.onrender.com'],
  credentials: true
}));
```

---

## Option 2: Backend on Render + Frontend on Vercel

### Step 1: Deploy Backend on Render
Follow **Option 1 → Step 1** above

### Step 2: Deploy Frontend on Vercel

1. Install Vercel CLI (optional):
   ```bash
   npm install -g vercel
   ```

2. **Via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Click **Add New** → **Project**
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   
3. Add Environment Variable:
   ```
   VITE_API_URL=https://hna-backend.onrender.com
   ```

4. Click **Deploy**

### Step 3: Update Frontend API URLs

Create `frontend/.env.production`:
```
VITE_API_URL=https://hna-backend.onrender.com
```

Update all API calls to use environment variable:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
fetch(`${API_URL}/api/products`)
```

---

## MongoDB Atlas Setup

1. Create a cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Click **Database Access** → **Add New Database User**
   - Username: `hna-user`
   - Password: Generate secure password
3. Click **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (0.0.0.0/0)
4. Click **Connect** → **Connect your application**
5. Copy connection string and replace `<password>` with your password
6. Use this as your `MONGO_URI` environment variable

---

## Stripe Webhook Configuration

After deploying backend:

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL: `https://hna-backend.onrender.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. Copy **Signing secret** and set as `STRIPE_WEBHOOK_SECRET`

---

## Cloudinary Setup

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to **Dashboard**
3. Copy:
   - Cloud Name
   - API Key
   - API Secret
4. Add these to your environment variables

---

## Seed Data (Optional)

After backend is deployed, seed affiliates:

```bash
# SSH into Render service or run locally pointing to production DB
node backend/scripts/seedAffiliates.js
```

---

## Post-Deployment Checklist

- [ ] MongoDB Atlas cluster created and accessible
- [ ] Backend deployed and running on Render
- [ ] Frontend deployed (Render or Vercel)
- [ ] All environment variables configured
- [ ] CORS configured with correct frontend URL
- [ ] Stripe webhook endpoint configured
- [ ] Test checkout flow end-to-end
- [ ] Test affiliate system
- [ ] Test admin panel access
- [ ] Verify all API endpoints work

---

## Troubleshooting

### Backend not starting
- Check Render logs for errors
- Verify all environment variables are set
- Check MongoDB connection string

### Frontend can't reach backend
- Verify `VITE_API_URL` is set correctly
- Check CORS settings in backend
- Verify backend URL is accessible

### Database connection errors
- Check MongoDB Atlas Network Access allows your Render IP
- Verify database user has correct permissions
- Check connection string format

### Stripe webhooks failing
- Verify webhook endpoint URL is correct
- Check `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Review Render logs for webhook errors

---

## Free Tier Limitations

**Render Free Tier**:
- Services spin down after 15 minutes of inactivity
- First request may take 30-60 seconds (cold start)
- 750 hours/month compute time

**Vercel Free Tier**:
- 100 GB bandwidth/month
- Unlimited deployments

**MongoDB Atlas Free Tier**:
- 512 MB storage
- Shared cluster

---

## Upgrade Recommendations

For production with real traffic:
- **Render**: Upgrade to Starter ($7/month) for always-on backend
- **MongoDB Atlas**: Upgrade to M10 ($0.08/hour) for dedicated cluster
- **Stripe**: Use live keys instead of test keys
- **Custom Domain**: Connect your own domain via Vercel/Render settings

---

## Environment Variables Summary

**Backend (`backend/.env`)**:
```
NODE_ENV=production
MONGO_URI=mongodb+srv://...
JWT_SECRET=...
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
EMAIL_USER=...
EMAIL_PASS=...
FRONTEND_URL=https://...
PORT=5001
```

**Frontend (`frontend/.env.production`)**:
```
VITE_API_URL=https://hna-backend.onrender.com
```

---

## Need Help?

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://www.mongodb.com/docs/atlas
- Stripe Docs: https://stripe.com/docs
