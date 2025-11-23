import { Users, Target, Award, Heart } from 'lucide-react';

export function AboutUs() {
  return (
    <div className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">About FarmVora</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Bridging the gap between diaspora investors and African agriculture through transparency,
            technology, and trust.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h3>
            <p className="text-lg text-gray-600 mb-4">
              FarmVora was founded to solve a critical problem: diaspora Africans want to invest in
              agriculture back home, but face challenges with fraud, lack of transparency, and poor
              communication from farm owners.
            </p>
            <p className="text-lg text-gray-600 mb-4">
              We provide a secure, transparent platform where investors can fund verified agricultural
              projects and receive real-time updates with photos every week until harvest.
            </p>
            <p className="text-lg text-gray-600">
              Additionally, our farm store allows anyone to purchase fresh, quality farm produce directly
              from our partnered farmers - supporting local agriculture while getting the best products.
            </p>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-2xl p-12 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-gray-900 mb-3">Growing Together</h4>
              <p className="text-gray-700">
                Connecting investors, farmers, and communities for sustainable growth
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-8 rounded-xl">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Our Vision</h3>
            <p className="text-gray-600">
              To become the leading platform for transparent agricultural investment in Africa,
              empowering both investors and farmers.
            </p>
          </div>

          <div className="bg-gray-50 p-8 rounded-xl">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Our Community</h3>
            <p className="text-gray-600">
              Thousands of investors and farmers working together to build sustainable agriculture
              and create lasting impact across Africa.
            </p>
          </div>

          <div className="bg-gray-50 p-8 rounded-xl">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Our Commitment</h3>
            <p className="text-gray-600">
              100% transparency, verified projects, weekly updates, and secure transactions.
              Your trust is our priority.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
