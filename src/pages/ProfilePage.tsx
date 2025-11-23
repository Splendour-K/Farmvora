import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, Mail, Globe, Calendar, Edit2, Save, X, TrendingUp, DollarSign } from 'lucide-react';

export function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalInvested: 0,
    activeInvestments: 0,
    expectedReturns: 0,
  });

  const [formData, setFormData] = useState({
    full_name: '',
    country: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name,
        country: profile.country || '',
      });
      loadStats();
    }
  }, [profile]);

  const loadStats = async () => {
    if (!user) return;

    try {
      const { data: investments, error } = await supabase
        .from('investments')
        .select('amount, expected_return, status')
        .eq('investor_id', user.id);

      if (error) throw error;

      const totalInvested = investments?.reduce((sum, inv) => sum + inv.amount, 0) || 0;
      const expectedReturns = investments?.reduce((sum, inv) => sum + inv.expected_return, 0) || 0;
      const activeInvestments = investments?.filter(inv => inv.status === 'active').length || 0;

      setStats({
        totalInvested,
        activeInvestments,
        expectedReturns,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          country: formData.country,
        })
        .eq('id', user.id);

      if (error) throw error;

      await refreshProfile();
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name,
        country: profile.country || '',
      });
    }
    setEditing(false);
  };

  if (!profile || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-green-400 to-green-600" />

          <div className="px-8 pb-8">
            <div className="flex items-end justify-between -mt-16 mb-6">
              <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <User className="w-16 h-16 text-green-600" />
              </div>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g., Kenya, Nigeria, Ghana"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{profile.full_name}</h1>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                    {profile.role === 'admin' ? 'Administrator' : 'Investor'}
                  </span>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Mail className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium text-gray-900">{profile.email}</p>
                    </div>
                  </div>

                  {profile.country && (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Globe className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Country</p>
                        <p className="font-medium text-gray-900">{profile.country}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-medium text-gray-900">
                        {new Date(profile.created_at).toLocaleDateString('en-US', {
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {profile.role !== 'admin' && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Investment Summary</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm text-gray-600">Total Invested</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  ${stats.totalInvested.toLocaleString()}
                </div>
              </div>

              <div className="bg-green-50 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <span className="text-sm text-gray-600">Expected Returns</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  ${stats.expectedReturns.toLocaleString()}
                </div>
              </div>

              <div className="bg-purple-50 p-6 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-sm text-gray-600">Active Investments</span>
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats.activeInvestments}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
