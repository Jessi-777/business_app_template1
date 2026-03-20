import Brand from '../models/Brand.js';

/*
─────────────────────────────────────────────────────────────────
BRAND MIDDLEWARE
─────────────────────────────────────────────────────────────────
Reads the incoming request hostname and attempts to match it
against a brand's custom domain in the database.

If a match is found, sets req.brand so downstream routes
can serve brand-specific data.

If no match, req.brand remains null — request is treated as
a standard HNA request.

Usage in server.js:
  import { resolveBrand } from './middleware/brandMiddleware.js';
  app.use(resolveBrand);

Usage in routes:
  router.get('/products', async (req, res) => {
    const filter = req.brand
      ? { brand: req.brand._id, isActive: true }
      : { isActive: true };
    const products = await Product.find(filter);
    res.json(products);
  });
─────────────────────────────────────────────────────────────────
*/

export const resolveBrand = async (req, res, next) => {
  try {
    const host = req.hostname;

    // Skip brand resolution for HNA's own domains
    const hnaDomains = [
      'localhost',
      'hnavault.com',
      'www.hnavault.com',
      process.env.HNA_DOMAIN
    ].filter(Boolean);

    if (hnaDomains.includes(host)) {
      req.brand = null;
      return next();
    }

    // Try to find a brand with this custom domain
    const brand = await Brand.findOne({
      domain: host,
      status: 'active'
    }).lean();

    req.brand = brand || null;
    next();

  } catch (err) {
    // Non-fatal — don't block the request if brand lookup fails
    console.error('Brand middleware error:', err.message);
    req.brand = null;
    next();
  }
};

/*
─────────────────────────────────────────────────────────────────
REQUIRE BRAND
─────────────────────────────────────────────────────────────────
Use on routes that must have a brand context.
Returns 404 if no brand resolved from domain.
─────────────────────────────────────────────────────────────────
*/

export const requireBrand = (req, res, next) => {
  if (!req.brand) {
    return res.status(404).json({ message: 'Brand not found' });
  }
  next();
};