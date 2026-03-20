import Brand from '../models/Brand.js';

/*
-----------------------------------------
GET ALL BRANDS
-----------------------------------------
*/
export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find().populate('owner', 'name email').sort({ createdAt: -1 });
    res.json(brands);
  } catch (error) {
    console.error('getBrands error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/*
-----------------------------------------
GET SINGLE BRAND
-----------------------------------------
*/
export const getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id).populate('owner', 'name email');
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json(brand);
  } catch (error) {
    console.error('getBrandById error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/*
-----------------------------------------
CREATE BRAND (Admin)
-----------------------------------------
*/
export const createBrand = async (req, res) => {
  try {
    const {
      name, slug, domain, owner, logo, heroImage,
      primaryColor, bio, socialLinks, stripeAccountId,
      plan, status, vendorType, commissionRate
    } = req.body;

    const existing = await Brand.findOne({ slug });
    if (existing) return res.status(400).json({ message: 'Slug already in use' });

    const brand = await Brand.create({
      name, slug, domain, owner, logo, heroImage,
      primaryColor, bio, socialLinks, stripeAccountId,
      plan: plan || 'starter',
      status: status || 'pending',
      vendorType: vendorType || 'inhouse',
      commissionRate: commissionRate ?? 10,
    });

    res.status(201).json(brand);
  } catch (error) {
    console.error('createBrand error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/*
-----------------------------------------
UPDATE BRAND
Admin can update everything; brand owner
fields are a subset (bio, logo, socialLinks,
heroImage, primaryColor, domain).
-----------------------------------------
*/
export const updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });

    const updates = req.body;
    Object.assign(brand, updates);
    await brand.save();

    res.json(brand);
  } catch (error) {
    console.error('updateBrand error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/*
-----------------------------------------
SUSPEND BRAND
-----------------------------------------
*/
export const suspendBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      { status: 'suspended' },
      { new: true }
    );
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json({ message: 'Brand suspended', brand });
  } catch (error) {
    console.error('suspendBrand error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/*
-----------------------------------------
ACTIVATE BRAND
-----------------------------------------
*/
export const activateBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    );
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json({ message: 'Brand activated', brand });
  } catch (error) {
    console.error('activateBrand error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/*
-----------------------------------------
DELETE BRAND
-----------------------------------------
*/
export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ message: 'Brand not found' });
    res.json({ message: 'Brand deleted' });
  } catch (error) {
    console.error('deleteBrand error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};