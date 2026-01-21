import ProductCard from "../components/ProductCard";
import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { API_URL } from "../config";

export default function Product() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${API_URL}/api/products`);
        const data = await res.json();
        setProducts(data.filter(p => p.isActive !== false));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-black py-12 px-6 lg:px-16">
      <div className="max-w-7xl mx-auto">
        {/* Page Heading */}
        <h1 className="text-5xl font-bold text-white mb-12 text-center tracking-wider drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          {t('products.shopCollection')}
        </h1>

        {/* Products Grid */}
        {loading ? (
          <p className="text-center text-white/60 text-xl">{t('products.loading')}</p>
        ) : products.length > 0 ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-white/60 text-xl">{t('products.noProducts')}</p>
        )}
      </div>
    </div>
  );
}
