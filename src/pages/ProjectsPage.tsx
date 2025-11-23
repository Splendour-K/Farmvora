import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ProjectCard } from '../components/projects/ProjectCard';
import { Filter, Search, Shield } from 'lucide-react';

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

interface ProjectsPageProps {
  onViewProject: (projectId: string) => void;
}

export function ProjectsPage({ onViewProject }: ProjectsPageProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [sortBy, setSortBy] = useState('roi');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    filterAndSortProjects();
  }, [projects, searchTerm, selectedCategory, selectedCountry, sortBy]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProjects = () => {
    let filtered = [...projects];

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (selectedCountry !== 'all') {
      filtered = filtered.filter(p => p.location.toLowerCase().includes(selectedCountry.toLowerCase()));
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'roi':
          return b.expected_roi - a.expected_roi;
        case 'funding':
          return (b.current_funding / b.required_capital) - (a.current_funding / a.required_capital);
        case 'duration':
          return a.duration_months - b.duration_months;
        default:
          return 0;
      }
    });

    setFilteredProjects(filtered);
  };

  const categories = ['all', ...new Set(projects.map(p => p.category))];
  const countries = ['all', ...new Set(projects.map(p => p.location.split(',')[0].trim()))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Agricultural Projects</h1>
          <p className="text-sm sm:text-base text-gray-600">Discover verified investment opportunities across Africa</p>

          <div className="mt-4 p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-2 sm:gap-3">
              <Shield className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">Your Investment is Protected</h3>
                <p className="text-xs sm:text-sm text-gray-700">
                  10% of all raised funds is reserved as an emergency buffer to protect your ROI. This covers unexpected challenges like disease outbreaks, feed price increases, or equipment repairs, ensuring smooth farm operations and secure returns.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Filters & Search</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </option>
              ))}
            </select>

            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {countries.map(country => (
                <option key={country} value={country}>
                  {country === 'all' ? 'All Countries' : country}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="roi">Highest ROI</option>
              <option value="funding">Most Funded</option>
              <option value="duration">Shortest Duration</option>
            </select>
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-base sm:text-lg">No projects found matching your criteria.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-xs sm:text-sm text-gray-600">
              Showing {filteredProjects.length} of {projects.length} projects
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onViewDetails={onViewProject}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
