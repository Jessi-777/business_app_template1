import { useEffect, useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const STATUS_STYLES = {
  active:    { bg: 'rgba(16,185,129,0.12)',  color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' },
  pending:   { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' },
  suspended: { bg: 'rgba(244,63,94,0.12)',   color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)'  },
  inactive:  { bg: 'rgba(100,116,139,0.12)', color: '#64748b', border: '1px solid rgba(100,116,139,0.3)' },
};

const PLAN_STYLES = {
  starter: { bg: 'rgba(255,255,255,0.06)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' },
  pro:     { bg: 'rgba(99,102,241,0.15)',  color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)'   },
  elite:   { bg: 'rgba(168,85,247,0.15)',  color: '#c084fc', border: '1px solid rgba(168,85,247,0.3)'   },
};

const ONBOARDING_STEPS = [
  { label: 'Brand Created',    icon: '🏷️' },
  { label: 'Logo Uploaded',    icon: '🖼️' },
  { label: 'Products Added',   icon: '👕' },
  { label: 'Domain Set',       icon: '🌐' },
  { label: 'Stripe Connected', icon: '💳' },
];

function getOnboardingProgress(brand) {
  return [
    true,
    !!brand.logo,
    true,
    !!brand.domain,
    !!brand.stripeAccountId,
  ];
}

const emptyForm = {
  name: '', slug: '', domain: '', plan: 'starter',
  status: 'pending', vendorType: 'inhouse',
  platformCommissionRate: 15,
  bio: '', tagline: '', primaryColor: '#6366f1',
};

const inp = {
  width: '100%',
  background: 'rgba(99,102,241,0.06)',
  border: '1px solid rgba(99,102,241,0.2)',
  borderRadius: '8px',
  padding: '10px 13px',
  color: '#e2e8f0',
  fontSize: '13px',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s',
};

function Field({ label, children }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '10px', color: '#6366f1', marginBottom: '6px', letterSpacing: '0.12em', fontWeight: 700 }}>
        {label.toUpperCase()}
      </label>
      {children}
    </div>
  );
}

