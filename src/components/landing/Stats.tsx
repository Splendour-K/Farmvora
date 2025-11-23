import { TrendingUp, Users, Sprout, DollarSign } from 'lucide-react';

export function Stats() {
  return (
    <div className="bg-gradient-to-br from-green-600 to-green-700 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">Our Impact</h2>
          <p className="text-xl text-green-100">
            Growing together, one investment at a time
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-8">
          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">5,000+</div>
              <div className="text-green-100">Active Investors</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <Sprout className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">150+</div>
              <div className="text-green-100">Active Projects</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">$2M+</div>
              <div className="text-green-100">Total Invested</div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-2">25%</div>
              <div className="text-green-100">Average ROI</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
