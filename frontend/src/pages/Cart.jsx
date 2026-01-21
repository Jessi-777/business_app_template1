import React, { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import CartItem from "../components/CartItem";
import { API_URL } from "../config";

export default function Cart() {
  const { state } = useCart();
  const { t } = useLanguage();
  const { items } = state;
  const [loading, setLoading] = useState(false);
  const [affiliateCode, setAffiliateCode] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // State to trigger animation
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (items.length > 0) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 300);
      return () => clearTimeout(timer);
    }
  }, [subtotal]);

  const handleCheckout = async () => {
    try {
      setLoading(true);
      
      // Store affiliate code in localStorage for testing (workaround for local webhook issue)
      if (affiliateCode) {
        localStorage.setItem('pendingAffiliateCode', affiliateCode);
        localStorage.setItem('pendingAffiliateAmount', subtotal.toString());
      }
      
      const response = await fetch(`${API_URL}/api/checkout/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map(item => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          affiliateCode: affiliateCode || undefined
        })
      });

      const data = await response.json();
      
      if (response.ok && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url;
      } else {
        alert('Error creating checkout session: ' + (data.message || 'Unknown error'));
        setLoading(false);
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Error processing checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col px-6 md:px-20 py-12">
      <h1 className="text-5xl font-bold mb-12 text-center text-white tracking-wider drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{t('cart.title')}</h1>

      {items.length === 0 ? (
        <div className="text-center text-white/60 mt-20 text-xl">
          {t('cart.empty')}
        </div>
      ) : (
        <>
          {/* Cart Items */}
          <div className="flex flex-col space-y-6 mb-12">
            {items.map((item) => (
              <CartItem key={item.id || item._id} item={item} />
            ))}
          </div>

          {/* Subtotal & Checkout */}
          <div className="relative flex flex-col md:flex-row md:justify-between items-center p-8 rounded-2xl">
            {/* Elegant glow */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-white/20 via-white/10 to-white/20 opacity-30 blur-xl"></div>

            {/* Subtotal container */}
            <div className="relative flex flex-col w-full bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl space-y-6">
              
              {/* Affiliate Code Input */}
              <div className="border-b border-white/10 pb-6">
                <label className="block text-white/80 mb-2 text-sm font-semibold">{t('cart.affiliatePrompt')}</label>
                <input
                  type="text"
                  value={affiliateCode}
                  onChange={(e) => setAffiliateCode(e.target.value.toUpperCase())}
                  placeholder={t('cart.affiliatePlaceholder')}
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/40 focus:border-indigo-500 focus:outline-none uppercase font-mono"
                  maxLength={20}
                />
                {affiliateCode && (
                  <p className="text-indigo-400 text-sm mt-2">✓ {t('cart.codeApplied')}: {affiliateCode}</p>
                )}
              </div>

              {/* Subtotal and Checkout */}
              <div className="flex flex-col md:flex-row md:justify-between items-center">
                <div
                  className={`text-2xl md:text-3xl font-bold text-white mb-4 md:mb-0 transition-transform duration-300 ${
                    animate ? "scale-110 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" : ""
                  }`}
                >
                  {t('cart.subtotal')}: ${subtotal.toFixed(2)}
                </div>
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="px-10 py-4 text-lg font-bold rounded-xl bg-white text-black hover:bg-white/90 shadow-lg shadow-white/20 hover:shadow-white/40 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center space-x-2"
                >
                  {loading && <span className="animate-spin">⏳</span>}
                  <span>{loading ? t('cart.processing') : t('cart.checkout')}</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