export default function Brands() {
  const [brands, setBrands]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilter]     = useState('active');
  const [showModal, setShowModal]     = useState(false);
  const [editing, setEditing]         = useState(null);
  const [form, setForm]               = useState(emptyForm);
  const [saving, setSaving]           = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [expandedId, setExpandedId]   = useState(null);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API}/api/brands`);
      setBrands(data);
    } catch {
      setError('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBrands(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (b) => {
    setEditing(b);
    setForm({
      name: b.name || '', slug: b.slug || '', domain: b.domain || '',
      plan: b.plan || 'starter', status: b.status || 'pending',
      vendorType: b.vendorType || 'inhouse',
      platformCommissionRate: b.platformCommissionRate ?? 15,
      bio: b.bio || '', tagline: b.tagline || '',
      primaryColor: b.primaryColor || '#6366f1',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.slug) return;
    setSaving(true);
    try {
      editing
        ? await axios.put(`${API}/api/brands/${editing._id}`, form)
        : await axios.post(`${API}/api/brands`, form);
      setShowModal(false);
      fetchBrands();
    } catch (err) {
      alert(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusToggle = async (b) => {
    try {
      await axios.put(`${API}/api/brands/${b._id}/${b.status === 'suspended' ? 'activate' : 'suspend'}`);
      fetchBrands();
    } catch { alert('Status update failed'); }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/api/brands/${id}`);
      setConfirmDelete(null);
      fetchBrands();
    } catch { alert('Delete failed'); }
  };

  const filtered = brands.filter(b => {
    const ms = !search || b.name?.toLowerCase().includes(search.toLowerCase()) || b.slug?.toLowerCase().includes(search.toLowerCase());
    const mf = filterStatus === 'all' || b.status === filterStatus;
    return ms && mf;
  });

  const activeCount    = brands.filter(b => b.status === 'active').length;
  const totalRevenue   = brands.reduce((s, b) => s + (b.totalRevenue || 0), 0);
  const totalOrders    = brands.reduce((s, b) => s + (b.totalOrders || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #06060f 0%, #0a0a1a 50%, #06060f 100%)', color: '#e2e8f0', padding: '36px 32px', position: 'relative', overflow: 'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; }

        /* Ambient glow background */
        .brands-page::before {
          content: '';
          position: fixed;
          top: -200px; left: -200px;
          width: 600px; height: 600px;
          background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .brands-page::after {
          content: '';
          position: fixed;
          bottom: -200px; right: -200px;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(168,85,247,0.06) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }

        /* Brand row glow card effect */
        .brand-row {
          position: relative;
          transition: background 0.2s;
        }
        .brand-row::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.15), transparent);
        }
        .brand-row:hover {
          background: rgba(99,102,241,0.04) !important;
        }

        /* Card glow underlight */
        .glow-card {
          position: relative;
        }
        .glow-card::before {
          content: '';
          position: absolute;
          bottom: -1px; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(99,102,241,0.5), rgba(168,85,247,0.5), transparent);
          filter: blur(1px);
        }

        /* Stat card glow */
        .stat-card {
          position: relative;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(99,102,241,0.15);
        }
        .stat-card::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 60px;
          background: linear-gradient(to top, rgba(99,102,241,0.06), transparent);
          pointer-events: none;
        }

        /* Expand row */
        .expand-panel {
          animation: expandIn 0.2s ease;
        }
        @keyframes expandIn {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Button hover */
        .btn-ghost { transition: all 0.15s; }
        .btn-ghost:hover { background: rgba(99,102,241,0.12) !important; color: #a5b4fc !important; }

        /* Input focus */
        .modal-input:focus { border-color: rgba(99,102,241,0.5) !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }

        /* Progress bar shimmer */
        .progress-fill {
          position: relative;
          overflow: hidden;
        }
        .progress-fill::after {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          animation: shimmer 2s infinite;
        }
        @keyframes shimmer {
          to { left: 100%; }
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.4); border-radius: 2px; }
      `}</style>

      <div className="brands-page" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── HEADER ──────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#6366f1', letterSpacing: '0.2em', fontWeight: 500, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 8px #6366f1' }} />
              HNA VAULT PLATFORM
            </div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '38px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Brand Partners
            </h1>
            <p style={{ color: '#475569', fontSize: '13px', marginTop: '6px', fontFamily: "'DM Mono', monospace" }}>
              {brands.length} total &nbsp;·&nbsp; {activeCount} active &nbsp;·&nbsp; ${totalRevenue.toLocaleString()} revenue
            </p>
          </div>
          <button
            onClick={openCreate}
            style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)', color: '#fff', border: 'none', borderRadius: '10px', padding: '13px 26px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.02em', boxShadow: '0 0 30px rgba(99,102,241,0.35), 0 4px 12px rgba(0,0,0,0.3)', fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', alignItems: 'center', gap: '8px', transition: 'transform 0.15s, box-shadow 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(99,102,241,0.45), 0 8px 20px rgba(0,0,0,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(99,102,241,0.35), 0 4px 12px rgba(0,0,0,0.3)'; }}
          >
            <span style={{ fontSize: '16px' }}>+</span> New Brand
          </button>
        </div>

        {/* ── STAT CARDS ──────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '28px' }}>
          {[
            { label: 'TOTAL BRANDS',    value: brands.length,                         color: '#6366f1', glow: 'rgba(99,102,241,0.2)' },
            { label: 'ACTIVE',          value: activeCount,                            color: '#10b981', glow: 'rgba(16,185,129,0.2)' },
            { label: 'TOTAL ORDERS',    value: totalOrders,                            color: '#f59e0b', glow: 'rgba(245,158,11,0.2)' },
            { label: 'PLATFORM REVENUE',value: `$${totalRevenue.toLocaleString()}`,    color: '#c084fc', glow: 'rgba(192,132,252,0.2)' },
          ].map(s => (
            <div key={s.label} className="stat-card glow-card"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '18px 16px', borderTop: `1px solid ${s.color}33` }}>
              <div style={{ fontSize: '26px', fontWeight: 800, color: '#fff', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', color: s.color, letterSpacing: '0.12em', marginTop: '5px', fontWeight: 500 }}>{s.label}</div>
              {/* Underlight glow */}
              <div style={{ position: 'absolute', bottom: '-8px', left: '20%', right: '20%', height: '16px', background: s.glow, filter: 'blur(8px)', borderRadius: '50%' }} />
            </div>
          ))}
        </div>

        {/* ── FILTERS ─────────────────────────────────────────────────── */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: '13px' }}>🔍</span>
            <input
              type="text"
              placeholder="Search brands..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9px', padding: '11px 14px 11px 36px', color: '#e2e8f0', fontSize: '13px', outline: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilter(e.target.value)}
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '9px', padding: '11px 14px', color: '#94a3b8', fontSize: '13px', outline: 'none', fontFamily: "'DM Mono', monospace", cursor: 'pointer' }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>

        {/* ── TABLE ───────────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#334155' }}>
            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', letterSpacing: '0.15em' }}>LOADING BRANDS...</div>
          </div>
        ) : error ? (
          <div style={{ color: '#f43f5e', textAlign: 'center', padding: '40px' }}>{error}</div>
        ) : (
          <div className="glow-card" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>

            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏷️</div>
                <p style={{ color: '#475569', fontSize: '15px', fontWeight: 600 }}>No brands found</p>
                <p style={{ color: '#334155', fontSize: '13px', marginTop: '4px' }}>Create your first brand partner above</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(99,102,241,0.15)' }}>
                    {['Brand', 'Slug / Domain', 'Plan', 'Commission', 'Onboarding', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '13px 18px', color: '#6366f1', fontFamily: "'DM Mono', monospace", fontSize: '9px', letterSpacing: '0.14em', fontWeight: 600, background: 'rgba(99,102,241,0.04)' }}>
                        {h.toUpperCase()}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((brand, i) => {
                    const progress    = getOnboardingProgress(brand);
                    const doneCount   = progress.filter(Boolean).length;
                    const pct         = Math.round((doneCount / ONBOARDING_STEPS.length) * 100);
                    const statusStyle = STATUS_STYLES[brand.status] || STATUS_STYLES.inactive;
                    const planStyle   = PLAN_STYLES[brand.plan]   || PLAN_STYLES.starter;
                    const primary     = brand.primaryColor || '#6366f1';
                    const isExpanded  = expandedId === brand._id;

                    return (
                      <>
                        <tr
                          key={brand._id}
                          className="brand-row"
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
                          onClick={() => setExpandedId(isExpanded ? null : brand._id)}
                        >
                          {/* Brand */}
                          <td style={{ padding: '16px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ width: '36px', height: '36px', borderRadius: '9px', background: `linear-gradient(135deg, ${primary}33, ${primary}11)`, border: `1px solid ${primary}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: 800, color: primary, fontFamily: "'Plus Jakarta Sans', sans-serif", flexShrink: 0, boxShadow: `0 0 12px ${primary}22` }}>
                                {brand.logo ? <img src={brand.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} /> : brand.name?.[0]?.toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '14px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{brand.name}</div>
                                {brand.owner?.name && <div style={{ fontSize: '11px', color: '#334155', marginTop: '1px', fontFamily: "'DM Mono', monospace" }}>{brand.owner.name}</div>}
                              </div>
                            </div>
                          </td>

                          {/* Slug / Domain */}
                          <td style={{ padding: '16px 18px' }}>
                            <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: '#818cf8' }}>/{brand.slug}</div>
                            {brand.domain && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#334155', marginTop: '3px' }}>{brand.domain}</div>}
                          </td>

                          {/* Plan */}
                          <td style={{ padding: '16px 18px' }}>
                            <span style={{ ...planStyle, padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                              {brand.plan}
                            </span>
                          </td>

                          {/* Commission */}
                          <td style={{ padding: '16px 18px' }}>
                            <span style={{ fontFamily: "'DM Mono', monospace", color: '#94a3b8', fontSize: '13px', fontWeight: 500 }}>
                              {brand.platformCommissionRate ?? 15}%
                            </span>
                          </td>

                          {/* Onboarding progress */}
                          <td style={{ padding: '16px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{ width: '64px', height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                                <div className="progress-fill" style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #6366f1, #c084fc)', borderRadius: '3px' }} />
                              </div>
                              <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: pct === 100 ? '#10b981' : '#6366f1', fontWeight: 500 }}>{pct}%</span>
                            </div>
                          </td>

                          {/* Status */}
                          <td style={{ padding: '16px 18px' }}>
                            <span style={{ ...statusStyle, padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                              {brand.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td style={{ padding: '16px 18px' }}>
                            <div style={{ display: 'flex', gap: '6px' }} onClick={e => e.stopPropagation()}>
                              <button className="btn-ghost" onClick={() => openEdit(brand)}
                                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', borderRadius: '7px', padding: '6px 12px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}>
                                Edit
                              </button>
                              <button onClick={() => handleStatusToggle(brand)}
                                style={{ background: brand.status === 'suspended' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${brand.status === 'suspended' ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`, color: brand.status === 'suspended' ? '#10b981' : '#f59e0b', borderRadius: '7px', padding: '6px 12px', fontSize: '11px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s' }}>
                                {brand.status === 'suspended' ? 'Activate' : 'Suspend'}
                              </button>
                              <button onClick={() => setConfirmDelete(brand)}
                                style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#f43f5e', borderRadius: '7px', padding: '6px 12px', fontSize: '11px', cursor: 'pointer', fontWeight: 600, transition: 'all 0.15s' }}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* ── EXPANDED ROW ──────────────────────────────── */}
                        {isExpanded && (
                          <tr key={`${brand._id}-expanded`}>
                            <td colSpan={7} style={{ padding: '0' }}>
                              <div className="expand-panel" style={{ background: 'rgba(99,102,241,0.04)', borderTop: '1px solid rgba(99,102,241,0.12)', borderBottom: '1px solid rgba(99,102,241,0.12)', padding: '20px 20px 20px 70px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>

                                  {/* Onboarding checklist */}
                                  <div>
                                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', color: '#6366f1', letterSpacing: '0.14em', marginBottom: '10px', fontWeight: 600 }}>ONBOARDING CHECKLIST</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                      {ONBOARDING_STEPS.map((step, idx) => (
                                        <div key={step.label} style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                                          <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: progress[idx] ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${progress[idx] ? '#10b981' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: progress[idx] ? '#10b981' : '#475569', flexShrink: 0 }}>
                                            {progress[idx] ? '✓' : ''}
                                          </div>
                                          <span style={{ fontSize: '12px', color: progress[idx] ? '#94a3b8' : '#475569' }}>{step.icon} {step.label}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Brand stats */}
                                  <div>
                                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', color: '#6366f1', letterSpacing: '0.14em', marginBottom: '10px', fontWeight: 600 }}>BRAND STATS</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      {[
                                        { label: 'Orders',   value: brand.totalOrders  || 0 },
                                        { label: 'Revenue',  value: `$${(brand.totalRevenue || 0).toLocaleString()}` },
                                        { label: 'Paid Out', value: `$${(brand.totalPaid || 0).toLocaleString()}` },
                                      ].map(s => (
                                        <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#475569', letterSpacing: '0.06em' }}>{s.label.toUpperCase()}</span>
                                          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>{s.value}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Quick links */}
                                  <div>
                                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', color: '#6366f1', letterSpacing: '0.14em', marginBottom: '10px', fontWeight: 600 }}>QUICK LINKS</div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                      <a href={`/store/${brand.slug}`} target="_blank" rel="noreferrer"
                                        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', padding: '8px 12px', color: '#818cf8', fontSize: '12px', fontWeight: 600, textDecoration: 'none', transition: 'all 0.15s' }}>
                                        🛍️ Preview Storefront
                                      </a>
                                      {brand.domain && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '8px 12px', color: '#475569', fontSize: '12px', fontFamily: "'DM Mono', monospace" }}>
                                          🌐 {brand.domain}
                                        </div>
                                      )}
                                      {brand.bio && (
                                        <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.5, fontStyle: 'italic', padding: '4px 0' }}>"{brand.bio}"</p>
                                      )}
                                    </div>
                                  </div>

                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── CREATE / EDIT MODAL ─────────────────────────────────────── */}
        {showModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', padding: '20px' }}>
            <div style={{ background: 'linear-gradient(145deg, #0f0f1e, #0a0a16)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '18px', width: '100%', maxWidth: '520px', padding: '30px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 0 60px rgba(99,102,241,0.15), 0 24px 48px rgba(0,0,0,0.5)' }}>

              {/* Modal header */}
              <div style={{ marginBottom: '26px' }}>
                <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '9px', color: '#6366f1', letterSpacing: '0.2em', marginBottom: '8px', fontWeight: 600 }}>
                  {editing ? 'EDIT BRAND' : 'NEW BRAND PARTNER'}
                </div>
                <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '26px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>
                  {editing ? editing.name : 'Create Brand'}
                </h2>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <Field label="Brand Name *">
                  <input className="modal-input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inp} placeholder="Italy Lucas" />
                </Field>
                <Field label="Slug *">
                  <input className="modal-input" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s/g, '') }))} style={inp} placeholder="italylucas" />
                  <div style={{ fontSize: '10px', color: '#4338ca', marginTop: '4px', fontFamily: "'DM Mono', monospace" }}>
                    hnavault.com/store/{form.slug || 'slug'}
                  </div>
                </Field>
                <Field label="Tagline">
                  <input className="modal-input" value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} style={inp} placeholder="Short punchy line" />
                </Field>
                <Field label="Domain">
                  <input className="modal-input" value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))} style={inp} placeholder="italylucasbrand.com" />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Plan">
                    <select className="modal-input" value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))} style={{ ...inp, cursor: 'pointer' }}>
                      <option value="starter">Starter — 10%</option>
                      <option value="pro">Pro — 15%</option>
                      <option value="elite">Elite — 20%</option>
                    </select>
                  </Field>
                  <Field label="Status">
                    <select className="modal-input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={{ ...inp, cursor: 'pointer' }}>
                      <option value="pending">Pending</option>
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </Field>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Field label="Platform Cut (%)">
                    <input type="number" className="modal-input" value={form.platformCommissionRate} onChange={e => setForm(f => ({ ...f, platformCommissionRate: Number(e.target.value) }))} style={inp} min="0" max="100" />
                  </Field>
                  <Field label="Primary Color">
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input type="color" value={form.primaryColor} onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))} style={{ width: '42px', height: '42px', borderRadius: '8px', border: '1px solid rgba(99,102,241,0.2)', background: 'transparent', cursor: 'pointer', padding: '2px' }} />
                      <input className="modal-input" value={form.primaryColor} onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))} style={{ ...inp, flex: 1 }} />
                    </div>
                  </Field>
                </div>
                <Field label="Bio">
                  <textarea className="modal-input" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} style={{ ...inp, resize: 'none', height: '80px' }} placeholder="Short brand description..." />
                </Field>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '26px' }}>
                <button onClick={() => setShowModal(false)}
                  style={{ padding: '11px 22px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving || !form.name || !form.slug}
                  style={{ padding: '11px 28px', borderRadius: '9px', border: 'none', background: saving ? '#334155' : 'linear-gradient(135deg, #6366f1, #818cf8)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: "'Plus Jakarta Sans', sans-serif", boxShadow: saving ? 'none' : '0 0 24px rgba(99,102,241,0.4)', opacity: (!form.name || !form.slug) ? 0.4 : 1 }}>
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Brand'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── DELETE CONFIRM ──────────────────────────────────────────── */}
        {confirmDelete && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', padding: '20px' }}>
            <div style={{ background: 'linear-gradient(145deg, #0f0f1e, #0a0a16)', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '16px', width: '100%', maxWidth: '360px', padding: '28px', textAlign: 'center', boxShadow: '0 0 40px rgba(244,63,94,0.1), 0 20px 40px rgba(0,0,0,0.5)' }}>
              <div style={{ fontSize: '44px', marginBottom: '14px' }}>⚠️</div>
              <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Delete Brand?</h2>
              <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px', lineHeight: 1.6 }}>
                <span style={{ color: '#e2e8f0', fontWeight: 700 }}>{confirmDelete.name}</span> will be permanently deactivated. This cannot be undone.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button onClick={() => setConfirmDelete(null)}
                  style={{ padding: '10px 22px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}>
                  Cancel
                </button>
                <button onClick={() => handleDelete(confirmDelete._id)}
                  style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #f43f5e, #fb7185)', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px', boxShadow: '0 0 20px rgba(244,63,94,0.3)' }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}





// premium

// import { useEffect, useState } from 'react';
// import axios from 'axios';

// const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// const STATUS_STYLES = {
//   active:    { bg: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' },
//   pending:   { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' },
//   suspended: { bg: 'rgba(244,63,94,0.12)',  color: '#f43f5e', border: '1px solid rgba(244,63,94,0.3)' },
//   inactive:  { bg: 'rgba(100,116,139,0.12)',color: '#64748b', border: '1px solid rgba(100,116,139,0.3)' },
// };

// const PLAN_STYLES = {
//   starter: { bg: 'rgba(255,255,255,0.06)', color: '#94a3b8' },
//   pro:     { bg: 'rgba(99,102,241,0.15)',  color: '#818cf8' },
//   elite:   { bg: 'rgba(168,85,247,0.15)',  color: '#c084fc' },
// };

// const ONBOARDING_STEPS = ['Brand Created', 'Logo Uploaded', 'Products Added', 'Domain Set', 'Stripe Connected'];

// function getOnboardingProgress(brand) {
//   const steps = [
//     true,
//     !!brand.logo,
//     (brand.totalOrders || 0) > 0 || true, // we don't have product count here, assume done if active
//     !!brand.domain,
//     !!brand.stripeAccountId,
//   ];
//   return steps;
// }

// const emptyForm = {
//   name: '', slug: '', domain: '', plan: 'starter',
//   status: 'pending', vendorType: 'inhouse', platformCommissionRate: 15,
//   bio: '', tagline: '', primaryColor: '#6366f1',
// };

// export default function Brands() {
//   const [brands, setBrands]           = useState([]);
//   const [loading, setLoading]         = useState(true);
//   const [error, setError]             = useState('');
//   const [search, setSearch]           = useState('');
//   const [filterStatus, setFilter]     = useState('all');
//   const [showModal, setShowModal]     = useState(false);
//   const [editing, setEditing]         = useState(null);
//   const [form, setForm]               = useState(emptyForm);
//   const [saving, setSaving]           = useState(false);
//   const [confirmDelete, setConfirmDelete] = useState(null);
//   const [expandedBrand, setExpanded]  = useState(null);
//   const [view, setView]               = useState('grid'); // 'grid' | 'table'

//   const fetchBrands = async () => {
//     try {
//       setLoading(true);
//       const { data } = await axios.get(`${API}/api/brands`);
//       setBrands(data);
//     } catch (err) {
//       setError('Failed to load brands');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchBrands(); }, []);

//   const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true); };
//   const openEdit = (brand) => {
//     setEditing(brand);
//     setForm({
//       name: brand.name || '', slug: brand.slug || '', domain: brand.domain || '',
//       plan: brand.plan || 'starter', status: brand.status || 'pending',
//       vendorType: brand.vendorType || 'inhouse',
//       platformCommissionRate: brand.platformCommissionRate ?? 15,
//       bio: brand.bio || '', tagline: brand.tagline || '',
//       primaryColor: brand.primaryColor || '#6366f1',
//     });
//     setShowModal(true);
//   };

//   const handleSave = async () => {
//     if (!form.name || !form.slug) return;
//     setSaving(true);
//     try {
//       if (editing) {
//         await axios.put(`${API}/api/brands/${editing._id}`, form);
//       } else {
//         await axios.post(`${API}/api/brands`, form);
//       }
//       setShowModal(false);
//       fetchBrands();
//     } catch (err) {
//       alert(err?.response?.data?.message || 'Save failed');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleStatusToggle = async (brand) => {
//     const endpoint = brand.status === 'suspended' ? 'activate' : 'suspend';
//     try {
//       await axios.put(`${API}/api/brands/${brand._id}/${endpoint}`);
//       fetchBrands();
//     } catch { alert('Status update failed'); }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`${API}/api/brands/${id}`);
//       setConfirmDelete(null);
//       fetchBrands();
//     } catch { alert('Delete failed'); }
//   };

//   const filtered = brands.filter(b => {
//     const matchSearch = !search ||
//       b.name?.toLowerCase().includes(search.toLowerCase()) ||
//       b.slug?.toLowerCase().includes(search.toLowerCase());
//     const matchStatus = filterStatus === 'all' || b.status === filterStatus;
//     return matchSearch && matchStatus;
//   });

//   const totalRevenue = brands.reduce((s, b) => s + (b.totalRevenue || 0), 0);
//   const totalOrders  = brands.reduce((s, b) => s + (b.totalOrders || 0), 0);
//   const activeCount  = brands.filter(b => b.status === 'active').length;

//   return (
//     <div style={{ minHeight: '100vh', background: '#080810', color: '#e2e8f0', fontFamily: "'DM Sans', sans-serif", padding: '32px 28px' }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&family=DM+Mono:wght@400;500&display=swap');
//         * { box-sizing: border-box; }
//         .brand-card { transition: transform 0.2s, box-shadow 0.2s; cursor: pointer; }
//         .brand-card:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(0,0,0,0.4); }
//         .action-btn { transition: all 0.15s; }
//         .action-btn:hover { opacity: 0.8; }
//         .progress-step { transition: all 0.3s; }
//         input[type=color] { cursor: pointer; }
//         ::-webkit-scrollbar { width: 4px; }
//         ::-webkit-scrollbar-track { background: #0f0f1a; }
//         ::-webkit-scrollbar-thumb { background: #6366f1; border-radius: 2px; }
//       `}</style>

//       {/* ── HEADER ─────────────────────────────────────────────────────── */}
//       <div style={{ marginBottom: '32px' }}>
//         <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
//           <div>
//             <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#6366f1', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '6px' }}>
//               HNA PLATFORM
//             </div>
//             <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: '42px', fontWeight: 800, color: '#fff', letterSpacing: '-0.03em', margin: 0, lineHeight: 1 }}>
//               Brand Partners
//             </h1>
//             <p style={{ color: '#475569', fontSize: '13px', marginTop: '6px' }}>
//               {brands.length} brands · {activeCount} active · ${totalRevenue.toLocaleString()} platform revenue
//             </p>
//           </div>
//           <button
//             onClick={openCreate}
//             style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', padding: '12px 24px', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 700, cursor: 'pointer', letterSpacing: '0.02em', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 0 24px rgba(99,102,241,0.3)' }}
//           >
//             <span style={{ fontSize: '18px', lineHeight: 1 }}>+</span> New Brand
//           </button>
//         </div>
//       </div>

//       {/* ── PLATFORM STATS ─────────────────────────────────────────────── */}
//       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '28px' }}>
//         {[
//           { label: 'Total Brands',   value: brands.length,                        icon: '🏷️', accent: '#6366f1' },
//           { label: 'Active',         value: activeCount,                           icon: '✅', accent: '#10b981' },
//           { label: 'Platform Orders',value: totalOrders,                           icon: '📦', accent: '#f59e0b' },
//           { label: 'Platform Revenue',value: `$${totalRevenue.toLocaleString()}`,  icon: '💰', accent: '#c084fc' },
//         ].map(s => (
//           <div key={s.label} style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '12px', padding: '16px', position: 'relative', overflow: 'hidden' }}>
//             <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: s.accent, opacity: 0.6 }} />
//             <div style={{ fontSize: '20px', marginBottom: '8px' }}>{s.icon}</div>
//             <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff', fontFamily: "'Syne', sans-serif" }}>{s.value}</div>
//             <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px', fontFamily: "'DM Mono', monospace", letterSpacing: '0.08em' }}>{s.label.toUpperCase()}</div>
//           </div>
//         ))}
//       </div>

//       {/* ── FILTERS + VIEW TOGGLE ───────────────────────────────────────── */}
//       <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
//         <input
//           type="text"
//           placeholder="Search brands..."
//           value={search}
//           onChange={e => setSearch(e.target.value)}
//           style={{ flex: 1, minWidth: '200px', background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '8px', padding: '10px 14px', color: '#e2e8f0', fontSize: '13px', outline: 'none', fontFamily: "'DM Sans', sans-serif" }}
//         />
//         <select
//           value={filterStatus}
//           onChange={e => setFilter(e.target.value)}
//           style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '8px', padding: '10px 14px', color: '#94a3b8', fontSize: '13px', outline: 'none', fontFamily: "'DM Mono', monospace' " }}
//         >
//           <option value="all">All Statuses</option>
//           <option value="active">Active</option>
//           <option value="pending">Pending</option>
//           <option value="suspended">Suspended</option>
//         </select>
//         <div style={{ display: 'flex', gap: '4px', background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '8px', padding: '4px' }}>
//           {[['grid', '⊞'], ['table', '☰']].map(([v, icon]) => (
//             <button key={v} onClick={() => setView(v)} style={{ background: view === v ? '#1e1e2e' : 'transparent', border: 'none', color: view === v ? '#fff' : '#475569', width: '32px', height: '32px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
//               {icon}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* ── LOADING / ERROR ─────────────────────────────────────────────── */}
//       {loading && (
//         <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
//           <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', letterSpacing: '0.1em' }}>LOADING BRANDS...</div>
//         </div>
//       )}
//       {error && <div style={{ color: '#f43f5e', textAlign: 'center', padding: '40px' }}>{error}</div>}

//       {/* ── GRID VIEW ───────────────────────────────────────────────────── */}
//       {!loading && !error && view === 'grid' && (
//         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
//           {filtered.length === 0 ? (
//             <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px', color: '#334155' }}>
//               <div style={{ fontSize: '48px', marginBottom: '12px' }}>🏷️</div>
//               <p style={{ fontFamily: "'Syne', sans-serif", fontSize: '20px', color: '#475569' }}>No brands yet</p>
//               <p style={{ color: '#334155', fontSize: '13px', marginTop: '4px' }}>Create your first brand partner above</p>
//             </div>
//           ) : filtered.map(brand => {
//             const progress   = getOnboardingProgress(brand);
//             const doneCount  = progress.filter(Boolean).length;
//             const pct        = Math.round((doneCount / ONBOARDING_STEPS.length) * 100);
//             const isExpanded = expandedBrand === brand._id;
//             const statusStyle = STATUS_STYLES[brand.status] || STATUS_STYLES.inactive;
//             const planStyle   = PLAN_STYLES[brand.plan]   || PLAN_STYLES.starter;
//             const primary     = brand.primaryColor || '#6366f1';

//             return (
//               <div key={brand._id} className="brand-card"
//                 style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '14px', overflow: 'hidden', position: 'relative' }}
//               >
//                 {/* Color accent bar */}
//                 <div style={{ height: '3px', background: `linear-gradient(90deg, ${primary}, transparent)` }} />

//                 {/* Card header */}
//                 <div style={{ padding: '18px 20px 14px', cursor: 'pointer' }} onClick={() => setExpanded(isExpanded ? null : brand._id)}>
//                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
//                     <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
//                       {brand.logo ? (
//                         <img src={brand.logo} alt={brand.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
//                       ) : (
//                         <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: `${primary}22`, border: `1px solid ${primary}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: primary, fontFamily: "'Syne', sans-serif" }}>
//                           {brand.name?.[0]?.toUpperCase()}
//                         </div>
//                       )}
//                       <div>
//                         <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '16px', fontWeight: 700, color: '#fff' }}>{brand.name}</div>
//                         <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#475569', marginTop: '2px' }}>/{brand.slug}</div>
//                       </div>
//                     </div>
//                     <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
//                       <span style={{ ...planStyle, padding: '3px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: 700, fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', textTransform: 'uppercase' }}>
//                         {brand.plan}
//                       </span>
//                       <span style={{ ...statusStyle, padding: '3px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: 700, fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', textTransform: 'uppercase' }}>
//                         {brand.status}
//                       </span>
//                     </div>
//                   </div>

//                   {brand.bio && (
//                     <p style={{ color: '#64748b', fontSize: '12px', marginTop: '10px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
//                       {brand.bio}
//                     </p>
//                   )}

//                   {/* Stats row */}
//                   <div style={{ display: 'flex', gap: '16px', marginTop: '14px' }}>
//                     {[
//                       { label: 'Orders',  value: brand.totalOrders  || 0 },
//                       { label: 'Revenue', value: `$${(brand.totalRevenue || 0).toLocaleString()}` },
//                       { label: 'Cut',     value: `${brand.platformCommissionRate || 15}%` },
//                     ].map(s => (
//                       <div key={s.label}>
//                         <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '15px', fontWeight: 700, color: '#fff' }}>{s.value}</div>
//                         <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#334155', letterSpacing: '0.08em' }}>{s.label.toUpperCase()}</div>
//                       </div>
//                     ))}
//                   </div>

//                   {/* Onboarding progress bar */}
//                   <div style={{ marginTop: '14px' }}>
//                     <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
//                       <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#334155', letterSpacing: '0.08em' }}>ONBOARDING</span>
//                       <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: pct === 100 ? '#10b981' : '#6366f1' }}>{pct}%</span>
//                     </div>
//                     <div style={{ height: '4px', background: '#1e1e2e', borderRadius: '2px', overflow: 'hidden' }}>
//                       <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#10b981' : `linear-gradient(90deg, #6366f1, #c084fc)`, borderRadius: '2px', transition: 'width 0.5s' }} />
//                     </div>
//                     <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
//                       {ONBOARDING_STEPS.map((step, i) => (
//                         <div key={step} title={step} style={{ flex: 1, height: '3px', borderRadius: '2px', background: progress[i] ? primary : '#1e1e2e', transition: 'background 0.3s' }} />
//                       ))}
//                     </div>
//                   </div>
//                 </div>

//                 {/* Expanded panel */}
//                 {isExpanded && (
//                   <div style={{ borderTop: '1px solid #1e1e2e', padding: '14px 20px', background: '#080810' }}>
//                     {/* Onboarding checklist */}
//                     <div style={{ marginBottom: '14px' }}>
//                       <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#334155', letterSpacing: '0.1em', marginBottom: '8px' }}>ONBOARDING CHECKLIST</div>
//                       <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
//                         {ONBOARDING_STEPS.map((step, i) => (
//                           <div key={step} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                             <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: progress[i] ? 'rgba(16,185,129,0.15)' : '#1e1e2e', border: `1px solid ${progress[i] ? '#10b981' : '#334155'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', flexShrink: 0 }}>
//                               {progress[i] ? '✓' : ''}
//                             </div>
//                             <span style={{ fontSize: '12px', color: progress[i] ? '#94a3b8' : '#475569', textDecoration: progress[i] ? 'none' : 'none' }}>{step}</span>
//                           </div>
//                         ))}
//                       </div>
//                     </div>

//                     {/* Domain + storefront preview */}
//                     <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
//                       <a href={`/store/${brand.slug}`} target="_blank" rel="noreferrer"
//                         style={{ flex: 1, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '7px', padding: '8px 12px', color: '#818cf8', fontSize: '11px', fontFamily: "'DM Mono', monospace", textDecoration: 'none', textAlign: 'center', display: 'block' }}
//                         onClick={e => e.stopPropagation()}>
//                         Preview Store →
//                       </a>
//                       {brand.domain && (
//                         <div style={{ flex: 1, background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '7px', padding: '8px 12px', color: '#475569', fontSize: '11px', fontFamily: "'DM Mono', monospace", textAlign: 'center' }}>
//                           {brand.domain}
//                         </div>
//                       )}
//                     </div>

//                     {/* Action buttons */}
//                     <div style={{ display: 'flex', gap: '6px' }}>
//                       <button className="action-btn" onClick={(e) => { e.stopPropagation(); openEdit(brand); }}
//                         style={{ flex: 1, background: '#1e1e2e', border: '1px solid #334155', color: '#94a3b8', borderRadius: '7px', padding: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
//                         Edit
//                       </button>
//                       <button className="action-btn" onClick={(e) => { e.stopPropagation(); handleStatusToggle(brand); }}
//                         style={{ flex: 1, background: brand.status === 'suspended' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)', border: `1px solid ${brand.status === 'suspended' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`, color: brand.status === 'suspended' ? '#10b981' : '#f59e0b', borderRadius: '7px', padding: '8px', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
//                         {brand.status === 'suspended' ? 'Activate' : 'Suspend'}
//                       </button>
//                       <button className="action-btn" onClick={(e) => { e.stopPropagation(); setConfirmDelete(brand); }}
//                         style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#f43f5e', borderRadius: '7px', padding: '8px 12px', fontSize: '12px', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
//                         Delete
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* ── TABLE VIEW ──────────────────────────────────────────────────── */}
//       {!loading && !error && view === 'table' && (
//         <div style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '14px', overflow: 'hidden' }}>
//           <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
//             <thead>
//               <tr style={{ borderBottom: '1px solid #1e1e2e' }}>
//                 {['Brand', 'Slug / Domain', 'Plan', 'Commission', 'Progress', 'Status', 'Actions'].map(h => (
//                   <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#334155', fontFamily: "'DM Mono', monospace", fontSize: '10px', letterSpacing: '0.1em', fontWeight: 600 }}>{h.toUpperCase()}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map((brand, i) => {
//                 const progress  = getOnboardingProgress(brand);
//                 const pct       = Math.round((progress.filter(Boolean).length / ONBOARDING_STEPS.length) * 100);
//                 const statusStyle = STATUS_STYLES[brand.status] || STATUS_STYLES.inactive;
//                 const planStyle   = PLAN_STYLES[brand.plan]   || PLAN_STYLES.starter;
//                 const primary     = brand.primaryColor || '#6366f1';
//                 return (
//                   <tr key={brand._id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #1e1e2e' : 'none', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
//                     <td style={{ padding: '14px 16px' }}>
//                       <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                         <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: primary, flexShrink: 0 }} />
//                         <div>
//                           <div style={{ fontWeight: 600, color: '#e2e8f0', fontFamily: "'Syne', sans-serif" }}>{brand.name}</div>
//                           {brand.owner?.name && <div style={{ fontSize: '11px', color: '#334155' }}>{brand.owner.name}</div>}
//                         </div>
//                       </div>
//                     </td>
//                     <td style={{ padding: '14px 16px' }}>
//                       <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '12px', color: '#6366f1' }}>/{brand.slug}</div>
//                       {brand.domain && <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '11px', color: '#334155', marginTop: '2px' }}>{brand.domain}</div>}
//                     </td>
//                     <td style={{ padding: '14px 16px' }}>
//                       <span style={{ ...planStyle, padding: '3px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: 700, fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', textTransform: 'uppercase' }}>{brand.plan}</span>
//                     </td>
//                     <td style={{ padding: '14px 16px', fontFamily: "'DM Mono', monospace", color: '#94a3b8', fontSize: '13px' }}>
//                       {brand.platformCommissionRate ?? 15}%
//                     </td>
//                     <td style={{ padding: '14px 16px' }}>
//                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
//                         <div style={{ width: '60px', height: '4px', background: '#1e1e2e', borderRadius: '2px', overflow: 'hidden' }}>
//                           <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#10b981' : '#6366f1', borderRadius: '2px' }} />
//                         </div>
//                         <span style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#475569' }}>{pct}%</span>
//                       </div>
//                     </td>
//                     <td style={{ padding: '14px 16px' }}>
//                       <span style={{ ...statusStyle, padding: '3px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: 700, fontFamily: "'DM Mono', monospace", letterSpacing: '0.06em', textTransform: 'uppercase' }}>{brand.status}</span>
//                     </td>
//                     <td style={{ padding: '14px 16px' }}>
//                       <div style={{ display: 'flex', gap: '6px' }}>
//                         <button className="action-btn" onClick={() => openEdit(brand)} style={{ background: '#1e1e2e', border: '1px solid #334155', color: '#94a3b8', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', cursor: 'pointer' }}>Edit</button>
//                         <button className="action-btn" onClick={() => handleStatusToggle(brand)} style={{ background: 'transparent', border: `1px solid ${brand.status === 'suspended' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`, color: brand.status === 'suspended' ? '#10b981' : '#f59e0b', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', cursor: 'pointer' }}>
//                           {brand.status === 'suspended' ? 'Activate' : 'Suspend'}
//                         </button>
//                         <button className="action-btn" onClick={() => setConfirmDelete(brand)} style={{ background: 'transparent', border: '1px solid rgba(244,63,94,0.2)', color: '#f43f5e', borderRadius: '6px', padding: '5px 10px', fontSize: '11px', cursor: 'pointer' }}>Delete</button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* ── CREATE / EDIT MODAL ─────────────────────────────────────────── */}
//       {showModal && (
//         <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', padding: '16px' }}>
//           <div style={{ background: '#0f0f1a', border: '1px solid #1e1e2e', borderRadius: '16px', width: '100%', maxWidth: '520px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
//             <div style={{ marginBottom: '24px' }}>
//               <div style={{ fontFamily: "'DM Mono', monospace", fontSize: '10px', color: '#6366f1', letterSpacing: '0.15em', marginBottom: '6px' }}>{editing ? 'EDIT BRAND' : 'NEW BRAND'}</div>
//               <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '24px', fontWeight: 800, color: '#fff', margin: 0 }}>{editing ? editing.name : 'Create Brand Partner'}</h2>
//             </div>

//             <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
//               <Field label="Brand Name *">
//                 <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="Italy Lucas" />
//               </Field>
//               <Field label="Slug *">
//                 <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s/g, '') }))} style={inputStyle} placeholder="italylucas" />
//                 <div style={{ fontSize: '11px', color: '#334155', marginTop: '4px', fontFamily: "'DM Mono', monospace" }}>hnavault.com/store/{form.slug || 'slug'}</div>
//               </Field>
//               <Field label="Tagline">
//                 <input value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} style={inputStyle} placeholder="Short punchy line" />
//               </Field>
//               <Field label="Domain">
//                 <input value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))} style={inputStyle} placeholder="italylucasbrand.com" />
//               </Field>
//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
//                 <Field label="Plan">
//                   <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))} style={inputStyle}>
//                     <option value="starter">Starter — 10%</option>
//                     <option value="pro">Pro — 15%</option>
//                     <option value="elite">Elite — 20%</option>
//                   </select>
//                 </Field>
//                 <Field label="Status">
//                   <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} style={inputStyle}>
//                     <option value="pending">Pending</option>
//                     <option value="active">Active</option>
//                     <option value="suspended">Suspended</option>
//                   </select>
//                 </Field>
//               </div>
//               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
//                 <Field label="Platform Cut (%)">
//                   <input type="number" value={form.platformCommissionRate} onChange={e => setForm(f => ({ ...f, platformCommissionRate: Number(e.target.value) }))} style={inputStyle} min="0" max="100" />
//                 </Field>
//                 <Field label="Primary Color">
//                   <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
//                     <input type="color" value={form.primaryColor} onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))} style={{ width: '40px', height: '40px', borderRadius: '8px', border: 'none', background: 'transparent', cursor: 'pointer' }} />
//                     <input value={form.primaryColor} onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))} style={{ ...inputStyle, flex: 1 }} />
//                   </div>
//                 </Field>
//               </div>
//               <Field label="Bio">
//                 <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} style={{ ...inputStyle, resize: 'none', height: '80px' }} placeholder="Short brand description..." />
//               </Field>
//             </div>

//             <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
//               <button onClick={() => setShowModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #1e1e2e', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px', fontFamily: "'DM Sans', sans-serif" }}>
//                 Cancel
//               </button>
//               <button onClick={handleSave} disabled={saving || !form.name || !form.slug}
//                 style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: saving ? '#334155' : '#6366f1', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: "'DM Sans', sans-serif", boxShadow: saving ? 'none' : '0 0 20px rgba(99,102,241,0.3)' }}>
//                 {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Brand'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* ── DELETE CONFIRM ──────────────────────────────────────────────── */}
//       {confirmDelete && (
//         <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', padding: '16px' }}>
//           <div style={{ background: '#0f0f1a', border: '1px solid rgba(244,63,94,0.2)', borderRadius: '16px', width: '100%', maxWidth: '380px', padding: '28px', textAlign: 'center' }}>
//             <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚠️</div>
//             <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Delete Brand?</h2>
//             <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>
//               <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{confirmDelete.name}</span> will be permanently deactivated.
//             </p>
//             <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
//               <button onClick={() => setConfirmDelete(null)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #1e1e2e', background: 'transparent', color: '#64748b', cursor: 'pointer', fontSize: '13px' }}>
//                 Cancel
//               </button>
//               <button onClick={() => handleDelete(confirmDelete._id)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#f43f5e', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '13px' }}>
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// const inputStyle = {
//   width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid #1e1e2e',
//   borderRadius: '8px', padding: '10px 12px', color: '#e2e8f0', fontSize: '13px',
//   outline: 'none', fontFamily: "'DM Sans', sans-serif"
// };

// function Field({ label, children }) {
//   return (
//     <div>
//       <label style={{ display: 'block', fontSize: '10px', color: '#475569', marginBottom: '6px', fontFamily: "'DM Mono', monospace", letterSpacing: '0.1em', fontWeight: 600 }}>
//         {label.toUpperCase()}
//       </label>
//       {children}
//     </div>
//   );
// }









// import { useEffect, useState } from 'react';
// import axios from 'axios';

// const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// const STATUS_COLORS = {
//   active:    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
//   pending:   'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
//   suspended: 'bg-red-500/20 text-red-300 border border-red-500/30',
// };

// const PLAN_COLORS = {
//   starter: 'bg-white/10 text-white/60',
//   pro:     'bg-blue-500/20 text-blue-300',
//   elite:   'bg-purple-500/20 text-purple-300',
// };

// const emptyForm = {
//   name: '', slug: '', domain: '', plan: 'starter',
//   status: 'pending', vendorType: 'inhouse', commissionRate: 10,
//   bio: '', primaryColor: '#000000',
// };

// export default function Brands() {
//   const [brands, setBrands]       = useState([]);
//   const [loading, setLoading]     = useState(true);
//   const [error, setError]         = useState('');
//   const [search, setSearch]       = useState('');
//   const [filterStatus, setFilter] = useState('all');
//   const [showModal, setShowModal] = useState(false);
//   const [editing, setEditing]     = useState(null); // brand object or null
//   const [form, setForm]           = useState(emptyForm);
//   const [saving, setSaving]       = useState(false);
//   const [confirmDelete, setConfirmDelete] = useState(null);

//   const fetchBrands = async () => {
//     try {
//       setLoading(true);
//       const { data } = await axios.get(`${API}/api/brands`);
//       setBrands(data);
//     } catch (err) {
//       setError('Failed to load brands');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchBrands(); }, []);

//   const openCreate = () => {
//     setEditing(null);
//     setForm(emptyForm);
//     setShowModal(true);
//   };

//   const openEdit = (brand) => {
//     setEditing(brand);
//     setForm({
//       name:           brand.name || '',
//       slug:           brand.slug || '',
//       domain:         brand.domain || '',
//       plan:           brand.plan || 'starter',
//       status:         brand.status || 'pending',
//       vendorType:     brand.vendorType || 'inhouse',
//       commissionRate: brand.commissionRate ?? 10,
//       bio:            brand.bio || '',
//       primaryColor:   brand.primaryColor || '#000000',
//     });
//     setShowModal(true);
//   };

//   const handleSave = async () => {
//     if (!form.name || !form.slug) return;
//     setSaving(true);
//     try {
//       if (editing) {
//         await axios.put(`${API}/api/brands/${editing._id}`, form);
//       } else {
//         await axios.post(`${API}/api/brands`, form);
//       }
//       setShowModal(false);
//       fetchBrands();
//     } catch (err) {
//       alert(err?.response?.data?.message || 'Save failed');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleStatusToggle = async (brand) => {
//     const endpoint = brand.status === 'suspended' ? 'activate' : 'suspend';
//     try {
//       await axios.put(`${API}/api/brands/${brand._id}/${endpoint}`);
//       fetchBrands();
//     } catch (err) {
//       alert('Status update failed');
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`${API}/api/brands/${id}`);
//       setConfirmDelete(null);
//       fetchBrands();
//     } catch (err) {
//       alert('Delete failed');
//     }
//   };

//   const filtered = brands.filter(b => {
//     const matchSearch = !search ||
//       b.name?.toLowerCase().includes(search.toLowerCase()) ||
//       b.slug?.toLowerCase().includes(search.toLowerCase());
//     const matchStatus = filterStatus === 'all' || b.status === filterStatus;
//     return matchSearch && matchStatus;
//   });

//   return (
//     <div className="p-6 text-white min-h-screen">

//       {/* Header */}
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
//           <p className="text-white/50 text-sm mt-1">
//             {brands.length} total &mdash; {brands.filter(b => b.status === 'active').length} active
//           </p>
//         </div>
//         <button
//           onClick={openCreate}
//           className="bg-white text-black px-5 py-2 rounded-lg font-bold hover:bg-white/90 transition-all duration-200 shadow-lg"
//         >
//           + New Brand
//         </button>
//       </div>

//       {/* Filters */}
//       <div className="flex flex-col sm:flex-row gap-3 mb-6">
//         <input
//           type="text"
//           placeholder="Search by name or slug..."
//           value={search}
//           onChange={e => setSearch(e.target.value)}
//           className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/30 flex-1"
//         />
//         <select
//           value={filterStatus}
//           onChange={e => setFilter(e.target.value)}
//           className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30"
//         >
//           <option value="all">All Statuses</option>
//           <option value="active">Active</option>
//           <option value="pending">Pending</option>
//           <option value="suspended">Suspended</option>
//         </select>
//       </div>

//       {/* Table */}
//       {loading ? (
//         <div className="text-white/40 text-center py-20">Loading brands...</div>
//       ) : error ? (
//         <div className="text-red-400 text-center py-20">{error}</div>
//       ) : filtered.length === 0 ? (
//         <div className="text-white/40 text-center py-20">No brands found.</div>
//       ) : (
//         <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-wider">
//                 <th className="text-left px-5 py-4">Brand</th>
//                 <th className="text-left px-5 py-4 hidden md:table-cell">Slug / Domain</th>
//                 <th className="text-left px-5 py-4 hidden lg:table-cell">Plan</th>
//                 <th className="text-left px-5 py-4 hidden lg:table-cell">Commission</th>
//                 <th className="text-left px-5 py-4">Status</th>
//                 <th className="text-right px-5 py-4">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map((brand, i) => (
//                 <tr
//                   key={brand._id}
//                   className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}
//                 >
//                   {/* Brand name + color swatch */}
//                   <td className="px-5 py-4">
//                     <div className="flex items-center gap-3">
//                       <div
//                         className="w-3 h-3 rounded-full flex-shrink-0"
//                         style={{ backgroundColor: brand.primaryColor || '#ffffff' }}
//                       />
//                       <span className="font-semibold">{brand.name}</span>
//                     </div>
//                     {brand.owner?.name && (
//                       <div className="text-white/40 text-xs mt-0.5 pl-6">{brand.owner.name}</div>
//                     )}
//                   </td>

//                   {/* Slug / Domain */}
//                   <td className="px-5 py-4 hidden md:table-cell">
//                     <div className="text-white/70 font-mono text-xs">/{brand.slug}</div>
//                     {brand.domain && (
//                       <div className="text-white/40 text-xs mt-0.5">{brand.domain}</div>
//                     )}
//                   </td>

//                   {/* Plan */}
//                   <td className="px-5 py-4 hidden lg:table-cell">
//                     <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${PLAN_COLORS[brand.plan] || 'bg-white/10 text-white/60'}`}>
//                       {brand.plan || '—'}
//                     </span>
//                   </td>

//                   {/* Commission */}
//                   <td className="px-5 py-4 hidden lg:table-cell text-white/70">
//                     {brand.commissionRate != null ? `${brand.commissionRate}%` : '—'}
//                   </td>

//                   {/* Status */}
//                   <td className="px-5 py-4">
//                     <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLORS[brand.status] || 'bg-white/10 text-white/50'}`}>
//                       {brand.status || '—'}
//                     </span>
//                   </td>

//                   {/* Actions */}
//                   <td className="px-5 py-4 text-right">
//                     <div className="flex items-center justify-end gap-2">
//                       <button
//                         onClick={() => openEdit(brand)}
//                         className="text-white/50 hover:text-white text-xs px-3 py-1 rounded border border-white/10 hover:border-white/30 transition-all"
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleStatusToggle(brand)}
//                         className={`text-xs px-3 py-1 rounded border transition-all ${
//                           brand.status === 'suspended'
//                             ? 'text-emerald-400 border-emerald-500/30 hover:border-emerald-400'
//                             : 'text-yellow-400 border-yellow-500/30 hover:border-yellow-400'
//                         }`}
//                       >
//                         {brand.status === 'suspended' ? 'Activate' : 'Suspend'}
//                       </button>
//                       <button
//                         onClick={() => setConfirmDelete(brand)}
//                         className="text-red-400 hover:text-red-300 text-xs px-3 py-1 rounded border border-red-500/20 hover:border-red-400/40 transition-all"
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Create / Edit Modal */}
//       {showModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
//           <div className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg p-6">
//             <h2 className="text-xl font-bold mb-5">{editing ? 'Edit Brand' : 'New Brand'}</h2>

//             <div className="space-y-4">
//               <Field label="Name *">
//                 <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
//                   className={inputCls} placeholder="Italy Lucas Brand" />
//               </Field>
//               <Field label="Slug *">
//                 <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
//                   className={inputCls} placeholder="italylucas" />
//               </Field>
//               <Field label="Domain">
//                 <input value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}
//                   className={inputCls} placeholder="italylucasbrand.com" />
//               </Field>
//               <div className="grid grid-cols-2 gap-4">
//                 <Field label="Plan">
//                   <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))} className={inputCls}>
//                     <option value="starter">Starter</option>
//                     <option value="pro">Pro</option>
//                     <option value="elite">Elite</option>
//                   </select>
//                 </Field>
//                 <Field label="Status">
//                   <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={inputCls}>
//                     <option value="pending">Pending</option>
//                     <option value="active">Active</option>
//                     <option value="suspended">Suspended</option>
//                   </select>
//                 </Field>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <Field label="Commission Rate (%)">
//                   <input type="number" value={form.commissionRate}
//                     onChange={e => setForm(f => ({ ...f, commissionRate: Number(e.target.value) }))}
//                     className={inputCls} min="0" max="100" />
//                 </Field>
//                 <Field label="Primary Color">
//                   <div className="flex gap-2 items-center">
//                     <input type="color" value={form.primaryColor}
//                       onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))}
//                       className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
//                     <input value={form.primaryColor}
//                       onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))}
//                       className={`${inputCls} flex-1`} placeholder="#000000" />
//                   </div>
//                 </Field>
//               </div>
//               <Field label="Bio">
//                 <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
//                   className={`${inputCls} resize-none h-20`} placeholder="Short brand description..." />
//               </Field>
//             </div>

//             <div className="flex justify-end gap-3 mt-6">
//               <button onClick={() => setShowModal(false)}
//                 className="px-5 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all text-sm">
//                 Cancel
//               </button>
//               <button onClick={handleSave} disabled={saving || !form.name || !form.slug}
//                 className="px-5 py-2 rounded-lg bg-white text-black font-bold hover:bg-white/90 transition-all text-sm disabled:opacity-40">
//                 {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Brand'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirm Modal */}
//       {confirmDelete && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
//           <div className="bg-zinc-900 border border-red-500/20 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
//             <div className="text-3xl mb-3">⚠️</div>
//             <h2 className="text-xl font-bold mb-2">Delete Brand?</h2>
//             <p className="text-white/50 text-sm mb-6">
//               <span className="text-white font-semibold">{confirmDelete.name}</span> will be permanently deleted.
//               This cannot be undone.
//             </p>
//             <div className="flex gap-3 justify-center">
//               <button onClick={() => setConfirmDelete(null)}
//                 className="px-5 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white transition-all text-sm">
//                 Cancel
//               </button>
//               <button onClick={() => handleDelete(confirmDelete._id)}
//                 className="px-5 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-400 transition-all text-sm">
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }

