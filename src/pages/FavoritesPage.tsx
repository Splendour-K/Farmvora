import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { ProjectCard } from '../components/projects/ProjectCard';
import { Heart } from 'lucide-react';

interface Project {
  id: string;
  title: string;
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
}

export function FavoritesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('project_favorites')
        .select(`
          project_id,
          projects (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projects = data?.map((fav: any) => fav.projects).filter(Boolean) || [];
      setFavorites(projects);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Heart className="w-8 h-8 text-red-500 fill-red-500" />
            <h1 className="text-4xl font-bold text-gray-900">My Watchlist</h1>
          </div>
          <p className="text-gray-600">Projects you're interested in</p>
        </div>

        {favorites.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No favorites yet</h2>
            <p className="text-gray-600 mb-6">
              Start building your watchlist by clicking the heart icon on projects you're interested in.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-gray-600">
              {favorites.length} {favorites.length === 1 ? 'project' : 'projects'} in your watchlist
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onViewDetails={(id) => navigate(`/projects/${id}`)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
