import { Shield, Clock, Camera, CheckCircle, BarChart3, Headphones } from 'lucide-react';

export function WhyChooseUs() {
  return (
    <div className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose FarmVora?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We provide the transparency, security, and communication that traditional farm investments lack
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gradient-to-br from-green-50 to-white p-8 rounded-xl border border-green-100">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Verified Projects</h3>
            <p className="text-gray-600">
              Every project is thoroughly vetted and verified by our team. We visit farms in person,
              verify ownership, and ensure all documentation is authentic.
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-xl border border-blue-100">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Weekly Photo Updates</h3>
            <p className="text-gray-600">
              Receive real-time updates with photos every single week until harvest. See exactly how
              your investment is growing.
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-white p-8 rounded-xl border border-orange-100">
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Transparent Timeline</h3>
            <p className="text-gray-600">
              Know exactly when to expect returns. Clear harvest dates, duration, and expected ROI
              for every project.
            </p>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-white p-8 rounded-xl border border-red-100">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Payments</h3>
            <p className="text-gray-600">
              All transactions are processed through secure, trusted payment gateways. Your financial
              information is always protected.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-white p-8 rounded-xl border border-purple-100">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Real-Time Dashboard</h3>
            <p className="text-gray-600">
              Track all your investments in one place. See total invested, expected returns, and
              project status at a glance.
            </p>
          </div>

          <div className="bg-gradient-to-br from-teal-50 to-white p-8 rounded-xl border border-teal-100">
            <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">24/7 Support</h3>
            <p className="text-gray-600">
              Our dedicated support team is always available to answer your questions and address
              any concerns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
