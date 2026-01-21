import { Link } from "react-router-dom";

export default function AdminNavbar() {
  return (
    <nav className="bg-black/95 backdrop-blur-md border-b border-white/10 px-8 py-4 flex justify-between items-center shadow-2xl">
      {/* Logo / Brand */}
      <Link to="/admin" className="text-2xl font-bold text-white tracking-wider hover:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] transition-all duration-300">
        HNA Admin
      </Link>

      {/* Links */}
      <div className="flex space-x-8 text-base font-medium">
        <Link to="/admin" className="text-white/70 hover:text-white transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-white/80 after:transition-all after:duration-300 hover:after:w-full">
          Dashboard
        </Link>
        <Link to="/admin/orders" className="text-white/70 hover:text-white transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-white/80 after:transition-all after:duration-300 hover:after:w-full">
          Orders
        </Link>
        <Link to="/admin/products" className="text-white/70 hover:text-white transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-white/80 after:transition-all after:duration-300 hover:after:w-full">
          Products
        </Link>
        <Link to="/admin/pricing" className="text-white/70 hover:text-white transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-white/80 after:transition-all after:duration-300 hover:after:w-full">
          Pricing
        </Link>
        <Link to="/admin/affiliates" className="text-white/70 hover:text-white transition-all duration-300 hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[2px] after:bg-white/80 after:transition-all after:duration-300 hover:after:w-full">
          Affiliates
        </Link>
      </div>

      {/* User / Logout */}
      <button className="bg-white text-black px-5 py-2 rounded-lg font-bold hover:bg-white/90 transition-all duration-300 shadow-lg shadow-white/20 hover:shadow-white/40 hover:scale-105">
        Logout
      </button>
    </nav>
  );
}
