import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

export default function BrandStorefront() {
  const { slug } = useParams();
  const { addToCart } = useCart();

  const [brand, setBrand]       = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [added, setAdded]       = useState(null);

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        setLoading(true);
        const [brandRes, productsRes] = await Promise.all([
          fetch(`${API_URL}/api/brands/${slug}`),
          fetch(`${API_URL}/api/brands/${slug}/products`)
        ]);
        if (!brandRes.ok) throw new Error('Brand not found');
        const brandData    = await brandRes.json();
        const productsData = productsRes.ok ? await productsRes.json() : [];
        setBrand(brandData);
        setProducts(productsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBrand();
  }, [slug]);

  const handleAddToCart = (product) => {
    addToCart({ _id: product._id, name: product.name, price: product.price, image: product.image, quantity: 1 });
    setAdded(product._id);
    setTimeout(() => setAdded(null), 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-center px-6">
        <div>
          <h1 className="text-4xl font-bold text-white mb-3">Brand Not Found</h1>
          <p className="text-gray-400 mb-6">This storefront doesn't exist or isn't active yet.</p>
          <Link to="/" className="text-indigo-400 hover:text-indigo-300 underline">Back to HNA</Link>
        </div>
      </div>
    );
  }

  const primary = brand.primaryColor || '#6366f1';
  const accent  = brand.accentColor  || '#818cf8';

  return (
    <div className="min-h-screen bg-black text-white">

      {/* HERO */}
      <div
        className="relative h-72 md:h-96 flex items-end"
        style={{ background: brand.heroImage ? `url(${brand.heroImage}) center/cover no-repeat` : `linear-gradient(135deg, ${primary}22, #000)` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="relative z-10 px-6 pb-8 md:px-12 w-full flex items-end gap-5">
          {brand.logo && (
            <img src={brand.logo} alt={brand.name} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2" style={{ borderColor: primary }} />
          )}
          <div>
            <h1 className="text-3xl md:text-5xl font-bold">{brand.name}</h1>
            {brand.tagline && <p className="mt-1 text-sm md:text-base" style={{ color: accent }}>{brand.tagline}</p>}
          </div>
        </div>
      </div>

      {/* BIO + SOCIAL */}
      {(brand.bio || brand.socialLinks) && (
        <div className="px-6 md:px-12 py-8 border-b border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {brand.bio && <p className="text-gray-300 max-w-2xl text-sm leading-relaxed">{brand.bio}</p>}
          <div className="flex gap-4 flex-shrink-0">
            {brand.socialLinks?.instagram && (
              <a href={`https://instagram.com/${brand.socialLinks.instagram}`} target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:text-white transition-colors">Instagram</a>
            )}
            {brand.socialLinks?.tiktok && (
              <a href={`https://tiktok.com/@${brand.socialLinks.tiktok}`} target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:text-white transition-colors">TikTok</a>
            )}
            {brand.socialLinks?.twitter && (
              <a href={`https://twitter.com/${brand.socialLinks.twitter}`} target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:text-white transition-colors">Twitter</a>
            )}
          </div>
        </div>
      )}

      {/* PRODUCTS */}
      <div className="px-6 md:px-12 py-10">
        <h2 className="text-xl font-semibold mb-6 tracking-wide uppercase text-gray-300">Collection</h2>
        {products.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <p className="text-lg">No products yet.</p>
            <p className="text-sm mt-2">Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map(product => (
              <div key={product._id} className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all">
                <Link to={`/product/${product._id}`} className="block">
                  <div className="aspect-square overflow-hidden bg-white/5">
                    <img src={product.image || '/assets/placeholder.png'} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/product/${product._id}`}>
                    <h3 className="font-medium text-sm text-white hover:text-gray-300 transition-colors line-clamp-1">{product.name}</h3>
                  </Link>
                  <p className="text-sm mt-1 font-bold" style={{ color: accent }}>${product.price.toFixed(2)}</p>
                  {product.compareAtPrice > product.price && (
                    <p className="text-xs text-gray-500 line-through">${product.compareAtPrice.toFixed(2)}</p>
                  )}
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={product.countInStock === 0}
                    className="mt-3 w-full py-2 rounded-lg text-xs font-semibold transition-all"
                    style={{ background: added === product._id ? '#10b981' : primary, color: '#fff', opacity: product.countInStock === 0 ? 0.4 : 1 }}
                  >
                    {product.countInStock === 0 ? 'Sold Out' : added === product._id ? '✓ Added' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-16 px-6 md:px-12 py-6 border-t border-white/10 flex items-center justify-between">
        <p className="text-xs text-gray-600">Powered by <Link to="/" className="text-gray-500 hover:text-white transition-colors">HNA Vault</Link></p>
        <Link to="/shop" className="text-xs text-gray-500 hover:text-white transition-colors">Explore HNA →</Link>
      </div>

    </div>
  );
}
