import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price_usd: number;
  price_ngn: number;
  unit: string;
  stock_quantity: number;
  image_url: string;
  is_available: boolean;
}

export function ProductManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    category: 'grains',
    price_usd: 0,
    price_ngn: 0,
    unit: 'kg',
    stock_quantity: 0,
    image_url: '',
    is_available: true,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const { error } = await supabase
        .from('products')
        .insert(formData);

      if (error) throw error;

      alert('Product created successfully!');
      setCreating(false);
      setFormData({
        name: '',
        description: '',
        category: 'grains',
        price_usd: 0,
        price_ngn: 0,
        unit: 'kg',
        stock_quantity: 0,
        image_url: '',
        is_available: true,
      });
      loadProducts();
    } catch (error: any) {
      console.error('Error creating product:', error);
      alert(`Failed to create product: ${error.message}`);
    }
  };

  const handleUpdate = async (productId: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .update(formData)
        .eq('id', productId);

      if (error) throw error;

      alert('Product updated successfully!');
      setEditing(null);
      loadProducts();
    } catch (error: any) {
      console.error('Error updating product:', error);
      alert(`Failed to update product: ${error.message}`);
    }
  };

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      alert('Product deleted successfully!');
      loadProducts();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      alert(`Failed to delete product: ${error.message}`);
    }
  };

  const startEdit = (product: Product) => {
    setEditing(product.id);
    setFormData(product);
  };

  const cancelEdit = () => {
    setEditing(null);
    setCreating(false);
    setFormData({
      name: '',
      description: '',
      category: 'grains',
      price_usd: 0,
      price_ngn: 0,
      unit: 'kg',
      stock_quantity: 0,
      image_url: '',
      is_available: true,
    });
  };

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Product Management</h2>
        <button
          onClick={() => setCreating(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {creating && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Product</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              >
                <option value="grains">Grains</option>
                <option value="vegetables">Vegetables</option>
                <option value="fruits">Fruits</option>
                <option value="livestock">Livestock</option>
                <option value="dairy">Dairy</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price_usd}
                onChange={(e) => setFormData({ ...formData, price_usd: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (NGN)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price_ngn}
                onChange={(e) => setFormData({ ...formData, price_ngn: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <input
                type="text"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="kg, lbs, piece, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
              <input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="https://..."
              />
            </div>

            <div className="col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm font-medium text-gray-700">Available for purchase</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Create Product
            </button>
            <button
              onClick={cancelEdit}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  {editing === product.id ? (
                    <>
                      <td className="px-6 py-4" colSpan={6}>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                              value={formData.category}
                              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            >
                              <option value="grains">Grains</option>
                              <option value="vegetables">Vegetables</option>
                              <option value="fruits">Fruits</option>
                              <option value="livestock">Livestock</option>
                              <option value="dairy">Dairy</option>
                            </select>
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                              rows={2}
                              value={formData.description}
                              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price USD</label>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.price_usd}
                              onChange={(e) => setFormData({ ...formData, price_usd: parseFloat(e.target.value) })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price NGN</label>
                            <input
                              type="number"
                              step="0.01"
                              value={formData.price_ngn}
                              onChange={(e) => setFormData({ ...formData, price_ngn: parseFloat(e.target.value) })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                            <input
                              type="text"
                              value={formData.unit}
                              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                            <input
                              type="number"
                              value={formData.stock_quantity}
                              onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={formData.is_available}
                                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                                className="rounded"
                              />
                              <span className="text-sm font-medium text-gray-700">Available</span>
                            </label>
                          </div>
                          <div className="col-span-2 flex gap-3">
                            <button
                              onClick={() => handleUpdate(product.id)}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                            >
                              <Save className="w-4 h-4" />
                              Save
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image_url || 'https://images.pexels.com/photos/1300361/pexels-photo-1300361.jpeg'}
                            alt={product.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.description?.substring(0, 50)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">{product.category}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>${product.price_usd}</div>
                        <div className="text-xs text-gray-500">₦{product.price_ngn.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {product.stock_quantity} {product.unit}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          product.is_available ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {product.is_available ? 'Available' : 'Unavailable'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
