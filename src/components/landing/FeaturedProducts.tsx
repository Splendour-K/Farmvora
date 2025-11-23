import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ShoppingBag, ArrowRight } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price_usd: number;
  price_ngn: number;
  unit: string;
  image_url: string;
}

interface FeaturedProductsProps {
  onVisitStore: () => void;
}

export function FeaturedProducts({ onVisitStore }: FeaturedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, price_usd, price_ngn, unit, image_url')
        .eq('is_available', true)
        .limit(4);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || products.length === 0) return null;

  return (
    <div className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <ShoppingBag className="w-12 h-12 text-orange-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Fresh from Our Farms
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Shop premium quality produce directly from our verified farms. From fresh eggs to frozen poultry, we deliver farm-to-table goodness.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {products.map(product => (
            <div key={product.id} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-shadow border border-gray-200">
              <div className="h-48 bg-gray-200 overflow-hidden">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-orange-600">
                    ${product.price_usd.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">/ {product.unit}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  ₦{product.price_ngn.toLocaleString()} / {product.unit}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={onVisitStore}
            className="inline-flex items-center gap-2 px-8 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-lg font-semibold"
          >
            View All Products
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
