import { Sprout, Shield, TrendingUp, ShoppingBag } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
  onBrowseProjects: () => void;
  onVisitStore: () => void;
}

export function Hero({ onGetStarted, onBrowseProjects, onVisitStore }: HeroProps) {
  return (
    <div className="bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Sprout className="w-16 h-16 text-green-600" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Invest & Shop from{' '}
            <span className="text-green-600">Africa's Farms</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Invest in verified agricultural projects with real-time tracking and weekly updates. Plus, shop fresh farm produce directly from our farmers - from eggs to chickens and more!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onGetStarted}
              className="px-8 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-lg font-semibold"
            >
              Start Investing
            </button>
            <button
              onClick={onVisitStore}
              className="px-8 py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-lg font-semibold flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Shop Farm Store
            </button>
            <button
              onClick={onBrowseProjects}
              className="px-8 py-4 bg-white text-green-600 border-2 border-green-600 rounded-lg hover:bg-green-50 transition-colors text-lg font-semibold"
            >
              Browse Projects
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">The Problem</h3>
            <p className="text-gray-600">
              Many diaspora Africans want to invest back home but face fraud, lack of transparency, and poor communication from farm owners.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Our Solution</h3>
            <p className="text-gray-600">
              FarmVora provides verified projects, real-time weekly updates with photos, transparent returns, and secure investment tracking.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Sprout className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Your Impact</h3>
            <p className="text-gray-600">
              Support sustainable agriculture, create jobs, earn returns, and contribute to food security across Africa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