// // Helpers
// const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30";

// function Field({ label, children }) {
//   return (
//     <div>
//       <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wider">{label}</label>
//       {children}
//     </div>
//   );
// }






// import { useEffect, useState } from 'react';
// import axios from 'axios';

// const API = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// const STATUS_COLORS = {
//   active:    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
//   pending:   'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
//   suspended: 'bg-red-500/20 text-red-300 border border-red-500/30',
// };

// const PLAN_COLORS = {
//   starter: 'bg-white/10 text-white/60',
//   pro:     'bg-blue-500/20 text-blue-300',
//   elite:   'bg-purple-500/20 text-purple-300',
// };

// const emptyForm = {
//   name: '', slug: '', domain: '', plan: 'starter',
//   status: 'pending', vendorType: 'inhouse', commissionRate: 10,
//   bio: '', primaryColor: '#000000',
// };

// export default function Brands() {
//   const [brands, setBrands]       = useState([]);
//   const [loading, setLoading]     = useState(true);
//   const [error, setError]         = useState('');
//   const [search, setSearch]       = useState('');
//   const [filterStatus, setFilter] = useState('all');
//   const [showModal, setShowModal] = useState(false);
//   const [editing, setEditing]     = useState(null); // brand object or null
//   const [form, setForm]           = useState(emptyForm);
//   const [saving, setSaving]       = useState(false);
//   const [confirmDelete, setConfirmDelete] = useState(null);

