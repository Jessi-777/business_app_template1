import express from 'express';
import Brand from '../models/Brand.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Matches the same dev bypass pattern used in affiliateRoutes.js
// TODO: Re-enable authentication before deploying to production
const isDevelopment = process.env.NODE_ENV !== 'production';

/*
─────────────────────────────────────────────────────────────────
PUBLIC ROUTES
─────────────────────────────────────────────────────────────────
*/

// GET /api/brands/:slug/products — must come before /:slug
router.get('/:slug/products', async (req, res) => {
  try {
    const brand = await Brand.findOne({ slug: req.params.slug, status: 'active' });
    if (!brand) return res.status(404).json({ message: 'Brand not found' });

    const products = await Product.find({ brand: brand._id, isActive: true })
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/brands/:slug — brand profile for storefront
router.get('/:slug', async (req, res) => {
  try {
    const brand = await Brand.findOne({ slug: req.params.slug, status: 'active' })
      .select('-notes -stripeAccountId -platformCommissionRate')
      .populate('owner', 'name');

    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json(brand);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/*
─────────────────────────────────────────────────────────────────
BRAND OWNER ROUTES
─────────────────────────────────────────────────────────────────
*/

// GET /api/brands/dashboard/me — brand owner dashboard
router.get('/dashboard/me', protect, async (req, res) => {
  try {
    const brand = await Brand.findOne({ owner: req.user._id });
    if (!brand) return res.status(404).json({ message: 'No brand found for this account' });

    const orders   = await Order.find({ brand: brand._id }).sort({ createdAt: -1 }).limit(20);
    const products = await Product.find({ brand: brand._id, isActive: true });

    res.json({
      brand,
      recentOrders: orders,
      products,
      stats: {
        totalOrders:  brand.totalOrders,
        totalRevenue: brand.totalRevenue,
        totalPaid:    brand.totalPaid,
        productCount: products.length,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// PUT /api/brands/dashboard/me — brand owner updates their profile
router.put('/dashboard/me', protect, async (req, res) => {
  try {
    const brand = await Brand.findOne({ owner: req.user._id });
    if (!brand) return res.status(404).json({ message: 'No brand found for this account' });

    const allowedUpdates = [
      'name', 'bio', 'tagline', 'logo', 'heroImage',
      'primaryColor', 'accentColor', 'socialLinks'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) brand[field] = req.body[field];
    });

    if (req.body.domain && ['pro', 'elite'].includes(brand.plan)) {
      brand.domain = req.body.domain.toLowerCase().trim();
    }

    await brand.save();
    res.json(brand);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/*
─────────────────────────────────────────────────────────────────
ADMIN ROUTES
Dev: unprotected (matches affiliateRoutes.js pattern)
Prod: requires protect + admin middleware
─────────────────────────────────────────────────────────────────
*/

if (isDevelopment) {

  // GET /api/brands — all brands
  router.get('/', async (req, res) => {
    try {
      const brands = await Brand.find()
        .populate('owner', 'name email')
        .sort({ createdAt: -1 });
      res.json(brands);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  // POST /api/brands — create brand
  router.post('/', async (req, res) => {
    try {
      const { name, slug, owner, plan, bio, logo, heroImage,
              primaryColor, accentColor, socialLinks,
              platformCommissionRate, notes } = req.body;

      if (!name || !slug) {
        return res.status(400).json({ message: 'name and slug are required' });
      }

      const existing = await Brand.findOne({ slug: slug.toLowerCase() });
      if (existing) {
        return res.status(400).json({ message: `Slug "${slug}" is already taken` });
      }

      const brand = await Brand.create({
        name, slug: slug.toLowerCase(),
        owner: owner || null,
        plan: plan || 'starter',
        bio, logo, heroImage, primaryColor, accentColor,
        socialLinks, platformCommissionRate, notes,
        status: 'active'
      });

      res.status(201).json(brand);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  // PUT /api/brands/:id/activate
  router.put('/:id/activate', async (req, res) => {
    try {
      const brand = await Brand.findById(req.params.id);
      if (!brand) return res.status(404).json({ message: 'Brand not found' });
      brand.status = 'active';
      await brand.save();
      res.json(brand);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  // PUT /api/brands/:id/suspend
  router.put('/:id/suspend', async (req, res) => {
    try {
      const brand = await Brand.findById(req.params.id);
      if (!brand) return res.status(404).json({ message: 'Brand not found' });
      brand.status = 'suspended';
      await brand.save();
      res.json(brand);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  // PUT /api/brands/:id — update brand
  router.put('/:id', async (req, res) => {
    try {
      const brand = await Brand.findById(req.params.id);
      if (!brand) return res.status(404).json({ message: 'Brand not found' });

      const fields = [
        'name', 'slug', 'domain', 'plan', 'status',
        'bio', 'tagline', 'logo', 'heroImage',
        'primaryColor', 'accentColor', 'socialLinks',
        'platformCommissionRate', 'vendorType',
        'stripeAccountId', 'stripeOnboardingComplete', 'notes'
      ];

      fields.forEach(f => {
        if (req.body[f] !== undefined) brand[f] = req.body[f];
      });

      await brand.save();
      res.json(brand);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  // DELETE /api/brands/:id — deactivate
  router.delete('/:id', async (req, res) => {
    try {
      const brand = await Brand.findById(req.params.id);
      if (!brand) return res.status(404).json({ message: 'Brand not found' });
      brand.status = 'inactive';
      await brand.save();
      res.json({ message: 'Brand deactivated' });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

} else {

  // PRODUCTION — all admin routes require authentication
  router.get('/',    protect, admin, async (req, res) => {
    try {
      const brands = await Brand.find().populate('owner', 'name email').sort({ createdAt: -1 });
      res.json(brands);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  router.post('/', protect, admin, async (req, res) => {
    try {
      const { name, slug, owner, plan, bio, logo, heroImage,
              primaryColor, accentColor, socialLinks,
              platformCommissionRate, notes } = req.body;

      if (!name || !slug) return res.status(400).json({ message: 'name and slug are required' });

      const existing = await Brand.findOne({ slug: slug.toLowerCase() });
      if (existing) return res.status(400).json({ message: `Slug "${slug}" is already taken` });

      const brand = await Brand.create({
        name, slug: slug.toLowerCase(), owner: owner || null,
        plan: plan || 'starter', bio, logo, heroImage,
        primaryColor, accentColor, socialLinks,
        platformCommissionRate, notes, status: 'active'
      });

      res.status(201).json(brand);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  router.put('/:id/activate', protect, admin, async (req, res) => {
    try {
      const brand = await Brand.findById(req.params.id);
      if (!brand) return res.status(404).json({ message: 'Brand not found' });
      brand.status = 'active';
      await brand.save();
      res.json(brand);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  router.put('/:id/suspend', protect, admin, async (req, res) => {
    try {
      const brand = await Brand.findById(req.params.id);
      if (!brand) return res.status(404).json({ message: 'Brand not found' });
      brand.status = 'suspended';
      await brand.save();
      res.json(brand);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  router.put('/:id', protect, admin, async (req, res) => {
    try {
      const brand = await Brand.findById(req.params.id);
      if (!brand) return res.status(404).json({ message: 'Brand not found' });

      const fields = [
        'name', 'slug', 'domain', 'plan', 'status',
        'bio', 'tagline', 'logo', 'heroImage',
        'primaryColor', 'accentColor', 'socialLinks',
        'platformCommissionRate', 'vendorType',
        'stripeAccountId', 'stripeOnboardingComplete', 'notes'
      ];

      fields.forEach(f => {
        if (req.body[f] !== undefined) brand[f] = req.body[f];
      });

      await brand.save();
      res.json(brand);
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });

  router.delete('/:id', protect, admin, async (req, res) => {
    try {
      const brand = await Brand.findById(req.params.id);
      if (!brand) return res.status(404).json({ message: 'Brand not found' });
      brand.status = 'inactive';
      await brand.save();
      res.json({ message: 'Brand deactivated' });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  });
}

export default router;














// import express from 'express';
// import Brand from '../models/Brand.js';
// import Product from '../models/Product.js';
// import Order from '../models/Order.js';
// import { protect, admin } from '../middleware/authMiddleware.js';

// const router = express.Router();

// /*
// ─────────────────────────────────────────────────────────────────
// PUBLIC ROUTES
// ─────────────────────────────────────────────────────────────────
// */

// // GET /api/brands/:slug — brand profile for storefront
// router.get('/:slug', async (req, res) => {
//   try {
//     const brand = await Brand.findOne({ slug: req.params.slug, status: 'active' })
//       .select('-notes -stripeAccountId -platformCommissionRate')
//       .populate('owner', 'name');

//     if (!brand) return res.status(404).json({ message: 'Brand not found' });
//     res.json(brand);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// // GET /api/brands/:slug/products — active products for this brand
// router.get('/:slug/products', async (req, res) => {
//   try {
//     const brand = await Brand.findOne({ slug: req.params.slug, status: 'active' });
//     if (!brand) return res.status(404).json({ message: 'Brand not found' });

//     const products = await Product.find({ brand: brand._id, isActive: true })
//       .sort({ createdAt: -1 });

//     res.json(products);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// /*
// ─────────────────────────────────────────────────────────────────
// BRAND OWNER ROUTES
// ─────────────────────────────────────────────────────────────────
// */

// // GET /api/brands/dashboard/me — brand owner dashboard
// router.get('/dashboard/me', protect, async (req, res) => {
//   try {
//     const brand = await Brand.findOne({ owner: req.user._id });
//     if (!brand) return res.status(404).json({ message: 'No brand found for this account' });

//     const orders   = await Order.find({ brand: brand._id }).sort({ createdAt: -1 }).limit(20);
//     const products = await Product.find({ brand: brand._id, isActive: true });

//     res.json({
//       brand,
//       recentOrders: orders,
//       products,
//       stats: {
//         totalOrders:  brand.totalOrders,
//         totalRevenue: brand.totalRevenue,
//         totalPaid:    brand.totalPaid,
//         productCount: products.length,
//       }
//     });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// // PUT /api/brands/dashboard/me — brand owner updates their profile
// router.put('/dashboard/me', protect, async (req, res) => {
//   try {
//     const brand = await Brand.findOne({ owner: req.user._id });
//     if (!brand) return res.status(404).json({ message: 'No brand found for this account' });

//     const allowedUpdates = [
//       'name', 'bio', 'tagline', 'logo', 'heroImage',
//       'primaryColor', 'accentColor', 'socialLinks'
//     ];

//     allowedUpdates.forEach(field => {
//       if (req.body[field] !== undefined) brand[field] = req.body[field];
//     });

//     // Domain update only on pro/elite plan
//     if (req.body.domain && ['pro', 'elite'].includes(brand.plan)) {
//       brand.domain = req.body.domain.toLowerCase().trim();
//     }

//     await brand.save();
//     res.json(brand);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// /*
// ─────────────────────────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────────────────────────
// */

// // GET /api/brands — all brands
// router.get('/', protect, admin, async (req, res) => {
//   try {
//     const brands = await Brand.find()
//       .populate('owner', 'name email')
//       .sort({ createdAt: -1 });
//     res.json(brands);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// // POST /api/brands — create brand (onboard new partner)
// router.post('/', protect, admin, async (req, res) => {
//   try {
//     const { name, slug, owner, plan, bio, logo, heroImage,
//             primaryColor, accentColor, socialLinks,
//             platformCommissionRate, notes } = req.body;

//     if (!name || !slug || !owner) {
//       return res.status(400).json({ message: 'name, slug, and owner are required' });
//     }

//     const existing = await Brand.findOne({ slug: slug.toLowerCase() });
//     if (existing) {
//       return res.status(400).json({ message: `Slug "${slug}" is already taken` });
//     }

//     const brand = await Brand.create({
//       name, slug: slug.toLowerCase(), owner,
//       plan: plan || 'starter',
//       bio, logo, heroImage, primaryColor, accentColor,
//       socialLinks, platformCommissionRate, notes,
//       status: 'active'
//     });

//     res.status(201).json(brand);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// // PUT /api/brands/:id — admin updates any brand
// router.put('/:id', protect, admin, async (req, res) => {
//   try {
//     const brand = await Brand.findById(req.params.id);
//     if (!brand) return res.status(404).json({ message: 'Brand not found' });

//     const fields = [
//       'name', 'slug', 'domain', 'plan', 'status',
//       'bio', 'tagline', 'logo', 'heroImage',
//       'primaryColor', 'accentColor', 'socialLinks',
//       'platformCommissionRate', 'vendorType',
//       'stripeAccountId', 'stripeOnboardingComplete', 'notes'
//     ];

//     fields.forEach(f => {
//       if (req.body[f] !== undefined) brand[f] = req.body[f];
//     });

//     await brand.save();
//     res.json(brand);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// // DELETE /api/brands/:id — deactivate (never hard delete)
// router.delete('/:id', protect, admin, async (req, res) => {
//   try {
//     const brand = await Brand.findById(req.params.id);
//     if (!brand) return res.status(404).json({ message: 'Brand not found' });

//     brand.status = 'inactive';
//     await brand.save();
//     res.json({ message: 'Brand deactivated' });
//   } catch (err) {
//     res.status(500).json({ message: 'Server error', error: err.message });
//   }
// });

// export default router;



// import express from 'express';
// import {
//   getBrands,
//   getBrandById,
//   createBrand,
//   updateBrand,
//   suspendBrand,
//   activateBrand,
//   deleteBrand,
// } from '../controllers/brandController.js';
// import { protect, admin } from '../middleware/authMiddleware.js';

// const router = express.Router();

// const isDevelopment = process.env.NODE_ENV !== 'production';

// if (isDevelopment) {
//   router.get('/', getBrands);
//   router.get('/:id', getBrandById);
//   router.post('/', createBrand);
//   router.put('/:id', updateBrand);
//   router.put('/:id/suspend', suspendBrand);
//   router.put('/:id/activate', activateBrand);
//   router.delete('/:id', deleteBrand);
// } else {
//   router.get('/', protect, admin, getBrands);
//   router.get('/:id', protect, admin, getBrandById);
//   router.post('/', protect, admin, createBrand);
//   router.put('/:id', protect, admin, updateBrand);
//   router.put('/:id/suspend', protect, admin, suspendBrand);
//   router.put('/:id/activate', protect, admin, activateBrand);
//   router.delete('/:id', protect, admin, deleteBrand);
// }

// export default router;