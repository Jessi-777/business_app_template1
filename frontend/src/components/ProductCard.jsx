import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { useState } from "react";

export default function ProductCard({ product }) {
  const { dispatch } = useCart();
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [showAddedNotification, setShowAddedNotification] = useState(false);

  const handleAddToCart = (e) => {
    if (e) e.stopPropagation();
    dispatch({ type: "ADD_ITEM", payload: product });
    setShowAddedNotification(true);
    setTimeout(() => setShowAddedNotification(false), 2000);
  };

  return (
    <>
      <div
        onClick={() => setShowModal(true)}
        className="group relative flex flex-col rounded-2xl overflow-hidden bg-black border border-white/10 hover:border-white/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] cursor-pointer"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-white/0 via-white/20 to-white/0 rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500"></div>

        <div className="relative">
          <div className="relative w-full h-96 overflow-hidden bg-white/5 flex items-center justify-center p-4">
            <img
              src={product.image}
              alt={product.name}
              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-50 group-hover:opacity-30 transition-opacity duration-500"></div>
          </div>

          <div className="flex flex-col flex-1 p-6">
            <h2 className="font-bold text-xl text-white/90 group-hover:text-white transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] tracking-wide">
              {product.name}
            </h2>
            <p className="text-white/70 mt-2 text-lg font-semibold">${product.price}</p>

            <div className="relative pt-6 mt-auto">
              <button
                onClick={handleAddToCart}
                className="w-full px-6 py-4 text-base font-bold text-white rounded-xl bg-black border border-white/30 hover:border-white/50 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg">
                {showAddedNotification ? t('products.added') : t('products.addToCart')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <ProductModal
          product={product}
          onClose={() => setShowModal(false)}
          onAddToCart={() => {
            dispatch({ type: "ADD_ITEM", payload: product });
            setShowAddedNotification(true);
            setTimeout(() => setShowAddedNotification(false), 2000);
            setTimeout(() => setShowModal(false), 500);
          }}
        />
      )}
    </>
  );
}

