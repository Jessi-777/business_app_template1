#!/bin/bash

echo "🔒 HNA Vault - Security Setup & Deployment Preparation"
echo "========================================================"
echo ""

# Check if we're in the right directory
if [ ! -f "backend/server.js" ]; then
    echo "❌ Error: Run this script from the hna-vault root directory"
    exit 1
fi

echo "📋 Step 1: Initializing Git Repository..."
git init
git add .
git status

echo ""
echo "⚠️  IMPORTANT: Check the git status above!"
echo "   If you see 'backend/.env' listed, something went wrong."
echo "   The .gitignore should prevent it from being tracked."
echo ""
read -p "Does git status look correct? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Aborting. Fix the issues and run again."
    exit 1
fi

echo ""
echo "🔐 Step 2: Generate New JWT Secret..."
NEW_JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
echo ""
echo "✅ New JWT Secret Generated:"
echo "   $NEW_JWT_SECRET"
echo ""
echo "   📝 Save this! You'll need to add it to Render environment variables."
echo ""

echo "📝 Step 3: Creating Initial Commit..."
git commit -m "Initial commit - HNA Vault e-commerce platform with security"

echo ""
echo "✅ Git repository initialized successfully!"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Create a GitHub repository (https://github.com/new)"
echo ""
echo "2. Connect your local repo:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/hna-vault.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "3. Deploy to Render (https://render.com):"
echo "   - Connect your GitHub repository"
echo "   - Select 'Web Service'"
echo "   - Root Directory: backend"
echo "   - Build Command: npm install"
echo "   - Start Command: npm start"
echo ""
echo "4. Add Environment Variables in Render:"
echo "   MONGO_URI=your_mongodb_uri"
echo "   JWT_SECRET=$NEW_JWT_SECRET"
echo "   STRIPE_SECRET_KEY=your_stripe_key"
echo "   CLOUDINARY_CLOUD_NAME=dtcxmiv1q"
echo "   CLOUDINARY_API_KEY=169321125967723"
echo "   CLOUDINARY_API_SECRET=CoZMYZw2-5tti1CB-FYoKfT8aLQ"
echo "   CLIENT_URL=https://your-frontend.vercel.app"
echo ""
echo "5. Deploy Frontend to Vercel (https://vercel.com):"
echo "   - Import the GitHub repository"
echo "   - Root Directory: frontend"
echo "   - Framework: Vite"
echo "   - Add Environment Variable:"
echo "     VITE_API_URL=https://your-backend.onrender.com"
echo ""
echo "6. ⚠️  SECURITY: After deploying, immediately:"
echo "   - Change your MongoDB password in Atlas"
echo "   - Update MONGO_URI in Render with new password"
echo "   - Create an admin user in your database"
echo ""
echo "📖 See SECURITY.md for complete deployment checklist"
echo ""