//   const fetchBrands = async () => {
//     try {
//       setLoading(true);
//       const { data } = await axios.get(`${API}/api/brands`);
//       setBrands(data);
//     } catch (err) {
//       setError('Failed to load brands');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchBrands(); }, []);

//   const openCreate = () => {
//     setEditing(null);
//     setForm(emptyForm);
//     setShowModal(true);
//   };

//   const openEdit = (brand) => {
//     setEditing(brand);
//     setForm({
//       name:           brand.name || '',
//       slug:           brand.slug || '',
//       domain:         brand.domain || '',
//       plan:           brand.plan || 'starter',
//       status:         brand.status || 'pending',
//       vendorType:     brand.vendorType || 'inhouse',
//       commissionRate: brand.commissionRate ?? 10,
//       bio:            brand.bio || '',
//       primaryColor:   brand.primaryColor || '#000000',
//     });
//     setShowModal(true);
//   };

//   const handleSave = async () => {
//     if (!form.name || !form.slug) return;
//     setSaving(true);
//     try {
//       if (editing) {
//         await axios.put(`${API}/api/brands/${editing._id}`, form);
//       } else {
//         await axios.post(`${API}/api/brands`, form);
//       }
//       setShowModal(false);
//       fetchBrands();
//     } catch (err) {
//       alert(err?.response?.data?.message || 'Save failed');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const handleStatusToggle = async (brand) => {
//     const endpoint = brand.status === 'suspended' ? 'activate' : 'suspend';
//     try {
//       await axios.put(`${API}/api/brands/${brand._id}/${endpoint}`);
//       fetchBrands();
//     } catch (err) {
//       alert('Status update failed');
//     }
//   };

