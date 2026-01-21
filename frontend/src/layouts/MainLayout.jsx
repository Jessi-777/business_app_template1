import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <Navbar />
      <main className="flex-1 bg-black">
        {/* Nested route content goes here */}
        <Outlet />
      </main>
      <footer className="bg-black border-t border-white/5 text-white/50 text-center py-6 mt-auto">
        <div className="text-sm tracking-wider">
          &copy; {new Date().getFullYear()} HNA. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
