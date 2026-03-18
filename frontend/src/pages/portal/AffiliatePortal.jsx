import { useState, useEffect, createContext, useContext } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const AffiliateAuthContext = createContext(null);
const useAffiliateAuth = () => useContext(AffiliateAuthContext);

const TIERS = {
  Trail:  { emoji: '🌿', color: 'text-green-400',  border: 'border-green-500/40',  bg: 'bg-green-500/10',  next: 'Ridge',  threshold: 20,  rate: 10 },
  Ridge:  { emoji: '🏔️', color: 'text-blue-400',   border: 'border-blue-500/40',   bg: 'bg-blue-500/10',   next: 'Peak',   threshold: 50,  rate: 12 },
  Peak:   { emoji: '⛰️', color: 'text-yellow-400', border: 'border-yellow-500/40', bg: 'bg-yellow-500/10', next: 'Summit', threshold: 100, rate: 15 },
  Summit: { emoji: '🏆', color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/10', next: null,     threshold: null, rate: 20 },
};

// ── LED Glow Card ─────────────────────────────────────────────────────────────
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
      const res = await fetch(`${API_URL}/api/affiliates/portal/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');
      onLogin(data.affiliate, data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05050f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.12)_0%,transparent_70%)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/8 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/8 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Card LED underglow */}
        <div className="absolute -bottom-4 left-8 right-8 h-8 bg-indigo-500/40 blur-2xl rounded-full" />
        <div className="relative bg-indigo-950/70 backdrop-blur-xl border border-indigo-500/40 rounded-2xl p-10 shadow-[0_0_60px_rgba(99,102,241,0.2)]">
          <div className="text-center mb-10">
            <div className="text-5xl mb-3 drop-shadow-[0_0_20px_rgba(99,102,241,0.8)]">⛰️</div>
            <h1 className="text-2xl font-bold text-white tracking-widest uppercase drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">HNA Affiliate</h1>
            <p className="text-indigo-300/40 text-sm mt-2 tracking-wider">Partner Portal</p>
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
                placeholder="you@example.com"
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
            Not an affiliate?{' '}
            <a href="mailto:hello@hna.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── SIDEBAR ───────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard',    icon: '◎' },
  { id: 'earnings',  label: 'Earnings',     icon: '💰' },
  { id: 'products',  label: 'My Sales',     icon: '📦' },
  { id: 'assets',    label: 'Brand Assets', icon: '🎨' },
];

function Sidebar({ activeView, setActiveView, affiliate, onLogout }) {
  const tier = TIERS[affiliate.tier] || TIERS.Trail;

  return (
    <aside className="w-64 min-h-screen bg-indigo-950/40 border-r border-indigo-500/20 flex flex-col flex-shrink-0">
      <div className="p-6 border-b border-indigo-500/20">
        <div className="text-xl font-bold text-white tracking-widest uppercase drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">HNA</div>
        <div className="text-indigo-300/30 text-xs tracking-wider mt-0.5">Affiliate Portal</div>
      </div>

      <div className="p-5 border-b border-indigo-500/20">
        <div className="text-white font-semibold truncate">{affiliate.name}</div>
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-sm px-2 py-0.5 rounded-lg border ${tier.bg} ${tier.color} ${tier.border}`}>
            {tier.emoji} {affiliate.tier}
          </span>
          <code className="text-xs text-indigo-400 font-mono">{affiliate.code}</code>
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
            {item.label}
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
function DashboardView({ affiliate }) {
  const tier = TIERS[affiliate.tier] || TIERS.Trail;
  const nextTier = tier.next ? TIERS[tier.next] : null;
  const sales = affiliate.totalSales || 0;
  const [copied, setCopied] = useState(false);

  const prevThreshold = affiliate.tier === 'Trail' ? 0 : affiliate.tier === 'Ridge' ? 20 : affiliate.tier === 'Peak' ? 50 : 100;
  const nextThreshold = tier.threshold;
  const progressPct = nextTier
    ? Math.min(100, ((sales - prevThreshold) / (nextThreshold - prevThreshold)) * 100)
    : 100;

  const referralLink = `${window.location.origin}?ref=${affiliate.code}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-1 drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]">
          Welcome back, {affiliate.name.split(' ')[0]} {tier.emoji}
        </h1>
        <p className="text-indigo-300/40">Here's how you're performing.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Sales"       value={affiliate.totalSales || 0}                             sub="All time" />
        <StatCard label="Revenue Generated" value={`$${(affiliate.totalRevenue || 0).toLocaleString()}`}  sub="Your referrals" />
        <StatCard label="Commission Earned" value={`$${(affiliate.totalCommission || 0).toFixed(2)}`}     sub={`${affiliate.commissionRate}% rate`} accent="text-indigo-400" />
        <StatCard label="Awaiting Payout"   value={`$${(affiliate.unpaidCommission || 0).toFixed(2)}`}    sub="Unpaid balance" accent="text-yellow-400" />
      </div>

      {/* Tier Progress */}
      <GlassCard glow>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-indigo-300/50 text-xs uppercase tracking-widest mb-1">Tier Progress</div>
              <div className={`text-xl font-bold ${tier.color}`}>
                {tier.emoji} {affiliate.tier}
                {nextTier && <span className="text-white/30 text-sm font-normal ml-2">→ {nextTier.emoji} {tier.next}</span>}
              </div>
            </div>
            {nextTier ? (
              <div className="text-right">
                <div className="text-indigo-300/40 text-sm">{nextThreshold - sales} more sales to {tier.next}</div>
                <div className="text-indigo-300/40 text-sm mt-0.5">Unlock {nextTier.rate}% commission</div>
              </div>
            ) : (
              <div className="text-purple-400 text-sm font-semibold drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">🏆 Max Tier Achieved!</div>
            )}
          </div>

          <div className="w-full bg-indigo-950/80 rounded-full h-3 overflow-hidden border border-indigo-500/20">
            <div
              className={`h-3 rounded-full transition-all duration-1000 shadow-[0_0_10px_currentColor] ${
                affiliate.tier === 'Summit' ? 'bg-purple-500' :
                affiliate.tier === 'Peak'   ? 'bg-yellow-500' :
                affiliate.tier === 'Ridge'  ? 'bg-blue-500'   : 'bg-green-500'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>

          <div className="flex justify-between mt-4">
            {Object.entries(TIERS).map(([name, t]) => (
              <div key={name} className={`flex flex-col items-center gap-1 text-xs ${affiliate.tier === name ? t.color : 'text-indigo-300/20'}`}>
                <span>{t.emoji}</span>
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      {/* Referral Link */}
      <GlassCard>
        <div className="p-6">
          <div className="text-indigo-300/50 text-xs uppercase tracking-widest mb-3">Your Referral Link</div>
          <div className="flex items-center gap-3">
            <div className="flex-1 px-4 py-3 bg-black/40 border border-indigo-500/20 rounded-xl font-mono text-sm text-indigo-300/60 truncate">
              {referralLink}
            </div>
            <button
              onClick={handleCopy}
              className="px-5 py-3 bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 rounded-xl text-sm font-semibold hover:bg-indigo-500/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all whitespace-nowrap"
            >
              {copied ? '✓ Copied!' : 'Copy Link'}
            </button>
          </div>
          <p className="text-indigo-300/30 text-xs mt-3">
            Every sale using code <code className="text-indigo-400">{affiliate.code}</code> earns you {affiliate.commissionRate}% commission.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}

// ── EARNINGS VIEW ─────────────────────────────────────────────────────────────
function EarningsView({ affiliate }) {
  const payments = affiliate.payments || [];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-1 drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]">Earnings</h1>
        <p className="text-indigo-300/40">Your commission history and payout status.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Total Earned"   value={`$${(affiliate.totalCommission || 0).toFixed(2)}`}  sub="All time" />
        <StatCard label="Total Paid"     value={`$${(affiliate.paidCommission  || 0).toFixed(2)}`}  sub="Received"        accent="text-green-400" />
        <StatCard label="Pending Payout" value={`$${(affiliate.unpaidCommission|| 0).toFixed(2)}`}  sub="Being processed" accent="text-yellow-400" />
      </div>

      <GlassCard>
        <div className="p-6">
          <div className="text-indigo-300/50 text-xs uppercase tracking-widest mb-4">Commission Structure</div>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(TIERS).map(([name, t]) => (
              <div
                key={name}
                className={`p-4 rounded-xl border ${t.bg} ${t.border} ${affiliate.tier === name ? 'ring-1 ring-indigo-400/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'opacity-50'}`}
              >
                <div className="text-lg mb-1">{t.emoji}</div>
                <div className={`font-bold text-sm ${t.color}`}>{name}</div>
                <div className="text-white/60 text-sm mt-1">{t.rate}%</div>
                {t.threshold && <div className="text-white/30 text-xs mt-0.5">{t.threshold}+ sales</div>}
                {affiliate.tier === name && <div className="text-xs text-indigo-300/50 mt-2 font-medium">← You are here</div>}
              </div>
            ))}
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="p-6 border-b border-indigo-500/20">
          <div className="text-indigo-300/50 text-xs uppercase tracking-widest">Payment History</div>
        </div>
        {payments.length === 0 ? (
          <div className="text-center py-12 text-indigo-300/30 text-sm">No payments recorded yet. Keep selling! 🚀</div>
        ) : (
          <table className="w-full">
            <thead className="bg-indigo-900/20">
              <tr>
                {['Date', 'Note', 'Amount', 'Status'].map((h, i) => (
                  <th key={h} className={`px-6 py-3 text-indigo-300/40 text-xs uppercase tracking-widest ${i >= 2 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map((p, i) => (
                <tr key={i} className="border-t border-indigo-500/10 hover:bg-indigo-500/5 transition-colors">
                  <td className="px-6 py-4 text-indigo-300/70 text-sm">{new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className="px-6 py-4 text-indigo-300/40 text-sm">{p.note || '—'}</td>
                  <td className="px-6 py-4 text-right text-white font-semibold">${p.amount.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded-lg">Paid</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </GlassCard>
    </div>
  );
}

// ── MY SALES VIEW ─────────────────────────────────────────────────────────────
function ProductsView({ affiliate }) {
  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('hna_affiliate_token');
    fetch(`${API_URL}/api/affiliates/portal/my-sales`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setSalesData(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="p-8 flex items-center justify-center h-64">
      <div className="text-indigo-300/40 animate-pulse">Loading your sales...</div>
    </div>
  );

  const products = salesData?.products || [];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-1 drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]">My Sales</h1>
        <p className="text-indigo-300/40">Products sold through your referral link.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Orders"  value={salesData?.totalOrders || 0}   sub="Via your code" />
        <StatCard label="Products Sold" value={products.length}                sub="Unique items" />
        <StatCard label="Your Rate"     value={`${affiliate.commissionRate}%`} sub="Commission" accent="text-indigo-400" />
      </div>

      {products.length === 0 ? (
        <GlassCard>
          <div className="p-12 text-center">
            <div className="text-4xl mb-4">📦</div>
            <div className="text-indigo-300/60 text-lg mb-2">No sales yet</div>
            <div className="text-indigo-300/30 text-sm">Share your referral link to start earning!</div>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-4">
          {products.map((product, i) => (
            <GlassCard key={i}>
              <div className="p-5 flex items-center gap-5">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-16 h-16 object-cover rounded-xl border border-indigo-500/20 flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 bg-indigo-950/60 rounded-xl border border-indigo-500/20 flex items-center justify-center text-2xl flex-shrink-0">👕</div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-white font-semibold truncate">{product.name}</div>
                  <div className="text-indigo-300/40 text-sm mt-0.5">{product.totalQuantity} units · {product.orders} orders</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-white font-bold text-lg">${product.totalRevenue.toFixed(2)}</div>
                  <div className="text-indigo-400 text-sm">+${(product.totalRevenue * affiliate.commissionRate / 100).toFixed(2)} earned</div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}

// ── BRAND ASSETS VIEW ─────────────────────────────────────────────────────────
const ASSETS = [
  {
    category: 'Logos',
    items: [
      { name: 'HNA Logo — White', format: 'PNG', size: '2.1 MB', file: '/assets/brand/hna-logo-white.png' },
      { name: 'HNA Logo — Black', format: 'PNG', size: '1.8 MB', file: '/assets/brand/hna-logo-black.png' },
      { name: 'HNA Wordmark',     format: 'SVG', size: '42 KB',  file: '/assets/brand/hna-wordmark.svg' },
    ],
  },
  {
    category: 'Italy Lucas',
    items: [
      { name: 'Signature Series Promo Shot', format: 'JPG', size: '5.4 MB', file: '/assets/brand/italy-promo-1.jpg' },
      { name: 'Lifestyle Shot — Court',      format: 'JPG', size: '6.1 MB', file: '/assets/brand/italy-court.jpg' },
    ],
  },
  {
    category: 'Social Media Templates',
    items: [
      { name: 'Instagram Story Template', format: 'PSD', size: '12 MB',  file: '/assets/brand/story-template.psd' },
      { name: 'Square Post Template',     format: 'PSD', size: '9.3 MB', file: '/assets/brand/post-template.psd' },
      { name: 'Affiliate Promo Copy',     format: 'TXT', size: '4 KB',   file: '/assets/brand/promo-copy.txt' },
    ],
  },
];

function AssetsView() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-1 drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]">Brand Assets</h1>
        <p className="text-indigo-300/40">Approved materials for promoting HNA.</p>
      </div>

      <div className="relative group">
        <div className="absolute -bottom-3 left-6 right-6 h-5 bg-yellow-500/20 blur-xl rounded-full" />
        <div className="relative p-5 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl">
          <div className="flex items-start gap-3">
            <span className="text-yellow-400 text-lg">⚠️</span>
            <div className="text-yellow-400/80 text-sm leading-relaxed">
              These assets are for affiliate promotion only. Do not alter logos or use imagery outside of approved HNA marketing contexts.
            </div>
          </div>
        </div>
      </div>

      {ASSETS.map(section => (
        <div key={section.category}>
          <div className="text-indigo-300/40 text-xs uppercase tracking-widest mb-4">{section.category}</div>
          <div className="space-y-3">
            {section.items.map((asset, i) => (
              <GlassCard key={i}>
                <div className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                    {asset.format}
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{asset.name}</div>
                    <div className="text-indigo-300/30 text-xs mt-0.5">{asset.size}</div>
                  </div>
                  <a
                    href={asset.file}
                    download
                    className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300/70 hover:text-indigo-300 text-xs rounded-lg hover:shadow-[0_0_12px_rgba(99,102,241,0.3)] transition-all"
                  >
                    ↓ Download
                  </a>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── PORTAL SHELL ──────────────────────────────────────────────────────────────
function PortalShell({ affiliate, onLogout }) {
  const [activeView, setActiveView] = useState('dashboard');

  const views = {
    dashboard: <DashboardView affiliate={affiliate} />,
    earnings:  <EarningsView  affiliate={affiliate} />,
    products:  <ProductsView  affiliate={affiliate} />,
    assets:    <AssetsView />,
  };

  return (
    <div className="min-h-screen bg-[#05050f] flex">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/8 blur-[100px] rounded-full" />
      </div>
      <Sidebar activeView={activeView} setActiveView={setActiveView} affiliate={affiliate} onLogout={onLogout} />
      <main className="flex-1 overflow-y-auto relative">
        {views[activeView]}
      </main>
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function AffiliatePortal() {
  const [affiliate, setAffiliate] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    const savedToken     = localStorage.getItem('hna_affiliate_token');
    const savedAffiliate = localStorage.getItem('hna_affiliate_data');
    if (savedToken && savedAffiliate) {
      try { setAffiliate(JSON.parse(savedAffiliate)); }
      catch {
        localStorage.removeItem('hna_affiliate_token');
        localStorage.removeItem('hna_affiliate_data');
      }
    }
    setBootstrapping(false);
  }, []);

  const handleLogin = (affiliateData, token) => {
    setAffiliate(affiliateData);
    localStorage.setItem('hna_affiliate_token', token);
    localStorage.setItem('hna_affiliate_data', JSON.stringify(affiliateData));
  };

  const handleLogout = () => {
    setAffiliate(null);
    localStorage.removeItem('hna_affiliate_token');
    localStorage.removeItem('hna_affiliate_data');
  };

  if (bootstrapping) return null;
  if (!affiliate) return <LoginView onLogin={handleLogin} />;

  return (
    <AffiliateAuthContext.Provider value={{ affiliate }}>
      <PortalShell affiliate={affiliate} onLogout={handleLogout} />
    </AffiliateAuthContext.Provider>
  );
}








// import { useState, useEffect, createContext, useContext } from 'react';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// // ─── Auth Context ─────────────────────────────────────────────────────────────
// const AffiliateAuthContext = createContext(null);
// const useAffiliateAuth = () => useContext(AffiliateAuthContext);

// // ─── Tier Config — matches Affiliates.jsx exactly ────────────────────────────
// const TIERS = {
//   Trail:  { emoji: '🌿', color: 'text-green-400',  border: 'border-green-500/40',  bg: 'bg-green-500/10',  next: 'Ridge',  threshold: 20,  rate: 10 },
//   Ridge:  { emoji: '🏔️', color: 'text-blue-400',   border: 'border-blue-500/40',   bg: 'bg-blue-500/10',   next: 'Peak',   threshold: 50,  rate: 12 },
//   Peak:   { emoji: '⛰️', color: 'text-yellow-400', border: 'border-yellow-500/40', bg: 'bg-yellow-500/10', next: 'Summit', threshold: 100, rate: 15 },
//   Summit: { emoji: '🏆', color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/10', next: null,     threshold: null, rate: 20 },
// };

// // ─── Shared UI ────────────────────────────────────────────────────────────────
// const GlassCard = ({ children, className = '', glow = false }) => (
//   <div className={`bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl ${glow ? 'shadow-[0_0_40px_rgba(99,102,241,0.15)]' : ''} ${className}`}>
//     {children}
//   </div>
// );

// const StatCard = ({ label, value, sub, accent = 'text-white' }) => (
//   <GlassCard className="p-6">
//     <div className="text-white/50 text-xs uppercase tracking-widest mb-2">{label}</div>
//     <div className={`text-3xl font-bold mb-1 ${accent}`}>{value}</div>
//     {sub && <div className="text-white/40 text-sm">{sub}</div>}
//   </GlassCard>
// );

// // ─── LOGIN ────────────────────────────────────────────────────────────────────
// function LoginView({ onLogin }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');
//     try {
//       const res = await fetch(`${API_URL}/api/affiliates/portal/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, password }),
//       });
//       const data = await res.json();
//       if (!res.ok) throw new Error(data.message || 'Login failed');
//       onLogin(data.affiliate, data.token);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
//       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08)_0%,transparent_70%)]" />
//       <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
//       <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />

//       <GlassCard className="w-full max-w-md p-10 relative z-10" glow>
//         <div className="text-center mb-10">
//           <div className="text-5xl mb-3">⛰️</div>
//           <h1 className="text-2xl font-bold text-white tracking-widest uppercase">HNA Affiliate</h1>
//           <p className="text-white/40 text-sm mt-2 tracking-wider">Partner Portal</p>
//         </div>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div>
//             <label className="block text-white/60 text-xs uppercase tracking-widest mb-2">Email</label>
//             <input
//               type="email"
//               required
//               value={email}
//               onChange={e => setEmail(e.target.value)}
//               className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:border-indigo-500/60 focus:outline-none transition-all"
//               placeholder="you@example.com"
//             />
//           </div>
//           <div>
//             <label className="block text-white/60 text-xs uppercase tracking-widest mb-2">Password</label>
//             <input
//               type="password"
//               required
//               value={password}
//               onChange={e => setPassword(e.target.value)}
//               className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:border-indigo-500/60 focus:outline-none transition-all"
//               placeholder="••••••••"
//             />
//           </div>

//           {error && (
//             <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
//               {error}
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold tracking-wide hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300 disabled:opacity-50"
//           >
//             {loading ? 'Signing in...' : 'Sign In'}
//           </button>
//         </form>

//         <p className="text-center text-white/30 text-xs mt-8">
//           Not an affiliate?{' '}
//           <a href="mailto:hello@hna.com" className="text-indigo-400 hover:text-indigo-300 transition-colors">
//             Contact us
//           </a>
//         </p>
//       </GlassCard>
//     </div>
//   );
// }

// // ─── SIDEBAR ──────────────────────────────────────────────────────────────────
// const NAV_ITEMS = [
//   { id: 'dashboard', label: 'Dashboard',    icon: '◎' },
//   { id: 'earnings',  label: 'Earnings',     icon: '💰' },
//   { id: 'products',  label: 'My Sales',     icon: '📦' },
//   { id: 'assets',    label: 'Brand Assets', icon: '🎨' },
// ];

// function Sidebar({ activeView, setActiveView, affiliate, onLogout }) {
//   const tier = TIERS[affiliate.tier] || TIERS.Trail;

//   return (
//     <aside className="w-64 min-h-screen bg-black border-r border-white/10 flex flex-col flex-shrink-0">
//       <div className="p-6 border-b border-white/10">
//         <div className="text-xl font-bold text-white tracking-widest uppercase">HNA</div>
//         <div className="text-white/30 text-xs tracking-wider mt-0.5">Affiliate Portal</div>
//       </div>

//       <div className="p-5 border-b border-white/10">
//         <div className="text-white font-semibold truncate">{affiliate.name}</div>
//         <div className="flex items-center gap-2 mt-2">
//           <span className={`text-sm px-2 py-0.5 rounded-lg border ${tier.bg} ${tier.color} ${tier.border}`}>
//             {tier.emoji} {affiliate.tier}
//           </span>
//           <code className="text-xs text-indigo-400 font-mono">{affiliate.code}</code>
//         </div>
//       </div>

//       <nav className="flex-1 p-4 space-y-1">
//         {NAV_ITEMS.map(item => (
//           <button
//             key={item.id}
//             onClick={() => setActiveView(item.id)}
//             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
//               activeView === item.id
//                 ? 'bg-indigo-500/20 text-white border border-indigo-500/30'
//                 : 'text-white/50 hover:text-white hover:bg-white/5'
//             }`}
//           >
//             <span className="text-base">{item.icon}</span>
//             {item.label}
//           </button>
//         ))}
//       </nav>

//       <div className="p-4 border-t border-white/10">
//         <button
//           onClick={onLogout}
//           className="w-full px-4 py-2.5 text-white/40 hover:text-white/70 text-sm rounded-xl hover:bg-white/5 transition-all text-left"
//         >
//           ← Sign Out
//         </button>
//       </div>
//     </aside>
//   );
// }

// // ─── DASHBOARD VIEW ───────────────────────────────────────────────────────────
// function DashboardView({ affiliate }) {
//   const tier = TIERS[affiliate.tier] || TIERS.Trail;
//   const nextTier = tier.next ? TIERS[tier.next] : null;
//   const sales = affiliate.totalSales || 0;
//   const [copied, setCopied] = useState(false);

//   const prevThreshold = affiliate.tier === 'Trail' ? 0 : affiliate.tier === 'Ridge' ? 20 : affiliate.tier === 'Peak' ? 50 : 100;
//   const nextThreshold = tier.threshold;
//   const progressPct = nextTier
//     ? Math.min(100, ((sales - prevThreshold) / (nextThreshold - prevThreshold)) * 100)
//     : 100;

//   const referralLink = `${window.location.origin}?ref=${affiliate.code}`;

//   const handleCopy = () => {
//     navigator.clipboard.writeText(referralLink);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   return (
//     <div className="p-8 space-y-8">
//       <div>
//         <h1 className="text-4xl font-bold text-white mb-1">
//           Welcome back, {affiliate.name.split(' ')[0]} {tier.emoji}
//         </h1>
//         <p className="text-white/40">Here's how you're performing.</p>
//       </div>

//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatCard label="Total Sales"       value={affiliate.totalSales || 0}                             sub="All time" />
//         <StatCard label="Revenue Generated" value={`$${(affiliate.totalRevenue || 0).toLocaleString()}`}  sub="Your referrals" />
//         <StatCard label="Commission Earned" value={`$${(affiliate.totalCommission || 0).toFixed(2)}`}     sub={`${affiliate.commissionRate}% rate`} accent="text-indigo-400" />
//         <StatCard label="Awaiting Payout"   value={`$${(affiliate.unpaidCommission || 0).toFixed(2)}`}    sub="Unpaid balance" accent="text-yellow-400" />
//       </div>

//       {/* Tier Progress */}
//       <GlassCard className="p-6" glow>
//         <div className="flex items-center justify-between mb-4">
//           <div>
//             <div className="text-white/50 text-xs uppercase tracking-widest mb-1">Tier Progress</div>
//             <div className={`text-xl font-bold ${tier.color}`}>
//               {tier.emoji} {affiliate.tier}
//               {nextTier && (
//                 <span className="text-white/30 text-sm font-normal ml-2">
//                   → {nextTier.emoji} {tier.next}
//                 </span>
//               )}
//             </div>
//           </div>
//           {nextTier ? (
//             <div className="text-right">
//               <div className="text-white/40 text-sm">{nextThreshold - sales} more sales to {tier.next}</div>
//               <div className="text-white/40 text-sm mt-0.5">Unlock {nextTier.rate}% commission</div>
//             </div>
//           ) : (
//             <div className="text-purple-400 text-sm font-semibold">🏆 Max Tier Achieved!</div>
//           )}
//         </div>

//         <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
//           <div
//             className={`h-3 rounded-full transition-all duration-1000 ${
//               affiliate.tier === 'Summit' ? 'bg-purple-500' :
//               affiliate.tier === 'Peak'   ? 'bg-yellow-500' :
//               affiliate.tier === 'Ridge'  ? 'bg-blue-500'   : 'bg-green-500'
//             }`}
//             style={{ width: `${progressPct}%` }}
//           />
//         </div>

//         <div className="flex justify-between mt-4">
//           {Object.entries(TIERS).map(([name, t]) => (
//             <div key={name} className={`flex flex-col items-center gap-1 text-xs ${affiliate.tier === name ? t.color : 'text-white/20'}`}>
//               <span>{t.emoji}</span>
//               <span>{name}</span>
//             </div>
//           ))}
//         </div>
//       </GlassCard>

//       {/* Referral Link */}
//       <GlassCard className="p-6">
//         <div className="text-white/50 text-xs uppercase tracking-widest mb-3">Your Referral Link</div>
//         <div className="flex items-center gap-3">
//           <div className="flex-1 px-4 py-3 bg-black/40 border border-white/10 rounded-xl font-mono text-sm text-white/70 truncate">
//             {referralLink}
//           </div>
//           <button
//             onClick={handleCopy}
//             className="px-5 py-3 bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 rounded-xl text-sm font-semibold hover:bg-indigo-500/30 transition-all whitespace-nowrap"
//           >
//             {copied ? '✓ Copied!' : 'Copy Link'}
//           </button>
//         </div>
//         <p className="text-white/30 text-xs mt-3">
//           Every sale using code <code className="text-indigo-400">{affiliate.code}</code> earns you {affiliate.commissionRate}% commission.
//         </p>
//       </GlassCard>
//     </div>
//   );
// }

// // ─── EARNINGS VIEW ────────────────────────────────────────────────────────────
// function EarningsView({ affiliate }) {
//   const payments = affiliate.payments || [];

//   return (
//     <div className="p-8 space-y-8">
//       <div>
//         <h1 className="text-4xl font-bold text-white mb-1">Earnings</h1>
//         <p className="text-white/40">Your commission history and payout status.</p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//         <StatCard label="Total Earned"   value={`$${(affiliate.totalCommission || 0).toFixed(2)}`}  sub="All time" />
//         <StatCard label="Total Paid"     value={`$${(affiliate.paidCommission  || 0).toFixed(2)}`}  sub="Received"        accent="text-green-400" />
//         <StatCard label="Pending Payout" value={`$${(affiliate.unpaidCommission|| 0).toFixed(2)}`}  sub="Being processed" accent="text-yellow-400" />
//       </div>

//       <GlassCard className="p-6">
//         <div className="text-white/50 text-xs uppercase tracking-widest mb-4">Commission Structure</div>
//         <div className="grid grid-cols-4 gap-3">
//           {Object.entries(TIERS).map(([name, t]) => (
//             <div
//               key={name}
//               className={`p-4 rounded-xl border ${t.bg} ${t.border} ${affiliate.tier === name ? 'ring-1 ring-white/20' : 'opacity-50'}`}
//             >
//               <div className="text-lg mb-1">{t.emoji}</div>
//               <div className={`font-bold text-sm ${t.color}`}>{name}</div>
//               <div className="text-white/60 text-sm mt-1">{t.rate}%</div>
//               {t.threshold && <div className="text-white/30 text-xs mt-0.5">{t.threshold}+ sales</div>}
//               {affiliate.tier === name && <div className="text-xs text-white/50 mt-2 font-medium">← You are here</div>}
//             </div>
//           ))}
//         </div>
//       </GlassCard>

//       <GlassCard className="overflow-hidden">
//         <div className="p-6 border-b border-white/10">
//           <div className="text-white/50 text-xs uppercase tracking-widest">Payment History</div>
//         </div>
//         {payments.length === 0 ? (
//           <div className="text-center py-12 text-white/30 text-sm">
//             No payments recorded yet. Keep selling! 🚀
//           </div>
//         ) : (
//           <table className="w-full">
//             <thead className="bg-white/5">
//               <tr>
//                 <th className="text-left px-6 py-3 text-white/40 text-xs uppercase tracking-widest">Date</th>
//                 <th className="text-left px-6 py-3 text-white/40 text-xs uppercase tracking-widest">Note</th>
//                 <th className="text-right px-6 py-3 text-white/40 text-xs uppercase tracking-widest">Amount</th>
//                 <th className="text-right px-6 py-3 text-white/40 text-xs uppercase tracking-widest">Status</th>
//               </tr>
//             </thead>
//             <tbody>
//               {payments.map((p, i) => (
//                 <tr key={i} className="border-t border-white/5 hover:bg-white/5 transition-colors">
//                   <td className="px-6 py-4 text-white/70 text-sm">
//                     {new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
//                   </td>
//                   <td className="px-6 py-4 text-white/40 text-sm">{p.note || '—'}</td>
//                   <td className="px-6 py-4 text-right text-white font-semibold">${p.amount.toFixed(2)}</td>
//                   <td className="px-6 py-4 text-right">
//                     <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-400 text-xs rounded-lg">
//                       Paid
//                     </span>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         )}
//       </GlassCard>
//     </div>
//   );
// }

// // ─── MY SALES VIEW ────────────────────────────────────────────────────────────
// function ProductsView({ affiliate }) {
//   const [salesData, setSalesData] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem('hna_affiliate_token');
//     fetch(`${API_URL}/api/affiliates/portal/my-sales`, {
//       headers: { Authorization: `Bearer ${token}` },
//     })
//       .then(r => r.json())
//       .then(data => { setSalesData(data); setLoading(false); })
//       .catch(() => setLoading(false));
//   }, []);

//   if (loading) {
//     return (
//       <div className="p-8 flex items-center justify-center h-64">
//         <div className="text-white/40">Loading your sales...</div>
//       </div>
//     );
//   }

//   const products = salesData?.products || [];

//   return (
//     <div className="p-8 space-y-8">
//       <div>
//         <h1 className="text-4xl font-bold text-white mb-1">My Sales</h1>
//         <p className="text-white/40">Products sold through your referral link.</p>
//       </div>

//       <div className="grid grid-cols-3 gap-4">
//         <StatCard label="Total Orders"  value={salesData?.totalOrders || 0}   sub="Via your code" />
//         <StatCard label="Products Sold" value={products.length}                sub="Unique items" />
//         <StatCard label="Your Rate"     value={`${affiliate.commissionRate}%`} sub="Commission" accent="text-indigo-400" />
//       </div>

//       {products.length === 0 ? (
//         <GlassCard className="p-12 text-center">
//           <div className="text-4xl mb-4">📦</div>
//           <div className="text-white/60 text-lg mb-2">No sales yet</div>
//           <div className="text-white/30 text-sm">Share your referral link to start earning!</div>
//         </GlassCard>
//       ) : (
//         <div className="space-y-4">
//           {products.map((product, i) => (
//             <GlassCard key={i} className="p-5 flex items-center gap-5 hover:border-white/20 transition-all">
//               {product.image ? (
//                 <img
//                   src={product.image}
//                   alt={product.name}
//                   className="w-16 h-16 object-cover rounded-xl border border-white/10 flex-shrink-0"
//                 />
//               ) : (
//                 <div className="w-16 h-16 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-2xl flex-shrink-0">
//                   👕
//                 </div>
//               )}
//               <div className="flex-1 min-w-0">
//                 <div className="text-white font-semibold truncate">{product.name}</div>
//                 <div className="text-white/40 text-sm mt-0.5">
//                   {product.totalQuantity} units · {product.orders} orders
//                 </div>
//               </div>
//               <div className="text-right flex-shrink-0">
//                 <div className="text-white font-bold text-lg">${product.totalRevenue.toFixed(2)}</div>
//                 <div className="text-indigo-400 text-sm">
//                   +${(product.totalRevenue * affiliate.commissionRate / 100).toFixed(2)} earned
//                 </div>
//               </div>
//             </GlassCard>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// // ─── BRAND ASSETS VIEW ────────────────────────────────────────────────────────
// const ASSETS = [
//   {
//     category: 'Logos',
//     items: [
//       { name: 'HNA Logo — White', format: 'PNG', size: '2.1 MB', file: '/assets/brand/hna-logo-white.png' },
//       { name: 'HNA Logo — Black', format: 'PNG', size: '1.8 MB', file: '/assets/brand/hna-logo-black.png' },
//       { name: 'HNA Wordmark',     format: 'SVG', size: '42 KB',  file: '/assets/brand/hna-wordmark.svg' },
//     ],
//   },
//   {
//     category: 'Italy Lucas',
//     items: [
//       { name: 'Signature Series Promo Shot', format: 'JPG', size: '5.4 MB', file: '/assets/brand/italy-promo-1.jpg' },
//       { name: 'Lifestyle Shot — Court',      format: 'JPG', size: '6.1 MB', file: '/assets/brand/italy-court.jpg' },
//     ],
//   },
//   {
//     category: 'Social Media Templates',
//     items: [
//       { name: 'Instagram Story Template', format: 'PSD', size: '12 MB',  file: '/assets/brand/story-template.psd' },
//       { name: 'Square Post Template',     format: 'PSD', size: '9.3 MB', file: '/assets/brand/post-template.psd' },
//       { name: 'Affiliate Promo Copy',     format: 'TXT', size: '4 KB',   file: '/assets/brand/promo-copy.txt' },
//     ],
//   },
// ];

// function AssetsView() {
//   return (
//     <div className="p-8 space-y-8">
//       <div>
//         <h1 className="text-4xl font-bold text-white mb-1">Brand Assets</h1>
//         <p className="text-white/40">Approved materials for promoting HNA.</p>
//       </div>

//       <GlassCard className="p-5 border-yellow-500/20 bg-yellow-500/5">
//         <div className="flex items-start gap-3">
//           <span className="text-yellow-400 text-lg">⚠️</span>
//           <div className="text-yellow-400/80 text-sm leading-relaxed">
//             These assets are for affiliate promotion only. Do not alter logos or use imagery outside of approved HNA marketing contexts.
//           </div>
//         </div>
//       </GlassCard>

//       {ASSETS.map(section => (
//         <div key={section.category}>
//           <div className="text-white/40 text-xs uppercase tracking-widest mb-4">{section.category}</div>
//           <div className="space-y-3">
//             {section.items.map((asset, i) => (
//               <GlassCard key={i} className="p-4 flex items-center gap-4 hover:border-white/20 transition-all">
//                 <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400 flex-shrink-0">
//                   {asset.format}
//                 </div>
//                 <div className="flex-1">
//                   <div className="text-white text-sm font-medium">{asset.name}</div>
//                   <div className="text-white/30 text-xs mt-0.5">{asset.size}</div>
//                 </div>
//                 <a
//                   href={asset.file}
//                   download
//                   className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs rounded-lg transition-all"
//                 >
//                   ↓ Download
//                 </a>
//               </GlassCard>
//             ))}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// // ─── PORTAL SHELL ─────────────────────────────────────────────────────────────
// function PortalShell({ affiliate, onLogout }) {
//   const [activeView, setActiveView] = useState('dashboard');

//   const views = {
//     dashboard: <DashboardView affiliate={affiliate} />,
//     earnings:  <EarningsView  affiliate={affiliate} />,
//     products:  <ProductsView  affiliate={affiliate} />,
//     assets:    <AssetsView />,
//   };

//   return (
//     <div className="min-h-screen bg-black flex">
//       <Sidebar
//         activeView={activeView}
//         setActiveView={setActiveView}
//         affiliate={affiliate}
//         onLogout={onLogout}
//       />
//       <main className="flex-1 overflow-y-auto">
//         {views[activeView]}
//       </main>
//     </div>
//   );
// }

// // ─── ROOT ─────────────────────────────────────────────────────────────────────
// export default function AffiliatePortal() {
//   const [affiliate, setAffiliate] = useState(null);
//   const [bootstrapping, setBootstrapping] = useState(true);

//   useEffect(() => {
//     const savedToken     = localStorage.getItem('hna_affiliate_token');
//     const savedAffiliate = localStorage.getItem('hna_affiliate_data');
//     if (savedToken && savedAffiliate) {
//       try {
//         setAffiliate(JSON.parse(savedAffiliate));
//       } catch {
//         localStorage.removeItem('hna_affiliate_token');
//         localStorage.removeItem('hna_affiliate_data');
//       }
//     }
//     setBootstrapping(false);
//   }, []);

//   const handleLogin = (affiliateData, token) => {
//     setAffiliate(affiliateData);
//     localStorage.setItem('hna_affiliate_token', token);
//     localStorage.setItem('hna_affiliate_data', JSON.stringify(affiliateData));
//   };

//   const handleLogout = () => {
//     setAffiliate(null);
//     localStorage.removeItem('hna_affiliate_token');
//     localStorage.removeItem('hna_affiliate_data');
//   };

//   if (bootstrapping) return null;
//   if (!affiliate) return <LoginView onLogin={handleLogin} />;

//   return (
//     <AffiliateAuthContext.Provider value={{ affiliate }}>
//       <PortalShell affiliate={affiliate} onLogout={handleLogout} />
//     </AffiliateAuthContext.Provider>
//   );
// }
