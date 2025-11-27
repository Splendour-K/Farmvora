import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, getCurrencySymbol } from '../lib/currency';
import { MapPin, Calendar, TrendingUp, Clock, Shield, ArrowLeft, DollarSign, CheckCircle, Plus } from 'lucide-react';
import { ProjectQA } from '../components/projects/ProjectQA';

interface Project {
  id: string;
  title: string;
  description: string;
  location: string;
  category: string;
  required_capital: number;
  current_funding: number;
  expected_roi: number;
  duration_months: number;
  start_date: string;
  expected_harvest_date: string;
  risk_level: string;
  status: string;
  currency: string;
  owner_name: string;
  owner_bio: string | null;
}

interface WeeklyUpdate {
  id: string;
  week_number: number;
  title: string;
  description: string;
  image_url: string | null;
  created_at: string;
}

interface UserInvestment {
  id: string;
  amount: number;
  status: string;
  invested_at: string;
  rejection_reason: string | null;
}

export function ProjectDetailPage() {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [updates, setUpdates] = useState<WeeklyUpdate[]>([]);
  const [userInvestments, setUserInvestments] = useState<UserInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [investAmount, setInvestAmount] = useState('');
  const [showInvestModal, setShowInvestModal] = useState(false);
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [investing, setInvesting] = useState(false);

  useEffect(() => {
    if (!projectId) {
      navigate('/projects');
      return;
    }
    loadProjectDetails();

    // Set up realtime subscription for investment changes
    if (user && projectId) {
      const channel = supabase
        .channel(`project-investments-${projectId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'investments',
            filter: `project_id=eq.${projectId}`,
          },
          (payload) => {
            console.log('Investment changed:', payload);
            // Reload investments when there's any change (delete, update, insert)
            loadProjectDetails();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [projectId, user, navigate]);

  const loadProjectDetails = async () => {
    if (!projectId) return;
    
    try {
      const [projectRes, updatesRes] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase.from('weekly_updates').select('*').eq('project_id', projectId).order('week_number', { ascending: true })
      ]);

      if (projectRes.error) throw projectRes.error;
      setProject(projectRes.data);
      setUpdates(updatesRes.data || []);

      if (user) {
        console.log('Loading investments for user:', user.id, 'project:', projectId);
        
        const { data: investments, error: invError } = await supabase
          .from('investments')
          .select('id, amount, status, invested_at, rejection_reason')
          .eq('investor_id', user.id)
          .eq('project_id', projectId)
          .order('invested_at', { ascending: false });

        if (invError) {
          console.error('Error loading investments:', invError);
        } else {
          console.log('User investments loaded:', investments);
          setUserInvestments(investments || []);
        }
      }
    } catch (error) {
      console.error('Error loading project details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async () => {
    if (!user || !project) return;

    const amount = parseFloat(investAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setInvesting(true);

    try {
      const expectedReturn = amount * (project.expected_roi / 100);

      const investmentData = {
        investor_id: user.id,
        project_id: project.id,
        amount,
        expected_return: expectedReturn,
        status: 'pending'
      };

      console.log('Attempting to create investment:', investmentData);

      const { data, error } = await supabase
        .from('investments')
        .insert(investmentData as any)
        .select();

      if (error) {
        console.error('Investment insert error:', error);
        throw error;
      }

      console.log('Investment created successfully:', data);

      alert('Investment submitted for approval! You will be notified once reviewed.');
      setShowInvestModal(false);
      setInvestAmount('');
      setIsAddingFunds(false);
      
      // Reload to show pending status
      await loadProjectDetails();
    } catch (error) {
      console.error('Error investing:', error);
      alert(`Investment failed: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setInvesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Project not found</p>
          <button onClick={() => navigate('/projects')} className="text-green-600 hover:text-green-700">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const fundingPercentage = (project.current_funding / project.required_capital) * 100;
  const totalUserInvestment = userInvestments.filter(inv => inv.status === 'approved').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingInvestment = userInvestments.find(inv => inv.status === 'pending');
  const hasApprovedInvestment = userInvestments.some(inv => inv.status === 'approved');
  
  // Determine if investment is allowed
  const isProjectActive = project.status === 'active';
  const isProjectUpcoming = project.status === 'upcoming';
  const isProjectEnded = project.status === 'completed' || project.status === 'paused';
  const isFundingComplete = fundingPercentage >= 100;
  const canInvest = isProjectActive && !isFundingComplete && !isProjectEnded;

  console.log('Button display state:', {
    userInvestments,
    pendingInvestment,
    hasApprovedInvestment,
    totalUserInvestment,
    canInvest,
    isProjectActive,
    isProjectUpcoming,
    isProjectEnded,
    isFundingComplete
  });

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Projects
          </button>

          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Login Required</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Please log in or create an account to view project details and make investments.
              Creating an account is free and takes less than a minute.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                Log In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Projects
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="h-64 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-5xl font-bold mb-3">{project.category}</div>
              <div className="text-xl opacity-90">{project.location}</div>
            </div>
          </div>

          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.title}</h1>
                <div className="flex items-center gap-4 text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {project.location}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                    {project.status}
                  </span>
                </div>
              </div>
              {user && (
                <div className="flex flex-col gap-2">
                  {pendingInvestment ? (
                    <div className="flex items-center gap-2 px-4 py-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <Clock className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="font-semibold text-orange-900">Investment Pending</p>
                        <p className="text-sm text-orange-700">{formatCurrency(pendingInvestment.amount, project.currency)} awaiting approval</p>
                      </div>
                    </div>
                  ) : hasApprovedInvestment ? (
                    <>
                      <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-900">Active Investment</p>
                          <p className="text-sm text-green-700">Total: {formatCurrency(totalUserInvestment, project.currency)}</p>
                        </div>
                      </div>
                      {canInvest && (
                        <button
                          onClick={() => {
                            setIsAddingFunds(true);
                            setShowInvestModal(true);
                          }}
                          className="flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                        >
                          <Plus className="w-5 h-5" />
                          Add More Funds
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {isProjectUpcoming ? (
                        <button
                          onClick={() => {
                            setIsAddingFunds(false);
                            setShowInvestModal(true);
                          }}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                          Express Interest
                        </button>
                      ) : canInvest ? (
                        <button
                          onClick={() => {
                            setIsAddingFunds(false);
                            setShowInvestModal(true);
                          }}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                        >
                          Invest Now
                        </button>
                      ) : (
                        <div className="px-6 py-3 bg-gray-100 text-gray-500 rounded-lg text-center font-semibold cursor-not-allowed">
                          {isFundingComplete ? 'Funding Complete' : isProjectEnded ? 'Project Ended' : 'Investment Unavailable'}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-600">Expected ROI</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{project.expected_roi}%</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-600">Duration</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">{project.duration_months} months</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-yellow-600" />
                  <span className="text-sm text-gray-600">Risk Level</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 capitalize">{project.risk_level}</div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="text-sm text-gray-600">Harvest Date</span>
                </div>
                <div className="text-lg font-bold text-gray-900">
                  {new Date(project.expected_harvest_date).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric'
                  })}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Funding Progress</h2>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div
                  className="bg-green-600 h-4 rounded-full transition-all"
                  style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-gray-900">{formatCurrency(project.current_funding, project.currency)} raised</span>
                <span className="text-gray-600">{fundingPercentage.toFixed(1)}%</span>
                <span className="font-semibold text-gray-900">{formatCurrency(project.required_capital, project.currency)} goal</span>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">About This Project</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">{project.description}</p>
            </div>

            <div className="mb-8 p-6 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Investment Protection</h3>
                  <p className="text-gray-700 leading-relaxed">
                    10% of all raised funds is reserved as an emergency buffer. This safety net covers unexpected challenges such as disease outbreaks, feed price increases, or equipment repairs. Your ROI is protected while ensuring the farm can operate smoothly even during unforeseen circumstances.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-3">Farm Owner</h2>
              <p className="font-semibold text-gray-900 mb-2">{project.owner_name}</p>
              {project.owner_bio && <p className="text-gray-600">{project.owner_bio}</p>}
            </div>
          </div>
        </div>

        {updates.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Weekly Progress Updates</h2>
            <div className="space-y-6">
              {updates.map((update, index) => (
                <div key={update.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">
                      W{update.week_number}
                    </div>
                    {index < updates.length - 1 && (
                      <div className="w-0.5 h-full bg-green-200 mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <h3 className="font-semibold text-gray-900 mb-1">{update.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {new Date(update.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">{update.description}</p>
                    {update.image_url && (
                      <img
                        src={update.image_url}
                        alt={update.title}
                        className="mt-3 rounded-lg max-w-md"
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {projectId && <ProjectQA projectId={projectId} />}
      </div>

      {showInvestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {isAddingFunds ? 'Add More Funds' : isProjectUpcoming ? 'Express Interest in' : 'Invest in'} {project.title}
            </h2>

            {isAddingFunds && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-900">
                  <span className="font-semibold">Current Investment:</span> {formatCurrency(totalUserInvestment, project.currency)}
                </p>
              </div>
            )}

            {isProjectUpcoming && !isAddingFunds && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  This project is upcoming. By expressing interest, you'll be notified when it becomes active and ready for investment.
                </p>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Amount ({project.currency})
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                  {getCurrencySymbol(project.currency)}
                </span>
                <input
                  type="number"
                  value={investAmount}
                  onChange={(e) => setInvestAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter amount"
                  min="1"
                  step="1"
                />
              </div>
              {investAmount && !isNaN(parseFloat(investAmount)) && (
                <div className="mt-3 space-y-1">
                  <p className="text-sm text-gray-600">
                    Expected return: <span className="font-semibold text-green-600">
                      {formatCurrency(parseFloat(investAmount) * (project.expected_roi / 100), project.currency)}
                    </span>
                  </p>
                  {isAddingFunds && (
                    <p className="text-sm text-gray-600">
                      New total: <span className="font-semibold">
                        {formatCurrency(totalUserInvestment + parseFloat(investAmount), project.currency)}
                      </span>
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg space-y-2">
              <p className="text-sm text-orange-900">
                {isProjectUpcoming 
                  ? 'Your interest will be recorded and you\'ll be notified when the project becomes active.' 
                  : 'Your investment will be reviewed by our admin team before being approved.'}
              </p>
              {!isProjectUpcoming && (
                <p className="text-xs text-orange-800">
                  Note: 10% emergency buffer is reserved from all raised funds for farm protection, securing your ROI.
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowInvestModal(false);
                  setInvestAmount('');
                  setIsAddingFunds(false);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={investing}
              >
                Cancel
              </button>
              <button
                onClick={handleInvest}
                disabled={investing || !investAmount || parseFloat(investAmount) <= 0}
                className={`flex-1 px-4 py-2 ${isProjectUpcoming ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg disabled:opacity-50`}
              >
                {investing ? 'Processing...' : isProjectUpcoming ? 'Submit Interest' : 'Submit for Approval'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
