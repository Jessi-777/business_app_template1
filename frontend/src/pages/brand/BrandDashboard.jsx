import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const TABS = ['Overview', 'Orders', 'Products', 'Settings'];

export default function BrandDashboard() {
  const [tab, setTab]             = useState('Overview');
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [token, setToken]         = useState(() => localStorage.getItem('hna_brand_token') || '');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('hna_brand_token');
    setToken('');
    setData(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res  = await fetch(`${API_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Login failed');
      if (json.user?.role !== 'brand_owner' && !json.user?.isAdmin) {
        throw new Error('This account does not have brand access');
      }
      localStorage.setItem('hna_brand_token', json.token);
      setToken(json.token);
    } catch (err) {
      setLoginError(err.message);
    }
  };

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/brands/dashboard/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status === 401) { handleLogout(); return; }
        if (!res.ok) throw new Error('Failed to load dashboard');
        setData(await res.json());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  // ── Login screen ──────────────────────────────────────────────────
  if (!token) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-block bg-indigo-500/10 border border-indigo-500/30 rounded-lg px-3 py-1 text-xs font-mono text-indigo-400 tracking-widest mb-4">BRAND PORTAL</div>
            <h1 className="text-2xl font-bold text-white">Brand Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Powered by HNA Vault</p>
          </div>
          <form onSubmit={handleLogin} className="bg-[#12121a] border border-white/10 rounded-xl p-6 space-y-4">
            {loginError && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-3 py-2 rounded-lg">{loginError}</div>}
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">Email</label>
              <input type="email" value={loginForm.email} onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" required />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium block mb-1">Password</label>
              <input type="password" value={loginForm.password} onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500" required />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">Sign In</button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center"><div className="text-indigo-400 animate-pulse">Loading your dashboard...</div></div>;
  if (error)   return <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-center px-4"><div><p className="text-red-400 mb-4">{error}</p><button onClick={handleLogout} className="text-indigo-400 underline text-sm">Sign out</button></div></div>;

  const { brand, recentOrders, products, stats } = data;
  const primary = brand?.primaryColor || '#6366f1';

  const statusBadge = (status) => {
    const map = { Delivered: 'bg-green-500/20 text-green-400', Shipped: 'bg-blue-500/20 text-blue-400', Cancelled: 'bg-red-500/20 text-red-400' };
    return map[status] || 'bg-indigo-500/20 text-indigo-400';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">

      {/* HEADER */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {brand.logo && <img src={brand.logo} alt={brand.name} className="w-8 h-8 rounded-full object-cover" />}
          <div>
            <h1 className="font-bold text-white text-sm">{brand.name}</h1>
            <p className="text-xs text-gray-500">Brand Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a href={`/store/${brand.slug}`} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-lg transition-colors">View Store →</a>
          <button onClick={handleLogout} className="text-xs text-gray-500 hover:text-white transition-colors">Sign out</button>
        </div>
      </div>

      {/* TABS */}
      <div className="border-b border-white/10 px-6 flex gap-1">
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className="px-4 py-3 text-sm font-medium transition-colors"
            style={{ color: tab === t ? '#fff' : '#64748b', borderBottom: tab === t ? `2px solid ${primary}` : '2px solid transparent' }}>
            {t}
          </button>
        ))}
      </div>

      <div className="px-6 py-8 max-w-6xl mx-auto">

        {/* OVERVIEW */}
        {tab === 'Overview' && (
          <div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Orders',  value: stats.totalOrders },
                { label: 'Total Revenue', value: `$${stats.totalRevenue.toFixed(2)}` },
                { label: 'Paid Out',      value: `$${stats.totalPaid.toFixed(2)}` },
                { label: 'Products',      value: stats.productCount },
              ].map(s => (
                <div key={s.label} className="bg-[#12121a] border border-white/10 rounded-xl p-4">
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider">{s.label}</p>
                  <p className="text-2xl font-bold text-white">{s.value}</p>
                </div>
              ))}
            </div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Recent Orders</h2>
            {recentOrders.length === 0 ? <p className="text-gray-500 text-sm">No orders yet.</p> : (
              <div className="bg-[#12121a] border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-white/10 text-gray-500 text-xs uppercase">
                    <th className="text-left px-4 py-3">Order</th>
                    <th className="text-left px-4 py-3">Customer</th>
                    <th className="text-left px-4 py-3">Total</th>
                    <th className="text-left px-4 py-3">Status</th>
                  </tr></thead>
                  <tbody>
                    {recentOrders.map(o => (
                      <tr key={o._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-indigo-400">{o.orderNumber}</td>
                        <td className="px-4 py-3 text-gray-300">{o.customer?.name}</td>
                        <td className="px-4 py-3 text-white">${o.totalPrice?.toFixed(2)}</td>
                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(o.status)}`}>{o.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ORDERS */}
        {tab === 'Orders' && (
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">All Orders</h2>
            {recentOrders.length === 0 ? <p className="text-gray-500 text-sm">No orders yet.</p> : (
              <div className="bg-[#12121a] border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-white/10 text-gray-500 text-xs uppercase">
                    <th className="text-left px-4 py-3">Order #</th>
                    <th className="text-left px-4 py-3">Customer</th>
                    <th className="text-left px-4 py-3">Items</th>
                    <th className="text-left px-4 py-3">Total</th>
                    <th className="text-left px-4 py-3">Status</th>
                    <th className="text-left px-4 py-3">Date</th>
                  </tr></thead>
                  <tbody>
                    {recentOrders.map(o => (
                      <tr key={o._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-indigo-400">{o.orderNumber}</td>
                        <td className="px-4 py-3 text-gray-300">{o.customer?.name}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{o.items?.length} item{o.items?.length !== 1 ? 's' : ''}</td>
                        <td className="px-4 py-3 text-white">${o.totalPrice?.toFixed(2)}</td>
                        <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge(o.status)}`}>{o.status}</span></td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PRODUCTS */}
        {tab === 'Products' && (
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Your Products</h2>
            {products.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p className="text-lg mb-2">No products yet</p>
                <p className="text-sm">Contact HNA to add products to your storefront.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map(p => (
                  <div key={p._id} className="bg-[#12121a] border border-white/10 rounded-xl overflow-hidden">
                    <div className="aspect-square bg-white/5">
                      <img src={p.image || '/assets/placeholder.png'} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-white line-clamp-1">{p.name}</p>
                      <p className="text-sm font-bold mt-1" style={{ color: primary }}>${p.price.toFixed(2)}</p>
                      <p className="text-xs text-gray-500 mt-1">{p.countInStock} in stock</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SETTINGS */}
        {tab === 'Settings' && (
          <div className="max-w-lg">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Brand Settings</h2>
            <div className="bg-[#12121a] border border-white/10 rounded-xl p-6 space-y-4">
              {[
                { label: 'Brand Name',     value: brand.name },
                { label: 'Slug',           value: brand.slug },
                { label: 'Plan',           value: brand.plan },
                { label: 'Status',         value: brand.status },
                { label: 'Custom Domain',  value: brand.domain || 'Not set (upgrade to Pro)' },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">{row.label}</span>
                  <span className="text-sm text-white font-medium">{row.value}</span>
                </div>
              ))}
              <p className="text-xs text-gray-600 pt-2">To update your brand profile, logo, or bio — contact HNA support or your account manager.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
