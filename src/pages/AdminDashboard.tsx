import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Plus, Calendar, Users, BarChart3, Trash2,
  Search, Filter, UserX, UserCheck, Edit2, Ban,
  TrendingUp, DollarSign, Activity, Shield, AlertCircle, Clock
} from 'lucide-react';
import { InvestmentApprovals } from '../components/admin/InvestmentApprovals';
import { QuestionApprovals } from '../components/admin/QuestionApprovals';
import { ProductManagement } from '../components/admin/ProductManagement';
import { ProjectEditor } from '../components/admin/ProjectEditor';

interface Project {
  id: string;
  title: string;
  status: string;
  current_funding: number;
  required_capital: number;
  location: string;
  category: string;
  expected_roi: number;
  emergency_buffer_percentage: number;
  emergency_buffer_amount_usd: number;
  emergency_buffer_amount_ngn: number;
}

interface Investment {
  id: string;
  amount: number;
  ngn_amount: number;
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

interface WeeklyUpdate {
  id: string;
  week_number: number;
  title: string;
  description: string;
  image_url: string | null;
  created_at: string;
  project: {
    title: string;
  };
}

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  country: string | null;
  created_at: string;
  is_suspended: boolean;
  suspended_reason: string | null;
  last_login: string | null;
}

export function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'projects' | 'updates' | 'users' | 'investments' | 'approvals' | 'questions' | 'products' | 'edit-projects'>('overview');
  const [projects, setProjects] = useState<Project[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [updates, setUpdates] = useState<WeeklyUpdate[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showAddUpdate, setShowAddUpdate] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  const [updateForm, setUpdateForm] = useState({
    week_number: '',
    title: '',
    description: '',
    image_url: '',
  });

  const [userEditForm, setUserEditForm] = useState({
    full_name: '',
    country: '',
    role: '',
  });

  useEffect(() => {
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadAllData();
    }
  }, [isAdmin]);

  const checkAdminStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('is_admin');
      if (error) throw error;
      setIsAdmin(data);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  const loadAllData = async () => {
    await Promise.all([
      loadProjects(),
      loadInvestments(),
      loadUpdates(),
      loadUsers(),
    ]);
  };

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, status, current_funding, required_capital, location, category, expected_roi, emergency_buffer_percentage, emergency_buffer_amount_usd, emergency_buffer_amount_ngn')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const loadInvestments = async () => {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select(`
          id,
          amount,
          ngn_amount,
          status,
          invested_at,
          investor_id,
          project_id,
          investor:investor_id(email, full_name),
          project:project_id(title, currency)
        `)
        .order('invested_at', { ascending: false });

      if (error) throw error;
      setInvestments(data || []);
    } catch (error) {
      console.error('Error loading investments:', error);
    }
  };

  const loadUpdates = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_updates')
        .select(`
          id,
          week_number,
          title,
          description,
          image_url,
          created_at,
          project:project_id(title)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error loading updates:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('weekly_updates').insert({
        project_id: selectedProjectId,
        week_number: parseInt(updateForm.week_number),
        title: updateForm.title,
        description: updateForm.description,
        image_url: updateForm.image_url || null,
      });

      if (error) throw error;

      const { data: investors } = await supabase
        .from('investments')
        .select('investor_id')
        .eq('project_id', selectedProjectId);

      if (investors && investors.length > 0) {
        const notifications = investors.map((inv) => ({
          user_id: inv.investor_id,
          type: 'project_update',
          title: 'New Project Update',
          message: `Week ${updateForm.week_number}: ${updateForm.title}`,
          link: `/project/${selectedProjectId}`,
          read: false,
        }));

        await supabase.from('notifications').insert(notifications);
      }

      alert('Update added successfully!');
      setShowAddUpdate(false);
      setUpdateForm({ week_number: '', title: '', description: '', image_url: '' });
      setSelectedProjectId('');
      loadUpdates();
    } catch (error) {
      console.error('Error adding update:', error);
      alert('Failed to add update');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      if (error) throw error;
      alert('Project deleted successfully');
      loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project');
    }
  };

  const updateProjectStatus = async (projectId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: newStatus })
        .eq('id', projectId);

      if (error) throw error;
      alert('Project status updated successfully');
      loadProjects();
    } catch (error) {
      console.error('Error updating project status:', error);
      alert('Failed to update project status');
    }
  };

  const handleSuspendUser = async (userId: string, reason: string) => {
    const suspendReason = reason || prompt('Please enter reason for suspension:');
    if (!suspendReason) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: true,
          suspended_reason: suspendReason,
        })
        .eq('id', userId);

      if (error) throw error;
      alert('User suspended successfully');
      loadUsers();
    } catch (error) {
      console.error('Error suspending user:', error);
      alert('Failed to suspend user');
    }
  };

  const handleUnsuspendUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_suspended: false,
          suspended_reason: null,
        })
        .eq('id', userId);

      if (error) throw error;
      alert('User unsuspended successfully');
      loadUsers();
    } catch (error) {
      console.error('Error unsuspending user:', error);
      alert('Failed to unsuspend user');
    }
  };

  const handleDeleteInvestment = async (investmentId: string) => {
    if (!confirm('Are you sure you want to delete this investment? This should only be used for system malfunction recovery. This action cannot be undone.')) {
      return;
    }

    const confirmText = prompt('Type "DELETE" to confirm:');
    if (confirmText !== 'DELETE') {
      alert('Deletion cancelled');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('admin_delete_investment', {
        investment_id: investmentId
      });

      if (error) throw error;

      if (data && !data.success) {
        throw new Error(data.error || 'Failed to delete investment');
      }

      alert('Investment deleted successfully');
      loadInvestments();
      loadProjects();
    } catch (error) {
      console.error('Error deleting investment:', error);
      alert(`Failed to delete investment: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This will delete all their data including investments. This action cannot be undone.')) {
      return;
    }

    const confirmText = prompt('Type "DELETE" to confirm:');
    if (confirmText !== 'DELETE') {
      alert('Deletion cancelled');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;
      alert('User deleted successfully');
      loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user');
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: userEditForm.full_name,
          country: userEditForm.country,
          role: userEditForm.role,
        })
        .eq('id', selectedUser.id);

      if (error) throw error;
      alert('User updated successfully');
      setShowEditUser(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const openEditUser = (user: UserProfile) => {
    setSelectedUser(user);
    setUserEditForm({
      full_name: user.full_name,
      country: user.country || '',
      role: user.role,
    });
    setShowEditUser(true);
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You do not have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  const totalFunding = projects.reduce((sum, p) => sum + p.current_funding, 0);
  const totalRequired = projects.reduce((sum, p) => sum + p.required_capital, 0);
  const totalInvestors = new Set(investments.map(i => i.investor?.email)).size;
  const activeUsers = users.filter(u => !u.is_suspended).length;
  const suspendedUsers = users.filter(u => u.is_suspended).length;

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && !u.is_suspended) ||
                         (statusFilter === 'suspended' && u.is_suspended);
    return matchesSearch && matchesStatus;
  });

  const recentActivity = [
    ...investments.slice(0, 5).map(inv => ({
      type: 'investment',
      message: `${inv.investor?.email} invested $${inv.amount.toLocaleString()}`,
      time: new Date(inv.invested_at).toLocaleDateString(),
    })),
    ...updates.slice(0, 5).map(upd => ({
      type: 'update',
      message: `New update: ${upd.title}`,
      time: new Date(upd.created_at).toLocaleDateString(),
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Farm Vora Admin Dashboard</h1>
            <p className="text-gray-600">Complete platform management and oversight</p>
          </div>
          <button
            onClick={() => setActiveTab('edit-projects')}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
            Create Project
          </button>
        </div>

        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                  <h3 className="text-sm font-semibold text-gray-600">Total Funding</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">${totalFunding.toLocaleString()}</p>
                <p className="text-sm text-gray-600 mt-1">of ${totalRequired.toLocaleString()} goal</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-6 h-6 text-blue-600" />
                  <h3 className="text-sm font-semibold text-gray-600">Total Users</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{users.length}</p>
                <p className="text-sm text-gray-600 mt-1">{activeUsers} active, {suspendedUsers} suspended</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                  <h3 className="text-sm font-semibold text-gray-600">Investments</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{investments.length}</p>
                <p className="text-sm text-gray-600 mt-1">{totalInvestors} unique investors</p>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="w-6 h-6 text-purple-600" />
                  <h3 className="text-sm font-semibold text-gray-600">Active Projects</h3>
                </div>
                <p className="text-3xl font-bold text-gray-900">{projects.length}</p>
                <p className="text-sm text-gray-600 mt-1">{updates.length} weekly updates</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {recentActivity.map((activity, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Activity className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Platform Statistics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Investment</span>
                    <span className="font-bold text-gray-900">
                      ${investments.length > 0 ? Math.round(totalFunding / investments.length).toLocaleString() : 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Funding Progress</span>
                    <span className="font-bold text-gray-900">
                      {totalRequired > 0 ? Math.round((totalFunding / totalRequired) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Active Projects</span>
                    <span className="font-bold text-gray-900">
                      {projects.filter(p => p.status === 'active').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg. Project ROI</span>
                    <span className="font-bold text-gray-900">
                      {projects.length > 0 ? Math.round(projects.reduce((sum, p) => sum + p.expected_roi, 0) / projects.length) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <span className="text-gray-600 font-semibold">Emergency Buffer (USD)</span>
                    <span className="font-bold text-orange-600">
                      ${projects.reduce((sum, p) => sum + (p.emergency_buffer_amount_usd || 0), 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-semibold">Emergency Buffer (NGN)</span>
                    <span className="font-bold text-orange-600">
                      ₦{projects.reduce((sum, p) => sum + (p.emergency_buffer_amount_ngn || 0), 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('projects')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'projects'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Projects ({projects.length})
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'users'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Users ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('investments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'investments'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Investments ({investments.length})
              </button>
              <button
                onClick={() => setActiveTab('updates')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'updates'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Updates ({updates.length})
              </button>
              <button
                onClick={() => setActiveTab('approvals')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'approvals'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-1">
                  Investment Approvals
                  <Clock className="w-4 h-4" />
                </div>
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'questions'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-1">
                  Question Approvals
                  <Clock className="w-4 h-4" />
                </div>
              </button>
              <button
                onClick={() => setActiveTab('edit-projects')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'edit-projects'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-1">
                  Edit Projects
                  <Edit2 className="w-4 h-4" />
                </div>
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'products'
                    ? 'border-green-600 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-1">
                  Store Products
                  <BarChart3 className="w-4 h-4" />
                </div>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'approvals' && <InvestmentApprovals />}

            {activeTab === 'questions' && <QuestionApprovals />}

            {activeTab === 'edit-projects' && <ProjectEditor />}

            {activeTab === 'products' && <ProductManagement />}

            {activeTab === 'projects' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">All Projects</h2>
                {projects.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No projects yet. Create your first project!</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Funding</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ROI</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {projects.map((project) => (
                          <tr key={project.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{project.title}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{project.location}</td>
                            <td className="px-6 py-4">
                              <select
                                value={project.status}
                                onChange={(e) => updateProjectStatus(project.id, e.target.value)}
                                className="text-xs font-semibold rounded-full px-3 py-1 bg-green-100 text-green-700 border-none cursor-pointer"
                              >
                                <option value="upcoming">Upcoming</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              ${project.current_funding.toLocaleString()} / ${project.required_capital.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{project.expected_roi}%</td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedProjectId(project.id);
                                    setShowAddUpdate(true);
                                  }}
                                  className="text-green-600 hover:text-green-700 font-semibold text-sm"
                                >
                                  Add Update
                                </button>
                                <button
                                  onClick={() => handleDeleteProject(project.id)}
                                  className="text-red-600 hover:text-red-700 font-semibold text-sm"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="all">All Users</option>
                      <option value="active">Active Only</option>
                      <option value="suspended">Suspended Only</option>
                    </select>
                  </div>
                </div>
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No users found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {filteredUsers.map((userProfile) => (
                          <tr key={userProfile.id} className={`hover:bg-gray-50 ${userProfile.is_suspended ? 'bg-red-50' : ''}`}>
                            <td className="px-6 py-4 font-medium text-gray-900">{userProfile.full_name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600">{userProfile.email}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                userProfile.role === 'admin'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-blue-100 text-blue-700'
                              }`}>
                                {userProfile.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">{userProfile.country || '-'}</td>
                            <td className="px-6 py-4">
                              {userProfile.is_suspended ? (
                                <div>
                                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-700">
                                    Suspended
                                  </span>
                                  {userProfile.suspended_reason && (
                                    <p className="text-xs text-gray-500 mt-1">{userProfile.suspended_reason}</p>
                                  )}
                                </div>
                              ) : (
                                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(userProfile.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => openEditUser(userProfile)}
                                  className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                                  title="Edit user"
                                >
                                  Edit
                                </button>
                                {userProfile.is_suspended ? (
                                  <button
                                    onClick={() => handleUnsuspendUser(userProfile.id)}
                                    className="text-green-600 hover:text-green-700 text-sm font-semibold"
                                    title="Unsuspend user"
                                  >
                                    Unsuspend
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleSuspendUser(userProfile.id, '')}
                                    className="text-orange-600 hover:text-orange-700 text-sm font-semibold"
                                    title="Suspend user"
                                  >
                                    Suspend
                                  </button>
                                )}
                                {userProfile.role !== 'admin' && (
                                  <button
                                    onClick={() => handleDeleteUser(userProfile.id)}
                                    className="text-red-600 hover:text-red-700 text-sm font-semibold"
                                    title="Delete user"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'investments' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">All Investments</h2>
                  <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-orange-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-gray-900">Emergency Buffer System</h3>
                        <p className="text-sm text-gray-700 mt-1">
                          10% of all raised funds is reserved for emergencies (disease, feed price increases, equipment repairs). This protects investor returns while ensuring smooth farm operations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                {investments.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No investments yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Investor</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {investments.map((investment) => (
                          <tr key={investment.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 font-medium">{investment.investor?.full_name || 'N/A'}</div>
                              <div className="text-xs text-gray-500">{investment.investor?.email || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">{investment.project?.title || 'N/A'}</td>
                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                              {investment.project?.currency === 'NGN'
                                ? `₦${investment.ngn_amount?.toLocaleString() || 0}`
                                : `$${investment.amount?.toLocaleString() || 0}`}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                investment.status === 'approved' ? 'bg-green-100 text-green-700' :
                                investment.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                'bg-orange-100 text-orange-700'
                              }`}>
                                {investment.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {new Date(investment.invested_at).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => handleDeleteInvestment(investment.id)}
                                className="text-red-600 hover:text-red-700 text-sm font-semibold"
                                title="Delete investment (for system malfunction recovery)"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'updates' && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Weekly Updates</h2>
                {updates.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600">No updates yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {updates.map((update) => (
                      <div key={update.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-gray-900">{update.title}</h3>
                            <p className="text-sm text-gray-600">
                              {update.project?.title} - Week {update.week_number}
                            </p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {new Date(update.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{update.description}</p>
                        {update.image_url && (
                          <img
                            src={update.image_url}
                            alt={update.title}
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Weekly Update</h2>
            <form onSubmit={handleAddUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Week Number</label>
                <input
                  type="number"
                  required
                  value={updateForm.week_number}
                  onChange={(e) => setUpdateForm({ ...updateForm, week_number: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Update Title</label>
                <input
                  type="text"
                  required
                  value={updateForm.title}
                  onChange={(e) => setUpdateForm({ ...updateForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  required
                  rows={4}
                  value={updateForm.description}
                  onChange={(e) => setUpdateForm({ ...updateForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (optional)</label>
                <input
                  type="url"
                  value={updateForm.image_url}
                  onChange={(e) => setUpdateForm({ ...updateForm, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddUpdate(false);
                    setSelectedProjectId('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditUser && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit User</h2>
            <form onSubmit={handleEditUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={userEditForm.full_name}
                  onChange={(e) => setUserEditForm({ ...userEditForm, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={userEditForm.country}
                  onChange={(e) => setUserEditForm({ ...userEditForm, country: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={userEditForm.role}
                  onChange={(e) => setUserEditForm({ ...userEditForm, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="investor">Investor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold text-gray-900">Email:</span> {selectedUser.email}
                </p>
                <p className="text-sm text-gray-700 mt-1">
                  <span className="font-semibold text-gray-900">User ID:</span> {selectedUser.id}
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditUser(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
