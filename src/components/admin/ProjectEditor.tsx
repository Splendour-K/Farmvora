import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';

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
  emergency_buffer_percentage: number;
  amount_raised_usd: number;
  amount_raised_ngn: number;
}

interface ProjectFormProps {
  formData: Partial<Project>;
  setFormData: Dispatch<SetStateAction<Partial<Project>>>;
  onSave: () => void;
  onCancel: () => void;
  isEdit: boolean;
}

function ProjectFormComponent({ formData, setFormData, onSave, onCancel, isEdit }: ProjectFormProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">{isEdit ? 'Edit Project' : 'Create New Project'}</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={4}
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            value={formData.location || ''}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select
            value={formData.category || 'crops'}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="crops">Crops</option>
            <option value="livestock">Livestock</option>
            <option value="aquaculture">Aquaculture</option>
            <option value="poultry">Poultry</option>
            <option value="horticulture">Horticulture</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Required Capital</label>
          <input
            type="number"
            step="0.01"
            value={formData.required_capital || 0}
            onChange={(e) => setFormData({ ...formData, required_capital: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="Amount in selected currency"
          />
          <p className="text-xs text-gray-500 mt-1">Amount will be in the currency selected below</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expected ROI (%)</label>
          <input
            type="number"
            step="0.01"
            value={formData.expected_roi || 0}
            onChange={(e) => setFormData({ ...formData, expected_roi: parseFloat(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration (months)</label>
          <input
            type="number"
            value={formData.duration_months || 0}
            onChange={(e) => setFormData({ ...formData, duration_months: parseInt(e.target.value) || 0 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Buffer (%)</label>
          <input
            type="number"
            value={formData.emergency_buffer_percentage || 10}
            onChange={(e) => setFormData({ ...formData, emergency_buffer_percentage: parseInt(e.target.value) || 10 })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input
            type="date"
            value={formData.start_date || ''}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expected Harvest Date</label>
          <input
            type="date"
            value={formData.expected_harvest_date || ''}
            onChange={(e) => setFormData({ ...formData, expected_harvest_date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
          <select
            value={formData.risk_level || 'low'}
            onChange={(e) => setFormData({ ...formData, risk_level: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={formData.status || 'active'}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select
            value={formData.currency || 'NGN'}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          >
            <option value="NGN">🇳🇬 Nigerian Naira (₦)</option>
            <option value="USD">🇺🇸 US Dollar ($)</option>
            <option value="GHS">🇬🇭 Ghanaian Cedi (₵)</option>
            <option value="KES">🇰🇪 Kenyan Shilling (KSh)</option>
            <option value="ZAR">🇿🇦 South African Rand (R)</option>
            <option value="EUR">🇪🇺 Euro (€)</option>
            <option value="GBP">🇬🇧 British Pound (£)</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Select the currency for this project. All investments and returns will be calculated in this currency.
          </p>
        </div>

        <div className="col-span-2">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <span className="font-semibold">Project Owner:</span> All projects are owned and coordinated by <span className="font-bold">Farm Vora</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={onSave}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isEdit ? 'Update Project' : 'Create Project'}
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Cancel
        </button>
      </div>
    </div>
  );
}

export function ProjectEditor() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    description: '',
    location: '',
    category: 'crops',
    required_capital: 0,
    expected_roi: 0,
    duration_months: 6,
    start_date: new Date().toISOString().split('T')[0],
    expected_harvest_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    risk_level: 'low',
    status: 'active',
    currency: 'NGN',
    emergency_buffer_percentage: 10,
  });

  useEffect(() => {
    loadProjects();
  }, []);

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

  const handleCreate = async () => {
    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          ...formData,
          current_funding: 0,
          amount_raised_usd: 0,
          amount_raised_ngn: 0,
        });

      if (error) throw error;

      alert('Project created successfully!');
      setCreating(false);
      resetForm();
      loadProjects();
    } catch (error: any) {
      console.error('Error creating project:', error);
      alert(`Failed to create project: ${error.message}`);
    }
  };

  const handleUpdate = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update(formData)
        .eq('id', projectId);

      if (error) throw error;

      alert('Project updated successfully!');
      setEditing(null);
      loadProjects();
    } catch (error: any) {
      console.error('Error updating project:', error);
      alert(`Failed to update project: ${error.message}`);
    }
  };

  const handleDelete = async (projectId: string, projectTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${projectTitle}"? This will also delete all related investments.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      alert('Project deleted successfully!');
      loadProjects();
    } catch (error: any) {
      console.error('Error deleting project:', error);
      alert(`Failed to delete project: ${error.message}`);
    }
  };

  const startEdit = (project: Project) => {
    setEditing(project.id);
    setFormData({
      title: project.title,
      description: project.description,
      location: project.location,
      category: project.category,
      required_capital: project.required_capital,
      expected_roi: project.expected_roi,
      duration_months: project.duration_months,
      start_date: project.start_date,
      expected_harvest_date: project.expected_harvest_date,
      risk_level: project.risk_level,
      status: project.status,
      currency: project.currency || 'NGN',
      emergency_buffer_percentage: project.emergency_buffer_percentage,
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      location: '',
      category: 'crops',
      required_capital: 0,
      expected_roi: 0,
      duration_months: 6,
      start_date: new Date().toISOString().split('T')[0],
      expected_harvest_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      risk_level: 'low',
      status: 'active',
      currency: 'NGN',
      emergency_buffer_percentage: 10,
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setCreating(false);
    resetForm();
  };

  if (loading) {
    return <div className="text-center py-8">Loading projects...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Project Management</h2>
        {!creating && !editing && (
          <button
            onClick={() => setCreating(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        )}
      </div>

      {creating && (
        <ProjectFormComponent
          formData={formData}
          setFormData={setFormData}
          onSave={handleCreate}
          onCancel={cancelEdit}
          isEdit={false}
        />
      )}

      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="bg-white rounded-xl border border-gray-200 p-6">
            {editing === project.id ? (
              <ProjectFormComponent
                formData={formData}
                setFormData={setFormData}
                onSave={() => handleUpdate(project.id)}
                onCancel={cancelEdit}
                isEdit={true}
              />
            ) : (
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{project.location} • {project.category}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      project.status === 'active' ? 'bg-green-100 text-green-700' :
                      project.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {project.status}
                    </span>
                    <button
                      onClick={() => startEdit(project)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id, project.title)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{project.description}</p>

                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500">Required Capital</div>
                    <div className="text-sm font-semibold text-gray-900">${project.required_capital.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Amount Raised</div>
                    <div className="text-sm font-semibold text-green-600">
                      ${(project.amount_raised_usd || 0).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Expected ROI</div>
                    <div className="text-sm font-semibold text-gray-900">{project.expected_roi}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Duration</div>
                    <div className="text-sm font-semibold text-gray-900">{project.duration_months} months</div>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Funding Progress</span>
                    <span className="font-semibold text-green-600">
                      {((project.amount_raised_ngn || 0) / project.required_capital * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-green-600 h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.min(((project.amount_raised_ngn || 0) / project.required_capital) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Risk: </span>
                    <span className={`font-semibold ${
                      project.risk_level === 'low' ? 'text-green-600' :
                      project.risk_level === 'medium' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {project.risk_level}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Start: </span>
                    <span className="text-gray-900">{new Date(project.start_date).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Harvest: </span>
                    <span className="text-gray-900">{new Date(project.expected_harvest_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
