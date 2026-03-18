import { useState, useEffect, createContext, useContext } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const VendorAuthContext = createContext(null);
const useVendorAuth = () => useContext(VendorAuthContext);

// ── Capability labels ─────────────────────────────────────────────────────────
const CAPABILITY_LABELS = {
  'screen-printing': { label: 'Screen Printing', emoji: '🖨️' },
  'embroidery':      { label: 'Embroidery',      emoji: '🧵' },
  'dtg':             { label: 'DTG',             emoji: '👕' },
  'sublimation':     { label: 'Sublimation',     emoji: '🎨' },
  'heat-transfer':   { label: 'Heat Transfer',   emoji: '🔥' },
  'cut-and-sew':     { label: 'Cut & Sew',       emoji: '✂️' },
  'embossing':       { label: 'Embossing',       emoji: '🔲' },
  'patches':         { label: 'Patches',         emoji: '🏷️' },
};

// ── Order status config ───────────────────────────────────────────────────────
const STATUS_CONFIG = {
  'Sent to Supplier': { color: 'text-yellow-400', border: 'border-yellow-500/40', bg: 'bg-yellow-500/10', dot: 'bg-yellow-400' },
  'In Production':    { color: 'text-blue-400',   border: 'border-blue-500/40',   bg: 'bg-blue-500/10',   dot: 'bg-blue-400'   },
  'Shipped':          { color: 'text-green-400',  border: 'border-green-500/40',  bg: 'bg-green-500/10',  dot: 'bg-green-400'  },
  'Delivered':        { color: 'text-indigo-400', border: 'border-indigo-500/40', bg: 'bg-indigo-500/10', dot: 'bg-indigo-400' },
};

// ── Shared UI — matches AffiliatePortal.jsx ───────────────────────────────────
const GlassCard = ({ children, className = '', glow = false }) => (
  <div className="relative group">
    <div className={`absolute -bottom-3 left-6 right-6 h-5 blur-xl rounded-full transition-all duration-300 group-hover:h-7 ${glow ? 'bg-indigo-500/50 group-hover:bg-indigo-400/70' : 'bg-indigo-500/25 group-hover:bg-indigo-400/40'}`} />
    <div className={`relative bg-indigo-950/60 backdrop-blur-md border border-indigo-500/30 rounded-2xl hover:border-indigo-400/50 transition-all duration-300 ${className}`}>
      {children}
    </div>
  </div>
);

const StatCard = ({ label, value, sub, accent = 'text-white' }) => (
  <GlassCard>
    <div className="p-6">
      <div className="text-indigo-300/50 text-xs uppercase tracking-widest mb-2">{label}</div>
      <div className={`text-3xl font-bold mb-1 ${accent}`}>{value}</div>
      {sub && <div className="text-indigo-300/40 text-sm">{sub}</div>}
    </div>
  </GlassCard>
);

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginView({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/vendors/portal/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      onLogin(data.vendor, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05050f] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12)_0%,transparent_70%)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/8 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="absolute -bottom-4 left-8 right-8 h-8 bg-indigo-500/40 blur-2xl rounded-full" />
        <div className="relative bg-indigo-950/70 backdrop-blur-xl border border-indigo-500/40 rounded-2xl p-10 shadow-[0_0_60px_rgba(99,102,241,0.2)]">
          <div className="text-center mb-10">
            <div className="text-5xl mb-3 drop-shadow-[0_0_20px_rgba(99,102,241,0.8)]">🏭</div>
            <h1 className="text-2xl font-bold text-white tracking-widest uppercase drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">HNA Vendor</h1>
            <p className="text-indigo-300/40 text-sm mt-2 tracking-wider">Fulfillment Portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-indigo-300/60 text-xs uppercase tracking-widest mb-2">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-indigo-950/60 border border-indigo-500/30 rounded-xl text-white placeholder-indigo-300/20 focus:border-indigo-400 focus:outline-none focus:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all"
                placeholder="you@business.com"
              />
            </div>
            <div>
              <label className="block text-indigo-300/60 text-xs uppercase tracking-widest mb-2">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-indigo-950/60 border border-indigo-500/30 rounded-xl text-white placeholder-indigo-300/20 focus:border-indigo-400 focus:outline-none focus:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold tracking-wide hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all duration-300 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-indigo-300/30 text-xs mt-8">
            Need access?{' '}
            <a href="mailto:hello@hna.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Contact HNA
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',   icon: '◎' },
  { id: 'orders',    label: 'Orders',      icon: '📦' },
  { id: 'profile',   label: 'My Profile',  icon: '🏭' },
];

