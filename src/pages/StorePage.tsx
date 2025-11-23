import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ShoppingCart, Search, Filter, Plus, Check, Eye } from 'lucide-react';

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

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product: Product;
}

interface StorePageProps {
  onNavigate?: (page: string) => void;
}

export function StorePage({ onNavigate }: StorePageProps = {}) {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
    if (user) {
      loadCart();
    }
  }, [user]);

  const loadProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          id,
          product_id,
          quantity,
          product:product_id(*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setCartItems(data || []);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const addToCart = async (product: Product) => {
    if (!user) {
      alert('Please sign in to add items to cart');
      return;
    }

    setAddingToCart(product.id);

    try {
      const existingItem = cartItems.find(item => item.product_id === product.id);

      if (existingItem) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + 1 })
          .eq('id', existingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('cart_items')
          .insert({
            user_id: user.id,
            product_id: product.id,
            quantity: 1,
          });

        if (error) throw error;
      }

      loadCart();
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const isInCart = (productId: string) => {
    return cartItems.some(item => item.product_id === productId);
  };

  const handleViewCart = () => {
    if (onNavigate) {
      onNavigate('cart');
    } else {
      window.location.href = '/cart';
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...new Set(products.map(p => p.category))];
  const categoryNames: Record<string, string> = {
    all: 'All Products',
    eggs: 'Eggs',
    live_chicken: 'Live Chickens',
    frozen_chicken: 'Frozen Chicken',
    frozen_parts: 'Chicken Parts',
    frozen_turkey: 'Turkey',
    frozen_duck: 'Duck',
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Farm Store</h1>
            <p className="text-gray-600">Fresh produce directly from our farms</p>
          </div>
          {user && (
            <a
              href="/cart"
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold relative"
            >
              <ShoppingCart className="w-5 h-5" />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </a>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Search & Filter</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {categoryNames[cat] || cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              Showing {filteredProducts.length} products
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={product.image_url || 'https://images.pexels.com/photos/1300361/pexels-photo-1300361.jpeg'}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>

                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-2xl font-bold text-green-600">
                        ${product.price_usd.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-500">/ {product.unit}</span>
                    </div>

                    <div className="text-xs text-gray-500 mb-3">
                      ₦{product.price_ngn.toLocaleString()} / {product.unit}
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-600">
                        Stock: {product.stock_quantity} {product.unit}s
                      </span>
                      {product.stock_quantity < 10 && (
                        <span className="text-xs text-red-600 font-semibold">Low stock!</span>
                      )}
                    </div>

                    {isInCart(product.id) ? (
                      <button
                        onClick={handleViewCart}
                        className="w-full py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                      >
                        <Eye className="w-4 h-4" />
                        View Cart
                      </button>
                    ) : (
                      <button
                        onClick={() => addToCart(product)}
                        disabled={addingToCart === product.id || product.stock_quantity === 0}
                        className="w-full py-2 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {addingToCart === product.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4" />
                            Add to Cart
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
