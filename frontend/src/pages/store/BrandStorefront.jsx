import { useState } from 'react';
import { Link } from 'react-router-dom';

// ─── STATIC DEMO DATA (no backend needed) ───────────────────────────────────
const BRAND = {
  name: "CJ Rabb",
  slug: "cjrabb",
  tagline: "Elite. Relentless. Built to Last.",
  bio: "Wide Receiver · Las Vegas, NV · Repping HNA from day one. CJ Rabb brings next level energy on and off the field and his collection does the same.",
  heroImage: "/assets/cj.jpg",
  logo: "/assets/cj2.jpg",
  verified: true,
  primaryColor: "#6366f1",
  accentColor: "#818cf8",
  socialLinks: {
    instagram: "cjrabb",
    tiktok: "cjrabb",
    twitter: "cjrabb",
  },
};

const PRODUCTS = [
  {
    _id: "1",
    name: "CJ Hoodie",
    price: 65.00,
    compareAtPrice: 80.00,
    category: "hoodies",
    countInStock: 12,
    image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=80",
  },
  {
    _id: "2",
    name: "HNA Performance Tee",
    price: 38.00,
    compareAtPrice: null,
    category: "tees",
    countInStock: 24,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
  },
  {
    _id: "3",
    name: "HNA Snapback Cap",
    price: 32.00,
    compareAtPrice: null,
    category: "hats",
    countInStock: 8,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80",
  },
  {
    _id: "4",
    name: "HNA Bundle — Hoodie + Tee + Hat",
    price: 110.00,
    compareAtPrice: 135.00,
    category: "bundles",
    countInStock: 5,
    image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=600&q=80",
  },
  {
    _id: "5",
    name: "HNA Training Shorts",
    price: 42.00,
    compareAtPrice: null,
    category: "bottoms",
    countInStock: 0,
    image: "https://images.unsplash.com/photo-1562183241-840b8af0721e?w=600&q=80",
  },
  {
    _id: "6",
    name: "HNA Vault Crewneck",
    price: 58.00,
    compareAtPrice: 70.00,
    category: "hoodies",
    countInStock: 7,
    image: "https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=600&q=80",
  },
];

