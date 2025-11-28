import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { formatCurrency } from '../../lib/currency';
import { Check, X, Clock, DollarSign } from 'lucide-react';

interface PendingInvestment {
  id: string;
  amount: number;
  invested_at: string;
  status: string;
  investor_id: string;
  project_id: string;
  investor: {
    email: string;
    full_name: string;
  };
  project: {
    title: string;
    currency: string;
  };
}

export function InvestmentApprovals() {
  const [pendingInvestments, setPendingInvestments] = useState<PendingInvestment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPendingInvestments();
  }, []);

  const loadPendingInvestments = async () => {
    try {
      console.log('Loading pending investments...');
      
      const { data, error } = await supabase
        .from('investments')
        .select(`
          id,
          amount,
          invested_at,
          status,
          investor_id,
          project_id,
          investor:investor_id(email, full_name),
          project:project_id(title, currency)
        `)
        .eq('status', 'pending')
        .order('invested_at', { ascending: false});

      if (error) {
        console.error('Error loading pending investments:', error);
        throw error;
      }
      
      console.log('Pending investments loaded:', data);
      setPendingInvestments(data || []);
    } catch (error) {
      console.error('Error loading pending investments:', error);
    }
  };

  const handleApprove = async (investmentId: string, investorId: string, projectId: string, amount: number) => {
    setLoading(true);
    try {
      console.log('Approving investment:', investmentId);
      
      // Use the approve_investment function which handles everything
      const { data, error } = await supabase.rpc('approve_investment', {
        investment_id: investmentId
      });

      if (error) {
        console.error('RPC error:', error);
        throw error;
      }

      console.log('Approval response:', data);

      // Check if approval was successful
      if (data && !data.success) {
        throw new Error(data.error || 'Failed to approve investment');
      }

      console.log('Investment approved successfully');
      alert(`Investment approved! Balance credited: ${data.data.currency} ${data.data.total_return}`);
      loadPendingInvestments();
    } catch (error: any) {
      console.error('Error approving investment:', error);
      alert(`Failed to approve investment: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (investmentId: string, investorId: string, amount: number) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;

    setLoading(true);
    try {
      console.log('Attempting to reject investment:', investmentId);
      
      // Use the admin_delete_investment function
      const { data, error } = await supabase.rpc('admin_delete_investment', {
        investment_id: investmentId
      });

      if (error) {
        console.error('RPC error:', error);
        throw error;
      }

      console.log('Delete response:', data);

      // Check if deletion was successful
      if (data && !data.success) {
        throw new Error(data.error || 'Failed to delete investment');
      }

      console.log('Investment deleted successfully');

      // Send notification to user
      const { error: notifError } = await supabase.from('notifications').insert({
        user_id: investorId,
        type: 'investment_rejected',
        title: 'Investment Request Declined',
        message: `Your investment request was not approved. Reason: ${reason}. You can submit a new investment request.`,
        link: '/dashboard',
        read: false,
      });

      if (notifError) {
        console.error('Notification error:', notifError);
        // Don't throw - notification failure shouldn't block the rejection
      }

      alert('Investment request rejected and removed');
      loadPendingInvestments();
    } catch (error: any) {
      console.error('Error rejecting investment:', error);
      alert(`Failed to reject investment: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pending Investments</h2>
          <p className="text-gray-600 mt-1">Review and approve investment requests</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
          <Clock className="w-5 h-5 text-orange-600" />
          <span className="font-semibold text-orange-900">{pendingInvestments.length} Pending</span>
        </div>
      </div>

      {pendingInvestments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No pending investments to review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingInvestments.map((investment) => (
            <div key={investment.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <h3 className="text-xl font-bold text-gray-900">
                      {formatCurrency(investment.amount, investment.project?.currency || 'NGN')}
                    </h3>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                      Pending Review
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-500">Investor</p>
                      <p className="font-medium text-gray-900">{investment.investor?.full_name}</p>
                      <p className="text-sm text-gray-600">{investment.investor?.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Project</p>
                      <p className="font-medium text-gray-900">{investment.project?.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Submitted</p>
                      <p className="font-medium text-gray-900">
                        {new Date(investment.invested_at).toLocaleDateString()} at{' '}
                        {new Date(investment.invested_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleApprove(investment.id, investment.investor_id, investment.project_id, investment.amount)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(investment.id, investment.investor_id, investment.amount)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
