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
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_60%)]"></div>

        {/* Music */}
        <audio id="bg-music" loop>
          <source src="/assets/higher-tica-rey.mp3" type="audio/mpeg" />
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








// import { Link } from "react-router-dom";
// import ProductCard from "../components/ProductCard";
// import { useEffect, useState } from "react";
// import { useLanguage } from "../context/LanguageContext";

// export default function Home() {
//   const { t } = useLanguage();
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [isMusicPlaying, setIsMusicPlaying] = useState(true);

//   useEffect(() => {
//     const fetchProducts = async () => {
//       try {
//         const response = await fetch('http://localhost:5001/api/products');
//         const data = await response.json();
//         // Get featured products (limit to 6 for homepage)
//         setProducts(data.filter(p => p.isActive !== false).slice(0, 6));
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching products:', error);
//         setLoading(false);
//       }
//     };
//     fetchProducts();

//     // Autoplay music on page load
//     const audio = document.getElementById('background-music');
//     if (audio) {
//       audio.play().catch(err => {
//         // Browser may block autoplay, user will need to click play button
//         console.log('Autoplay prevented:', err);
//         setIsMusicPlaying(false);
//       });
//     }
//   }, []);

//   const toggleMusic = () => {
//     const audio = document.getElementById('background-music');
//     if (audio) {
//       if (isMusicPlaying) {
//         audio.pause();
//       } else {
//         audio.play();
//       }
//       setIsMusicPlaying(!isMusicPlaying);
//     }
//   };

//   return (
//     <div className="bg-black">
//       {/* Hero Section */}
//       <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
//         {/* Animated gradient background */}
//         <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
//           <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse"></div>
//         </div>


// {/* Hero Image Background */}
// <div className="absolute inset-0 overflow-hidden">
//   <img
//     src="/assets/boho-hero.png"
//     alt="HNA Human Nature Athletica"
//     className="absolute top-0 left-0 w-full h-full object-cover opacity-50 hero-img"
//   />

//   {/* Soft animated glow layer */} 
//   {/* hero-glow" */}
//   <div className="absolute inset-0 hero-glow"></div>
// </div>
//         {/* Video Background - COMMENTED FOR FUTURE USE - Uncomment below to enable */}
        
//         {/* <video
//           autoPlay
//           loop
//           muted
//           playsInline
//           poster="/assets/hero-poster.jpg"
//           className="absolute top-0 left-0 w-full h-full object-cover opacity-40"
//         >
//           <source src="/assets/hna-vid1.mp4" type="video/mp4" />
//           Your browser does not support the video tag.
//         </video> */}
       

//         {/* Background Music with Autoplay */}
//         <audio id="background-music" loop autoPlay>
//           {/* <source src="/assets/Dimples_ichoose_love.mp3" type="audio/mpeg" /> */}
//           <source src="/assets/higher-tica-rey.mp3" type="audio/mpeg" />

//           Your browser does not support the audio element.
//         </audio>

//         {/* Music Control Button */}
//         <button
//           onClick={toggleMusic}
//           className="absolute top-8 right-8 z-20 p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-110 shadow-lg"
//           aria-label={isMusicPlaying ? 'Pause music' : 'Play music'}
//           title={isMusicPlaying ? 'Pause music' : 'Play music'}
//         >
//           {isMusicPlaying ? (
//             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
//             </svg>
//           ) : (
//             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
//               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
//             </svg>
//           )}
//         </button>

//         {/* Hero Content */}
//         <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
//           {/* Main Headline */}
//           <div className="mb-8">
//             <h1 className="text-7xl md:text-9xl font-black text-white mb-6 tracking-tight drop-shadow-[0_0_40px_rgba(255,255,255,0.3)] animate-fade-in">
//               HNA
//             </h1>
//             <div className="h-1 w-32 bg-white mx-auto mb-8 shadow-[0_0_20px_rgba(255,255,255,0.5)]"></div>
//           </div>

//           {/* Tagline */}
//           <p className="text-2xl md:text-3xl text-white/90 font-light mb-4 tracking-wide">
//             {t('home.tagline')}
//           </p>
//           <p className="text-xl md:text-2xl text-white/70 font-light mb-12 max-w-3xl mx-auto leading-relaxed">
//             {t('home.subtitle')}
//           </p>

//           {/* CTA Buttons */}
//           <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
//             <Link
//               to="/shop"
//               className="group relative px-12 py-5 text-lg font-bold text-black bg-white rounded-xl
//                        hover:scale-110 transition-all duration-300
//                        shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)]
//                        overflow-hidden"
//             >
//               <span className="relative z-10">{t('home.shopCollection')}</span>
//               <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//             </Link>
            
//             <Link
//               to="/about"
//               className="px-12 py-5 text-lg font-bold text-white rounded-xl
//                        border-2 border-white/30 backdrop-blur-sm
//                        hover:bg-white hover:text-black hover:border-white
//                        transition-all duration-300 hover:scale-105"
//             >
//               {t('home.ourStory')}
//             </Link>
//           </div>

