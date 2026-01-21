import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Affiliates() {
  const [affiliates, setAffiliates] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAffiliate, setNewAffiliate] = useState({
    name: '',
    email: '',
    code: '',
    commissionRate: 10
  });

  useEffect(() => {
    fetchAffiliates();
    fetchStats();
  }, []);

  const fetchAffiliates = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/affiliates');
      if (response.ok) {
        const data = await response.json();
        setAffiliates(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching affiliates:', error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/affiliates/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateAffiliate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/api/affiliates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAffiliate)
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewAffiliate({ name: '', email: '', code: '', commissionRate: 10 });
        fetchAffiliates();
        fetchStats();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to create affiliate');
      }
    } catch (error) {
      console.error('Error creating affiliate:', error);
      alert('Failed to create affiliate');
    }
  };

  const handleDeleteAffiliate = async (id) => {
    if (!confirm('Are you sure you want to delete this affiliate?')) return;

    try {
      const response = await fetch(`http://localhost:5001/api/affiliates/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchAffiliates();
        fetchStats();
      }
    } catch (error) {
      console.error('Error deleting affiliate:', error);
    }
  };

  const handlePayCommission = async (id, amount) => {
    try {
      const response = await fetch(`http://localhost:5001/api/affiliates/pay/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount })
      });

      if (response.ok) {
        fetchAffiliates();
        fetchStats();
        alert('Commission payment recorded successfully!');
      }
    } catch (error) {
      console.error('Error paying commission:', error);
    }
  };

  const getTierColor = (tier) => {
    const colors = {
      Bronze: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
      Silver: 'bg-gray-400/20 text-gray-300 border-gray-400/40',
      Gold: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
      Platinum: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
    };
    return colors[tier] || colors.Bronze;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-500/20 text-green-400 border-green-500/40',
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
      inactive: 'bg-gray-500/20 text-gray-400 border-gray-500/40',
      suspended: 'bg-red-500/20 text-red-400 border-red-500/40'
    };
    return colors[status] || colors.active;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading affiliates...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-5xl font-bold text-white mb-2 tracking-wider drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            🤝 Affiliate Management
          </h1>
          <p className="text-white/70 text-lg">
            Managing affiliate partners and track their performance
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/affiliates/sales-report"
            className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-indigo-500/50 text-white rounded-xl font-semibold transition-all duration-300"
          >
            📊 Sales Report
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#1c1e32] to-indigo-900 text-white rounded-xl font-semibold hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300"
          >
            + Create New Affiliate
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <div className="text-white/60 text-sm mb-1">Total Affiliates</div>
          <div className="text-3xl font-bold text-white">{stats.totalAffiliates || 0}</div>
          <div className="text-green-400 text-sm mt-1">{stats.activeAffiliates || 0} active</div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <div className="text-white/60 text-sm mb-1">Total Revenue</div>
          <div className="text-3xl font-bold text-white">${(stats.totalRevenue || 0).toLocaleString()}</div>
          <div className="text-white/60 text-sm mt-1">{stats.totalSales || 0} sales</div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <div className="text-white/60 text-sm mb-1">Commission Owed</div>
          <div className="text-3xl font-bold text-yellow-400">${(stats.unpaidCommission || 0).toLocaleString()}</div>
          <div className="text-white/60 text-sm mt-1">Unpaid balance</div>
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          <div className="text-white/60 text-sm mb-1">Avg Conversion</div>
          <div className="text-3xl font-bold text-white">{stats.conversionRate || 0}%</div>
          <div className="text-white/60 text-sm mt-1">{stats.totalClicks || 0} clicks</div>
        </div>
      </div>

      {/* Affiliates Table */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="text-left p-4 text-white/80 font-semibold">Affiliate</th>
                <th className="text-left p-4 text-white/80 font-semibold">Code</th>
                <th className="text-left p-4 text-white/80 font-semibold">Tier</th>
                <th className="text-left p-4 text-white/80 font-semibold">Status</th>
                <th className="text-right p-4 text-white/80 font-semibold">Sales</th>
                <th className="text-right p-4 text-white/80 font-semibold">Revenue</th>
                <th className="text-right p-4 text-white/80 font-semibold">Commission</th>
                <th className="text-right p-4 text-white/80 font-semibold">Owed</th>
                <th className="text-center p-4 text-white/80 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {affiliates.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-12 text-white/60">
                    No affiliates yet. Create your first affiliate to get started!
                  </td>
                </tr>
              ) : (
                affiliates.map((affiliate) => (
                  <tr key={affiliate._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="text-white font-semibold">{affiliate.name}</div>
                      <div className="text-white/60 text-sm">{affiliate.email}</div>
                    </td>
                    <td className="p-4">
                      <code className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded font-mono text-sm">
                        {affiliate.code}
                      </code>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-lg text-sm border ${getTierColor(affiliate.tier)}`}>
                        {affiliate.tier}
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
                      <div className="text-white/60 text-sm">{affiliate.commissionRate}%</div>
                    </td>
                    <td className="p-4 text-right text-yellow-400 font-semibold">
                      ${affiliate.unpaidCommission.toFixed(2)}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-center">
                        {affiliate.unpaidCommission > 0 && (
                          <button
                            onClick={() => handlePayCommission(affiliate._id, affiliate.unpaidCommission)}
                            className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all text-sm"
                            title="Pay commission"
                          >
                            💰 Pay
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAffiliate(affiliate._id)}
                          className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm"
                          title="Delete affiliate"
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-black border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(99,102,241,0.3)]">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Affiliate</h2>
            <form onSubmit={handleCreateAffiliate} className="space-y-4">
              <div>
                <label className="block text-white/80 mb-2 text-sm">Name</label>
                <input
                  type="text"
                  required
                  value={newAffiliate.name}
                  onChange={(e) => setNewAffiliate({ ...newAffiliate, name: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2 text-sm">Email</label>
                <input
                  type="email"
                  required
                  value={newAffiliate.email}
                  onChange={(e) => setNewAffiliate({ ...newAffiliate, email: e.target.value })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-indigo-500 focus:outline-none"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2 text-sm">Affiliate Code</label>
                <input
                  type="text"
                  required
                  value={newAffiliate.code}
                  onChange={(e) => setNewAffiliate({ ...newAffiliate, code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white font-mono focus:border-indigo-500 focus:outline-none uppercase"
                  placeholder="JOHN10"
                  maxLength={20}
                />
              </div>
              <div>
                <label className="block text-white/80 mb-2 text-sm">Commission Rate (%)</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="100"
                  step="0.5"
                  value={newAffiliate.commissionRate}
                  onChange={(e) => setNewAffiliate({ ...newAffiliate, commissionRate: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-white focus:border-indigo-800 focus:outline-none"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-6 py-3 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-black to-[#404697] text-white rounded-lg font-semibold hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all"
                >
                  Create Affiliate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