//   const handleDelete = async (id) => {
//     try {
//       await axios.delete(`${API}/api/brands/${id}`);
//       setConfirmDelete(null);
//       fetchBrands();
//     } catch (err) {
//       alert('Delete failed');
//     }
//   };

//   const filtered = brands.filter(b => {
//     const matchSearch = !search ||
//       b.name?.toLowerCase().includes(search.toLowerCase()) ||
//       b.slug?.toLowerCase().includes(search.toLowerCase());
//     const matchStatus = filterStatus === 'all' || b.status === filterStatus;
//     return matchSearch && matchStatus;
//   });

//   return (
//     <div className="p-6 text-white min-h-screen">

//       {/* Header */}
//       <div className="flex items-center justify-between mb-8">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
//           <p className="text-white/50 text-sm mt-1">
//             {brands.length} total &mdash; {brands.filter(b => b.status === 'active').length} active
//           </p>
//         </div>
//         <button
//           onClick={openCreate}
//           className="bg-white text-black px-5 py-2 rounded-lg font-bold hover:bg-white/90 transition-all duration-200 shadow-lg"
//         >
//           + New Brand
//         </button>
//       </div>

//       {/* Filters */}
//       <div className="flex flex-col sm:flex-row gap-3 mb-6">
//         <input
//           type="text"
//           placeholder="Search by name or slug..."
//           value={search}
//           onChange={e => setSearch(e.target.value)}
//           className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/30 flex-1"
//         />
//         <select
//           value={filterStatus}
//           onChange={e => setFilter(e.target.value)}
//           className="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-white/30"
//         >
//           <option value="all">All Statuses</option>
//           <option value="active">Active</option>
//           <option value="pending">Pending</option>
//           <option value="suspended">Suspended</option>
//         </select>
//       </div>

