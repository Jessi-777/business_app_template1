import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";

export default function Navbar() {
  const { state } = useCart();
  const { t } = useLanguage();
  const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <nav className="bg-black/95 backdrop-blur-md border-b border-white/5 p-4 flex justify-between items-center shadow-2xl">
      {/* Logo + Brand */}
      <Link to="/" className="flex items-center space-x-5 group">
        <div className="h-20 w-20 rounded-full bg-black flex items-center justify-center overflow-hidden">
          <img
            src="/assets/HNA_L0G0.png"
            alt="HNA Logo"
            className="h-[160%] w-[140%] object-cover transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]"
          />
        </div>
        <span className="text-white/90 font-bold text-xl tracking-wide transition-all duration-300 group-hover:text-white group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
          Human Nature Athletica
        </span>
      </Link>

      {/* Nav Links */}
      <div className="space-x-8 flex items-center text-lg font-medium">
        <Link
          to="/about"
          className="text-white/70 hover:text-white transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-white/80 after:transition-all after:duration-300 hover:after:w-full"
        >
          {t('nav.about')}
        </Link>
        <Link
          to="/shop"
          className="text-white/70 hover:text-white transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-white/80 after:transition-all after:duration-300 hover:after:w-full"
        >
          {t('nav.shop')}
        </Link>
        <Link
          to="/cart"
          className="relative text-white/70 hover:text-white transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-white/80 after:transition-all after:duration-300 hover:after:w-full"
        >
          {t('nav.cart')}
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-3 bg-white text-black text-xs px-2 py-0.5 rounded-full shadow-lg shadow-white/20 font-bold animate-pulse">
              {totalItems}
            </span>
          )}
        </Link>
      </div>

    </nav>
  );
}
