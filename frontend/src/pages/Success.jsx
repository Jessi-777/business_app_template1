import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { API_URL } from '../config';

export default function Success() {
  const navigate = useNavigate();
  const { dispatch } = useCart();
  const [searchParams] = useSearchParams();
  const [showConfetti, setShowConfetti] = useState(true);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    // Clear cart after successful payment
    dispatch({ type: 'CLEAR_CART' });
    
    // Hide confetti after animation
    setTimeout(() => setShowConfetti(false), 4000);

    // Fetch order details from the session
    if (sessionId) {
      fetchOrderDetails();
      // Testing workaround: Record affiliate sale directly (since webhooks can't reach localhost)
      recordAffiliateSale();
    } else {
      setLoading(false);
    }
  }, [dispatch, sessionId]);

  const recordAffiliateSale = async () => {
    try {
      const affiliateCode = localStorage.getItem('pendingAffiliateCode');
      const amount = localStorage.getItem('pendingAffiliateAmount');
      
      if (affiliateCode && amount) {
        await fetch(`${API_URL}/api/affiliates/sale/${affiliateCode}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: parseFloat(amount) })
        });
        
        // Clear the pending affiliate data
        localStorage.removeItem('pendingAffiliateCode');
        localStorage.removeItem('pendingAffiliateAmount');
        console.log('✅ Affiliate sale recorded for testing');
      }
    } catch (error) {
      console.error('Error recording affiliate sale:', error);
    }
  };

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders?sessionId=${sessionId}`);
      if (response.ok) {
        const orders = await response.json();
        // Get the most recent order
        if (orders.length > 0) {
          setOrderDetails(orders[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Play success sound
  useEffect(() => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      const playTone = (frequency, startTime, duration, volume = 0.3) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequency;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(volume, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + duration);
      };

      const now = audioContext.currentTime;
      
      // Success fanfare
      playTone(600, now, 0.15, 0.3);
      playTone(750, now + 0.15, 0.15, 0.3);
      playTone(900, now + 0.3, 0.25, 0.4);
    } catch (error) {
      console.log('Audio not available');
    }
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden" id="main-content">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.1),transparent_50%)] animate-pulse"></div>
      </div>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-fall"
              style={{
                left: `${Math.random() * 100}%`,
                top: `-${Math.random() * 20}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            >
              <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-20">
        <div className="max-w-2xl w-full">
          {/* Success Animation */}
          <div className="text-center mb-12">
            {/* Animated Checkmark */}
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-green-500/30 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-green-600 border-4 border-green-400 flex items-center justify-center shadow-[0_0_50px_rgba(34,197,94,0.5)] animate-bounce-slow">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={4} 
                    d="M5 13l4 4L19 7"
                    className="animate-draw-check"
                  />
                </svg>
              </div>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tight drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] animate-fade-in">
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
                Payment Successful! 🎉
              </span>
            </h1>
            
            <p className="text-2xl text-white/90 font-light mb-2">
              Thank you for choosing <span className="font-bold text-white">HNA</span>
            </p>

            {orderDetails && (
              <div className="inline-block px-4 py-2 bg-indigo-500/20 border border-indigo-500/50 rounded-full text-indigo-300 font-mono text-sm mb-4">
                Order #{orderDetails.orderNumber}
              </div>
            )}

            <p className="text-lg text-white/60 max-w-xl mx-auto leading-relaxed">
              Your payment was successful and your order is being processed
            </p>
          </div>

          {/* Order Summary Card */}
          {orderDetails && (
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 mb-6 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Order Summary
              </h3>
              
              <div className="space-y-3 mb-4">
                {orderDetails.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-black/30 rounded-lg border border-white/10">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-white">{item.name}</div>
                      <div className="text-sm text-white/60">Quantity: {item.quantity}</div>
                    </div>
                    <div className="text-white font-bold">${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/20 pt-4 flex justify-between items-center">
                <span className="text-lg font-semibold text-white/80">Total Paid</span>
                <span className="text-3xl font-bold text-green-400">${orderDetails.totalPrice.toFixed(2)}</span>
              </div>

              {orderDetails.affiliate?.code && (
                <div className="mt-4 p-3 bg-indigo-900/30 border border-indigo-500/50 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span className="text-indigo-300">Affiliate code <code className="font-mono font-bold">{orderDetails.affiliate.code}</code> applied</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Order Info Card */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-8 hover:border-indigo-500/30 transition-all duration-300 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-black to-[#293037] flex items-center justify-center flex-shrink-0 shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2">What happens next?</h3>
                <ul className="space-y-3 text-white/70">
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 mt-1 text-lg">✓</span>
                    <span>Confirmation email sent to <span className="text-white font-medium">{orderDetails?.customer?.email || 'your inbox'}</span></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-green-400 mt-1 text-lg">✓</span>
                    <span>Your items are being prepared by our fulfillment partners</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-yellow-400 mt-1 text-lg">⏱</span>
                    <span>Shipping within <span className="text-white font-medium">3-5 business days</span></span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-400 mt-1 text-lg">📦</span>
                    <span>Tracking information will be sent via email</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 mt-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>30-day money-back guarantee</span>
                </div>
                <div className="flex items-center gap-3 text-white/60 text-sm">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Customer support available 24/7</span>
                </div>
              </div>
            </div>
          </div>

          {/* Special Offer Banner */}
          <div className="bg-gradient-to-r from-[#303341] glassmorphism to-black border border-indigo-500/30 rounded-2xl p-6 mb-8 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">First-time customer bonus!</h3>
                <p className="text-white/70 text-sm">Get 15% off your next order. Check your email for the discount code.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            <Link
              to="/shop"
              className="group relative px-8 py-5 text-lg font-bold rounded-xl text-center
                       bg-gradient-to-r from-black to-[#24282f] text-white
                       hover:from-black hover:to-[#1a2431]
                       shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_50px_rgba(99,102,241,0.6)]
                       hover:scale-105 transition-all duration-300"
            >
              <span className="relative z-10">Continue Shopping</span>
            </Link>
            
            <Link
              to="/"
              className="px-8 py-5 text-lg font-bold text-white rounded-xl text-center
                       border-2 border-white/30 backdrop-blur-sm
                       hover:bg-white/10 hover:border-white/50
                       transition-all duration-300 hover:scale-105"
            >
              Back to Home
            </Link>
          </div>

          {/* Support Section */}
          <div className="text-center bg-white/5 rounded-xl p-6 border border-white/10">
            <p className="text-white/70 text-sm mb-3">Need help with your order?</p>
            <div className="flex justify-center gap-6">
              <a href="mailto:support@hna.com" className="flex items-center gap-2 text-[#93a2c1] hover:text-white  transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-medium text-[#93a2c1] hover:text-white">Email Support</span>
              </a>
              <a href="#" className="flex items-center gap-2 text-[#93a2c1] hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span className="font-medium">Live Chat</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
        @keyframes draw-check {
          from {
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
          }
          to {
            stroke-dasharray: 100;
            stroke-dashoffset: 0;
          }
        }
        .animate-draw-check {
          animation: draw-check 0.5s ease-in-out 0.3s forwards;
        }
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite;
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