//       {/* Table */}
//       {loading ? (
//         <div className="text-white/40 text-center py-20">Loading brands...</div>
//       ) : error ? (
//         <div className="text-red-400 text-center py-20">{error}</div>
//       ) : filtered.length === 0 ? (
//         <div className="text-white/40 text-center py-20">No brands found.</div>
//       ) : (
//         <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
//           <table className="w-full text-sm">
//             <thead>
//               <tr className="border-b border-white/10 text-white/50 text-xs uppercase tracking-wider">
//                 <th className="text-left px-5 py-4">Brand</th>
//                 <th className="text-left px-5 py-4 hidden md:table-cell">Slug / Domain</th>
//                 <th className="text-left px-5 py-4 hidden lg:table-cell">Plan</th>
//                 <th className="text-left px-5 py-4 hidden lg:table-cell">Commission</th>
//                 <th className="text-left px-5 py-4">Status</th>
//                 <th className="text-right px-5 py-4">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filtered.map((brand, i) => (
//                 <tr
//                   key={brand._id}
//                   className={`border-b border-white/5 hover:bg-white/5 transition-colors ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}
//                 >
//                   {/* Brand name + color swatch */}
//                   <td className="px-5 py-4">
//                     <div className="flex items-center gap-3">
//                       <div
//                         className="w-3 h-3 rounded-full flex-shrink-0"
//                         style={{ backgroundColor: brand.primaryColor || '#ffffff' }}
//                       />
//                       <span className="font-semibold">{brand.name}</span>
//                     </div>
//                     {brand.owner?.name && (
//                       <div className="text-white/40 text-xs mt-0.5 pl-6">{brand.owner.name}</div>
//                     )}
//                   </td>