//           {/* Trust Indicators */}
//           <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-white/80">
//             <div className="flex flex-col items-center">
//               <div className="text-3xl font-bold text-white mb-2">100%</div>
//               <div className="text-sm">{t('home.sustainable')}</div>
//             </div>
//             <div className="flex flex-col items-center">
//               <div className="text-3xl font-bold text-white mb-2">{t('home.free')}</div>
//               <div className="text-sm">{t('home.shipping')}</div>
//             </div>
//             <div className="flex flex-col items-center">
//               <div className="text-3xl font-bold text-white mb-2">30-{t('home.day')}</div>
//               <div className="text-sm">{t('home.returns')}</div>
//             </div>
//           </div>
//         </div>

//         {/* Scroll Indicator */}
//         <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
//           <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
//             <div className="w-1 h-3 bg-white/60 rounded-full mt-2"></div>
//           </div>
//         </div>
//       </section>

//       {/* Featured Products */}
//       <section className="py-20 px-6 max-w-7xl mx-auto">
//         {/* Section Header */}
//         <div className="text-center mb-16">
//           <h2 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
//             {t('home.featuredCollection')}
//           </h2>
//           <p className="text-xl text-white/60 max-w-2xl mx-auto">
//             {t('home.featuredSubtitle')}
//           </p>
//         </div>

//         {/* Products Grid */}
//         {loading ? (
//           <div className="text-center text-white/60 text-xl py-20">
//             <div className="inline-block w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
//             <p>{t('home.loadingProducts')}</p>
//           </div>
//         ) : products.length > 0 ? (
//           <>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
//               {products.map((product) => (
//                 <ProductCard key={product._id} product={product} />
//               ))}
//             </div>
            
//             {/* View All CTA */}
//             <div className="text-center">
//               <Link
//                 to="/shop"
//                 className="group inline-flex items-center gap-3 text-white/90 font-bold text-xl hover:text-white transition-all duration-300 relative"
//               >
//                 <span className="relative">
//                   {t('home.exploreCollection')}
//                   <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
//                 </span>
//                 <span className="group-hover:translate-x-2 transition-transform duration-300">→</span>
//               </Link>
//             </div>
//           </>
//         ) : (
//           <div className="text-center text-white/60 text-xl py-20">
//             {t('home.comingSoon')}
//           </div>
//         )}
//       </section>

//       {/* Why Choose HNA Section */}
//       <section className="py-20 px-6 bg-gradient-to-b from-black to-gray-900">
//         <div className="max-w-7xl mx-auto">
//           <h2 className="text-5xl font-black text-white text-center mb-16 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
//             {t('home.whyChooseHNA')}
//           </h2>
          
//           <div className="grid md:grid-cols-3 gap-12">
//             {/* Feature 1 */}
//             <div className="group text-center p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/30 hover:bg-white/10 transition-all duration-300 hover:scale-105">
//               <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">🌱</div>
//               <h3 className="text-2xl font-bold text-white mb-4">{t('home.ecoTitle')}</h3>
//               <p className="text-white/70 leading-relaxed">
//                 {t('home.ecoDesc')}
//               </p>
//             </div>

//             {/* Feature 2 */}
//             <div className="group text-center p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/30 hover:bg-white/10 transition-all duration-300 hover:scale-105">
//               <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">⚡</div>
//               <h3 className="text-2xl font-bold text-white mb-4">{t('home.performanceTitle')}</h3>
//               <p className="text-white/70 leading-relaxed">
//                 {t('home.performanceDesc')}
//               </p>
//             </div>

//             {/* Feature 3 */}
//             <div className="group text-center p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:border-white/30 hover:bg-white/10 transition-all duration-300 hover:scale-105">
//               <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">✨</div>
//               <h3 className="text-2xl font-bold text-white mb-4">{t('home.styleTitle')}</h3>
//               <p className="text-white/70 leading-relaxed">
//                 {t('home.styleDesc')}
//               </p>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Final CTA Banner */}
//       <section className="py-24 px-6 bg-gradient-to-r from-black via-gray-900 to-black relative overflow-hidden">
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.05),transparent_50%)]"></div>
//         <div className="relative z-10 max-w-4xl mx-auto text-center">
//           <h2 className="text-5xl md:text-6xl font-black text-white mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
//             {t('home.journeyStarts')}
//           </h2>
//           <p className="text-xl md:text-2xl text-white/80 mb-12 leading-relaxed">
//             {t('home.joinMovement')}
//           </p>
//           <Link
//             to="/shop"
//             className="inline-block px-16 py-6 text-xl font-black text-black bg-white rounded-xl
//                      hover:scale-110 transition-all duration-300
//                      shadow-[0_0_40px_rgba(255,255,255,0.4)] hover:shadow-[0_0_60px_rgba(255,255,255,0.6)]"
//           >
//             {t('home.startShopping')}
//           </Link>
//         </div>
//       </section>
//     </div>
//   );
// }