function Sidebar({ activeView, setActiveView, vendor, pendingCount, onLogout }) {
  return (
    <aside className="w-64 min-h-screen bg-indigo-950/40 border-r border-indigo-500/20 flex flex-col flex-shrink-0">
      <div className="p-6 border-b border-indigo-500/20">
        <div className="text-xl font-bold text-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">HNA</div>
        <div className="text-indigo-300/30 text-xs tracking-wider mt-0.5">Vendor Portal</div>
      </div>

      <div className="p-5 border-b border-indigo-500/20">
        <div className="text-white font-semibold truncate">{vendor.businessName || vendor.name}</div>
        <div className="flex flex-wrap gap-1 mt-2">
          {(vendor.capabilities || []).slice(0, 2).map(cap => (
            <span key={cap} className="text-xs px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
              {CAPABILITY_LABELS[cap]?.emoji} {CAPABILITY_LABELS[cap]?.label}
            </span>
          ))}
          {(vendor.capabilities || []).length > 2 && (
            <span className="text-xs px-2 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300/50">
              +{vendor.capabilities.length - 2} more
            </span>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeView === item.id
                ? 'bg-indigo-500/20 text-white border border-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                : 'text-indigo-300/50 hover:text-white hover:bg-indigo-500/10'
            }`}
          >
            <span className="text-base">{item.icon}</span>
            <span className="flex-1 text-left">{item.label}</span>
            {item.id === 'orders' && pendingCount > 0 && (
              <span className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-xs rounded-full font-bold">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-indigo-500/20">
        <button
          onClick={onLogout}
          className="w-full px-4 py-2.5 text-indigo-300/40 hover:text-indigo-300/70 text-sm rounded-xl hover:bg-indigo-500/10 transition-all text-left"
        >
          ← Sign Out
        </button>
      </div>
    </aside>
  );
}

// ── DASHBOARD VIEW ────────────────────────────────────────────────────────────
function DashboardView({ vendor, orders, setActiveView }) {
  const pending    = orders.filter(o => o.status === 'Sent to Supplier').length;
  const production = orders.filter(o => o.status === 'In Production').length;
  const shipped    = orders.filter(o => o.status === 'Shipped').length;
  const delivered  = orders.filter(o => o.status === 'Delivered').length;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-1 drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]">
          Welcome, {vendor.businessName || vendor.name} 🏭
        </h1>
        <p className="text-indigo-300/40">Your fulfillment dashboard.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Awaiting Action"   value={pending}    sub="New orders"        accent={pending > 0 ? 'text-yellow-400' : 'text-white'} />
        <StatCard label="In Production"     value={production} sub="Being made"        accent="text-blue-400" />
        <StatCard label="Shipped"           value={shipped}    sub="Tracking uploaded" accent="text-green-400" />
        <StatCard label="Total Fulfilled"   value={vendor.totalOrdersFulfilled || 0} sub="All time" accent="text-indigo-400" />
      </div>

      {/* Pending orders alert */}
      {pending > 0 && (
        <div className="relative group">
          <div className="absolute -bottom-3 left-6 right-6 h-5 bg-yellow-500/20 blur-xl rounded-full" />
          <div className="relative p-5 bg-yellow-500/5 border border-yellow-500/30 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <div className="text-yellow-400 font-semibold">
                  {pending} order{pending > 1 ? 's' : ''} waiting for you
                </div>
                <div className="text-yellow-400/60 text-sm">These need to be marked In Production or Shipped</div>
              </div>
            </div>
            <button
              onClick={() => setActiveView('orders')}
              className="px-4 py-2 bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 rounded-xl text-sm font-semibold hover:bg-yellow-500/30 transition-all"
            >
              View Orders →
            </button>
          </div>
        </div>
      )}

      {/* Capabilities */}
      <GlassCard>
        <div className="p-6">
          <div className="text-indigo-300/50 text-xs uppercase tracking-widest mb-4">Your Capabilities</div>
          <div className="flex flex-wrap gap-3">
            {(vendor.capabilities || []).map(cap => (
              <div key={cap} className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-sm text-indigo-300 flex items-center gap-2">
                <span>{CAPABILITY_LABELS[cap]?.emoji}</span>
                <span>{CAPABILITY_LABELS[cap]?.label}</span>
              </div>
            ))}
            {(!vendor.capabilities || vendor.capabilities.length === 0) && (
              <div className="text-indigo-300/30 text-sm">No capabilities set. Contact HNA admin.</div>
            )}
          </div>
          <div className="flex gap-6 mt-4 pt-4 border-t border-indigo-500/10 text-sm text-indigo-300/40">
            <span>⏱ {vendor.turnaroundDays || 7} day turnaround</span>
            <span>📦 Min order: {vendor.minimumOrderQty || 1} unit{vendor.minimumOrderQty !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </GlassCard>

      {/* Recent orders */}
      <div>
        <div className="text-indigo-300/40 text-xs uppercase tracking-widest mb-4">Recent Orders</div>
        {orders.length === 0 ? (
          <GlassCard>
            <div className="p-10 text-center">
              <div className="text-4xl mb-3">📭</div>
              <div className="text-indigo-300/40">No orders assigned yet.</div>
            </div>
          </GlassCard>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map(order => {
              const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG['Sent to Supplier'];
              return (
                <GlassCard key={order._id}>
                  <div className="p-4 flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${sc.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-semibold text-sm">#{order.orderNumber}</div>
                      <div className="text-indigo-300/40 text-xs mt-0.5">
                        {order.customer.name} · {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs border ${sc.bg} ${sc.color} ${sc.border}`}>
                      {order.status}
                    </span>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── ORDERS VIEW ───────────────────────────────────────────────────────────────
function OrdersView({ orders, onUpdateOrder }) {
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [trackingInputs, setTrackingInputs] = useState({});
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState('all');

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => o.status === filter);

  const handleMarkInProduction = async (orderId) => {
    setUpdating(orderId);
    await onUpdateOrder(orderId, { supplierStatus: 'in_production' });
    setUpdating(null);
  };

  const handleUploadTracking = async (orderId) => {
    const tracking = trackingInputs[orderId]?.trim();
    if (!tracking) return alert('Please enter a tracking number');
    setUpdating(orderId);
    await onUpdateOrder(orderId, { trackingNumber: tracking });
    setTrackingInputs(prev => ({ ...prev, [orderId]: '' }));
    setUpdating(null);
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-white mb-1 drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]">Orders</h1>
        <p className="text-indigo-300/40">Fulfill and track your assigned orders.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'Sent to Supplier', 'In Production', 'Shipped', 'Delivered'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === f
                ? 'bg-indigo-500/20 text-white border border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                : 'text-indigo-300/50 hover:text-white border border-transparent hover:border-indigo-500/20'
            }`}
          >
            {f === 'all' ? 'All Orders' : f}
            {f !== 'all' && (
              <span className="ml-2 text-xs opacity-60">
                {orders.filter(o => o.status === f).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <GlassCard>
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">📭</div>
            <div className="text-indigo-300/40">No orders in this category.</div>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map(order => {
            const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG['Sent to Supplier'];
            const isExpanded = expandedOrder === order._id;

            return (
              <GlassCard key={order._id}>
                {/* Order header */}
                <div
                  className="p-5 cursor-pointer"
                  onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${sc.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-white font-bold">#{order.orderNumber}</span>
                        <span className={`px-3 py-0.5 rounded-lg text-xs border ${sc.bg} ${sc.color} ${sc.border}`}>
                          {order.status}
                        </span>
                        <span className="text-indigo-300/40 text-xs">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="text-indigo-300/50 text-sm mt-1">
                        {order.customer.name} · {order.items.length} item{order.items.length !== 1 ? 's' : ''} · ${order.totalPrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-indigo-300/30 text-sm flex-shrink-0">
                      {isExpanded ? '▲' : '▼'}
                    </div>
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-indigo-500/20 p-5 space-y-5">

                    {/* Items */}
                    <div>
                      <div className="text-indigo-300/40 text-xs uppercase tracking-widest mb-3">Items to Fulfill</div>
                      <div className="space-y-2">
                        {order.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/10">
                            {item.image && (
                              <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded-lg border border-indigo-500/20 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="text-white text-sm font-semibold truncate">{item.name}</div>
                              <div className="text-indigo-300/40 text-xs">Qty: {item.quantity} · ${item.price} each</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Ship to */}
                    <div>
                      <div className="text-indigo-300/40 text-xs uppercase tracking-widest mb-3">Ship To</div>
                      <div className="p-4 bg-indigo-950/40 rounded-xl border border-indigo-500/10 text-sm">
                        <div className="text-white font-semibold">{order.customer.name}</div>
                        <div className="text-indigo-300/60 mt-1">{order.customer.address}</div>
                        <div className="text-indigo-300/60">{order.customer.city}, {order.customer.zipCode}</div>
                        <div className="text-indigo-300/60">{order.customer.country}</div>
                        <div className="text-indigo-300/40 mt-2 text-xs">{order.customer.email}</div>
                      </div>
                    </div>

                    {/* Tracking info if shipped */}
                    {order.supplier?.trackingNumber && (
                      <div className="p-4 bg-green-500/5 border border-green-500/20 rounded-xl">
                        <div className="text-green-400/60 text-xs uppercase tracking-widest mb-1">Tracking Number</div>
                        <div className="text-green-400 font-mono font-semibold">{order.supplier.trackingNumber}</div>
                      </div>
                    )}

                    {/* Actions */}
                    {order.status === 'Sent to Supplier' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleMarkInProduction(order._id)}
                          disabled={updating === order._id}
                          className="flex-1 py-3 bg-blue-500/20 border border-blue-500/40 text-blue-400 rounded-xl text-sm font-semibold hover:bg-blue-500/30 hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all disabled:opacity-50"
                        >
                          {updating === order._id ? 'Updating...' : '🖨️ Mark In Production'}
                        </button>
                      </div>
                    )}

                    {(order.status === 'Sent to Supplier' || order.status === 'In Production') && (
                      <div>
                        <div className="text-indigo-300/40 text-xs uppercase tracking-widest mb-2">Upload Tracking Number</div>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            value={trackingInputs[order._id] || ''}
                            onChange={e => setTrackingInputs(prev => ({ ...prev, [order._id]: e.target.value }))}
                            placeholder="e.g. 1Z999AA10123456784"
                            className="flex-1 px-4 py-2.5 bg-indigo-950/60 border border-indigo-500/30 rounded-xl text-white placeholder-indigo-300/20 font-mono text-sm focus:border-indigo-400 focus:outline-none focus:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"
                          />
                          <button
                            onClick={() => handleUploadTracking(order._id)}
                            disabled={updating === order._id}
                            className="px-5 py-2.5 bg-green-500/20 border border-green-500/40 text-green-400 rounded-xl text-sm font-semibold hover:bg-green-500/30 hover:shadow-[0_0_15px_rgba(74,222,128,0.3)] transition-all disabled:opacity-50 whitespace-nowrap"
                          >
                            {updating === order._id ? '...' : '📦 Mark Shipped'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── PROFILE VIEW ──────────────────────────────────────────────────────────────
function ProfileView({ vendor }) {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-1 drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]">My Profile</h1>
        <p className="text-indigo-300/40">Your vendor account details.</p>
      </div>

      <GlassCard glow>
        <div className="p-6 space-y-4">
          {[
            { label: 'Business Name', value: vendor.businessName || '—' },
            { label: 'Contact Name',  value: vendor.name },
            { label: 'Email',         value: vendor.email },
            { label: 'Phone',         value: vendor.phone || '—' },
            { label: 'Website',       value: vendor.website || '—' },
            { label: 'Location',      value: [vendor.city, vendor.state, vendor.country].filter(Boolean).join(', ') || '—' },
          ].map(field => (
            <div key={field.label} className="flex justify-between items-center py-3 border-b border-indigo-500/10 last:border-0">
              <div className="text-indigo-300/40 text-sm">{field.label}</div>
              <div className="text-white text-sm font-medium">{field.value}</div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <div className="p-6">
          <div className="text-indigo-300/50 text-xs uppercase tracking-widest mb-4">Fulfillment Capabilities</div>
          <div className="flex flex-wrap gap-3">
            {(vendor.capabilities || []).map(cap => (
              <div key={cap} className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-sm text-indigo-300 flex items-center gap-2">
                <span>{CAPABILITY_LABELS[cap]?.emoji}</span>
                <span>{CAPABILITY_LABELS[cap]?.label}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-indigo-500/10">
            <div className="text-center p-4 bg-indigo-950/40 rounded-xl border border-indigo-500/10">
              <div className="text-indigo-300/40 text-xs uppercase tracking-widest mb-1">Turnaround</div>
              <div className="text-white font-bold text-2xl">{vendor.turnaroundDays || 7}</div>
              <div className="text-indigo-300/30 text-xs">days</div>
            </div>
            <div className="text-center p-4 bg-indigo-950/40 rounded-xl border border-indigo-500/10">
              <div className="text-indigo-300/40 text-xs uppercase tracking-widest mb-1">Min Order</div>
              <div className="text-white font-bold text-2xl">{vendor.minimumOrderQty || 1}</div>
              <div className="text-indigo-300/30 text-xs">unit{vendor.minimumOrderQty !== 1 ? 's' : ''}</div>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl text-center">
        <p className="text-indigo-300/40 text-sm">
          Need to update your info?{' '}
          <a href="mailto:hello@hna.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">
            Contact HNA
          </a>
        </p>
      </div>
    </div>
  );
}

// ── PORTAL SHELL ──────────────────────────────────────────────────────────────
function PortalShell({ vendor, onLogout }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('hna_vendor_token');
      const res = await fetch(`${API_URL}/api/vendors/portal/my-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setOrders(await res.json());
    } catch (err) {
      console.error('Failed to fetch vendor orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleUpdateOrder = async (orderId, payload) => {
    try {
      const token = localStorage.getItem('hna_vendor_token');
      const res = await fetch(`${API_URL}/api/vendors/portal/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders(prev => prev.map(o => o._id === orderId ? updated : o));
      }
    } catch (err) {
      console.error('Failed to update order:', err);
    }
  };

  const pendingCount = orders.filter(o => o.status === 'Sent to Supplier').length;

  const views = {
    dashboard: <DashboardView vendor={vendor} orders={orders} setActiveView={setActiveView} />,
    orders:    <OrdersView orders={orders} onUpdateOrder={handleUpdateOrder} />,
    profile:   <ProfileView vendor={vendor} />,
  };

  return (
    <div className="min-h-screen bg-[#05050f] flex">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/8 blur-[100px] rounded-full" />
      </div>
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        vendor={vendor}
        pendingCount={pendingCount}
        onLogout={onLogout}
      />
      <main className="flex-1 overflow-y-auto relative">
        {ordersLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-indigo-300/40 animate-pulse">Loading orders...</div>
          </div>
        ) : (
          views[activeView]
        )}
      </main>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function VendorPortal() {
  const [vendor, setVendor] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    const savedToken  = localStorage.getItem('hna_vendor_token');
    const savedVendor = localStorage.getItem('hna_vendor_data');
    if (savedToken && savedVendor) {
      try { setVendor(JSON.parse(savedVendor)); }
      catch {
        localStorage.removeItem('hna_vendor_token');
        localStorage.removeItem('hna_vendor_data');
      }
    }
    setBootstrapping(false);
  }, []);

  const handleLogin = (vendorData, token) => {
    setVendor(vendorData);
    localStorage.setItem('hna_vendor_token', token);
    localStorage.setItem('hna_vendor_data', JSON.stringify(vendorData));
  };

  const handleLogout = () => {
    setVendor(null);
    localStorage.removeItem('hna_vendor_token');
    localStorage.removeItem('hna_vendor_data');
  };

  if (bootstrapping) return null;
  if (!vendor) return <LoginView onLogin={handleLogin} />;

  return (
    <VendorAuthContext.Provider value={{ vendor }}>
      <PortalShell vendor={vendor} onLogout={handleLogout} />
    </VendorAuthContext.Provider>
  );
}
