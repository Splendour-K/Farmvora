import { Sprout, Shield, TrendingUp, ShoppingBag } from 'lucide-react';

interface HeroProps {
  onGetStarted: () => void;
  onBrowseProjects: () => void;
  onVisitStore: () => void;
}

export function Hero({ onGetStarted, onBrowseProjects, onVisitStore }: HeroProps) {
  return (
    <div className="bg-gradient-to-br from-green-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex justify-center mb-4 sm:mb-6">
            <Sprout className="w-12 h-12 sm:w-16 sm:h-16 text-green-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 px-4">
            Invest & Shop from{' '}
            <span className="text-green-600">Africa's Farms</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            Invest in verified agricultural projects with real-time tracking and weekly updates. Plus, shop fresh farm produce directly from our farmers - from eggs to chickens and more!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-base sm:text-lg font-semibold"
            >
              Start Investing
            </button>
            <button
              onClick={onVisitStore}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-base sm:text-lg font-semibold flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              Shop Farm Store
            </button>
            <button
              onClick={onBrowseProjects}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-white text-green-600 border-2 border-green-600 rounded-lg hover:bg-green-50 transition-colors text-base sm:text-lg font-semibold"
            >
              Browse Projects
            </button>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-20">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">The Problem</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Many diaspora Africans want to invest back home but face fraud, lack of transparency, and poor communication from farm owners.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Our Solution</h3>
            <p className="text-sm sm:text-base text-gray-600">
              FarmVora provides verified projects, real-time weekly updates with photos, transparent returns, and secure investment tracking.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-100 sm:col-span-2 md:col-span-1">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Sprout className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Your Impact</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Support sustainable agriculture, create jobs, earn returns, and contribute to food security across Africa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
