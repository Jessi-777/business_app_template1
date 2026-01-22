import { useState, useEffect, useRef } from "react";
import { API_URL } from "../../config";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'create'
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, price: 0, image: '' });
  const [itemImagePreview, setItemImagePreview] = useState(null);
  const [itemImageFile, setItemImageFile] = useState(null);
  const previousOrderCountRef = useRef(0);

  // Cash register sound effect
  const playNewOrderSound = () => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create a more realistic cash register sound
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
    
    // Cash register "cha-ching" sound
    playTone(800, now, 0.05, 0.3);
    playTone(1000, now + 0.05, 0.05, 0.3);
    playTone(1200, now + 0.1, 0.15, 0.4);
    
    // Bell ding
    playTone(2000, now + 0.25, 0.3, 0.2);
  };

  useEffect(() => {
    fetchOrders();
    
    // Poll for new orders every 10 seconds
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, filterStatus, searchTerm]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/api/orders`);
      const data = await response.json();
      
      // Check for new orders and play sound
      if (previousOrderCountRef.current > 0 && data.length > previousOrderCountRef.current) {
        playNewOrderSound();
      }
      previousOrderCountRef.current = data.length;
      
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(order => order.status === filterStatus);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredOrders(filtered);
  };

  const handleCreateOrder = () => {
    setSelectedOrder({
      orderNumber: `HNA-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      customer: { name: '', email: '', address: '', city: '', zipCode: '', country: '' },
      items: [],
      totalPrice: 0,
      status: 'Pending',
      paymentStatus: 'Pending',
      priority: 'Medium'
    });
    setNewItem({ name: '', quantity: 1, price: 0, image: '' });
    setItemImagePreview(null);
    setItemImageFile(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEditOrder = (order) => {
    setSelectedOrder({ ...order });
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setOrders(orders.filter(o => o._id !== orderId));
          alert('Order deleted successfully');
        } else {
          alert('Error deleting order');
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        alert('Error deleting order');
      }
    }
  };

  const handleSendToSupplier = async (order) => {
    if (window.confirm(`Send order ${order.orderNumber} to supplier?`)) {
      try {
        const response = await fetch(`${API_URL}/api/orders/${order._id}/send-to-supplier`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ supplier: 'Printful' })
        });
        
        if (response.ok) {
          const updatedOrder = await response.json();
          setOrders(orders.map(o => o._id === order._id ? updatedOrder : o));
          alert('Order sent to supplier successfully');
        } else {
          alert('Error sending order to supplier');
        }
      } catch (error) {
        console.error('Error sending order to supplier:', error);
        alert('Error sending order to supplier');
      }
    }
  };

  const handleItemImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setItemImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setItemImagePreview(reader.result);
        setNewItem({ ...newItem, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = () => {
    if (!newItem.name || newItem.price <= 0 || newItem.quantity <= 0) {
      alert('Please fill in all item fields');
      return;
    }
    
    const item = {
      ...newItem,
      image: itemImagePreview || '/assets/placeholder.png'
    };
    
    const updatedItems = [...selectedOrder.items, item];
    const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    setSelectedOrder({
      ...selectedOrder,
      items: updatedItems,
      totalPrice: total
    });
    
    // Reset form
    setNewItem({ name: '', quantity: 1, price: 0, image: '' });
    setItemImagePreview(null);
    setItemImageFile(null);
  };

  const handleRemoveItem = (index) => {
    const updatedItems = selectedOrder.items.filter((_, i) => i !== index);
    const total = updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    setSelectedOrder({
      ...selectedOrder,
      items: updatedItems,
      totalPrice: total
    });
  };

  const handleSaveOrder = async () => {
    try {
      if (selectedOrder.items.length === 0) {
        alert('Please add at least one item to the order');
        return;
      }
      
      if (modalMode === 'create') {
        const response = await fetch(`${API_URL}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selectedOrder)
        });
        
        if (response.ok) {
          const newOrder = await response.json();
          setOrders([newOrder, ...orders]);
          alert('Order created successfully');
        } else {
          const error = await response.json();
          alert(`Error: ${error.message || 'Failed to create order'}`);
          return;
        }
      } else if (modalMode === 'edit') {
        const response = await fetch(`${API_URL}/api/orders/${selectedOrder._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selectedOrder)
        });
        
        if (response.ok) {
          const updatedOrder = await response.json();
          setOrders(orders.map(o => o._id === selectedOrder._id ? updatedOrder : o));
          alert('Order updated successfully');
        } else {
          const error = await response.json();
          alert(`Error: ${error.message || 'Failed to update order'}`);
          return;
        }
      }
      setShowModal(false);
      setNewItem({ name: '', quantity: 1, price: 0, image: '' });
      setItemImagePreview(null);
      setItemImageFile(null);
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Error saving order');
    }
  };

  const statusOptions = ['Pending', 'Processing', 'Sent to Supplier', 'In Production', 'Shipped', 'Delivered', 'Cancelled'];
  const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-5xl font-bold text-white mb-2 tracking-wider drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            Order Management
          </h1>
          <p className="text-white/70 text-lg">Create, update, and manage all orders</p>
        </div>
        <button
          onClick={handleCreateOrder}
          className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all duration-300 shadow-lg hover:scale-105"
        >
          + Create New Order
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-white/70 text-sm mb-2 block">Search Orders</label>
            <input
              type="text"
              placeholder="Search by order number, customer name, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/40"
            />
          </div>
          <div>
            <label className="text-white/70 text-sm mb-2 block">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/40"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/10 border-b border-white/10">
              <tr>
                <th className="text-left p-4 text-white font-semibold">Order #</th>
                <th className="text-left p-4 text-white font-semibold">Customer</th>
                <th className="text-left p-4 text-white font-semibold">Items</th>
                <th className="text-left p-4 text-white font-semibold">Total</th>
                <th className="text-left p-4 text-white font-semibold">Affiliate</th>
                <th className="text-left p-4 text-white font-semibold">Status</th>
                <th className="text-left p-4 text-white font-semibold">Priority</th>
                <th className="text-left p-4 text-white font-semibold">Date</th>
                <th className="text-left p-4 text-white font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-white/90 font-mono text-sm">{order.orderNumber}</td>
                  <td className="p-4">
                    <div className="text-white">{order.customer.name}</div>
                    <div className="text-white/60 text-sm">{order.customer.email}</div>
                  </td>
                  <td className="p-4 text-white/80">{order.items.length} item(s)</td>
                  <td className="p-4 text-white font-semibold">${order.totalPrice}</td>
                  <td className="p-4">
                    {order.affiliate?.code ? (
                      <div className="flex flex-col">
                        <code className="text-indigo-400 font-mono text-sm">{order.affiliate.code}</code>
                        <span className="text-white/60 text-xs">${order.affiliate.commission?.toFixed(2) || '0.00'}</span>
                        {order.affiliate.commissionPaid && (
                          <span className="text-green-400 text-xs">✓ Paid</span>
                        )}
                      </div>
                    ) : (
                      <span className="text-white/40 text-sm">-</span>
                    )}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="p-4">
                    <PriorityBadge priority={order.priority} />
                  </td>
                  <td className="p-4 text-white/70 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all text-sm"
                        title="View"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => handleEditOrder(order)}
                        className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all text-sm"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      {order.status === 'Pending' && (
                        <button
                          onClick={() => handleSendToSupplier(order)}
                          className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-all text-sm"
                          title="Send to Supplier"
                        >
                          🚀
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteOrder(order._id)}
                        className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm"
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-white/60">
            No orders found matching your criteria
          </div>
        )}
      </div>

      {/* Order Modal */}
      {showModal && (
        <OrderModal
          order={selectedOrder}
          mode={modalMode}
          onClose={() => {
            setShowModal(false);
            setNewItem({ name: '', quantity: 1, price: 0, image: '' });
            setItemImagePreview(null);
            setItemImageFile(null);
          }}
          onSave={handleSaveOrder}
          onChange={setSelectedOrder}
          statusOptions={statusOptions}
          priorityOptions={priorityOptions}
          newItem={newItem}
          onNewItemChange={setNewItem}
          itemImagePreview={itemImagePreview}
          onItemImageChange={handleItemImageChange}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
        />
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    'Pending': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'Processing': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Sent to Supplier': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'In Production': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Shipped': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'Delivered': 'bg-green-500/20 text-green-400 border-green-500/30',
    'Cancelled': 'bg-red-500/20 text-red-400 border-red-500/30'
  };
  
  return (
    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${colors[status] || 'bg-gray-500/20 text-gray-400'}`}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const colors = {
    'Low': 'bg-gray-500/20 text-gray-400',
    'Medium': 'bg-blue-500/20 text-blue-400',
    'High': 'bg-orange-500/20 text-orange-400',
    'Urgent': 'bg-red-500/20 text-red-400'
  };
  
  return (
    <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${colors[priority]}`}>
      {priority}
    </span>
  );
}