export default function BrandStorefront() {
  const [added, setAdded]   = useState(null);
  const [filter, setFilter] = useState('all');
  const [cart, setCart]     = useState([]);

  const primary = BRAND.primaryColor;
  const accent  = BRAND.accentColor;

  const categories = ['all', ...new Set(PRODUCTS.map(p => p.category))];
  const filtered   = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);

  const handleAddToCart = (product) => {
    setCart(prev => [...prev, product]);
    setAdded(product._id);
    setTimeout(() => setAdded(null), 1500);
  };

  return (
    <div className="min-h-screen text-white" style={{ background: '#0a0a0f' }}>

      {/* Google Font */}
      <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700;900&display=swap" rel="stylesheet" />

      {/* Floating cart pill */}
      {cart.length > 0 && (
        <div
          className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold shadow-lg"
          style={{ background: primary, boxShadow: `0 0 24px ${primary}88`, fontFamily: "'DM Sans', sans-serif" }}
        >
          🛒 {cart.length} item{cart.length > 1 ? 's' : ''}
        </div>
      )}

      {/* ── HERO ── */}
      <div className="relative h-[70vh] min-h-[480px] flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-center bg-cover" style={{ backgroundImage: `url(${BRAND.heroImage})` }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #0a0a0f 0%, rgba(10,10,15,0.5) 45%, transparent 100%)' }} />
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 20% 60%, ${primary}22 0%, transparent 55%)` }} />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 px-6 md:px-12 py-5 flex items-center justify-between z-10">
          <Link to="/" className="text-xs font-bold tracking-widest uppercase text-white/50 hover:text-white transition-colors" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            ← HNA Vault
          </Link>
          <div className="text-xs px-3 py-1.5 rounded-full font-semibold" style={{ background: 'rgba(0,0,0,0.55)', border: `1px solid ${primary}44`, color: accent, backdropFilter: 'blur(10px)', fontFamily: "'DM Sans', sans-serif" }}>
            ✦ Official Athlete Store
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 px-6 pb-12 md:px-12 w-full">
          <div className="absolute bottom-0 left-0 w-80 h-40 blur-[80px] opacity-25 pointer-events-none" style={{ background: primary }} />
          <div className="relative flex items-end gap-5">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden flex-shrink-0" style={{ border: `2px solid ${primary}`, boxShadow: `0 0 28px ${primary}66` }}>
              <img src={BRAND.logo} alt={BRAND.name} className="w-full h-full object-cover object-top" />
            </div>
            <div>
              <h1 className="text-5xl md:text-7xl leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.04em', textShadow: `0 0 40px ${primary}55` }}>
                {BRAND.name}
              </h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-sm md:text-base font-medium" style={{ color: accent, fontFamily: "'DM Sans', sans-serif" }}>{BRAND.tagline}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${primary}33`, color: accent, border: `1px solid ${primary}55`, fontFamily: "'DM Sans', sans-serif" }}>
                  ✓ Verified Athlete
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BIO + SOCIAL ── */}
      <div className="px-6 md:px-12 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.07)', fontFamily: "'DM Sans', sans-serif" }}>
        <p className="text-gray-400 max-w-2xl text-sm leading-relaxed">{BRAND.bio}</p>
        <div className="flex gap-2 flex-shrink-0">
          {[['instagram','📸'],['tiktok','🎵'],['twitter','🐦']].map(([platform, icon]) => (
            BRAND.socialLinks?.[platform] && (
              <a key={platform} href="#"
                className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#e5e7eb' }}
              >
                {icon} {platform}
              </a>
            )
          ))}
        </div>
      </div>

      {/* ── STATS ── */}
      <div className="px-6 md:px-12 py-4 border-b flex gap-8" style={{ borderColor: 'rgba(255,255,255,0.07)', fontFamily: "'DM Sans', sans-serif" }}>
        {[
          { val: PRODUCTS.length, label: 'Products' },
          { val: PRODUCTS.filter(p => p.countInStock > 0).length, label: 'In Stock' },
          { val: categories.length - 1, label: 'Categories' },
        ].map(({ val, label }) => (
          <div key={label}>
            <p className="text-lg font-black text-white">{val}</p>
            <p className="text-[11px] text-gray-500 uppercase tracking-widest">{label}</p>
          </div>
        ))}
      </div>

      {/* ── COLLECTION ── */}
      <div className="px-6 md:px-12 py-10" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <h2 className="text-[11px] font-black tracking-[0.25em] uppercase text-gray-500">Collection</h2>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all duration-200"
                style={filter === cat
                  ? { background: primary, color: '#fff', boxShadow: `0 0 14px ${primary}66` }
                  : { background: 'rgba(255,255,255,0.05)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.08)' }
                }
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {filtered.map((product) => (
            <div
              key={product._id}
              className="group relative rounded-2xl overflow-hidden transition-all duration-300"
              style={{ background: 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))', border: '1px solid rgba(255,255,255,0.08)' }}
              onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${primary}66`; e.currentTarget.style.boxShadow = `0 0 32px ${primary}33`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {product.countInStock === 0 && (
                <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide" style={{ background: 'rgba(0,0,0,0.75)', color: '#6b7280', border: '1px solid rgba(255,255,255,0.1)' }}>
                  Sold Out
                </div>
              )}
              {product.compareAtPrice > product.price && (
                <div className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase" style={{ background: '#10b981', color: '#fff' }}>
                  Sale
                </div>
              )}

              <div className="aspect-square overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)' }}>
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" style={{ opacity: product.countInStock === 0 ? 0.45 : 1 }} />
              </div>

              <div className="p-4">
                <h3 className="font-bold text-sm text-white line-clamp-1 mb-1">{product.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-black" style={{ color: accent }}>${product.price.toFixed(2)}</span>
                  {product.compareAtPrice > product.price && (
                    <span className="text-xs text-gray-600 line-through">${product.compareAtPrice.toFixed(2)}</span>
                  )}
                </div>
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={product.countInStock === 0}
                  className="w-full py-2 rounded-xl text-xs font-black tracking-wide transition-all duration-200"
                  style={
                    product.countInStock === 0
                      ? { background: 'rgba(255,255,255,0.04)', color: '#374151', cursor: 'not-allowed' }
                      : added === product._id
                        ? { background: '#10b981', color: '#fff', boxShadow: '0 0 18px rgba(16,185,129,0.5)' }
                        : { background: `linear-gradient(135deg, ${primary}, ${accent})`, color: '#fff', boxShadow: `0 0 18px ${primary}55` }
                  }
                >
                  {product.countInStock === 0 ? 'Sold Out' : added === product._id ? '✓ Added!' : 'Add to Cart'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div className="mt-16 px-6 md:px-12 py-6 border-t flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.07)', fontFamily: "'DM Sans', sans-serif" }}>
        <p className="text-xs text-gray-600">Powered by <Link to="/" className="hover:text-indigo-400 transition-colors" style={{ color: '#6366f1' }}>HNA Vault</Link></p>
        <Link to="/shop" className="text-xs text-gray-500 hover:text-white transition-colors">Explore HNA →</Link>
      </div>

    </div>
  );
}



// import { useState, useEffect } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { useCart } from '../../context/CartContext';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// export default function BrandStorefront() {
//   const { slug } = useParams();
//   const { addToCart } = useCart();

//   const [brand, setBrand]       = useState(null);
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading]   = useState(true);
//   const [error, setError]       = useState(null);
//   const [added, setAdded]       = useState(null);

//   useEffect(() => {
//     const fetchBrand = async () => {
//       try {
//         setLoading(true);
//         const [brandRes, productsRes] = await Promise.all([
//           fetch(`${API_URL}/api/brands/${slug}`),
//           fetch(`${API_URL}/api/brands/${slug}/products`)
//         ]);
//         if (!brandRes.ok) throw new Error('Brand not found');
//         const brandData    = await brandRes.json();
//         const productsData = productsRes.ok ? await productsRes.json() : [];
//         setBrand(brandData);
//         setProducts(productsData);
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchBrand();
//   }, [slug]);

//   const handleAddToCart = (product) => {
//     addToCart({ _id: product._id, name: product.name, price: product.price, image: product.image, quantity: 1 });
//     setAdded(product._id);
//     setTimeout(() => setAdded(null), 1500);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-black flex items-center justify-center">
//         <div className="text-white text-lg animate-pulse">Loading...</div>
//       </div>
//     );
//   }

//   if (error || !brand) {
//     return (
//       <div className="min-h-screen bg-black flex items-center justify-center text-center px-6">
//         <div>
//           <h1 className="text-4xl font-bold text-white mb-3">Brand Not Found</h1>
//           <p className="text-gray-400 mb-6">This storefront doesn't exist or isn't active yet.</p>
//           <Link to="/" className="text-indigo-400 hover:text-indigo-300 underline">Back to HNA</Link>
//         </div>
//       </div>
//     );
//   }

//   const primary = brand.primaryColor || '#6366f1';
//   const accent  = brand.accentColor  || '#818cf8';

//   return (
//     <div className="min-h-screen bg-black text-white">

//       {/* HERO */}
//       <div
//         className="relative h-72 md:h-96 flex items-end"
//         style={{ background: brand.heroImage ? `url(${brand.heroImage}) center/cover no-repeat` : `linear-gradient(135deg, ${primary}22, #000)` }}
//       >
//         <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
//         <div className="relative z-10 px-6 pb-8 md:px-12 w-full flex items-end gap-5">
//           {brand.logo && (
//             <img src={brand.logo} alt={brand.name} className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-2" style={{ borderColor: primary }} />
//           )}
//           <div>
//             <h1 className="text-3xl md:text-5xl font-bold">{brand.name}</h1>
//             {brand.tagline && <p className="mt-1 text-sm md:text-base" style={{ color: accent }}>{brand.tagline}</p>}
//           </div>
//         </div>
//       </div>

//       {/* BIO + SOCIAL */}
//       {(brand.bio || brand.socialLinks) && (
//         <div className="px-6 md:px-12 py-8 border-b border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
//           {brand.bio && <p className="text-gray-300 max-w-2xl text-sm leading-relaxed">{brand.bio}</p>}
//           <div className="flex gap-4 flex-shrink-0">
//             {brand.socialLinks?.instagram && (
//               <a href={`https://instagram.com/${brand.socialLinks.instagram}`} target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:text-white transition-colors">Instagram</a>
//             )}
//             {brand.socialLinks?.tiktok && (
//               <a href={`https://tiktok.com/@${brand.socialLinks.tiktok}`} target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:text-white transition-colors">TikTok</a>
//             )}
//             {brand.socialLinks?.twitter && (
//               <a href={`https://twitter.com/${brand.socialLinks.twitter}`} target="_blank" rel="noreferrer" className="text-xs text-gray-400 hover:text-white transition-colors">Twitter</a>
//             )}
//           </div>
//         </div>
//       )}

//       {/* PRODUCTS */}
//       <div className="px-6 md:px-12 py-10">
//         <h2 className="text-xl font-semibold mb-6 tracking-wide uppercase text-gray-300">Collection</h2>
//         {products.length === 0 ? (
//           <div className="text-center py-20 text-gray-500">
//             <p className="text-lg">No products yet.</p>
//             <p className="text-sm mt-2">Check back soon.</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
//             {products.map(product => (
//               <div key={product._id} className="group bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-all">
//                 <Link to={`/product/${product._id}`} className="block">
//                   <div className="aspect-square overflow-hidden bg-white/5">
//                     <img src={product.image || '/assets/placeholder.png'} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
//                   </div>
//                 </Link>
//                 <div className="p-4">
//                   <Link to={`/product/${product._id}`}>
//                     <h3 className="font-medium text-sm text-white hover:text-gray-300 transition-colors line-clamp-1">{product.name}</h3>
//                   </Link>
//                   <p className="text-sm mt-1 font-bold" style={{ color: accent }}>${product.price.toFixed(2)}</p>
//                   {product.compareAtPrice > product.price && (
//                     <p className="text-xs text-gray-500 line-through">${product.compareAtPrice.toFixed(2)}</p>
//                   )}
//                   <button
//                     onClick={() => handleAddToCart(product)}
//                     disabled={product.countInStock === 0}
//                     className="mt-3 w-full py-2 rounded-lg text-xs font-semibold transition-all"
//                     style={{ background: added === product._id ? '#10b981' : primary, color: '#fff', opacity: product.countInStock === 0 ? 0.4 : 1 }}
//                   >
//                     {product.countInStock === 0 ? 'Sold Out' : added === product._id ? '✓ Added' : 'Add to Cart'}
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* FOOTER */}
//       <div className="mt-16 px-6 md:px-12 py-6 border-t border-white/10 flex items-center justify-between">
//         <p className="text-xs text-gray-600">Powered by <Link to="/" className="text-gray-500 hover:text-white transition-colors">HNA Vault</Link></p>
//         <Link to="/shop" className="text-xs text-gray-500 hover:text-white transition-colors">Explore HNA →</Link>
//       </div>

//     </div>
//   );
// }