//                   {/* Slug / Domain */}
//                   <td className="px-5 py-4 hidden md:table-cell">
//                     <div className="text-white/70 font-mono text-xs">/{brand.slug}</div>
//                     {brand.domain && (
//                       <div className="text-white/40 text-xs mt-0.5">{brand.domain}</div>
//                     )}
//                   </td>

//                   {/* Plan */}
//                   <td className="px-5 py-4 hidden lg:table-cell">
//                     <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${PLAN_COLORS[brand.plan] || 'bg-white/10 text-white/60'}`}>
//                       {brand.plan || '—'}
//                     </span>
//                   </td>

//                   {/* Commission */}
//                   <td className="px-5 py-4 hidden lg:table-cell text-white/70">
//                     {brand.commissionRate != null ? `${brand.commissionRate}%` : '—'}
//                   </td>

//                   {/* Status */}
//                   <td className="px-5 py-4">
//                     <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${STATUS_COLORS[brand.status] || 'bg-white/10 text-white/50'}`}>
//                       {brand.status || '—'}
//                     </span>
//                   </td>

//                   {/* Actions */}
//                   <td className="px-5 py-4 text-right">
//                     <div className="flex items-center justify-end gap-2">
//                       <button
//                         onClick={() => openEdit(brand)}
//                         className="text-white/50 hover:text-white text-xs px-3 py-1 rounded border border-white/10 hover:border-white/30 transition-all"
//                       >
//                         Edit
//                       </button>
//                       <button
//                         onClick={() => handleStatusToggle(brand)}
//                         className={`text-xs px-3 py-1 rounded border transition-all ${
//                           brand.status === 'suspended'
//                             ? 'text-emerald-400 border-emerald-500/30 hover:border-emerald-400'
//                             : 'text-yellow-400 border-yellow-500/30 hover:border-yellow-400'
//                         }`}
//                       >
//                         {brand.status === 'suspended' ? 'Activate' : 'Suspend'}
//                       </button>
//                       <button
//                         onClick={() => setConfirmDelete(brand)}
//                         className="text-red-400 hover:text-red-300 text-xs px-3 py-1 rounded border border-red-500/20 hover:border-red-400/40 transition-all"
//                       >
//                         Delete
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       {/* Create / Edit Modal */}
//       {showModal && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
//           <div className="bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg p-6">
//             <h2 className="text-xl font-bold mb-5">{editing ? 'Edit Brand' : 'New Brand'}</h2>

