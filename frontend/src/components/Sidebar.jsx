import React from "react";
import { Home, User, Settings, ShoppingBag } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { name: "Home", path: "/dashboard", icon: <Home size={20} /> },
  { name: "Onboarding", path: "/onboarding", icon: <User size={20} /> },
  { name: "Bundles", path: "/bundles", icon: <ShoppingBag size={20} /> },
  { name: "Settings", path: "/settings", icon: <Settings size={20} /> },
];

export default function Sidebar() {
  return (
    <aside className="h-screen w-64 bg-gray-900 text-gray-100 flex flex-col">
      <div className="p-6 text-2xl font-bold tracking-tight border-b border-gray-700">
        🐾 Pawfect Plug
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`
            }
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-700 text-sm text-gray-400">
        © {new Date().getFullYear()} Pawfect Plug
      </div>
    </aside>
  );
}