function ProductModal({ product, onClose, onAddToCart }) {
  const { t } = useLanguage();
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-black border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-black border-b border-white/10 p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-white">{t('products.details')}</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl">×</button>
        </div>

        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white/5 border border-white/10 rounded-xl flex items-center justify-center min-h-[500px] shadow-[0_0_50px_rgba(255,255,255,0.15)] hover:shadow-[0_0_80px_rgba(255,255,255,0.25)] hover:-translate-y-3 hover:scale-[1.02] transition-all duration-500 ease-out transform-gpu">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full max-h-[750px] object-contain drop-shadow-[0_15px_40px_rgba(255,255,255,0.2)]"
              />
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-4 tracking-wide drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                  {product.name}
                </h1>
                <div className="text-3xl font-bold text-white/90 mb-6">${product.price}</div>

                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <div className="mb-4">
                    <span className="text-white/50 line-through text-lg">${product.compareAtPrice}</span>
                    <span className="ml-3 text-green-400 font-semibold">
                      {t('products.save')} ${(product.compareAtPrice - product.price).toFixed(2)}
                    </span>
                  </div>
                )}

                {product.description && (
                  <div className="mb-6">
                    <h3 className="text-white/70 font-semibold mb-2">{t('products.description')}</h3>
                    <p className="text-white/60 leading-relaxed">{product.description}</p>
                  </div>
                )}

                {product.category && (
                  <div className="mb-4">
                    <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white/70 text-sm">
                      {product.category}
                    </span>
                  </div>
                )}

                {product.countInStock !== undefined && (
                  <div className="mb-6">
                    <span className={`text-sm font-semibold ${product.countInStock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {product.countInStock > 0 ? `${product.countInStock} ${t('products.inStock')}` : t('products.outOfStock')}
                    </span>
                  </div>
                )}

                {product.tags && product.tags.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-white/70 font-semibold mb-2">{t('products.tags')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-white/60 text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative mt-8">
                <button
                  onClick={onAddToCart}
                  disabled={product.countInStock === 0}
                  className="w-full px-8 py-4 text-lg font-bold text-white rounded-xl bg-black border border-white/30 hover:border-white/50 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {product.countInStock === 0 ? t('products.outOfStock') : t('products.addToCart')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}





// import { useCart } from "../context/CartContext";
// import { useLanguage } from "../context/LanguageContext";
// import { useState } from "react";

// export default function ProductCard({ product }) {
//   const { dispatch } = useCart();
//   const { t } = useLanguage();
//   const [showModal, setShowModal] = useState(false);
//   const [showAddedNotification, setShowAddedNotification] = useState(false);

//   const handleAddToCart = (e) => {
//     if (e) e.stopPropagation();
//     dispatch({ type: "ADD_ITEM", payload: product });
//     setShowAddedNotification(true);
//     setTimeout(() => setShowAddedNotification(false), 2000);
//   };

//   return (
//     <>
//       <div 
//         onClick={() => setShowModal(true)}
//         className="group relative flex flex-col rounded-2xl overflow-hidden bg-black border border-white/10 hover:border-white/30 transition-all duration-500 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] cursor-pointer"
//       >
//         {/* Animated glow effect */}
//         <div className="absolute -inset-0.5 bg-gradient-to-r from-white/0 via-white/20 to-white/0 rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500"></div>
        
//         <div className="relative">
//           {/* Product Image - Full image visible */}
//           <div className="relative w-full h-96 overflow-hidden bg-white/5 flex items-center justify-center p-4">
//             <img
//               src={product.image}
//               alt={product.name}
//               className="w-full h-full  max-h-[750px] object-contain group-hover:scale-105 transition-transform duration-700"
//             />
//             {/* Subtle overlay */}
//             <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-50 group-hover:opacity-30 transition-opacity duration-500"></div>
//           </div>

//           {/* Product Info */}
//           <div className="flex flex-col flex-1 p-6">
//             <h2 className="font-bold text-xl text-white/90 group-hover:text-white transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] tracking-wide">
//               {product.name}
//             </h2>
//             <p className="text-white/70 mt-2 text-lg font-semibold">${product.price}</p>

//           {/* Add to Cart Button */}
//           <div className="relative pt-6 mt-auto">
//             <button
//               onClick={handleAddToCart}
//               className="w-full px-6 py-4 text-base font-bold text-white rounded-xl
//                    bg-black border border-white/30
//                    hover:border-white/50
//                    transition-all duration-300
//                    hover:scale-105 active:scale-95
//                    shadow-lg">
//               {showAddedNotification ? t('products.added') : t('products.addToCart')}
//             </button>
//           </div>
//         </div>
//         </div>
//       </div>

//       {/* Product Detail Modal */}
//       {showModal && (
//         <ProductModal 
//           product={product} 
//           onClose={() => setShowModal(false)}
//           onAddToCart={() => {
//             dispatch({ type: "ADD_ITEM", payload: product });
//             setShowAddedNotification(true);
//             setTimeout(() => setShowAddedNotification(false), 2000);
//             setTimeout(() => setShowModal(false), 500);
//           }}
//         />
//       )}
//     </>
//   );
// }

// function ProductModal({ product, onClose, onAddToCart }) {
//   const { t } = useLanguage();
//   return (
//     <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
//       <div className="bg-black border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
//         <div className="sticky top-0 bg-black border-b border-white/10 p-6 flex justify-between items-center z-10">
//           <h2 className="text-2xl font-bold text-white">{t('products.details')}</h2>
//           <button onClick={onClose} className="text-white/60 hover:text-white text-2xl">×</button>
//         </div>
        
//         <div className="p-8">
//           <div className="grid md:grid-cols-2 gap-8">
//             {/* Full Product Image - Elevated */}
//             <div className="bg-white/5 border border-white/10 rounded-xl  flex items-center justify-center min-h-[400px] 
//                           shadow-[0_0_50px_rgba(255,255,255,0.15)] 
//                           hover:shadow-[0_0_80px_rgba(255,255,255,0.25)] 
//                           hover:-translate-y-3 hover:scale-[1.02]
//                           transition-all duration-500 ease-out
//                           transform-gpu">
//               <img
//                 src={product.image}
//                 alt={product.name}
//                 className="w-full h-full max-h-[600px] object-contain drop-shadow-[0_15px_40px_rgba(255,255,255,0.2)]"
//               />
//             </div>

//             {/* Product Details */}
//             <div className="flex flex-col justify-between">
//               <div>
//                 <h1 className="text-4xl font-bold text-white mb-4 tracking-wide drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
//                   {product.name}
//                 </h1>
                
//                 <div className="text-3xl font-bold text-white/90 mb-6">
//                   ${product.price}
//                 </div>

//                 {product.compareAtPrice && product.compareAtPrice > product.price && (
//                   <div className="mb-4">
//                     <span className="text-white/50 line-through text-lg">${product.compareAtPrice}</span>
//                     <span className="ml-3 text-green-400 font-semibold">
//                       {t('products.save')} ${(product.compareAtPrice - product.price).toFixed(2)}
//                     </span>
//                   </div>
//                 )}

//                 {product.description && (
//                   <div className="mb-6">
//                     <h3 className="text-white/70 font-semibold mb-2">{t('products.description')}</h3>
//                     <p className="text-white/60 leading-relaxed">{product.description}</p>
//                   </div>
//                 )}

//                 {product.category && (
//                   <div className="mb-4">
//                     <span className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-white/70 text-sm">
//                       {product.category}
//                     </span>
//                   </div>
//                 )}

//                 {product.countInStock !== undefined && (
//                   <div className="mb-6">
//                     <span className={`text-sm font-semibold ${product.countInStock > 0 ? 'text-green-400' : 'text-red-400'}`}>
//                       {product.countInStock > 0 ? `${product.countInStock} ${t('products.inStock')}` : t('products.outOfStock')}
//                     </span>
//                   </div>
//                 )}

//                 {product.tags && product.tags.length > 0 && (
//                   <div className="mb-6">
//                     <h3 className="text-white/70 font-semibold mb-2">{t('products.tags')}</h3>
//                     <div className="flex flex-wrap gap-2">
//                       {product.tags.map((tag, index) => (
//                         <span key={index} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-white/60 text-xs">
//                           {tag}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Add to Cart Button */}
//               <div className="relative mt-8">
//                 <button
//                   onClick={onAddToCart}
//                   disabled={product.countInStock === 0}
//                   className="w-full px-8 py-4 text-lg font-bold text-white rounded-xl
//                        bg-black border border-white/30
//                        hover:border-white/50
//                        transition-all duration-300
//                        hover:scale-105 active:scale-95
//                        disabled:opacity-50 disabled:cursor-not-allowed
//                        shadow-lg"
//                 >
//                   {product.countInStock === 0 ? t('products.outOfStock') : t('products.addToCart')}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
