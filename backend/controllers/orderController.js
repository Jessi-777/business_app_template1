import Order from '../models/Order.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
export const createOrder = async (req, res) => {
  try {
    const { items, customer, totalPrice } = req.body;
    
    // Generate unique order number
    const orderNumber = `HNA-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const order = new Order({ 
      orderNumber,
      items, 
      customer,
      totalPrice,
      status: 'Pending',
      paymentStatus: 'Pending'
    });
    
    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private/Admin
export const updateOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (order) {
      order.status = req.body.status || order.status;
      order.paymentStatus = req.body.paymentStatus || order.paymentStatus;
      order.notes = req.body.notes || order.notes;
      order.priority = req.body.priority || order.priority;
      
      if (req.body.customer) {
        order.customer = { ...order.customer, ...req.body.customer };
      }
      
      if (req.body.supplier) {
        order.supplier = { ...order.supplier, ...req.body.supplier };
      }
      
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (order) {
      await order.deleteOne();
      res.json({ message: 'Order removed' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Send order to supplier
// @route   POST /api/orders/:id/send-to-supplier
// @access  Private/Admin
export const sendOrderToSupplier = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (order) {
      // Here you would integrate with your print-on-demand supplier API
      // For now, we'll simulate the process
      
      const supplierData = {
        name: req.body.supplierName || 'Default POD Supplier',
        orderId: `SUP-${Date.now()}`,
        status: 'Sent',
        sentAt: new Date()
      };
      
      order.supplier = supplierData;
      order.status = 'Sent to Supplier';
      
      const updatedOrder = await order.save();
      
      // TODO: Actual API call to supplier would go here
      // Example: await printfulAPI.createOrder(orderData);
      
      res.json({ 
        message: 'Order sent to supplier successfully',
        order: updatedOrder 
      });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order analytics
// @route   GET /api/orders/analytics/stats
// @access  Private/Admin
export const getOrderAnalytics = async (req, res) => {
  try {
    const orders = await Order.find({});
    
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    
    const statusBreakdown = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
    
    const recentOrders = await Order.find({})
      .sort({ createdAt: -1 })
      .limit(10);
    
    const monthlyRevenue = orders
      .filter(order => {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        return orderDate.getMonth() === now.getMonth() && 
               orderDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, order) => sum + order.totalPrice, 0);
    
    const pendingOrders = orders.filter(o => o.status === 'Pending').length;
    const processingOrders = orders.filter(o => o.status === 'Processing' || o.status === 'In Production').length;
    const completedOrders = orders.filter(o => o.status === 'Delivered').length;
    
    res.json({
      totalOrders,
      totalRevenue,
      monthlyRevenue,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      statusBreakdown,
      pendingOrders,
      processingOrders,
      completedOrders,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