function OrderModal({ order, mode, onClose, onSave, onChange, statusOptions, priorityOptions, newItem, onNewItemChange, itemImagePreview, onItemImageChange, onAddItem, onRemoveItem }) {
  const isViewMode = mode === 'view';
  const title = mode === 'create' ? 'Create New Order' : mode === 'edit' ? 'Edit Order' : 'Order Details';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-black border-b border-white/10 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl">×</button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Order Number */}
          <div>
            <label className="text-white/70 text-sm mb-2 block">Order Number</label>
            <input
              type="text"
              value={order.orderNumber}
              disabled
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white/60"
            />
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Customer Name</label>
              <input
                type="text"
                value={order.customer.name}
                onChange={(e) => onChange({ ...order, customer: { ...order.customer, name: e.target.value }})}
                disabled={isViewMode}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm mb-2 block">Email</label>
              <input
                type="email"
                value={order.customer.email}
                onChange={(e) => onChange({ ...order, customer: { ...order.customer, email: e.target.value }})}
                disabled={isViewMode}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white disabled:opacity-50"
              />
            </div>
          </div>

          <div>
            <label className="text-white/70 text-sm mb-2 block">Address</label>
            <input
              type="text"
              value={order.customer.address}
              onChange={(e) => onChange({ ...order, customer: { ...order.customer, address: e.target.value }})}
              disabled={isViewMode}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">City</label>
              <input
                type="text"
                value={order.customer.city}
                onChange={(e) => onChange({ ...order, customer: { ...order.customer, city: e.target.value }})}
                disabled={isViewMode}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm mb-2 block">Zip Code</label>
              <input
                type="text"
                value={order.customer.zipCode}
                onChange={(e) => onChange({ ...order, customer: { ...order.customer, zipCode: e.target.value }})}
                disabled={isViewMode}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-white/70 text-sm mb-2 block">Country</label>
              <input
                type="text"
                value={order.customer.country}
                onChange={(e) => onChange({ ...order, customer: { ...order.customer, country: e.target.value }})}
                disabled={isViewMode}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white disabled:opacity-50"
              />
            </div>
          </div>

          {/* Order Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Status</label>
              <select
                value={order.status}
                onChange={(e) => onChange({ ...order, status: e.target.value })}
                disabled={isViewMode}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white disabled:opacity-50"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-white/70 text-sm mb-2 block">Priority</label>
              <select
                value={order.priority}
                onChange={(e) => onChange({ ...order, priority: e.target.value })}
                disabled={isViewMode}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white disabled:opacity-50"
              >
                {priorityOptions.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Items */}
          <div>
            <label className="text-white/70 text-sm mb-2 block">Order Items</label>
            
            {/* Add New Item Form - Only in create/edit mode */}
            {!isViewMode && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-4">
                <h4 className="text-white font-semibold mb-3">Add Item to Order</h4>
                
                {/* Item Image Upload */}
                <div className="mb-4">
                  <label className="text-white/70 text-sm mb-2 block">Item Image</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-24 h-24 bg-white/5 border border-white/20 rounded-lg overflow-hidden flex-shrink-0">
                      {itemImagePreview ? (
                        <img src={itemImagePreview} alt="Item preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/40 text-xs text-center p-2">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={onItemImageChange}
                        className="hidden"
                        id="item-image-upload"
                      />
                      <label
                        htmlFor="item-image-upload"
                        className="inline-block px-4 py-2 bg-white/10 border border-white/20 text-white text-sm rounded-lg hover:bg-white/20 cursor-pointer transition-all"
                      >
                        📷 Choose Image
                      </label>
                      <p className="text-white/50 text-xs mt-1">Add product image so customer knows what they're purchasing</p>
                    </div>
                  </div>
                </div>

                {/* Item Details */}
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="col-span-3">
                    <label className="text-white/70 text-xs mb-1 block">Item Name *</label>
                    <input
                      type="text"
                      value={newItem.name}
                      onChange={(e) => onNewItemChange({ ...newItem, name: e.target.value })}
                      placeholder="Enter item name"
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-white/70 text-xs mb-1 block">Quantity *</label>
                    <input
                      type="number"
                      min="1"
                      value={newItem.quantity}
                      onChange={(e) => onNewItemChange({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-white/70 text-xs mb-1 block">Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newItem.price}
                      onChange={(e) => onNewItemChange({ ...newItem, price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={onAddItem}
                      className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all font-semibold text-sm"
                    >
                      + Add Item
                    </button>
                  </div>
                </div>
                
                {newItem.quantity > 0 && newItem.price > 0 && (
                  <div className="text-white/60 text-sm">
                    Subtotal: ${(newItem.quantity * newItem.price).toFixed(2)}
                  </div>
                )}
              </div>
            )}

            {/* Existing Items List */}
            <div className="space-y-2">
              {order.items.length === 0 ? (
                <div className="text-white/50 text-sm text-center py-4 border border-white/10 rounded-lg">
                  No items added yet
                </div>
              ) : (
                order.items.map((item, index) => (
                  <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-3 flex items-center space-x-4 group hover:border-white/30 transition-all">
                    {item.image && (
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg border border-white/20" />
                    )}
                    <div className="flex-1">
                      <div className="text-white font-semibold">{item.name}</div>
                      <div className="text-white/60 text-sm">Qty: {item.quantity} × ${item.price}</div>
                    </div>
                    <div className="text-white font-bold">${(item.quantity * item.price).toFixed(2)}</div>
                    {!isViewMode && (
                      <button
                        onClick={() => onRemoveItem(index)}
                        className="opacity-0 group-hover:opacity-100 px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Supplier Info */}
          {order.supplier && order.supplier.name && (
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">Supplier Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-white/60">Supplier:</span> <span className="text-white">{order.supplier.name}</span></div>
                <div><span className="text-white/60">Order ID:</span> <span className="text-white">{order.supplier.orderId}</span></div>
                {order.supplier.trackingNumber && (
                  <div><span className="text-white/60">Tracking:</span> <span className="text-white">{order.supplier.trackingNumber}</span></div>
                )}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="border-t border-white/10 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-lg">Total Price:</span>
              <span className="text-white text-2xl font-bold">${order.totalPrice.toFixed(2)}</span>
            </div>
            {!isViewMode && order.items.length > 0 && (
              <p className="text-white/50 text-sm mt-2 text-right">
                {order.items.length} item(s) • Auto-calculated from items above
              </p>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        {!isViewMode && (
          <div className="sticky bottom-0 bg-black border-t border-white/10 p-6 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-all"
            >
              {mode === 'create' ? 'Create Order' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
