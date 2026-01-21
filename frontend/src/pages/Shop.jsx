import ProductCard from "../components/ProductCard";
import { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { API_URL } from "../config";

export default function Shop() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`);
        const data = await response.json();
        setProducts(data.filter(p => p.isActive !== false));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen p-12 bg-black max-w-7xl mx-auto">
      <h1 className="text-5xl text-center text-white font-bold mb-12 tracking-wider drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
        {t('products.welcomeTitle')}
      </h1>
      
      {loading ? (
        <div className="text-center text-white/60 text-xl">{t('products.loading')}</div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center text-white/60 text-xl">{t('products.noProducts')}</div>
      )}
    </div>
  );
}
