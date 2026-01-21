import { Outlet } from "react-router-dom";
import AdminNavbar from "../components/admin/AdminNavbar";

export default function AdminLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <AdminNavbar />
      <main className="flex-1 bg-black">
        <Outlet />
      </main>
      <footer className="bg-black border-t border-white/5 text-white/50 text-center py-6 mt-auto">
        <div className="text-sm tracking-wider">
          &copy; {new Date().getFullYear()} HNA Admin. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
