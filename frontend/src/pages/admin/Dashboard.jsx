import { useState, useEffect } from "react";
import { API_URL } from "../../config";

export default function Dashboard() {
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    averageOrderValue: 0,
    pendingOrders: 0,
    processingOrders: 0,
    completedOrders: 0,
    statusBreakdown: {},
    recentOrders: []
  });
  const [affiliateStats, setAffiliateStats] = useState({
    totalAffiliates: 0,
    activeAffiliates: 0,
    totalSales: 0,
    totalRevenue: 0,
    unpaidCommission: 0,
    conversionRate: 0,
    tierBreakdown: {
      Trail: 0,
      Ridge: 0,
      Peak: 0,
      Summit: 0
    }
  });
  const [topAffiliates, setTopAffiliates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    fetchAffiliateData();
  }, []);

  const fetchAffiliateData = async () => {
    try {
      const [statsRes, topRes] = await Promise.all([
        fetch(`${API_URL}/api/affiliates/stats`),
        fetch(`${API_URL}/api/affiliates/top?limit=5`)
      ]);
      
      if (statsRes.ok) {
        const stats = await statsRes.json();
        setAffiliateStats(stats);
      }
      
      if (topRes.ok) {
        const top = await topRes.json();
        setTopAffiliates(top);
      }
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      // Mock data for now - replace with actual API call
      const mockData = {
        totalOrders: 326,
        totalRevenue: 12430,
        monthlyRevenue: 3250,
        averageOrderValue: 38.13,
        pendingOrders: 12,
        processingOrders: 8,
        completedOrders: 306,
        statusBreakdown: {
          'Pending': 12,
          'Processing': 5,
          'Sent to Supplier': 3,
          'In Production': 8,
          'Shipped': 15,
          'Delivered': 283
        },
        recentOrders: []
      };
      setAnalytics(mockData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const goals = [
    { label: 'Monthly Revenue Goal', current: analytics.monthlyRevenue, target: 5000, color: 'from-green-500 to-emerald-600' },
    { label: 'Orders This Month', current: analytics.pendingOrders + analytics.processingOrders, target: 50, color: 'from-blue-500 to-cyan-600' },
    { label: 'Customer Satisfaction', current: 94, target: 95, color: 'from-purple-500 to-pink-600' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-5xl font-bold text-white mb-2 tracking-wider drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          HNA Admin Dashboard
        </h1>
        <p className="text-white/70 text-lg">
          Our dashboard tracks performance, manage orders, etc. 
        </p>
      </div>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="Total Revenue" 
          value={`$${analytics.totalRevenue.toLocaleString()}`}
          icon="💰"
          trend="+12.5%"
          trendUp={true}
        />
        <MetricCard 
          title="Total Orders" 
          value={analytics.totalOrders}
          icon="📦"
          trend="+8.3%"
          trendUp={true}
        />
        <MetricCard 
          title="Avg Order Value" 
          value={`$${analytics.averageOrderValue.toFixed(2)}`}
          icon="💳"
          trend="+3.2%"
          trendUp={true}
        />
        <MetricCard 
          title="Pending Orders" 
          value={analytics.pendingOrders}
          icon="⏳"
          trend={`${analytics.processingOrders} processing`}
          trendUp={false}
        />
      </div>

      {/* Goals Progress */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4 tracking-wide">Goals & Targets</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {goals.map((goal, index) => (
            <GoalCard key={index} goal={goal} />
          ))}
        </div>
      </div>

      {/* Order Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all duration-500">
          <h2 className="text-2xl font-bold text-white mb-6">Order Status</h2>
          <div className="space-y-4">
            {Object.entries(analytics.statusBreakdown).map(([status, count]) => (
              <StatusBar key={status} status={status} count={count} total={analytics.totalOrders} />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all duration-500">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <QuickActionButton icon="📋" label="View All Orders" href="/admin/orders" />
            <QuickActionButton icon="➕" label="Create New Order" href="/admin/orders?action=create" />
            <QuickActionButton icon="📊" label="View Products" href="/admin/products" />
            <QuickActionButton icon="🚀" label="Send to Suppliers" href="/admin/orders?filter=pending" />
            <QuickActionButton icon="💵" label="Pricing Rules" href="/admin/pricing" />
          </div>
        </div>
      </div>

      {/* Supplier Integration Status */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all duration-500 mb-8">
        <h2 className="text-2xl font-bold text-white mb-6">Print-on-Demand Supplier Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SupplierStatus name="Printful" status="Connected" ordersInQueue={3} />
          <SupplierStatus name="Printify" status="Connected" ordersInQueue={5} />
          <SupplierStatus name="Custom POD" status="Ready" ordersInQueue={0} />
        </div>
      </div>

      {/* Affiliate Program Management */}
      {/* from-purple-500/10 to-indigo-500/10 */}
      <div className="bg-gradient-to-br  bg-blue-300/20 backdrop-blur-md border border-indigo-500/20 rounded-2xl p-6 hover:border-indigo-500/40 transition-all duration-500">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="text-3xl">🤝</span>
            Affiliate Program
          </h2>
          <a 
            href="/admin/affiliates"
            className="px-6 py-2 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 rounded-xl hover:bg-indigo-500/30 transition-all duration-300 font-semibold"
          >
            Manage Affiliates
          </a>
        </div>

        {/* Affiliate Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-white/60 text-sm mb-1">Active Affiliates</div>
            <div className="text-3xl font-bold text-white">{affiliateStats.activeAffiliates}</div>
            <div className="text-green-400 text-sm mt-1">Total: {affiliateStats.totalAffiliates}</div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-white/60 text-sm mb-1">Commission Owed</div>
            <div className="text-3xl font-bold text-white">${affiliateStats.unpaidCommission.toLocaleString()}</div>
            <div className="text-white/60 text-sm mt-1">Due this month</div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-white/60 text-sm mb-1">Affiliate Sales</div>
            <div className="text-3xl font-bold text-white">${affiliateStats.totalRevenue.toLocaleString()}</div>
            <div className="text-green-400 text-sm mt-1">{affiliateStats.totalSales} total sales</div>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="text-white/60 text-sm mb-1">Conversion Rate</div>
            <div className="text-3xl font-bold text-white">{affiliateStats.conversionRate}%</div>
            <div className="text-white/60 text-sm mt-1">Industry avg: 2.5%</div>
          </div>
        </div>

        {/* Affiliate Tiers */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-4">Commission Tiers</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <AffiliateTier 
              name="Trail"
              commission="10%"
              requirement="0-19 sales"
              affiliates={affiliateStats.tierBreakdown.Trail}
              color="from-emerald-600 to-emerald-700"
              image="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80"
            />
            <AffiliateTier 
              name="Ridge"
              commission="12%"
              requirement="20-49 sales"
              affiliates={affiliateStats.tierBreakdown.Ridge}
              color="from-teal-500 to-teal-600"
              image="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
            />
            <AffiliateTier 
              name="Peak"
              commission="15%"
              requirement="50-99 sales"
              affiliates={affiliateStats.tierBreakdown.Peak}
              color="from-sky-500 to-sky-600"
              image="https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=800&q=80"
            />
            <AffiliateTier 
              name="Summit"
              commission="20%"
              requirement="100+ sales"
              affiliates={affiliateStats.tierBreakdown.Summit}
              color="from-slate-300 to-slate-400"
              image="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80"
            />
          </div>
        </div>

        {/* Top Performers */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white mb-4">Top Performers This Month</h3>
          <div className="space-y-2">
            {topAffiliates.length > 0 ? (
              topAffiliates.map((affiliate) => (
                <TopAffiliate 
                  key={affiliate._id}
                  name={affiliate.name} 
                  sales={affiliate.totalSales} 
                  revenue={affiliate.totalRevenue} 
                  tier={affiliate.tier} 
                />
              ))
            ) : (
              <div className="text-white/60 text-center py-4">No affiliate data yet. Create your first affiliate to get started!</div>
            )}
          </div>
        </div>

        {/* Affiliate Tools & Resources */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span>🔗</span>
              Tracking & Links
            </h4>
            <ul className="space-y-2 text-white/70 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400">✓</span>
                <span>Unique tracking links for each affiliate</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400">✓</span>
                <span>Real-time click and conversion tracking</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400">✓</span>
                <span>Automated commission calculations</span>
              </li>
            </ul>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
              <span>💸</span>
              Payment & Support
            </h4>
            <ul className="space-y-2 text-white/70 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-indigo-400">✓</span>
                <span>Multiple payment options (PayPal, bank transfer)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400">✓</span>
                <span>Monthly commission payouts</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-indigo-400">✓</span>
                <span>Dedicated affiliate support team</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components
function MetricCard({ title, value, icon, trend, trendUp }) {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500">
      <div className="flex justify-between items-start mb-4">
        <span className="text-4xl">{icon}</span>
        <span className={`text-sm px-2 py-1 rounded-lg ${trendUp ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'}`}>
          {trend}
        </span>
      </div>
      <h3 className="text-white/70 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function GoalCard({ goal }) {
  const percentage = Math.min((goal.current / goal.target) * 100, 100);
  
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all duration-500">
      <h3 className="text-white font-semibold mb-3">{goal.label}</h3>
      <div className="flex justify-between items-center mb-2">
        <span className="text-2xl font-bold text-white">{typeof goal.current === 'number' && goal.current < 100 ? goal.current.toFixed(0) : goal.current.toLocaleString()}</span>
        <span className="text-white/60">/ {goal.target.toLocaleString()}</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${goal.color} transition-all duration-1000 rounded-full shadow-lg`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="text-white/60 text-sm mt-2">{percentage.toFixed(1)}% complete</p>
    </div>
  );
}

function StatusBar({ status, count, total }) {
  const percentage = (count / total) * 100;
  const colors = {
    'Pending': 'bg-yellow-500',
    'Processing': 'bg-blue-500',
    'Sent to Supplier': 'bg-purple-500',
    'In Production': 'bg-orange-500',
    'Shipped': 'bg-cyan-500',
    'Delivered': 'bg-green-500',
    'Cancelled': 'bg-red-500'
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-white/80">{status}</span>
        <span className="text-white font-semibold">{count}</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
        <div 
          className={`h-full ${colors[status] || 'bg-gray-500'} transition-all duration-700`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}

function QuickActionButton({ icon, label, href }) {
  return (
    <a 
      href={href}
      className="flex items-center space-x-3 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all duration-300 group"
    >
      <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{icon}</span>
      <span className="text-white font-medium">{label}</span>
      <span className="ml-auto text-white/40 group-hover:text-white/80 transition-colors">→</span>
    </a>
  );
}

function SupplierStatus({ name, status, ordersInQueue }) {
  const isConnected = status === 'Connected' || status === 'Ready';
  
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-white/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-semibold">{name}</h3>
        <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
      </div>
      <p className="text-white/60 text-sm mb-1">{status}</p>
      <p className="text-white/80 text-sm">Queue: {ordersInQueue} orders</p>
    </div>
  );
}

function AffiliateTier({ name, commission, requirement, affiliates, color, image }) {
  return (
    <div className="relative rounded-xl p-4 border border-white/20 overflow-hidden group hover:scale-105 transition-transform duration-300">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity duration-300"
        style={{ backgroundImage: `url(${image})` }}
      />
      
      {/* Glassmorphism Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${color} backdrop-blur-sm`} />
      
      {/* Content */}
      <div className="relative z-10">
        <h4 className="text-white font-bold text-lg mb-1 drop-shadow-lg">{name}</h4>
        <div className="text-white text-2xl font-bold mb-2 drop-shadow-lg">{commission}</div>
        <div className="text-white/90 text-sm mb-3 drop-shadow-md">{requirement}</div>
        <div className="text-white/95 text-sm drop-shadow-md">
          <span className="font-semibold">{affiliates}</span> affiliates
        </div>
      </div>
    </div>
  );
}

function TopAffiliate({ name, sales, revenue, tier }) {
  const tierColors = {
    'Trail': 'text-emerald-400',
    'Ridge': 'text-teal-400',
    'Peak': 'text-sky-400',
    'Summit': 'text-slate-300'
  };
  
  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-black to-[#46454f] rounded-full flex items-center justify-center text-white font-bold">
            {name.charAt(0)}
          </div>
          <div>
            <div className="text-white font-semibold">{name}</div>
            <div className={`text-sm ${tierColors[tier]}`}>{tier} Tier</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-white font-bold">{sales} sales</div>
          <div className="text-green-400 text-sm">${revenue.toLocaleString()}</div>
        </div>
      </div>
    </div>
  );
}
