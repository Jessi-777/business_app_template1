# 🔒 Security Checklist for Production Deployment

## ✅ **Completed Security Fixes:**

1. ✅ Added `.gitignore` to prevent committing sensitive files
2. ✅ Created `admin` middleware for role-based access control
3. ✅ Protected all admin product routes (create/update/delete)
4. ✅ Protected all admin order routes (view/update/delete)
5. ✅ Protected all affiliate admin routes
6. ✅ Configured CORS to restrict to specific origin
7. ✅ Created `.env.example` template

## ⚠️ **CRITICAL: Before Deploying, You MUST:**

### 1. **Check Git Status**
```bash
cd /Users/hom3/hna-vault
git status
```
**If `.env` is listed, DO NOT COMMIT!** The new `.gitignore` will prevent future commits.

### 2. **Generate Strong JWT Secret**
Your current JWT_SECRET is weak. Generate a strong one:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Replace `JWT_SECRET` in Render environment variables with this.

### 3. **Update Environment Variables in Render**
When deploying to Render, use these environment variables (NOT your current `.env` values):

**Required:**
- `MONGO_URI` - Your MongoDB Atlas connection string (keep current one)
- `JWT_SECRET` - **NEW strong secret from step 2**
- `STRIPE_SECRET_KEY` - Your Stripe secret key (keep current one)
- `STRIPE_WEBHOOK_SECRET` - Get this from Stripe dashboard after deploying
- `CLIENT_URL` - Your Vercel frontend URL (e.g., `https://hna-vault.vercel.app`)
- `CLOUDINARY_CLOUD_NAME` - Keep current value
- `CLOUDINARY_API_KEY` - Keep current value
- `CLOUDINARY_API_SECRET` - Keep current value

### 4. **Verify MongoDB Security**
Your MongoDB credentials are exposed in `.env`. After deployment:
1. Go to MongoDB Atlas
2. Database Access → Edit User `hna_admin`
3. **Change the password** (currently: `hnadbvault999`)
4. Update `MONGO_URI` in Render with new password

### 5. **Create Admin User**
You need at least one admin user to access protected routes:
```bash
# After deploying, create admin user via MongoDB Atlas or a one-time script
```

### 6. **Frontend Environment Variables**
Update `frontend/.env` or Vercel environment variables:
```
VITE_API_URL=https://your-backend.onrender.com
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

### 7. **Test Authentication**
After deployment, test that:
- [ ] Public routes work (GET /api/products)
- [ ] Protected routes reject unauthenticated requests
- [ ] Admin routes reject non-admin users
- [ ] Stripe webhooks work

## 🚨 **Additional Security Recommendations:**

### High Priority:
- [ ] Add rate limiting (use `express-rate-limit`)
- [ ] Add helmet.js for security headers
- [ ] Implement webhook signature verification (Printful, Stripe)
- [ ] Add input validation (use `express-validator` or `joi`)
- [ ] Set up SSL/HTTPS (Render does this automatically)

### Medium Priority:
- [ ] Add request logging (use `morgan`)
- [ ] Implement API versioning
- [ ] Add database query sanitization
- [ ] Set up monitoring/error tracking (Sentry)

### Before Going Live:
- [ ] Remove console.logs with sensitive data
- [ ] Set NODE_ENV=production
- [ ] Test all payment flows thoroughly
- [ ] Set up automated backups for MongoDB

## 📋 **Deployment Checklist:**

1. [ ] Git status shows no `.env` file staged
2. [ ] New strong JWT_SECRET generated
3. [ ] MongoDB password changed
4. [ ] All environment variables set in Render
5. [ ] Admin user created
6. [ ] Frontend points to production API
7. [ ] Stripe webhook endpoint configured
8. [ ] CORS allows only your frontend domain
9. [ ] Test all protected routes
10. [ ] Test complete purchase flow

## 🔐 **Current Security Status:**

**Backend:** ✅ Basic security in place, but needs admin user + new secrets
**Frontend:** ⚠️ Update API URL before deploying
**Database:** ⚠️ Change MongoDB password after deployment
**Secrets:** ⚠️ Generate new JWT_SECRET

**Ready to deploy?** Almost! Complete the checklist above first.
