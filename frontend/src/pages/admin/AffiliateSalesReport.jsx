import { useState, useEffect } from 'react';
import { API_URL } from '../../config';

export default function AffiliateSalesReport() {
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAffiliates, setExpandedAffiliates] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSalesReport();
  }, []);

  const fetchSalesReport = async () => {
    try {
      const response = await fetch(`${API_URL}/api/affiliates/sales-report`);
      const data = await response.json();
      setReportData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sales report:', error);
      setLoading(false);
    }
  };

  const toggleAffiliate = (code) => {
    const newExpanded = new Set(expandedAffiliates);
    if (newExpanded.has(code)) {
      newExpanded.delete(code);
    } else {
      newExpanded.add(code);
    }
    setExpandedAffiliates(newExpanded);
  };

  const filteredData = reportData.filter(affiliate =>
    affiliate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    affiliate.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTierColor = (tier) => {
    const colors = {
      Trail: 'bg-emerald-900/30 text-emerald-400 border-emerald-700',
      Ridge: 'bg-teal-800/30 text-teal-400 border-teal-600',
      Peak: 'bg-sky-900/30 text-sky-400 border-sky-700',
      Summit: 'bg-slate-700/30 text-slate-300 border-slate-500'
    };
    return colors[tier] || colors.Trail;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-white text-xl">Loading sales report...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#e6e7ea] bg-clip-text text-transparent">
          Affiliate Sales Report
        </h1>
        <p className="text-white/60">Detailed breakdown of products sold by each affiliate</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by affiliate name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Report List */}
      {filteredData.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/60 text-lg">No sales data found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredData.map((affiliate) => (
            <div
              key={affiliate.code}
              className="bg-white/5 border border-white/10 rounded-lg overflow-hidden hover:border-[#333] transition-all"
            >
              {/* Affiliate Header */}
              <div
                onClick={() => toggleAffiliate(affiliate.code)}
                className="p-6 cursor-pointer hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    {/* Expand Icon */}
                    <div className="text-indigo-400">
                      {expandedAffiliates.has(affiliate.code) ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>

                    {/* Affiliate Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{affiliate.name}</h3>
                        <code className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded text-sm font-mono">
                          {affiliate.code}
                        </code>
                        <span className={'px-2 py-1 rounded text-xs border ' + getTierColor(affiliate.tier)}>
                          {affiliate.tier}
                        </span>
                      </div>
                      <div className="flex gap-6 text-sm text-white/60">
                        <span>{affiliate.products.length} Product{affiliate.products.length !== 1 ? 's' : ''}</span>
                        <span>{affiliate.totalOrders} Order{affiliate.totalOrders !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-8 text-right">
                      <div>
                        <div className="text-sm text-white/60">Revenue</div>
                        <div className="text-2xl font-bold text-white">
                          ${affiliate.totalRevenue.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-white/60">Commission</div>
                        <div className="text-2xl font-bold text-indigo-400">
                          ${affiliate.totalCommission.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products List (Expanded) */}
              {expandedAffiliates.has(affiliate.code) && (
                <div className="border-t border-white/10 bg-black/20">
                  <div className="p-6">
                    <h4 className="text-sm font-semibold text-white/60 uppercase tracking-wide mb-4">
                      Products Sold
                    </h4>
                    <div className="space-y-3">
                      {affiliate.products.map((product, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-4 p-4 bg-white/5 rounded-lg border border-white/10 hover:border-indigo-500/30 transition-colors"
                        >
                          {/* Product Image */}
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded-lg border border-white/10"
                            />
                          )}

                          {/* Product Info */}
                          <div className="flex-1">
                            <h5 className="font-semibold text-white mb-1">{product.name}</h5>
                            <div className="flex gap-4 text-sm text-white/60">
                              <span>{product.totalQuantity} unit{product.totalQuantity !== 1 ? 's' : ''} sold</span>
                              <span>•</span>
                              <span>{product.orders} order{product.orders !== 1 ? 's' : ''}</span>
                            </div>
                          </div>

                          {/* Product Revenue */}
                          <div className="text-right">
                            <div className="text-xs text-white/60 mb-1">Product Revenue</div>
                            <div className="text-xl font-bold text-white">
                              ${product.totalRevenue.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      {filteredData.length > 0 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border border-indigo-500/30 rounded-lg">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm text-white/60 mb-1">Total Affiliates</div>
              <div className="text-2xl font-bold text-white">{filteredData.length}</div>
            </div>
            <div>
              <div className="text-sm text-white/60 mb-1">Total Orders</div>
              <div className="text-2xl font-bold text-white">
                {filteredData.reduce((sum, a) => sum + a.totalOrders, 0)}
              </div>
            </div>
            <div>
              <div className="text-sm text-white/60 mb-1">Total Revenue</div>
              <div className="text-2xl font-bold text-white">
                ${filteredData.reduce((sum, a) => sum + a.totalRevenue, 0).toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-sm text-white/60 mb-1">Total Commission</div>
              <div className="text-2xl font-bold text-indigo-400">
                ${filteredData.reduce((sum, a) => sum + a.totalCommission, 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
