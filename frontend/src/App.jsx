import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";

import { CartProvider } from "./context/CartContext";
import { LanguageProvider } from "./context/LanguageContext";
import { AccessibilityProvider } from "./context/AccessibilityContext";

import AccessibilityToolbar from "./components/AccessibilityToolbar";

/* Layouts */
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";

/* Lazy Loaded Pages */
const Home    = lazy(() => import("./pages/Home"));
const Product = lazy(() => import("./pages/Product"));
const Cart    = lazy(() => import("./pages/Cart"));
const Shop    = lazy(() => import("./pages/Shop"));
const About   = lazy(() => import("./pages/About"));
const Success = lazy(() => import("./pages/Success"));

/* Admin */
const Dashboard            = lazy(() => import("./pages/admin/Dashboard"));
const Orders               = lazy(() => import("./pages/admin/Orders"));
const Products             = lazy(() => import("./pages/admin/Products"));
const Pricing              = lazy(() => import("./pages/admin/Pricing"));
const Affiliates           = lazy(() => import("./pages/admin/Affiliates"));
const AffiliateSalesReport = lazy(() => import("./pages/admin/AffiliateSalesReport"));
const Brands               = lazy(() => import("./pages/admin/Brands"));

/* Portals — standalone, no layout wrapper */
const AffiliatePortal = lazy(() => import("./pages/portal/AffiliatePortal"));
const VendorPortal    = lazy(() => import("./pages/vendor/VendorPortal"));

/* Brand — standalone, no layout wrapper */
const BrandStorefront = lazy(() => import("./pages/store/BrandStorefront"));
const BrandDashboard  = lazy(() => import("./pages/brand/BrandDashboard"));

/* 404 */
const NotFound = () => (
  <div className="flex items-center justify-center h-screen text-center">
    <div>
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-gray-500 mt-2">Page not found</p>
    </div>
  </div>
);

export default function App() {
  return (
    <LanguageProvider>
      <AccessibilityProvider>
        <CartProvider>
          <BrowserRouter>

            <AccessibilityToolbar />

            <Suspense fallback={<div className="p-10 text-center">Loading...</div>}>

              <Routes>

                {/* ---------------- PUBLIC SITE ---------------- */}
                <Route element={<MainLayout />}>
                  <Route path="/"            element={<Home />} />
                  <Route path="/about"       element={<About />} />
                  <Route path="/shop"        element={<Shop />} />
                  <Route path="/product/:id" element={<Product />} />
                  <Route path="/cart"        element={<Cart />} />
                  <Route path="/success"     element={<Success />} />
                </Route>

                {/* ---------------- ADMIN ---------------- */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index                          element={<Dashboard />} />
                  <Route path="orders"                  element={<Orders />} />
                  <Route path="products"                element={<Products />} />
                  <Route path="affiliates"              element={<Affiliates />} />
                  <Route path="affiliates/sales-report" element={<AffiliateSalesReport />} />
                  <Route path="pricing"                 element={<Pricing />} />
                  <Route path="brands"                  element={<Brands />} />
                </Route>

                {/* ---------------- AFFILIATE PORTAL ---------------- */}
                <Route path="/portal" element={<AffiliatePortal />} />

                {/* ---------------- VENDOR PORTAL ---------------- */}
                <Route path="/vendor" element={<VendorPortal />} />

                {/* ---------------- BRAND STOREFRONT ---------------- */}
                {/* /store/italylucas → brand partner's public storefront */}
                <Route path="/store/:slug" element={<BrandStorefront />} />

                {/* ---------------- BRAND DASHBOARD ---------------- */}
                {/* /brand → brand owner's private dashboard */}
                <Route path="/brand" element={<BrandDashboard />} />

                {/* ---------------- 404 ---------------- */}
                <Route path="*" element={<NotFound />} />

              </Routes>

            </Suspense>

          </BrowserRouter>
        </CartProvider>
      </AccessibilityProvider>
    </LanguageProvider>
  );
}






// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import { CartProvider } from "./context/CartContext";
// import { LanguageProvider } from "./context/LanguageContext";
// import { AccessibilityProvider } from "./context/AccessibilityContext";
// import AccessibilityToolbar from "./components/AccessibilityToolbar";

// import MainLayout from "./layouts/MainLayout";
// import Home from "./pages/Home";
// import Product from "./pages/Product";
// import Cart from "./pages/Cart";
// import Shop from "./pages/Shop"; 
// import About from "./pages/About";
// import Success from "./pages/Success";

// import AdminLayout from "./layouts/AdminLayout";
// import Dashboard from "./pages/admin/Dashboard";
// import Orders from "./pages/admin/Orders";
// import Products from "./pages/admin/Products";
// import Pricing from "./pages/admin/Pricing";
// import Affiliates from "./pages/admin/Affiliates";
// import AffiliateSalesReport from "./pages/admin/AffiliateSalesReport";
// import AffiliatePortal from './pages/portal/AffiliatePortal';


// export default function App() {
//   return (
//     <LanguageProvider>
//       <AccessibilityProvider>
//         <CartProvider>
//           <BrowserRouter>
//             <AccessibilityToolbar />
//             <Routes>
//             {/* Public site routes wrapped in MainLayout */}
//             <Route element={<MainLayout />}>
//               <Route path="/" element={<Home />} />
//               <Route path="/about" element={<About />} /> 
//               <Route path="/shop" element={<Shop />} />
//               <Route path="/product/:id" element={<Product />} />
//               <Route path="/cart" element={<Cart />} />
//               <Route path="/success" element={<Success />} />
//             </Route>

//             {/* Admin routes wrapped in AdminLayout */}
//             <Route element={<AdminLayout />}>
//               <Route path="/admin" element={<Dashboard />} />
//               <Route path="/admin/orders" element={<Orders />} />
//               <Route path="/admin/products" element={<Products />} />
//               <Route path="/admin/affiliates/sales-report" element={<AffiliateSalesReport />} />
//               <Route path="/admin/affiliates" element={<Affiliates />} />
//               <Route path="/admin/pricing" element={<Pricing />} />
//             </Route>

//             {/* Portal  standalone, no layout wrapper */}
//             <Route path="/portal" element={<AffiliatePortal />} />
//           </Routes>
//           </BrowserRouter>
//         </CartProvider>
//       </AccessibilityProvider>
//     </LanguageProvider>
//   );
// }




  //  <Routes>
  //             {/* Public site routes wrapped in MainLayout */}
  //             <Route element={<MainLayout />}>
  //               <Route path="/" element={<Home />} />
  //               <Route path="/about" element={<About />} /> 
  //               <Route path="/shop" element={<Shop />} />
  //               <Route path="/product/:id" element={<Product />} />
  //               <Route path="/cart" element={<Cart />} />
  //               <Route path="/success" element={<Success />} />
  //               <Route path="/portal" element={<AffiliatePortal />} />

  //             </Route>

  //             {/* Admin routes wrapped in AdminLayout */}
  //             <Route element={<AdminLayout />}>
  //               <Route path="/admin" element={<Dashboard />} />
  //               <Route path="/admin/orders" element={<Orders />} />
  //               <Route path="/admin/products" element={<Products />} />
  //               <Route path="/admin/affiliates/sales-report" element={<AffiliateSalesReport />} />
  //               <Route path="/admin/affiliates" element={<Affiliates />} />
  //               <Route path="/admin/pricing" element={<Pricing />} />
  //             </Route>
  //           </Routes>