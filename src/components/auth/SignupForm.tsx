import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, TrendingUp, ShoppingBag } from 'lucide-react';

interface SignupFormProps {
  onToggleForm: () => void;
  onSuccess: () => void;
}

export function SignupForm({ onToggleForm, onSuccess }: SignupFormProps) {
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    country: '',
    password: '',
    confirmPassword: '',
    userType: 'digital_farmer',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const { error } = await signUp(
      formData.email,
      formData.password,
      formData.fullName,
      formData.country,
      formData.userType
    );

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          I want to:
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFormData({ ...formData, userType: 'digital_farmer' })}
            className={`p-4 border-2 rounded-lg transition-all ${
              formData.userType === 'digital_farmer'
                ? 'border-green-600 bg-green-50'
                : 'border-gray-300 hover:border-green-400'
            }`}
          >
            <TrendingUp className={`w-6 h-6 mx-auto mb-2 ${
              formData.userType === 'digital_farmer' ? 'text-green-600' : 'text-gray-400'
            }`} />
            <div className="text-sm font-semibold text-gray-900">Invest in Farms</div>
            <div className="text-xs text-gray-600 mt-1">Digital Farmer</div>
          </button>

          <button
            type="button"
            onClick={() => setFormData({ ...formData, userType: 'product_buyer' })}
            className={`p-4 border-2 rounded-lg transition-all ${
              formData.userType === 'product_buyer'
                ? 'border-orange-600 bg-orange-50'
                : 'border-gray-300 hover:border-orange-400'
            }`}
          >
            <ShoppingBag className={`w-6 h-6 mx-auto mb-2 ${
              formData.userType === 'product_buyer' ? 'text-orange-600' : 'text-gray-400'
            }`} />
            <div className="text-sm font-semibold text-gray-900">Buy Products</div>
            <div className="text-xs text-gray-600 mt-1">Store Customer</div>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          You can do both activities after signing up
        </p>
      </div>

      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
          Country
        </label>
        <input
          id="country"
          name="country"
          type="text"
          value={formData.country}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <UserPlus className="w-4 h-4" />
        {loading ? 'Creating account...' : 'Create Account'}
      </button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onToggleForm}
          className="text-green-600 hover:text-green-700 font-medium"
        >
          Sign in
        </button>
      </p>
    </form>
  );
}
