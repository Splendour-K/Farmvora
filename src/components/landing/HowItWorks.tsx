import { UserPlus, Search, DollarSign, TrendingUp, ShoppingCart, Package } from 'lucide-react';

export function HowItWorks() {
  return (
    <div className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Simple, transparent, and secure - whether you're investing or shopping
          </p>
        </div>

        <div className="mb-20">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">For Investors</h3>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="relative">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <UserPlus className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mb-3 mx-auto">
                    1
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Sign Up</h4>
                  <p className="text-gray-600 text-sm">
                    Create your free account in less than a minute
                  </p>
                </div>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-green-200" />
            </div>

            <div className="relative">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Search className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mb-3 mx-auto">
                    2
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Browse Projects</h4>
                  <p className="text-gray-600 text-sm">
                    Explore verified agricultural projects with full details
                  </p>
                </div>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-green-200" />
            </div>

            <div className="relative">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mb-3 mx-auto">
                    3
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Invest Securely</h4>
                  <p className="text-gray-600 text-sm">
                    Choose your amount and invest with secure payment
                  </p>
                </div>
              </div>
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-green-200" />
            </div>

            <div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold mb-3 mx-auto">
                    4
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">Track & Earn</h4>
                  <p className="text-gray-600 text-sm">
                    Get weekly updates and earn returns at harvest
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">For Shoppers</h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mb-3 mx-auto">
                  1
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Browse Store</h4>
                <p className="text-gray-600 text-sm">
                  Explore fresh farm products - grains, vegetables, livestock, and more
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mb-3 mx-auto">
                  2
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Add & Checkout</h4>
                <p className="text-gray-600 text-sm">
                  Add to cart, enter delivery details, and pay securely
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-center">
                <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold mb-3 mx-auto">
                  3
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Receive Fresh</h4>
                <p className="text-gray-600 text-sm">
                  Get your fresh farm products delivered to your door
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
