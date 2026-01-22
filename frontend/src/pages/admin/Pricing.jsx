import { useState } from 'react';

export default function Pricing() {
  const [localShopCosts, setLocalShopCosts] = useState({
    tshirt: { base: 12, printing: 5, setup: 25 },
    hoodie: { base: 25, printing: 8, setup: 30 },
    tank: { base: 10, printing: 5, setup: 25 },
    sweatshirt: { base: 22, printing: 7, setup: 30 },
  });

  const [profitMargin, setProfitMargin] = useState(45); // percentage
  const [bulkDiscounts, setBulkDiscounts] = useState([
    { quantity: 10, discount: 10 },
    { quantity: 25, discount: 15 },
    { quantity: 50, discount: 20 },
  ]);

  const calculateRetailPrice = (baseCost, printingCost) => {
    const totalCost = baseCost + printingCost;
    const retailPrice = totalCost / (1 - profitMargin / 100);
    return retailPrice.toFixed(2);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          Pricing Management
        </h1>
        <p className="text-white/60">
          Manage costs from our local printing shop and configure pricing rules
        </p>
      </div>

      {/* Profit Margin Card */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Global Profit Margin
        </h2>
        <div className="flex items-center gap-6">
          <input
            type="range"
            min="10"
            max="70"
            value={profitMargin}
            onChange={(e) => setProfitMargin(Number(e.target.value))}
            className="flex-1 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-3xl font-bold text-white min-w-[100px] text-right">
            {profitMargin}%
          </div>
        </div>
        <p className="text-white/50 text-sm mt-2">
          This margin is applied to calculate retail prices from our costs
        </p>
      </div>

      {/* Local Shop Costs */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-2xl">🏪</span>
          Local Printing Shop Costs
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(localShopCosts).map(([product, costs]) => (
            <div
              key={product}
              className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-300"
            >
              <h3 className="text-lg font-bold text-white mb-4 capitalize">{product}</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-white/60 text-xs uppercase tracking-wide">Base Cost</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/40">$</span>
                    <input
                      type="number"
                      value={costs.base}
                      onChange={(e) => setLocalShopCosts({
                        ...localShopCosts,
                        [product]: { ...costs, base: Number(e.target.value) }
                      })}
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/40"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-xs uppercase tracking-wide">Printing</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/40">$</span>
                    <input
                      type="number"
                      value={costs.printing}
                      onChange={(e) => setLocalShopCosts({
                        ...localShopCosts,
                        [product]: { ...costs, printing: Number(e.target.value) }
                      })}
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/40"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-white/60 text-xs uppercase tracking-wide">Setup Fee</label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-white/40">$</span>
                    <input
                      type="number"
                      value={costs.setup}
                      onChange={(e) => setLocalShopCosts({
                        ...localShopCosts,
                        [product]: { ...costs, setup: Number(e.target.value) }
                      })}
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-white/40"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white/60 text-xs">Total Cost:</span>
                    <span className="text-white/80 font-semibold">
                      ${(costs.base + costs.printing).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/60 text-xs">Suggested Retail:</span>
                    <span className="text-green-400 font-bold text-lg">
                      ${calculateRetailPrice(costs.base, costs.printing)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk Discounts */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <span className="text-2xl">🎁</span>
          Bulk Order Discounts
        </h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          {bulkDiscounts.map((discount, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-300"
            >
              <div className="space-y-3">
                <div>
                  <label className="text-white/60 text-xs uppercase tracking-wide">Min Quantity</label>
                  <input
                    type="number"
                    value={discount.quantity}
                    onChange={(e) => {
                      const newDiscounts = [...bulkDiscounts];
                      newDiscounts[index].quantity = Number(e.target.value);
                      setBulkDiscounts(newDiscounts);
                    }}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white mt-1 focus:outline-none focus:border-white/40"
                  />
                </div>
                <div>
                  <label className="text-white/60 text-xs uppercase tracking-wide">Discount %</label>
                  <input
                    type="number"
                    value={discount.discount}
                    onChange={(e) => {
                      const newDiscounts = [...bulkDiscounts];
                      newDiscounts[index].discount = Number(e.target.value);
                      setBulkDiscounts(newDiscounts);
                    }}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white mt-1 focus:outline-none focus:border-white/40"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Future Printify Integration */}
      <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 backdrop-blur-md border border-purple-500/20 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🚀</span>
          Future: Printify Integration
        </h2>
        <p className="text-white/70 mb-4">
          Ready to scale? Connect Printify for automated fulfillment and expanded product catalog.
        </p>
        <button className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300 opacity-50 cursor-not-allowed">
          Connect Printify (Coming Soon)
        </button>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button className="px-8 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300">
          Cancel
        </button>
        <button className="px-8 py-3 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all duration-300 shadow-lg">
          Save Pricing Rules
        </button>
      </div>
    </div>
  );
}
