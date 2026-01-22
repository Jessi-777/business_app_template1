import { useState, useEffect } from "react";
import { API_URL } from "../../config";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const categories = ['Tops', 'Bottoms', 'Accessories', 'Outerwear', 'Other'];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products');
      const data = await response.json();
      setProducts(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setSelectedProduct({
      name: '',
      description: '',
      price: 0,
      compareAtPrice: 0,
      cost: 0,
      image: '/assets/placeholder.png',
      category: 'Other',
      countInStock: 0,
      isActive: true,
      sku: '',
      tags: [],
      printfulVariantId: '',
      printifyProductId: '',
      printifyVariantId: ''
    });
    setImagePreview(null);
    setImageFile(null);
    setModalMode('create');
    setShowModal(true);
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setImagePreview(product.image);
    setImageFile(null);
    setModalMode('view');
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct({ ...product });
    setImagePreview(product.image);
    setImageFile(null);
    setModalMode('edit');
    setShowModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`${API_URL}/api/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
            // Add auth token when available: 'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          setProducts(products.filter(p => p._id !== productId));
          alert('Product deleted successfully');
        } else {
          alert('Error deleting product');
        }
      } catch (error) {
        console.error('Error:', error);
        alert('Error deleting product');
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      // Replace with actual API endpoint
      // const response = await fetch('/api/products/upload', {
      //   method: 'POST',
      //   body: formData,
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });
      // const data = await response.json();
      // return data.image;
      
      // Mock response
      return imagePreview;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSaveProduct = async () => {
    try {
      setUploading(true);

      if (modalMode === 'create') {
        // Create new product
        const formData = new FormData();
        formData.append('name', selectedProduct.name);
        formData.append('description', selectedProduct.description || '');
        formData.append('price', selectedProduct.price);
        formData.append('compareAtPrice', selectedProduct.compareAtPrice || 0);
        formData.append('cost', selectedProduct.cost || 0);
        formData.append('category', selectedProduct.category);
        formData.append('countInStock', selectedProduct.countInStock);
        formData.append('isActive', selectedProduct.isActive);
        formData.append('sku', selectedProduct.sku || '');
        formData.append('tags', selectedProduct.tags.join(','));
        formData.append('printfulVariantId', selectedProduct.printfulVariantId || '');
        formData.append('printifyProductId', selectedProduct.printifyProductId || '');
        formData.append('printifyVariantId', selectedProduct.printifyVariantId || '');
        
        if (imageFile) {
          formData.append('image', imageFile);
        } else if (selectedProduct.image && selectedProduct.image !== '/assets/placeholder.png') {
          formData.append('image', selectedProduct.image);
        }

        const response = await fetch(`${API_URL}/api/products', {
          method: 'POST',
          body: formData
          // Add auth when available: headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const newProduct = await response.json();
          console.log('Product created:', newProduct);
          setProducts([newProduct, ...products]);
          alert('Product created successfully');
          setShowModal(false);
          setImageFile(null);
          setImagePreview(null);
          // Reload products to ensure we have the latest data
          fetchProducts();
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          console.error('Server error:', errorData);
          alert(`Error: ${errorData.message || 'Failed to create product'}`);
        }
      } else if (modalMode === 'edit') {
        // Update existing product
        const formData = new FormData();
        formData.append('name', selectedProduct.name);
        formData.append('description', selectedProduct.description || '');
        formData.append('price', selectedProduct.price);
        formData.append('compareAtPrice', selectedProduct.compareAtPrice || 0);
        formData.append('cost', selectedProduct.cost || 0);
        formData.append('category', selectedProduct.category);
        formData.append('countInStock', selectedProduct.countInStock);
        formData.append('isActive', selectedProduct.isActive);
        formData.append('sku', selectedProduct.sku || '');
        formData.append('tags', selectedProduct.tags.join(','));
        formData.append('printfulVariantId', selectedProduct.printfulVariantId || '');
        formData.append('printifyProductId', selectedProduct.printifyProductId || '');
        formData.append('printifyVariantId', selectedProduct.printifyVariantId || '');
        
        if (imageFile) {
          formData.append('image', imageFile);
        }

        const response = await fetch(`${API_URL}/api/products/${selectedProduct._id}`, {
          method: 'PUT',
          body: formData
          // Add auth when available: headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const updatedProduct = await response.json();
          console.log('Product updated:', updatedProduct);
          setProducts(products.map(p => p._id === selectedProduct._id ? updatedProduct : p));
          alert('Product updated successfully');
          setShowModal(false);
          setImageFile(null);
          setImagePreview(null);
          // Reload products to ensure we have the latest data
          fetchProducts();
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
          console.error('Server error:', errorData);
          alert(`Error: ${errorData.message || 'Failed to update product'}`);
        }
      }
    } catch (error) {
      console.error('Error saving product:', error);
      console.error('Full error details:', {
        message: error.message,
        stack: error.stack,
        error: error
      });
      alert(`Error saving product: ${error.message || 'Network error or server unreachable'}`);
    } finally {
      setUploading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading products...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-5xl font-bold text-white mb-2 tracking-wider drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
            Product Management
          </h1>
          <p className="text-white/70 text-lg">Create, update, and manage your product catalog</p>
        </div>
        <button
          onClick={handleCreateProduct}
          className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-all duration-300 shadow-lg hover:scale-105"
        >
          + Add New Product
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Products" value={products.length} icon="📦" />
        <StatCard title="Active Products" value={products.filter(p => p.isActive).length} icon="✅" />
        <StatCard title="Out of Stock" value={products.filter(p => p.countInStock === 0).length} icon="⚠️" />
        <StatCard title="Total Value" value={`$${products.reduce((sum, p) => sum + (p.price * p.countInStock), 0).toLocaleString()}`} icon="💰" />
      </div>

      {/* Filters */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-white/70 text-sm mb-2 block">Search Products</label>
            <input
              type="text"
              placeholder="Search by name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/40 focus:outline-none focus:border-white/40"
            />
          </div>
          <div>
            <label className="text-white/70 text-sm mb-2 block">Filter by Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-white/40"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            onView={handleViewProduct}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
          />
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 text-white/60">
          No products found matching your criteria
        </div>
      )}

      {/* Product Modal */}
      {showModal && (
        <ProductModal
          product={selectedProduct}
          mode={modalMode}
          onClose={() => {
            setShowModal(false);
            setImageFile(null);
            setImagePreview(null);
          }}
          onSave={handleSaveProduct}
          onChange={setSelectedProduct}
          categories={categories}
          imagePreview={imagePreview}
          onImageChange={handleImageChange}
          uploading={uploading}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500">
      <div className="flex justify-between items-start mb-2">
        <span className="text-3xl">{icon}</span>
      </div>
      <h3 className="text-white/70 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function ProductCard({ product, onView, onEdit, onDelete }) {
  const margin = product.price - (product.cost || 0);
  const marginPercent = product.cost ? ((margin / product.price) * 100).toFixed(0) : 0;

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden hover:border-white/30 hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all duration-500 group">
      {/* Product Image */}
      <div className="relative h-48 overflow-hidden bg-black">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        {!product.isActive && (
          <div className="absolute top-2 right-2 bg-red-500/90 text-white text-xs px-3 py-1 rounded-lg font-bold">
            Inactive
          </div>
        )}
        {product.countInStock === 0 && (
          <div className="absolute top-2 left-2 bg-orange-500/90 text-white text-xs px-3 py-1 rounded-lg font-bold">
            Out of Stock
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-white font-bold text-lg">{product.name}</h3>
          <span className="text-white/60 text-sm">{product.category}</span>
        </div>
        
        <p className="text-white/60 text-sm mb-3 line-clamp-2">{product.description}</p>
        
        <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
          <div>
            <span className="text-white/60">Price:</span>
            <span className="text-white font-bold ml-2">${product.price}</span>
          </div>
          <div>
            <span className="text-white/60">Stock:</span>
            <span className="text-white font-bold ml-2">{product.countInStock}</span>
          </div>
          <div>
            <span className="text-white/60">Cost:</span>
            <span className="text-white font-bold ml-2">${product.cost || 0}</span>
          </div>
          <div>
            <span className="text-white/60">Margin:</span>
            <span className="text-green-400 font-bold ml-2">{marginPercent}%</span>
          </div>
        </div>

        {product.sku && (
          <div className="text-white/50 text-xs mb-3 font-mono">SKU: {product.sku}</div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 mt-4">
          <button
            onClick={() => onView(product)}
            className="flex-1 px-3 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all text-sm font-semibold"
          >
            👁️ View
          </button>
          <button
            onClick={() => onEdit(product)}
            className="flex-1 px-3 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all text-sm font-semibold"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => onDelete(product._id)}
            className="flex-1 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm font-semibold"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductModal({ product, mode, onClose, onSave, onChange, categories, imagePreview, onImageChange, uploading }) {
  const isViewMode = mode === 'view';
  const title = mode === 'create' ? 'Create New Product' : mode === 'edit' ? 'Edit Product' : 'Product Details';

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-black border border-white/20 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-black border-b border-white/10 p-6 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white text-2xl">×</button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Image Upload */}
          <div>
            <label className="text-white/70 text-sm mb-2 block">Product Image</label>
            <div className="flex items-center space-x-4">
              <div className="w-48 h-48 bg-white/5 border border-white/20 rounded-xl overflow-hidden">
                {imagePreview ? (
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/40">
                    No image
                  </div>
                )}
              </div>
              {!isViewMode && (
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="inline-block px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 cursor-pointer transition-all"
                  >
                    📷 Choose Image
                  </label>
                  <p className="text-white/50 text-sm mt-2">Recommended: 1000x1000px, max 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-white/70 text-sm mb-2 block">Product Name *</label>
              <input
                type="text"
                value={product.name}
                onChange={(e) => onChange({ ...product, name: e.target.value })}
                disabled={isViewMode}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white disabled:opacity-50"
                placeholder="Enter product name"
              />
            </div>

            <div className="col-span-2">
              <label className="text-white/70 text-sm mb-2 block">Description</label>
              <textarea
                value={product.description}
                onChange={(e) => onChange({ ...product, description: e.target.value })}
                disabled={isViewMode}
                rows={3}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white disabled:opacity-50"
                placeholder="Enter product description"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Category *</label>
              <select
                value={product.category}
                onChange={(e) => onChange({ ...product, category: e.target.value })}
                disabled={isViewMode}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white disabled:opacity-50"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">SKU</label>
              <input
                type="text"
                value={product.sku}
                onChange={(e) => onChange({ ...product, sku: e.target.value })}
                disabled={isViewMode}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white disabled:opacity-50"
                placeholder="Product SKU"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Price *</label>
              <input
                type="number"
                step="0.01"
                value={product.price}
                onChange={(e) => onChange({ ...product, price: parseFloat(e.target.value) || 0 })}
                disabled={isViewMode}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white disabled:opacity-50"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Compare At Price</label>
              <input
                type="number"
                step="0.01"
                value={product.compareAtPrice}
                onChange={(e) => onChange({ ...product, compareAtPrice: parseFloat(e.target.value) || 0 })}
                disabled={isViewMode}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white disabled:opacity-50"
              />
            </div>

            <div>
              <label className="text-white/70 text-sm mb-2 block">Cost</label>
              <input
                type="number"
                step="0.01"
                value={product.cost}
                onChange={(e) => onChange({ ...product, cost: parseFloat(e.target.value) || 0 })}
                disabled={isViewMode}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white disabled:opacity-50"
              />
            </div>
          </div>

          {/* Inventory */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/70 text-sm mb-2 block">Stock Quantity *</label>
              <input
                type="number"
                value={product.countInStock}
                onChange={(e) => onChange({ ...product, countInStock: parseInt(e.target.value) || 0 })}
                disabled={isViewMode}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white disabled:opacity-50"
              />
            </div>

            {!isViewMode && (
              <div className="flex items-center pt-6">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={product.isActive}
                    onChange={(e) => onChange({ ...product, isActive: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span className="text-white">Product is Active</span>
                </label>
              </div>
            )}
          </div>

          {/* POD Integration */}
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-3">Print-on-Demand Integration</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-white/70 text-sm mb-2 block">Printful Variant ID</label>
                <input
                  type="text"
                  value={product.printfulVariantId || ''}
                  onChange={(e) => onChange({ ...product, printfulVariantId: e.target.value })}
                  disabled={isViewMode}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white disabled:opacity-50 text-sm"
                  placeholder="e.g., 4012"
                />
              </div>
              <div>
                <label className="text-white/70 text-sm mb-2 block">Printify Product ID</label>
                <input
                  type="text"
                  value={product.printifyProductId || ''}
                  onChange={(e) => onChange({ ...product, printifyProductId: e.target.value })}
                  disabled={isViewMode}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white disabled:opacity-50 text-sm"
                  placeholder="e.g., 5bfd0b66a342bc"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-white/70 text-sm mb-2 block">Tags (comma separated)</label>
            <input
              type="text"
              value={Array.isArray(product.tags) ? product.tags.join(', ') : ''}
              onChange={(e) => onChange({ ...product, tags: e.target.value.split(',').map(t => t.trim()) })}
              disabled={isViewMode}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white disabled:opacity-50"
              placeholder="e.g., athletic, sustainable, premium"
            />
          </div>
        </div>

        {/* Footer Actions */}
        {!isViewMode && (
          <div className="sticky bottom-0 bg-black border-t border-white/10 p-6 flex justify-end space-x-4 z-10">
            <button
              onClick={onClose}
              disabled={uploading}
              className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={uploading}
              className="px-6 py-2 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-all disabled:opacity-50 flex items-center space-x-2"
            >
              {uploading && <span className="animate-spin">⏳</span>}
              <span>{mode === 'create' ? 'Create Product' : 'Save Changes'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
