import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// ── LED Glow Card ─────────────────────────────────────────────────────────────
const GlowCard = ({ children, className = '' }) => (
  <div className="relative group">
    {/* LED underglow */}
    <div className="absolute -bottom-2 left-4 right-4 h-4 bg-indigo-500/40 blur-lg rounded-full transition-all duration-300 group-hover:bg-indigo-400/60 group-hover:h-6" />
    <div className="relative bg-indigo-950/60 backdrop-blur-md border border-indigo-500/30 rounded-2xl hover:border-indigo-400/50 transition-all duration-300 ${className}">
      {children}
    </div>
  </div>
);

export default function Affiliates() {
  const [affiliates, setAffiliates] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAffiliate, setNewAffiliate] = useState({
    name: '', email: '', code: '', commissionRate: 10
  });

  useEffect(() => { fetchAffiliates(); fetchStats(); }, []);

  const fetchAffiliates = async () => {
    try {
      const response = await fetch(`${API_URL}/api/affiliates`);
      if (response.ok) setAffiliates(await response.json());
      setLoading(false);
    } catch (error) { console.error(error); setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/affiliates/stats`);
      if (response.ok) setStats(await response.json());
    } catch (error) { console.error(error); }
  };

  const handleCreateAffiliate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/affiliates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAffiliate)
      });
      if (response.ok) {
        setShowCreateModal(false);
        setNewAffiliate({ name: '', email: '', code: '', commissionRate: 10 });
        fetchAffiliates(); fetchStats();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create affiliate');
      }
    } catch (error) { alert('Failed to create affiliate'); }
  };

  const handleDeleteAffiliate = async (id) => {
    if (!confirm('Are you sure you want to delete this affiliate?')) return;
    try {
      const response = await fetch(`${API_URL}/api/affiliates/${id}`, { method: 'DELETE' });
      if (response.ok) { fetchAffiliates(); fetchStats(); }
    } catch (error) { console.error(error); }
  };

  const handlePayCommission = async (id, amount) => {
    try {
      const response = await fetch(`${API_URL}/api/affiliates/pay/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });
      if (response.ok) { fetchAffiliates(); fetchStats(); alert('Commission payment recorded!'); }
    } catch (error) { console.error(error); }
  };

  const getTierColor = (tier) => {
    const colors = {
      Trail:  'bg-green-500/20 text-green-400 border-green-500/40',
      Ridge:  'bg-blue-500/20 text-blue-400 border-blue-500/40',
      Peak:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
      Summit: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    };
    return colors[tier] || colors.Trail;
  };

  const getTierEmoji = (tier) => {
    const emojis = { Trail: '🌿', Ridge: '🏔️', Peak: '⛰️', Summit: '🏆' };
    return emojis[tier] || '🌿';
  };

  const getStatusColor = (status) => {
    const colors = {
      active:    'bg-green-500/20 text-green-400 border-green-500/40',
      pending:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
      inactive:  'bg-gray-500/20 text-gray-400 border-gray-500/40',
      suspended: 'bg-red-500/20 text-red-400 border-red-500/40'
    };
    return colors[status] || colors.active;
  };

  if (loading) return (
    <div className="min-h-screen bg-[#05050f] flex items-center justify-center">
      <div className="text-indigo-300 text-xl animate-pulse">Loading affiliates...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05050f] p-8">

      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-600/8 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <div className="relative flex justify-between items-center mb-10">
        <div>
          <h1 className="text-5xl font-bold text-white mb-2 tracking-wider drop-shadow-[0_0_30px_rgba(99,102,241,0.5)]">
            🤝 Affiliate Management
          </h1>
          <p className="text-indigo-300/70 text-lg">Manage your affiliate partners and track their performance</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/affiliates/sales-report"
            className="px-6 py-3 bg-indigo-950/80 hover:bg-indigo-900/80 border border-indigo-500/40 text-indigo-300 rounded-xl font-semibold transition-all duration-300 hover:border-indigo-400/60 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]"
          >
            📊 Sales Report
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#6065c088] to-[#070b57] text-white rounded-xl font-semibold hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all duration-300"
          >
            + Create New Affiliate
          </button>
        </div>
      </div>

      {/* Tier Legend */}
      <div className="relative flex gap-3 mb-10">
        {['Trail', 'Ridge', 'Peak', 'Summit'].map(tier => (
          <div key={tier} className={`px-4 py-2 rounded-lg text-sm border flex items-center gap-2 ${getTierColor(tier)}`}>
            {getTierEmoji(tier)} {tier}
            <span className="text-white/40 text-xs">
              {tier === 'Trail' && '0–19 · 10%'}
              {tier === 'Ridge' && '20–49 · 12%'}
              {tier === 'Peak' && '50–99 · 15%'}
              {tier === 'Summit' && '100+ · 20%'}
            </span>
          </div>
        ))}
      </div>

      {/* Stats Grid with LED glow */}
      <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Affiliates', value: stats.totalAffiliates || 0, sub: `${stats.activeAffiliates || 0} active`, subColor: 'text-green-400' },
          { label: 'Total Revenue',    value: `$${(stats.totalRevenue || 0).toLocaleString()}`, sub: `${stats.totalSales || 0} sales`, subColor: 'text-indigo-300' },
          { label: 'Commission Owed',  value: `$${(stats.unpaidCommission || 0).toLocaleString()}`, valueColor: 'text-yellow-400', sub: 'Unpaid balance', subColor: 'text-indigo-300/60' },
          { label: 'Avg Conversion',   value: `${stats.conversionRate || 0}%`, sub: `${stats.totalClicks || 0} clicks`, subColor: 'text-indigo-300/60' },
        ].map((card, i) => (
          <div key={i} className="relative group">
            <div className="absolute -bottom-3 left-6 right-6 h-5 bg-indigo-500/30 blur-xl rounded-full transition-all duration-300 group-hover:bg-indigo-400/50 group-hover:h-7" />
            <div className="relative bg-indigo-950/60 backdrop-blur-md border border-indigo-500/30 rounded-2xl p-6 hover:border-indigo-400/50 transition-all duration-300">
              <div className="text-indigo-300/60 text-sm mb-1">{card.label}</div>
              <div className={`text-3xl font-bold ${card.valueColor || 'text-white'}`}>{card.value}</div>
              <div className={`text-sm mt-1 ${card.subColor}`}>{card.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Affiliates Table */}
      <div className="relative group">
        <div className="absolute -bottom-3 left-8 right-8 h-6 bg-indigo-500/20 blur-xl rounded-full transition-all duration-300 group-hover:bg-indigo-400/30" />
        <div className="relative bg-indigo-950/40 backdrop-blur-md border border-indigo-500/30 rounded-2xl overflow-hidden hover:border-indigo-400/40 transition-all duration-300">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-indigo-900/30 border-b border-indigo-500/20">
                <tr>
                  {['Affiliate', 'Code', 'Tier', 'Status', 'Sales', 'Revenue', 'Commission', 'Owed', 'Actions'].map((h, i) => (
                    <th key={h} className={`p-4 text-indigo-300/80 font-semibold text-sm tracking-wide ${i >= 4 && i <= 7 ? 'text-right' : i === 8 ? 'text-center' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {affiliates.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-16 text-indigo-300/40">
                      No affiliates yet. Create your first affiliate to get started!
                    </td>
                  </tr>
                ) : (
                  affiliates.map((affiliate) => (
                    <tr key={affiliate._id} className="border-b border-indigo-500/10 hover:bg-indigo-500/5 transition-colors">
                      <td className="p-4">
                        <div className="text-white font-semibold">{affiliate.name}</div>
                        <div className="text-indigo-300/50 text-sm">{affiliate.email}</div>
                      </td>
                      <td className="p-4">
                        <code className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded font-mono text-sm border border-indigo-500/30">
                          {affiliate.code}
                        </code>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-lg text-sm border ${getTierColor(affiliate.tier)}`}>
                          {getTierEmoji(affiliate.tier)} {affiliate.tier}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-lg text-sm border ${getStatusColor(affiliate.status)}`}>
                          {affiliate.status}
                        </span>
                      </td>
                      <td className="p-4 text-right text-white font-semibold">{affiliate.totalSales}</td>
                      <td className="p-4 text-right text-white font-semibold">${affiliate.totalRevenue.toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <div className="text-white font-semibold">${affiliate.totalCommission.toFixed(2)}</div>
                        <div className="text-indigo-300/50 text-sm">{affiliate.commissionRate}%</div>
                      </td>
                      <td className="p-4 text-right text-yellow-400 font-semibold">${affiliate.unpaidCommission.toFixed(2)}</td>
                      <td className="p-4">
                        <div className="flex gap-2 justify-center">
                          {affiliate.unpaidCommission > 0 && (
                            <button
                              onClick={() => handlePayCommission(affiliate._id, affiliate.unpaidCommission)}
                              className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 hover:shadow-[0_0_12px_rgba(74,222,128,0.3)] transition-all text-sm"
                            >
                              💰 Pay
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAffiliate(affiliate._id)}
                            className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 hover:shadow-[0_0_12px_rgba(248,113,113,0.3)] transition-all text-sm"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative">
            {/* Modal LED glow */}
            <div className="absolute -bottom-4 left-8 right-8 h-8 bg-indigo-500/40 blur-2xl rounded-full" />
            <div className="relative bg-gradient-to-br from-indigo-950 to-[#05050f] border border-indigo-500/40 rounded-2xl p-8 max-w-md w-full shadow-[0_0_60px_rgba(99,102,241,0.3)]">
              <h2 className="text-2xl font-bold text-white mb-6 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">Create New Affiliate</h2>
              <form onSubmit={handleCreateAffiliate} className="space-y-4">
                {[
                  { label: 'Name', key: 'name', type: 'text', placeholder: 'John Doe' },
                  { label: 'Email', key: 'email', type: 'email', placeholder: 'john@example.com' },
                  { label: 'Affiliate Code', key: 'code', type: 'text', placeholder: 'JOHN10' },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-indigo-300/80 mb-2 text-sm">{field.label}</label>
                    <input
                      type={field.type}
                      required
                      value={newAffiliate[field.key]}
                      onChange={(e) => setNewAffiliate({ ...newAffiliate, [field.key]: field.key === 'code' ? e.target.value.toUpperCase() : e.target.value })}
                      className="w-full px-4 py-2 bg-indigo-950/60 border border-indigo-500/30 rounded-lg text-white placeholder-indigo-300/20 focus:border-indigo-400 focus:outline-none focus:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"
                      placeholder={field.placeholder}
                      maxLength={field.key === 'code' ? 20 : undefined}
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-indigo-300/80 mb-2 text-sm">Commission Rate (%)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    step="0.5"
                    value={newAffiliate.commissionRate}
                    onChange={(e) => setNewAffiliate({ ...newAffiliate, commissionRate: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 bg-indigo-950/60 border border-indigo-500/30 rounded-lg text-white focus:border-indigo-400 focus:outline-none focus:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"
                  />
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 bg-indigo-950/60 border border-indigo-500/20 text-indigo-700 rounded-lg hover:bg-indigo-900/60 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#364a72] to-[#0d2b7b87] text-white rounded-lg font-semibold hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all"
                  >
                    Create Affiliate
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

















// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// export default function Affiliates() {
//   const [affiliates, setAffiliates] = useState([]);
//   const [stats, setStats] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [newAffiliate, setNewAffiliate] = useState({
//     name: '', email: '', code: '', commissionRate: 10
//   });

//   useEffect(() => { fetchAffiliates(); fetchStats(); }, []);

//   const fetchAffiliates = async () => {
//     try {
//       const response = await fetch(`${API_URL}/api/affiliates`);
//       if (response.ok) setAffiliates(await response.json());
//       setLoading(false);
//     } catch (error) { console.error(error); setLoading(false); }
//   };

//   const fetchStats = async () => {
//     try {
//       const response = await fetch(`${API_URL}/api/affiliates/stats`);
//       if (response.ok) setStats(await response.json());
//     } catch (error) { console.error(error); }
//   };

//   const handleCreateAffiliate = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch(`${API_URL}/api/affiliates`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(newAffiliate)
//       });
//       if (response.ok) {
//         setShowCreateModal(false);
//         setNewAffiliate({ name: '', email: '', code: '', commissionRate: 10 });
//         fetchAffiliates(); fetchStats();
//       } else {
//         const error = await response.json();
//         alert(error.message || 'Failed to create affiliate');
//       }
//     } catch (error) { alert('Failed to create affiliate'); }
//   };

//   const handleDeleteAffiliate = async (id) => {
//     if (!confirm('Are you sure you want to delete this affiliate?')) return;
//     try {
//       const response = await fetch(`${API_URL}/api/affiliates/${id}`, { method: 'DELETE' });
//       if (response.ok) { fetchAffiliates(); fetchStats(); }
//     } catch (error) { console.error(error); }
//   };

//   const handlePayCommission = async (id, amount) => {
//     try {
//       const response = await fetch(`${API_URL}/api/affiliates/pay/${id}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ amount })
//       });
//       if (response.ok) { fetchAffiliates(); fetchStats(); alert('Commission payment recorded!'); }
//     } catch (error) { console.error(error); }
//   };

//   const getTierColor = (tier) => {
//     const colors = {
//       Trail:  'bg-green-500/20 text-green-400 border-green-500/40',
//       Ridge:  'bg-blue-500/20 text-blue-400 border-blue-500/40',
//       Peak:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
//       Summit: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
//     };
//     return colors[tier] || colors.Trail;
//   };

//   const getTierEmoji = (tier) => {
//     const emojis = { Trail: '🌿', Ridge: '🏔️', Peak: '⛰️', Summit: '🏆' };
//     return emojis[tier] || '🌿';
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       active:    'bg-green-500/20 text-green-400 border-green-500/40',
//       pending:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
//       inactive:  'bg-gray-500/20 text-gray-400 border-gray-500/40',
//       suspended: 'bg-red-500/20 text-red-400 border-red-500/40'
//     };
//     return colors[status] || colors.active;
//   };

//   if (loading) return (
//     <div className="min-h-screen bg-black flex items-center justify-center">
//       <div className="text-white text-xl">Loading affiliates...</div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen bg-black p-8">
//       <div className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-5xl font-bold text-white mb-2 tracking-wider drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
//             🤝 Affiliate Management
//           </h1>
//           <p className="text-white/70 text-lg">Manage your affiliate partners and track their performance</p>
//         </div>
//         <div className="flex gap-3">
//           <Link to="/admin/affiliates/sales-report" className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-indigo-500/50 text-white rounded-xl font-semibold transition-all duration-300">
//             📊 Sales Report
//           </Link>
//           <button onClick={() => setShowCreateModal(true)} className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300">
//             + Create New Affiliate
//           </button>
//         </div>
//       </div>

//       <div className="flex gap-3 mb-8">
//         {['Trail', 'Ridge', 'Peak', 'Summit'].map(tier => (
//           <div key={tier} className={`px-4 py-2 rounded-lg text-sm border flex items-center gap-2 ${getTierColor(tier)}`}>
//             {getTierEmoji(tier)} {tier}
//             <span className="text-white/40 text-xs">
//               {tier === 'Trail' && '0–19 sales · 10%'}
//               {tier === 'Ridge' && '20–49 sales · 12%'}
//               {tier === 'Peak' && '50–99 sales · 15%'}
//               {tier === 'Summit' && '100+ sales · 20%'}
//             </span>
//           </div>
//         ))}
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//         <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
//           <div className="text-white/60 text-sm mb-1">Total Affiliates</div>
//           <div className="text-3xl font-bold text-white">{stats.totalAffiliates || 0}</div>
//           <div className="text-green-400 text-sm mt-1">{stats.activeAffiliates || 0} active</div>
//         </div>
//         <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
//           <div className="text-white/60 text-sm mb-1">Total Revenue</div>
//           <div className="text-3xl font-bold text-white">${(stats.totalRevenue || 0).toLocaleString()}</div>
//           <div className="text-white/60 text-sm mt-1">{stats.totalSales || 0} sales</div>
//         </div>
//         <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
//           <div className="text-white/60 text-sm mb-1">Commission Owed</div>
//           <div className="text-3xl font-bold text-yellow-400">${(stats.unpaidCommission || 0).toLocaleString()}</div>
//           <div className="text-white/60 text-sm mt-1">Unpaid balance</div>
//         </div>
//         <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
//           <div className="text-white/60 text-sm mb-1">Avg Conversion</div>
//           <div className="text-3xl font-bold text-white">{stats.conversionRate || 0}%</div>
//           <div className="text-white/60 text-sm mt-1">{stats.totalClicks || 0} clicks</div>
//         </div>
//       </div>

//       <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-white/5 border-b border-white/10">
//               <tr>
//                 <th className="text-left p-4 text-white/80 font-semibold">Affiliate</th>
//                 <th className="text-left p-4 text-white/80 font-semibold">Code</th>
//                 <th className="text-left p-4 text-white/80 font-semibold">Tier</th>
//                 <th className="text-left p-4 text-white/80 font-semibold">Status</th>
//                 <th className="text-right p-4 text-white/80 font-semibold">Sales</th>
//                 <th className="text-right p-4 text-white/80 font-semibold">Revenue</th>
//                 <th className="text-right p-4 text-white/80 font-semibold">Commission</th>
//                 <th className="text-right p-4 text-white/80 font-semibold">Owed</th>
//                 <th className="text-center p-4 text-white/80 font-semibold">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {affiliates.length === 0 ? (
//                 <tr><td colSpan="9" className="text-center py-12 text-white/60">No affiliates yet. Create your first affiliate to get started!</td></tr>
//               ) : (
//                 affiliates.map((affiliate) => (
//                   <tr key={affiliate._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
//                     <td className="p-4">
//                       <div className="text-white font-semibold">{affiliate.name}</div>
//                       <div className="text-white/60 text-sm">{affiliate.email}</div>
//                     </td>
//                     <td className="p-4">
//                       <code className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded font-mono text-sm">{affiliate.code}</code>
//                     </td>
//                     <td className="p-4">
//                       <span className={`px-3 py-1 rounded-lg text-sm border ${getTierColor(affiliate.tier)}`}>
//                         {getTierEmoji(affiliate.tier)} {affiliate.tier}
//                       </span>
//                     </td>
//                     <td className="p-4">
//                       <span className={`px-3 py-1 rounded-lg text-sm border ${getStatusColor(affiliate.status)}`}>
//                         {affiliate.status}
//                       </span>
//                     </td>
//                     <td className="p-4 text-right text-white font-semibold">{affiliate.totalSales}</td>
//                     <td className="p-4 text-right text-white font-semibold">${affiliate.totalRevenue.toLocaleString()}</td>
//                     <td className="p-4 text-right">
//                       <div className="text-white font-semibold">${affiliate.totalCommission.toFixed(2)}</div>
//                       <div className="text-white/60 text-sm">{affiliate.commissionRate}%</div>
//                     </td>
//                     <td className="p-4 text-right text-yellow-400 font-semibold">${affiliate.unpaidCommission.toFixed(2)}</td>
//                     <td className="p-4">
//                       <div className="flex gap-2 justify-center">
//                         {affiliate.unpaidCommission > 0 && (
//                           <button onClick={() => handlePayCommission(affiliate._id, affiliate.unpaidCommission)} className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all text-sm">
//                             💰 Pay
//                           </button>
//                         )}
//                         <button onClick={() => handleDeleteAffiliate(affiliate._id)} className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm">
//                           🗑️
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {showCreateModal && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(99,102,241,0.3)]">
//             <h2 className="text-2xl font-bold text-white mb-6">Create New Affiliate</h2>
//             <form onSubmit={handleCreateAffiliate} className="space-y-4">
//               <div>
//                 <label className="block text-white/80 mb-2 text-sm">Name</label>
//                 <input type="text" required value={newAffiliate.name} onChange={(e) => setNewAffiliate({ ...newAffiliate, name: e.target.value })} className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-indigo-500 focus:outline-none" placeholder="John Doe" />
//               </div>
//               <div>
//                 <label className="block text-white/80 mb-2 text-sm">Email</label>
//                 <input type="email" required value={newAffiliate.email} onChange={(e) => setNewAffiliate({ ...newAffiliate, email: e.target.value })} className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-indigo-500 focus:outline-none" placeholder="john@example.com" />
//               </div>
//               <div>
//                 <label className="block text-white/80 mb-2 text-sm">Affiliate Code</label>
//                 <input type="text" required value={newAffiliate.code} onChange={(e) => setNewAffiliate({ ...newAffiliate, code: e.target.value.toUpperCase() })} className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white font-mono focus:border-indigo-500 focus:outline-none uppercase" placeholder="JOHN10" maxLength={20} />
//               </div>
//               <div>
//                 <label className="block text-white/80 mb-2 text-sm">Commission Rate (%)</label>
//                 <input type="number" required min="0" max="100" step="0.5" value={newAffiliate.commissionRate} onChange={(e) => setNewAffiliate({ ...newAffiliate, commissionRate: parseFloat(e.target.value) })} className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-indigo-500 focus:outline-none" />
//               </div>
//               <div className="flex gap-3 mt-6">
//                 <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-6 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all">Cancel</button>
//                 <button type="submit" className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all">Create Affiliate</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }





// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';

// const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// export default function Affiliates() {
//   const [affiliates, setAffiliates] = useState([]);
//   const [stats, setStats] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [newAffiliate, setNewAffiliate] = useState({
//     name: '',
//     email: '',
//     code: '',
//     commissionRate: 10
//   });

//   useEffect(() => {
//     fetchAffiliates();
//     fetchStats();
//   }, []);

//   const fetchAffiliates = async () => {
//     try {
//       const response = await fetch(`${API_URL}/api/affiliates`);
//       if (response.ok) {
//         const data = await response.json();
//         setAffiliates(data);
//       }
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching affiliates:', error);
//       setLoading(false);
//     }
//   };

//   const fetchStats = async () => {
//     try {
//       const response = await fetch(`${API_URL}/api/affiliates/stats`);
//       if (response.ok) {
//         const data = await response.json();
//         setStats(data);
//       }
//     } catch (error) {
//       console.error('Error fetching stats:', error);
//     }
//   };

//   const handleCreateAffiliate = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch(`${API_URL}/api/affiliates`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(newAffiliate)
//       });

//       if (response.ok) {
//         setShowCreateModal(false);
//         setNewAffiliate({ name: '', email: '', code: '', commissionRate: 10 });
//         fetchAffiliates();
//         fetchStats();
//       } else {
//         const error = await response.json();
//         alert(error.message || 'Failed to create affiliate');
//       }
//     } catch (error) {
//       console.error('Error creating affiliate:', error);
//       alert('Failed to create affiliate');
//     }
//   };

//   const handleDeleteAffiliate = async (id) => {
//     if (!confirm('Are you sure you want to delete this affiliate?')) return;

//     try {
//       const response = await fetch(`${API_URL}/api/affiliates/${id}`, {
//         method: 'DELETE'
//       });

//       if (response.ok) {
//         fetchAffiliates();
//         fetchStats();
//       }
//     } catch (error) {
//       console.error('Error deleting affiliate:', error);
//     }
//   };

//   const handlePayCommission = async (id, amount) => {
//     try {
//       const response = await fetch(`${API_URL}/api/affiliates/pay/${id}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ amount })
//       });

//       if (response.ok) {
//         fetchAffiliates();
//         fetchStats();
//         alert('Commission payment recorded successfully!');
//       }
//     } catch (error) {
//       console.error('Error paying commission:', error);
//     }
//   };

//   // ✅ Bug 1 Fixed: Tier colors now match Trail/Ridge/Peak/Summit
//   const getTierColor = (tier) => {
//     const colors = {
//       Trail:  'bg-green-500/20 text-green-400 border-green-500/40',
//       Ridge:  'bg-blue-500/20 text-blue-400 border-blue-500/40',
//       Peak:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
//       Summit: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
//     };
//     return colors[tier] || colors.Trail;
//   };

//   // ✅ Tier emoji for visual flair matching HNA brand
//   const getTierEmoji = (tier) => {
//     const emojis = { Trail: '🌿', Ridge: '🏔️', Peak: '⛰️', Summit: '🏆' };
//     return emojis[tier] || '🌿';
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       active:    'bg-green-500/20 text-green-400 border-green-500/40',
//       pending:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
//       inactive:  'bg-gray-500/20 text-gray-400 border-gray-500/40',
//       suspended: 'bg-red-500/20 text-red-400 border-red-500/40'
//     };
//     return colors[status] || colors.active;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-black flex items-center justify-center">
//         <div className="text-white text-xl">Loading affiliates...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-black p-8">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-5xl font-bold text-white mb-2 tracking-wider drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
//             🤝 Affiliate Management
//           </h1>
//           <p className="text-white/70 text-lg">
//             Manage your affiliate partners and track their performance
//           </p>
//         </div>
//         <div className="flex gap-3">
//           <Link
//             to="/admin/affiliates/sales-report"
//             className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-indigo-500/50 text-white rounded-xl font-semibold transition-all duration-300"
//           >
//             📊 Sales Report
//           </Link>
//           <button
//             onClick={() => setShowCreateModal(true)}
//             className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300"
//           >
//             + Create New Affiliate
//           </button>
//         </div>
//       </div>

//       {/* Tier Legend */}
//       <div className="flex gap-3 mb-8">
//         {['Trail', 'Ridge', 'Peak', 'Summit'].map(tier => (
//           <div key={tier} className={`px-4 py-2 rounded-lg text-sm border flex items-center gap-2 ${getTierColor(tier)}`}>
//             {getTierEmoji(tier)} {tier}
//             <span className="text-white/40 text-xs">
//               {tier === 'Trail' && '0–19 sales · 10%'}
//               {tier === 'Ridge' && '20–49 sales · 12%'}
//               {tier === 'Peak' && '50–99 sales · 15%'}
//               {tier === 'Summit' && '100+ sales · 20%'}
//             </span>
//           </div>
//         ))}
//       </div>

//       {/* Stats Overview */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//         <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
//           <div className="text-white/60 text-sm mb-1">Total Affiliates</div>
//           <div className="text-3xl font-bold text-white">{stats.totalAffiliates || 0}</div>
//           <div className="text-green-400 text-sm mt-1">{stats.activeAffiliates || 0} active</div>
//         </div>

//         <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
//           <div className="text-white/60 text-sm mb-1">Total Revenue</div>
//           <div className="text-3xl font-bold text-white">${(stats.totalRevenue || 0).toLocaleString()}</div>
//           <div className="text-white/60 text-sm mt-1">{stats.totalSales || 0} sales</div>
//         </div>

//         <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
//           <div className="text-white/60 text-sm mb-1">Commission Owed</div>
//           <div className="text-3xl font-bold text-yellow-400">${(stats.unpaidCommission || 0).toLocaleString()}</div>
//           <div className="text-white/60 text-sm mt-1">Unpaid balance</div>
//         </div>

//         <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
//           <div className="text-white/60 text-sm mb-1">Avg Conversion</div>
//           <div className="text-3xl font-bold text-white">{stats.conversionRate || 0}%</div>
//           <div className="text-white/60 text-sm mt-1">{stats.totalClicks || 0} clicks</div>
//         </div>
//       </div>

//       {/* Affiliates Table */}
//       <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-white/5 border-b border-white/10">
//               <tr>
//                 <th className="text-left p-4 text-white/80 font-semibold">Affiliate</th>
//                 <th className="text-left p-4 text-white/80 font-semibold">Code</th>
//                 <th className="text-left p-4 text-white/80 font-semibold">Tier</th>
//                 <th className="text-left p-4 text-white/80 font-semibold">Status</th>
//                 <th className="text-right p-4 text-white/80 font-semibold">Sales</th>
//                 <th className="text-right p-4 text-white/80 font-semibold">Revenue</th>
//                 <th className="text-right p-4 text-white/80 font-semibold">Commission</th>
//                 <th className="text-right p-4 text-white/80 font-semibold">Owed</th>
//                 <th className="text-center p-4 text-white/80 font-semibold">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {affiliates.length === 0 ? (
//                 <tr>
//                   <td colSpan="9" className="text-center py-12 text-white/60">
//                     No affiliates yet. Create your first affiliate to get started!
//                   </td>
//                 </tr>
//               ) : (
//                 affiliates.map((affiliate) => (
//                   <tr key={affiliate._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
//                     <td className="p-4">
//                       <div className="text-white font-semibold">{affiliate.name}</div>
//                       <div className="text-white/60 text-sm">{affiliate.email}</div>
//                     </td>
//                     <td className="p-4">
//                       <code className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded font-mono text-sm">
//                         {affiliate.code}
//                       </code>
//                     </td>
//                     <td className="p-4">
//                       <span className={`px-3 py-1 rounded-lg text-sm border ${getTierColor(affiliate.tier)}`}>
//                         {getTierEmoji(affiliate.tier)} {affiliate.tier}
//                       </span>
//                     </td>
//                     <td className="p-4">
//                       <span className={`px-3 py-1 rounded-lg text-sm border ${getStatusColor(affiliate.status)}`}>
//                         {affiliate.status}
//                       </span>
//                     </td>
//                     <td className="p-4 text-right text-white font-semibold">{affiliate.totalSales}</td>
//                     <td className="p-4 text-right text-white font-semibold">${affiliate.totalRevenue.toLocaleString()}</td>
//                     <td className="p-4 text-right">
//                       <div className="text-white font-semibold">${affiliate.totalCommission.toFixed(2)}</div>
//                       <div className="text-white/60 text-sm">{affiliate.commissionRate}%</div>
//                     </td>
//                     <td className="p-4 text-right text-yellow-400 font-semibold">
//                       ${affiliate.unpaidCommission.toFixed(2)}
//                     </td>
//                     <td className="p-4">
//                       <div className="flex gap-2 justify-center">
//                         {affiliate.unpaidCommission > 0 && (
//                           <button
//                             onClick={() => handlePayCommission(affiliate._id, affiliate.unpaidCommission)}
//                             className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all text-sm"
//                             title="Pay commission"
//                           >
//                             💰 Pay
//                           </button>
//                         )}
//                         <button
//                           onClick={() => handleDeleteAffiliate(affiliate._id)}
//                           className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm"
//                           title="Delete affiliate"
//                         >
//                           🗑️
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Create Modal */}
//       {showCreateModal && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(99,102,241,0.3)]">
//             <h2 className="text-2xl font-bold text-white mb-6">Create New Affiliate</h2>
//             <form onSubmit={handleCreateAffiliate} className="space-y-4">
//               <div>
//                 <label className="block text-white/80 mb-2 text-sm">Name</label>
//                 <input
//                   type="text"
//                   required
//                   value={newAffiliate.name}
//                   onChange={(e) => setNewAffiliate({ ...newAffiliate, name: e.target.value })}
//                   className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
//                   placeholder="John Doe"
//                 />
//               </div>
//               <div>
//                 <label className="block text-white/80 mb-2 text-sm">Email</label>
//                 <input
//                   type="email"
//                   required
//                   value={newAffiliate.email}
//                   onChange={(e) => setNewAffiliate({ ...newAffiliate, email: e.target.value })}
//                   className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
//                   placeholder="john@example.com"
//                 />
//               </div>
//               <div>
//                 <label className="block text-white/80 mb-2 text-sm">Affiliate Code</label>
//                 <input
//                   type="text"
//                   required
//                   value={newAffiliate.code}
//                   onChange={(e) => setNewAffiliate({ ...newAffiliate, code: e.target.value.toUpperCase() })}
//                   className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white font-mono focus:border-indigo-500 focus:outline-none uppercase"
//                   placeholder="JOHN10"
//                   maxLength={20}
//                 />
//               </div>
//               <div>
//                 <label className="block text-white/80 mb-2 text-sm">Commission Rate (%)</label>
//                 <input
//                   type="number"
//                   required
//                   min="0"
//                   max="100"
//                   step="0.5"
//                   value={newAffiliate.commissionRate}
//                   onChange={(e) => setNewAffiliate({ ...newAffiliate, commissionRate: parseFloat(e.target.value) })}
//                   className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
//                 />
//               </div>
//               <div className="flex gap-3 mt-6">
//                 <button
//                   type="button"
//                   onClick={() => setShowCreateModal(false)}
//                   className="flex-1 px-6 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all"
//                 >
//                   Create Affiliate
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }






// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';

// export default function Affiliates() {
//   const [affiliates, setAffiliates] = useState([]);
//   const [stats, setStats] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [newAffiliate, setNewAffiliate] = useState({
//     name: '',
//     email: '',
//     code: '',
//     commissionRate: 10
//   });

//   useEffect(() => {
//     fetchAffiliates();
//     fetchStats();
//   }, []);

//   const fetchAffiliates = async () => {
//     try {
//       const response = await fetch('http://localhost:5001/api/affiliates');
//       if (response.ok) {
//         const data = await response.json();
//         setAffiliates(data);
//       }
//       setLoading(false);
//     } catch (error) {
//       console.error('Error fetching affiliates:', error);
//       setLoading(false);
//     }
//   };

//   const fetchStats = async () => {
//     try {
//       const response = await fetch('http://localhost:5001/api/affiliates/stats');
//       if (response.ok) {
//         const data = await response.json();
//         setStats(data);
//       }
//     } catch (error) {
//       console.error('Error fetching stats:', error);
//     }
//   };

//   const handleCreateAffiliate = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch('http://localhost:5001/api/affiliates', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(newAffiliate)
//       });

//       if (response.ok) {
//         setShowCreateModal(false);
//         setNewAffiliate({ name: '', email: '', code: '', commissionRate: 10 });
//         fetchAffiliates();
//         fetchStats();
//       } else {
//         const error = await response.json();
//         alert(error.message || 'Failed to create affiliate');
//       }
//     } catch (error) {
//       console.error('Error creating affiliate:', error);
//       alert('Failed to create affiliate');
//     }
//   };

//   const handleDeleteAffiliate = async (id) => {
//     if (!confirm('Are you sure you want to delete this affiliate?')) return;

//     try {
//       const response = await fetch(`http://localhost:5001/api/affiliates/${id}`, {
//         method: 'DELETE'
//       });

//       if (response.ok) {
//         fetchAffiliates();
//         fetchStats();
//       }
//     } catch (error) {
//       console.error('Error deleting affiliate:', error);
//     }
//   };

//   const handlePayCommission = async (id, amount) => {
//     try {
//       const response = await fetch(`http://localhost:5001/api/affiliates/pay/${id}`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ amount })
//       });

//       if (response.ok) {
//         fetchAffiliates();
//         fetchStats();
//         alert('Commission payment recorded successfully!');
//       }
//     } catch (error) {
//       console.error('Error paying commission:', error);
//     }
//   };

//   const getTierColor = (tier) => {
//     const colors = {
//       Bronze: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
//       Silver: 'bg-gray-400/20 text-gray-300 border-gray-400/40',
//       Gold: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
//       Platinum: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
//     };
//     return colors[tier] || colors.Bronze;
//   };

//   const getStatusColor = (status) => {
//     const colors = {
//       active: 'bg-green-500/20 text-green-400 border-green-500/40',
//       pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
//       inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
//       suspended: 'bg-red-500/20 text-red-400 border-red-500/40'
//     };
//     return colors[status] || colors.active;
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-black flex items-center justify-center">
//         <div className="text-white text-xl">Loading affiliates...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-black p-8">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-8">
//         <div>
//           <h1 className="text-5xl font-bold text-white mb-2 tracking-wider drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
//             🤝 Affiliate Management
//           </h1>
//           <p className="text-white/70 text-lg">
//             Manage your affiliate partners and track their performance
//           </p>
//         </div>
//         <div className="flex gap-3">
//           <Link
//             to="/admin/affiliates/sales-report"
//             className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-indigo-500/50 text-white rounded-xl font-semibold transition-all duration-300"
//           >
//             📊 Sales Report
//           </Link>
//           <button
//             onClick={() => setShowCreateModal(true)}
//             className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300"
//           >
//             + Create New Affiliate
//           </button>
//         </div>
//       </div>

//       {/* Stats Overview */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
//         <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
//           <div className="text-white/60 text-sm mb-1">Total Affiliates</div>
//           <div className="text-3xl font-bold text-white">{stats.totalAffiliates || 0}</div>
//           <div className="text-green-400 text-sm mt-1">{stats.activeAffiliates || 0} active</div>
//         </div>

//         <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
//           <div className="text-white/60 text-sm mb-1">Total Revenue</div>
//           <div className="text-3xl font-bold text-white">${(stats.totalRevenue || 0).toLocaleString()}</div>
//           <div className="text-white/60 text-sm mt-1">{stats.totalSales || 0} sales</div>
//         </div>

//         <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
//           <div className="text-white/60 text-sm mb-1">Commission Owed</div>
//           <div className="text-3xl font-bold text-yellow-400">${(stats.unpaidCommission || 0).toLocaleString()}</div>
//           <div className="text-white/60 text-sm mt-1">Unpaid balance</div>
//         </div>

//         <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
//           <div className="text-white/60 text-sm mb-1">Avg Conversion</div>
//           <div className="text-3xl font-bold text-white">{stats.conversionRate || 0}%</div>
//           <div className="text-white/60 text-sm mt-1">{stats.totalClicks || 0} clicks</div>
//         </div>
//       </div>

//       {/* Affiliates Table */}
//       <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-white/5 border-b border-white/10">
//               <tr>
//                 <th className="text-left p-4 text-white/80 font-semibold">Affiliate</th>
//                 <th className="text-left p-4 text-white/80 font-semibold">Code</th>
//                 <th className="text-left p-4 text-white/80 font-semibold">Tier</th>
//                 <th className="text-left p-4 text-white/80 font-semibold">Status</th>
//                 <th className="text-right p-4 text-white/80 font-semibold">Sales</th>
//                 <th className="text-right p-4 text-white/80 font-semibold">Revenue</th>
//                 <th className="text-right p-4 text-white/80 font-semibold">Commission</th>
//                 <th className="text-right p-4 text-white/80 font-semibold">Owed</th>
//                 <th className="text-center p-4 text-white/80 font-semibold">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {affiliates.length === 0 ? (
//                 <tr>
//                   <td colSpan="9" className="text-center py-12 text-white/60">
//                     No affiliates yet. Create your first affiliate to get started!
//                   </td>
//                 </tr>
//               ) : (
//                 affiliates.map((affiliate) => (
//                   <tr key={affiliate._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
//                     <td className="p-4">
//                       <div className="text-white font-semibold">{affiliate.name}</div>
//                       <div className="text-white/60 text-sm">{affiliate.email}</div>
//                     </td>
//                     <td className="p-4">
//                       <code className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded font-mono text-sm">
//                         {affiliate.code}
//                       </code>
//                     </td>
//                     <td className="p-4">
//                       <span className={`px-3 py-1 rounded-lg text-sm border ${getTierColor(affiliate.tier)}`}>
//                         {affiliate.tier}
//                       </span>
//                     </td>
//                     <td className="p-4">
//                       <span className={`px-3 py-1 rounded-lg text-sm border ${getStatusColor(affiliate.status)}`}>
//                         {affiliate.status}
//                       </span>
//                     </td>
//                     <td className="p-4 text-right text-white font-semibold">{affiliate.totalSales}</td>
//                     <td className="p-4 text-right text-white font-semibold">${affiliate.totalRevenue.toLocaleString()}</td>
//                     <td className="p-4 text-right">
//                       <div className="text-white font-semibold">${affiliate.totalCommission.toFixed(2)}</div>
//                       <div className="text-white/60 text-sm">{affiliate.commissionRate}%</div>
//                     </td>
//                     <td className="p-4 text-right text-yellow-400 font-semibold">
//                       ${affiliate.unpaidCommission.toFixed(2)}
//                     </td>
//                     <td className="p-4">
//                       <div className="flex gap-2 justify-center">
//                         {affiliate.unpaidCommission > 0 && (
//                           <button
//                             onClick={() => handlePayCommission(affiliate._id, affiliate.unpaidCommission)}
//                             className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all text-sm"
//                             title="Pay commission"
//                           >
//                             💰 Pay
//                           </button>
//                         )}
//                         <button
//                           onClick={() => handleDeleteAffiliate(affiliate._id)}
//                           className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm"
//                           title="Delete affiliate"
//                         >
//                           🗑️
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Create Modal */}
//       {showCreateModal && (
//         <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(99,102,241,0.3)]">
//             <h2 className="text-2xl font-bold text-white mb-6">Create New Affiliate</h2>
//             <form onSubmit={handleCreateAffiliate} className="space-y-4">
//               <div>
//                 <label className="block text-white/80 mb-2 text-sm">Name</label>
//                 <input
//                   type="text"
//                   required
//                   value={newAffiliate.name}
//                   onChange={(e) => setNewAffiliate({ ...newAffiliate, name: e.target.value })}
//                   className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
//                   placeholder="John Doe"
//                 />
//               </div>
//               <div>
//                 <label className="block text-white/80 mb-2 text-sm">Email</label>
//                 <input
//                   type="email"
//                   required
//                   value={newAffiliate.email}
//                   onChange={(e) => setNewAffiliate({ ...newAffiliate, email: e.target.value })}
//                   className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
//                   placeholder="john@example.com"
//                 />
//               </div>
//               <div>
//                 <label className="block text-white/80 mb-2 text-sm">Affiliate Code</label>
//                 <input
//                   type="text"
//                   required
//                   value={newAffiliate.code}
//                   onChange={(e) => setNewAffiliate({ ...newAffiliate, code: e.target.value.toUpperCase() })}
//                   className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white font-mono focus:border-indigo-500 focus:outline-none uppercase"
//                   placeholder="JOHN10"
//                   maxLength={20}
//                 />
//               </div>
//               <div>
//                 <label className="block text-white/80 mb-2 text-sm">Commission Rate (%)</label>
//                 <input
//                   type="number"
//                   required
//                   min="0"
//                   max="100"
//                   step="0.5"
//                   value={newAffiliate.commissionRate}
//                   onChange={(e) => setNewAffiliate({ ...newAffiliate, commissionRate: parseFloat(e.target.value) })}
//                   className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
//                 />
//               </div>
//               <div className="flex gap-3 mt-6">
//                 <button
//                   type="button"
//                   onClick={() => setShowCreateModal(false)}
//                   className="flex-1 px-6 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all"
//                 >
//                   Create Affiliate
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
