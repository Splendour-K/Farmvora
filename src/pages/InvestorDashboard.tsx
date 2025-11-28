import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../lib/currency';
import { CurrencyBreakdown } from '../components/dashboard/CurrencyBreakdown';
import { TrendingUp, DollarSign, Briefcase, Calendar, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';

interface Investment {
  id: string;
  amount: number;
  expected_return: number;
  status: string;
  invested_at: string;
  project: {
    id: string;
    title: string;
    category: string;
    status: string;
    expected_roi: number;
    expected_harvest_date: string;
    currency: string;
  };
}

export function InvestorDashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadInvestments();

      // Set up realtime subscription for investment changes
      const channel = supabase
        .channel('user-investments')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'investments',
            filter: `investor_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Investment changed:', payload);
            // Reload investments when there's any change (delete, update, insert)
            loadInvestments();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadInvestments = async () => {
    if (!user) {
      console.log('No user found, skipping investment load');
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          project:projects(id, title, category, status, expected_roi, expected_harvest_date, currency)
        `)
        .eq('investor_id', user.id)
        .order('invested_at', { ascending: false});

      if (error) throw error;
      setInvestments(data || []);
    } catch (error) {
      console.error('Error loading investments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawInvestment = async (investmentId: string, status: string) => {
    if (status !== 'pending') {
      alert('You can only withdraw pending investments. Please contact admin for approved investments.');
      return;
    }

    if (!confirm('Are you sure you want to withdraw this investment request?')) {
      return;
    }

    setDeleting(investmentId);
    try {
      const { data, error } = await supabase.rpc('withdraw_investment', {
        investment_id: investmentId
      });

      if (error) throw error;

      if (data && !data.success) {
        throw new Error(data.error || 'Failed to withdraw investment');
      }

      alert('Investment withdrawn successfully');
      loadInvestments();
    } catch (error: any) {
      console.error('Error withdrawing investment:', error);
      alert(`Failed to withdraw investment: ${error.message}`);
    } finally {
      setDeleting(null);
    }
  };

  // Separate approved and pending investments
  const approvedInvestments = investments.filter(inv => inv.status === 'approved');
  const pendingInvestments = investments.filter(inv => inv.status === 'pending');
  
  // Calculate totals only from approved investments
  const totalInvested = approvedInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  const totalExpectedReturns = approvedInvestments.reduce((sum, inv) => sum + inv.expected_return, 0);
  const activeInvestments = approvedInvestments.filter(inv => inv.status === 'approved').length;
  
  // Check if there are any pending investments
  const hasPendingInvestments = pendingInvestments.length > 0;
  const pendingAmount = pendingInvestments.reduce((sum, inv) => sum + inv.amount, 0);
  
  // Get currency from first investment (all should have same currency for now)
  const currency = investments[0]?.project?.currency || 'NGN';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Investment Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600">Welcome back, {profile?.full_name}!</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-xs sm:text-sm text-gray-600">Total Invested</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              {formatCurrency(totalInvested, currency)}
              {hasPendingInvestments && (
                <span className="block text-sm font-normal text-yellow-600 mt-1">
                  + {formatCurrency(pendingAmount, currency)} Pending
                </span>
              )}
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-xs sm:text-sm text-gray-600">Expected Returns</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{formatCurrency(totalExpectedReturns, currency)}</div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-xs sm:text-sm text-gray-600">Active Investments</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{activeInvestments}</div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="text-xs sm:text-sm text-gray-600">Potential Profit</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              {formatCurrency(totalExpectedReturns - totalInvested, currency)}
            </div>
          </div>
        </div>

        {/* Currency Breakdown */}
        {investments.length > 0 && (
          <CurrencyBreakdown 
            investments={investments} 
            title="Your Investments by Currency"
            showOnlyApproved={true}
          />
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Your Investments</h2>
          </div>

          {investments.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <p className="text-sm sm:text-base text-gray-600 mb-4">You haven't made any investments yet.</p>
              <button
                onClick={() => window.location.reload()}
                className="text-green-600 hover:text-green-700 font-semibold text-sm sm:text-base"
              >
                Browse Projects
              </button>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden divide-y divide-gray-200">
                {investments.map((investment) => (
                  <div key={investment.id} className="p-4 hover:bg-gray-50">
                    <div className="mb-3">
                      <div className="font-semibold text-gray-900 mb-1">{investment.project.title}</div>
                      <div className="text-xs text-gray-500">{investment.project.category}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Amount Invested</div>
                        <div className="font-semibold text-gray-900">{formatCurrency(investment.amount, investment.project.currency)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Expected Return</div>
                        <div className="font-semibold text-green-600">{formatCurrency(investment.expected_return, investment.project.currency)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Status</div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full inline-flex items-center gap-1 ${
                            investment.status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : investment.status === 'pending'
                              ? 'bg-orange-100 text-orange-700'
                              : investment.status === 'rejected'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {investment.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                          {investment.status === 'pending' && <Clock className="w-3 h-3" />}
                          {investment.status === 'rejected' && <XCircle className="w-3 h-3" />}
                          {investment.status}
                        </span>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Harvest Date</div>
                        <div className="text-xs text-gray-600 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(investment.project.expected_harvest_date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => navigate(`/projects/${investment.project.id}`)}
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold"
                      >
                        View Project
                      </button>
                      {investment.status === 'pending' && (
                        <button
                          onClick={() => handleWithdrawInvestment(investment.id, investment.status)}
                          disabled={deleting === investment.id}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm font-semibold flex items-center gap-1 disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                          Withdraw
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Project
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount Invested
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expected Return
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Harvest Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {investments.map((investment) => (
                      <tr key={investment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{investment.project.title}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {investment.project.category}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {formatCurrency(investment.amount, investment.project.currency)}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600">
                          {formatCurrency(investment.expected_return, investment.project.currency)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-1 w-fit ${
                              investment.status === 'approved'
                                ? 'bg-green-100 text-green-700'
                                : investment.status === 'pending'
                                ? 'bg-orange-100 text-orange-700'
                                : investment.status === 'rejected'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {investment.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                            {investment.status === 'pending' && <Clock className="w-3 h-3" />}
                            {investment.status === 'rejected' && <XCircle className="w-3 h-3" />}
                            {investment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(investment.project.expected_harvest_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => navigate(`/projects/${investment.project.id}`)}
                              className="text-green-600 hover:text-green-700 font-semibold text-sm"
                            >
                              View Project
                            </button>
                            {investment.status === 'pending' && (
                              <button
                                onClick={() => handleWithdrawInvestment(investment.id, investment.status)}
                                disabled={deleting === investment.id}
                                className="text-red-600 hover:text-red-700 font-semibold text-sm flex items-center gap-1 disabled:opacity-50"
                                title="Withdraw investment request"
                              >
                                <Trash2 className="w-4 h-4" />
                                Withdraw
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
