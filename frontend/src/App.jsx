import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AccessibilityProvider } from "./context/AccessibilityContext";
import AccessibilityToolbar from "./components/AccessibilityToolbar";

import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Shop from "./pages/Shop"; 
import About from "./pages/About";
import Success from "./pages/Success";

import AdminLayout from "./layouts/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Orders from "./pages/admin/Orders";
import Products from "./pages/admin/Products";
import Pricing from "./pages/admin/Pricing";
import Affiliates from "./pages/admin/Affiliates";
import AffiliateSalesReport from "./pages/admin/AffiliateSalesReport";

export default function App() {
  return (
    <LanguageProvider>
      <AccessibilityProvider>
        <CartProvider>
          <BrowserRouter>
            <AccessibilityToolbar />
            <Routes>
              {/* Public site routes wrapped in MainLayout */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} /> 
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<Product />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/success" element={<Success />} />
              </Route>

              {/* Admin routes wrapped in AdminLayout */}
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/admin/orders" element={<Orders />} />
                <Route path="/admin/products" element={<Products />} />
                <Route path="/admin/affiliates/sales-report" element={<AffiliateSalesReport />} />
                <Route path="/admin/affiliates" element={<Affiliates />} />
                <Route path="/admin/pricing" element={<Pricing />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AccessibilityProvider>
    </LanguageProvider>
  );
}
