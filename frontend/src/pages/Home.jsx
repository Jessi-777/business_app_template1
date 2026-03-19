import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products'); // ✅ FIXED for production
        const data = await response.json();
        setProducts(data.filter(p => p.isActive !== false).slice(0, 6));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const toggleMusic = () => {
    const audio = document.getElementById("bg-music");
    if (!audio) return;

    if (isMusicPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsMusicPlaying(!isMusicPlaying);
  };

  return (
    <div className="bg-black text-white">

      {/* HERO */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

        {/* Image */}
        <img
          src="/assets/boho-hero.png"
          className="absolute inset-0 w-full h-full object-cover hero-img"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_60%)]"></div>

        {/* Music */}
        <audio id="bg-music" loop>
          <source src="/assets/house_friend.mp3" type="audio/mpeg" />
        </audio>

        {/* Music Button */}
        <button
          onClick={toggleMusic}
          className="absolute top-6 right-6 z-30 px-4 py-2 bg-white/10 border border-white/20 rounded-full backdrop-blur hover:bg-white/20 transition"
        >
          {isMusicPlaying ? "Pause" : "Play"}
        </button>

        {/* Content */}
        <div className="relative z-20 text-center px-6">

          <h1 className="text-7xl md:text-[9rem] font-black tracking-tight hero-title">
            HNA
          </h1>

          <p className="uppercase tracking-widest text-white/70 mt-4">
            {t('home.tagline')}
          </p>

          <p className="text-white/60 max-w-xl mx-auto mt-4">
            {t('home.subtitle')}
          </p>

          <Link
            to="/shop"
            className="inline-block mt-10 px-10 py-4 bg-white text-black font-bold rounded-xl
            hover:scale-110 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.4)]"
          >
            {t('home.shopCollection')}
          </Link>
        </div>

        {/* Scroll */}
        <div className="absolute bottom-6 text-white/40 animate-bounce">
          ↓
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="py-20 px-6 max-w-7xl mx-auto">

        <h2 className="text-4xl font-bold text-center mb-12">
          {t('home.featuredCollection')}
        </h2>

        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}

        <div className="text-center mt-10">
          <Link to="/shop" className="text-white/70 hover:text-white">
            {t('home.exploreCollection')} →
          </Link>
        </div>
      </section>

      {/* WHY */}
      <section className="py-20 bg-black/90 text-center">

        <h2 className="text-4xl font-bold mb-12">
          {t('home.whyChooseHNA')}
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto px-6">

          <div className="p-6 border border-white/10 rounded-xl">
            🌱
            <h3 className="mt-4 font-bold">{t('home.ecoTitle')}</h3>
            <p className="text-white/60 mt-2">{t('home.ecoDesc')}</p>
          </div>

          <div className="p-6 border border-white/10 rounded-xl">
            ⚡
            <h3 className="mt-4 font-bold">{t('home.performanceTitle')}</h3>
            <p className="text-white/60 mt-2">{t('home.performanceDesc')}</p>
          </div>

          <div className="p-6 border border-white/10 rounded-xl">
            ✨
            <h3 className="mt-4 font-bold">{t('home.styleTitle')}</h3>
            <p className="text-white/60 mt-2">{t('home.styleDesc')}</p>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">

        <h2 className="text-4xl font-bold mb-6">
          {t('home.journeyStarts')}
        </h2>

        <p className="text-white/60 mb-10">
          {t('home.joinMovement')}
        </p>

        <Link
          to="/shop"
          className="px-12 py-5 bg-white text-black font-bold rounded-xl hover:scale-110 transition"
        >
          {t('home.startShopping')}
        </Link>
      </section>

    </div>
  );
}







