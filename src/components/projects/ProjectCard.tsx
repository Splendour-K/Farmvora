import { useState, useEffect } from 'react';
import { MapPin, Calendar, TrendingUp, Clock, Heart } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Project {
  id: string;
  title: string;
  location: string;
  category: string;
  required_capital: number;
  current_funding: number;
  amount_raised_ngn?: number;
  expected_roi: number;
  duration_months: number;
  start_date: string;
  expected_harvest_date: string;
  risk_level: string;
  status: string;
}

interface ProjectCardProps {
  project: Project;
  onViewDetails: (projectId: string) => void;
}

export function ProjectCard({ project, onViewDetails }: ProjectCardProps) {
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentFunding = project.amount_raised_ngn || project.current_funding || 0;
  const fundingPercentage = (currentFunding / project.required_capital) * 100;
  const remaining = project.required_capital - currentFunding;
  const isFunded = fundingPercentage >= 100;

  useEffect(() => {
    if (user) {
      checkIfFavorite();
    }
  }, [user, project.id]);

  const checkIfFavorite = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('project_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('project_id', project.id)
        .maybeSingle();

      if (error) throw error;
      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || loading) return;

    setLoading(true);

    try {
      if (isFavorite) {
        const { error } = await supabase
          .from('project_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('project_id', project.id);

        if (error) throw error;
        setIsFavorite(false);
      } else {
        const { error } = await supabase
          .from('project_favorites')
          .insert({
            user_id: user.id,
            project_id: project.id,
          });

        if (error) throw error;
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50';
      case 'upcoming': return 'text-blue-600 bg-blue-50';
      case 'completed': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-4xl font-bold mb-2">{project.category}</div>
          <div className="text-sm opacity-90">Agricultural Project</div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 flex-1">{project.title}</h3>
          <div className="flex items-center gap-2">
            {user && (
              <button
                onClick={toggleFavorite}
                disabled={loading}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart
                  className={`w-5 h-5 ${
                    isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'
                  } transition-colors`}
                />
              </button>
            )}
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
              {project.status}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-600 mb-4">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{project.location}</span>
          <span className={`ml-auto px-2 py-1 rounded-full text-xs font-semibold ${getRiskColor(project.risk_level)}`}>
            {project.risk_level} risk
          </span>
        </div>

        <div className="space-y-3 mb-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Funding Progress</span>
              <span className={`font-semibold ${isFunded ? 'text-green-600' : 'text-gray-900'}`}>
                {fundingPercentage.toFixed(0)}%
                {isFunded && ' - Fully Funded!'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${isFunded ? 'bg-green-500' : 'bg-green-600'}`}
                style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>₦{currentFunding.toLocaleString()} raised</span>
              <span>{isFunded ? 'Complete!' : `₦${remaining.toLocaleString()} remaining`}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <div>
                <div className="text-xs text-gray-500">Expected ROI</div>
                <div className="text-sm font-semibold text-gray-900">{project.expected_roi}%</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <div>
                <div className="text-xs text-gray-500">Duration</div>
                <div className="text-sm font-semibold text-gray-900">{project.duration_months} months</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>
              Harvest: {new Date(project.expected_harvest_date).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>

        <button
          onClick={() => onViewDetails(project.id)}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-semibold"
        >
          View Details
        </button>
      </div>
    </div>
  );
}
