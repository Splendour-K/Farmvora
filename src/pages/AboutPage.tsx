import { Users, Target, Award, Heart, Shield, TrendingUp, Globe, CheckCircle } from 'lucide-react';

export function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 text-white py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6">About FarmVora</h1>
            <p className="text-lg sm:text-xl text-green-100 max-w-3xl mx-auto">
              Bridging the gap between diaspora investors and African agriculture through transparency,
              technology, and trust.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Mission Section */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center mb-16 sm:mb-20">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Our Mission</h2>
            <p className="text-base sm:text-lg text-gray-600 mb-4">
              FarmVora was founded to solve a critical problem: diaspora Africans want to invest in
              agriculture back home, but face challenges with fraud, lack of transparency, and poor
              communication from farm owners.
            </p>
            <p className="text-base sm:text-lg text-gray-600 mb-4">
              We provide a secure, transparent platform where investors can fund verified agricultural
              projects and receive real-time updates with photos every week until harvest.
            </p>
            <p className="text-base sm:text-lg text-gray-600">
              Additionally, our farm store allows anyone to purchase fresh, quality farm produce directly
              from our partnered farmers - supporting local agriculture while getting the best products.
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-2xl p-8 sm:p-12 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Heart className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">Growing Together</h3>
              <p className="text-sm sm:text-base text-gray-700">
                Connecting investors, farmers, and communities for sustainable growth
              </p>
            </div>
          </div>
        </div>

        {/* Vision, Community, Commitment */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-16 sm:mb-20">
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Our Vision</h3>
            <p className="text-sm sm:text-base text-gray-600">
              To become the leading platform for transparent agricultural investment in Africa,
              empowering both investors and farmers.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Our Community</h3>
            <p className="text-sm sm:text-base text-gray-600">
              Thousands of investors and farmers working together to build sustainable agriculture
              and create lasting impact across Africa.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200 sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Our Commitment</h3>
            <p className="text-sm sm:text-base text-gray-600">
              100% transparency, verified projects, weekly updates, and secure transactions.
              Your trust is our priority.
            </p>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-16 sm:mb-20">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 sm:mb-12 text-center">Our Core Values</h2>
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Trust & Transparency</h4>
                <p className="text-sm sm:text-base text-gray-600">
                  Every project is verified in person. We visit farms, meet owners, and ensure authenticity before listing.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Accountability</h4>
                <p className="text-sm sm:text-base text-gray-600">
                  Weekly photo updates keep you informed about your investment's progress from planting to harvest.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Sustainable Growth</h4>
                <p className="text-sm sm:text-base text-gray-600">
                  We support farming practices that protect the environment while maximizing returns for investors and farmers.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Pan-African Impact</h4>
                <p className="text-sm sm:text-base text-gray-600">
                  From Ghana to Rwanda, we're building a network of verified farms across Africa, creating opportunities continent-wide.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How We Work */}
        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl p-8 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">How We Work</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl sm:text-2xl font-bold">
                1
              </div>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Farm Verification</h4>
              <p className="text-xs sm:text-sm text-gray-600">We personally visit and verify every farm and project before listing</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl sm:text-2xl font-bold">
                2
              </div>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Investor Funding</h4>
              <p className="text-xs sm:text-sm text-gray-600">You choose projects and invest securely through our platform</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl sm:text-2xl font-bold">
                3
              </div>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Weekly Updates</h4>
              <p className="text-xs sm:text-sm text-gray-600">Farmers send photo updates every week showing project progress</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl sm:text-2xl font-bold">
                4
              </div>
              <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Harvest & Returns</h4>
              <p className="text-xs sm:text-sm text-gray-600">At harvest, you receive your principal plus returns directly to your account</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