//             <div className="space-y-4">
//               <Field label="Name *">
//                 <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
//                   className={inputCls} placeholder="Italy Lucas Brand" />
//               </Field>
//               <Field label="Slug *">
//                 <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
//                   className={inputCls} placeholder="italylucas" />
//               </Field>
//               <Field label="Domain">
//                 <input value={form.domain} onChange={e => setForm(f => ({ ...f, domain: e.target.value }))}
//                   className={inputCls} placeholder="italylucasbrand.com" />
//               </Field>
//               <div className="grid grid-cols-2 gap-4">
//                 <Field label="Plan">
//                   <select value={form.plan} onChange={e => setForm(f => ({ ...f, plan: e.target.value }))} className={inputCls}>
//                     <option value="starter">Starter</option>
//                     <option value="pro">Pro</option>
//                     <option value="elite">Elite</option>
//                   </select>
//                 </Field>
//                 <Field label="Status">
//                   <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={inputCls}>
//                     <option value="pending">Pending</option>
//                     <option value="active">Active</option>
//                     <option value="suspended">Suspended</option>
//                   </select>
//                 </Field>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <Field label="Commission Rate (%)">
//                   <input type="number" value={form.commissionRate}
//                     onChange={e => setForm(f => ({ ...f, commissionRate: Number(e.target.value) }))}
//                     className={inputCls} min="0" max="100" />
//                 </Field>
//                 <Field label="Primary Color">
//                   <div className="flex gap-2 items-center">
//                     <input type="color" value={form.primaryColor}
//                       onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))}
//                       className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
//                     <input value={form.primaryColor}
//                       onChange={e => setForm(f => ({ ...f, primaryColor: e.target.value }))}
//                       className={`${inputCls} flex-1`} placeholder="#000000" />
//                   </div>
//                 </Field>
//               </div>
//               <Field label="Bio">
//                 <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
//                   className={`${inputCls} resize-none h-20`} placeholder="Short brand description..." />
//               </Field>
//             </div>

//             <div className="flex justify-end gap-3 mt-6">
//               <button onClick={() => setShowModal(false)}
//                 className="px-5 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/30 transition-all text-sm">
//                 Cancel
//               </button>
//               <button onClick={handleSave} disabled={saving || !form.name || !form.slug}
//                 className="px-5 py-2 rounded-lg bg-white text-black font-bold hover:bg-white/90 transition-all text-sm disabled:opacity-40">
//                 {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Brand'}
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Delete Confirm Modal */}
//       {confirmDelete && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
//           <div className="bg-zinc-900 border border-red-500/20 rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
//             <div className="text-3xl mb-3">⚠️</div>
//             <h2 className="text-xl font-bold mb-2">Delete Brand?</h2>
//             <p className="text-white/50 text-sm mb-6">
//               <span className="text-white font-semibold">{confirmDelete.name}</span> will be permanently deleted.
//               This cannot be undone.
//             </p>
//             <div className="flex gap-3 justify-center">
//               <button onClick={() => setConfirmDelete(null)}
//                 className="px-5 py-2 rounded-lg border border-white/10 text-white/60 hover:text-white transition-all text-sm">
//                 Cancel
//               </button>
//               <button onClick={() => handleDelete(confirmDelete._id)}
//                 className="px-5 py-2 rounded-lg bg-red-500 text-white font-bold hover:bg-red-400 transition-all text-sm">
//                 Delete
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// }

// // Helpers
// const inputCls = "w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30";

// function Field({ label, children }) {
//   return (
//     <div>
//       <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wider">{label}</label>
//       {children}
//     </div>
//   );
// }
