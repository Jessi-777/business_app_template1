# Cloudinary Setup Guide for HNA

## Quick Setup (5 minutes)

### 1. Create Cloudinary Account
1. Go to https://cloudinary.com/users/register/free
2. Sign up for a free account (no credit card required)
3. After signup, you'll be redirected to your dashboard

### 2. Get Your Credentials
On your Cloudinary Dashboard, you'll see:
- **Cloud Name**: (e.g., `dxyz123abc`)
- **API Key**: (e.g., `123456789012345`)
- **API Secret**: (Click "Reveal" to see it)

### 3. Add to .env File
Update `/backend/.env` with your credentials:
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### 4. Restart Backend Server
```bash
cd backend
npm run dev
```

## Features

✅ **Automatic Image Optimization**: Images are automatically optimized for web
✅ **Image Transformation**: Resized to 1000x1000px max
✅ **CDN Delivery**: Fast global image delivery
✅ **Organized Storage**: All images stored in `hna-products` folder
✅ **Automatic Cleanup**: Old images deleted when updating products

## Free Tier Limits
- ✅ 25 GB storage
- ✅ 25 GB bandwidth/month
- ✅ Image transformations included
- ✅ More than enough for getting started!

## Upload Flow

1. **Admin clicks "Add New Product"**
2. **Clicks "Choose Image" button**
3. **Selects image from computer**
4. **Image preview shown instantly**
5. **Clicks "Create Product"**
6. **Image uploaded to Cloudinary**
7. **Product saved with Cloudinary URL**

## Supported Formats
- JPG / JPEG
- PNG
- GIF
- WebP

## File Size Limit
- Maximum: 5MB per image
- Recommended: 1000x1000px for best quality

## Testing

### Test Image Upload:
1. Go to `/admin/products`
2. Click "+ Add New Product"
3. Fill in product details
4. Click "📷 Choose Image"
5. Select an image
6. See instant preview
7. Click "Create Product"

## Troubleshooting

**Images not uploading?**
- Check .env credentials are correct
- Ensure backend server restarted after adding credentials
- Check file size is under 5MB
- Verify image format is supported

**Getting errors?**
- Check console for specific error messages
- Verify Cloudinary account is active
- Check API key hasn't expired

## Alternative: Use Local Images

If you prefer not to use Cloudinary for now:
1. Place images in `/frontend/public/assets/`
2. When creating products, use path like `/assets/your-image.png`
3. Images will be served from your local server

## Next Steps

Once Cloudinary is configured:
1. Upload product images
2. Images automatically stored in cloud
3. Fast CDN delivery to customers
4. Automatic backups included
5. No server storage needed

## Support

- Cloudinary Docs: https://cloudinary.com/documentation
- Dashboard: https://cloudinary.com/console
- Free tier: Perfect for starting out!

---

**Pro Tip**: The free tier is generous enough for most small to medium stores. You can always upgrade later as you grow!
