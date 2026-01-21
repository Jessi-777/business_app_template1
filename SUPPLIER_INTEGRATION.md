# HNA Print-on-Demand Supplier Integration Guide

## Overview

This system provides seamless integration with print-on-demand suppliers like Printful and Printify. Orders can be automatically sent to suppliers for production and fulfillment.

## Supported Suppliers

### 1. Printful
- **Status**: Ready for integration
- **API Docs**: https://developers.printful.com/
- **Features**: 
  - Automatic order creation
  - Real-time status updates via webhooks
  - Tracking number integration
  - 200+ product variants

### 2. Printify
- **Status**: Ready for integration
- **API Docs**: https://developers.printify.com/
- **Features**:
  - Multiple print provider options
  - Competitive pricing
  - Order tracking
  - Global fulfillment

### 3. Custom POD Suppliers
- **Status**: Template ready
- Easily extendable for other suppliers

## Setup Instructions

### Backend Setup

1. **Environment Variables**
   Add these to your `.env` file:
   ```env
   PRINTFUL_API_KEY=your_printful_api_key_here
   PRINTIFY_API_KEY=your_printify_api_key_here
   ```

2. **Get API Keys**
   - **Printful**: Sign up at https://www.printful.com/ → Dashboard → Settings → API
   - **Printify**: Sign up at https://printify.com/ → My Account → Connections → API

3. **Product Mapping**
   You need to map your HNA products to supplier product variants:
   - Each product needs a `printfulVariantId` or `printifyProductId`
   - Find variant IDs in supplier dashboards or API documentation

### Webhook Configuration

Set up webhooks in your supplier dashboards to receive real-time updates:

**Printful Webhooks:**
- URL: `https://yourdomain.com/api/suppliers/printful/webhook`
- Events: `order_updated`, `order_shipped`, `order_canceled`

**Printify Webhooks:**
- URL: `https://yourdomain.com/api/suppliers/printify/webhook`
- Events: `order:sent-to-production`, `order:shipment:created`, `order:shipment:delivered`

## How It Works

### Order Flow

1. **Customer Places Order** → Order created in your database with status "Pending"

2. **Admin Reviews Order** → Admin can view, edit, update order details

3. **Send to Supplier** → Admin clicks "Send to Supplier" button
   - Order data is formatted for supplier API
   - API call creates order with supplier
   - Order status changes to "Sent to Supplier"
   - Supplier order ID is stored

4. **Supplier Processes Order** → Supplier produces the item
   - Supplier sends webhook updates
   - Order status automatically updates to "In Production"

5. **Order Ships** → Supplier ships the order
   - Webhook updates order to "Shipped"
   - Tracking number is added to order

6. **Delivery Confirmation** → Order status updated to "Delivered"

### API Endpoints

#### Send Order to Supplier
```http
POST /api/orders/:id/send-to-supplier
Authorization: Bearer YOUR_TOKEN

{
  "supplierName": "printful" // or "printify"
}
```

#### Get Order Analytics
```http
GET /api/orders/analytics/stats
Authorization: Bearer YOUR_TOKEN
```

#### Update Order
```http
PUT /api/orders/:id
Authorization: Bearer YOUR_TOKEN

{
  "status": "Processing",
  "priority": "High",
  "notes": "Rush order"
}
```

#### Delete Order
```http
DELETE /api/orders/:id
Authorization: Bearer YOUR_TOKEN
```

## Admin Dashboard Features

### Analytics Dashboard
- **Total Revenue**: Track all-time and monthly revenue
- **Order Metrics**: Total orders, average order value, pending count
- **Goal Tracking**: Visual progress bars for revenue and order targets
- **Status Breakdown**: See orders by status (Pending, Processing, Shipped, etc.)
- **Supplier Status**: Monitor connection status and queue for each supplier

### Order Management
- **Search & Filter**: Find orders by number, customer name, or email
- **Status Filtering**: Filter by order status
- **CRUD Operations**:
  - ✅ Create new orders manually
  - 👁️ View detailed order information
  - ✏️ Edit order details, status, priority
  - 🗑️ Delete orders
  - 🚀 Send to suppliers with one click

### Order Details Include
- Customer information (name, email, full address)
- Order items with images and pricing
- Payment status
- Priority level (Low, Medium, High, Urgent)
- Supplier information (if sent)
- Tracking numbers (when available)
- Order notes

## Customization

### Adding New Suppliers

1. **Create supplier module** in `/backend/utils/supplierIntegration.js`:
   ```javascript
   export const newSupplierAPI = {
     apiKey: process.env.NEW_SUPPLIER_API_KEY,
     baseURL: 'https://api.newsupplier.com',
     
     async createOrder(orderData) {
       // Implementation
     },
     
     async getOrderStatus(orderId) {
       // Implementation
     }
   };
   ```

2. **Add to switch statement** in `sendToSupplier()` function

3. **Create webhook route** in `/backend/routes/supplierRoutes.js`

4. **Update environment variables** with new API keys

### Product Variant Mapping

Update your Product model to include supplier variant IDs:
```javascript
{
  name: "HNA Top",
  price: 25,
  printfulVariantId: 4012, // Printful's variant ID
  printifyProductId: "5bfd0b66a342bc9b8b2c4dd3", // Printify's product ID
  printifyVariantId: 17887 // Printify's variant ID
}
```

## Testing

### Test Order Flow (Development)

1. Create a test order in the admin panel
2. Click "Send to Supplier" - this will use mock data
3. Order status will update to "Sent to Supplier"
4. Simulate webhook by calling webhook endpoint manually

### Mock Webhook Test
```bash
curl -X POST http://localhost:5000/api/suppliers/printful/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "order": {
      "id": "12345",
      "status": "in_production"
    }
  }'
```

## Production Deployment

Before going live:

1. ✅ Add real API keys to production environment
2. ✅ Set up webhook URLs with HTTPS
3. ✅ Implement webhook signature verification
4. ✅ Map all products to supplier variant IDs
5. ✅ Test order flow end-to-end
6. ✅ Set up error monitoring (e.g., Sentry)
7. ✅ Configure email notifications for order updates

## Troubleshooting

### Common Issues

**Order not sending to supplier:**
- Check API keys are correct
- Verify product has supplier variant ID mapped
- Check network connectivity
- Review server logs for API errors

**Webhooks not working:**
- Verify webhook URL is publicly accessible
- Check webhook is configured in supplier dashboard
- Ensure HTTPS is enabled
- Verify webhook signature (if implemented)

**Order status not updating:**
- Check webhook endpoint is receiving data
- Verify supplier order ID matches
- Review database connection
- Check server logs

## Support

For issues or questions:
- Backend: Check `/backend/utils/supplierIntegration.js`
- Frontend: Check `/frontend/src/pages/admin/Orders.jsx`
- API: Check `/backend/controllers/orderController.js`

## Next Steps

1. **Connect Real APIs**: Replace mock data with actual API calls
2. **Email Notifications**: Send emails on order status changes
3. **Customer Portal**: Let customers track their orders
4. **Automated Workflows**: Auto-send orders based on rules
5. **Inventory Sync**: Sync product availability with suppliers
6. **Multi-Supplier**: Route orders to best supplier based on location/price
