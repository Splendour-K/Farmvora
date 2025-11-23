import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Hero } from './components/landing/Hero';
import { FeaturedProducts } from './components/landing/FeaturedProducts';
import { AboutUs } from './components/landing/AboutUs';
import { HowItWorks } from './components/landing/HowItWorks';
import { WhyChooseUs } from './components/landing/WhyChooseUs';
import { Stats } from './components/landing/Stats';
import { CallToAction } from './components/landing/CallToAction';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { InvestorDashboard } from './pages/InvestorDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProfilePage } from './pages/ProfilePage';
import { FavoritesPage } from './pages/FavoritesPage';
import { StorePage } from './pages/StorePage';
import { CartPage } from './pages/CartPage';

function AppContent() {
  const { user, profile, isAdmin, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const handleNavigate = (page: string, projectId?: string) => {
    if (projectId) {
      setSelectedProjectId(projectId);
      setCurrentPage('project-detail');
    } else {
      setCurrentPage(page);
      setSelectedProjectId(null);
    }
  };

  const handleViewProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentPage('project-detail');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar onNavigate={handleNavigate} currentPage={currentPage} />

      <main className="flex-1">
        {currentPage === 'home' && (
          <>
            <Hero
              onGetStarted={() => handleNavigate(user ? 'projects' : 'signup')}
              onBrowseProjects={() => handleNavigate('projects')}
              onVisitStore={() => handleNavigate('store')}
            />
            <FeaturedProducts onVisitStore={() => handleNavigate('store')} />
            <Stats />
            <WhyChooseUs />
            <HowItWorks />
            <AboutUs />
            <CallToAction onGetStarted={() => handleNavigate(user ? 'projects' : 'signup')} />
          </>
        )}

        {currentPage === 'store' && (
          <StorePage onNavigate={handleNavigate} />
        )}

        {currentPage === 'cart' && (
          <CartPage onNavigate={handleNavigate} />
        )}

        {currentPage === 'login' && (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Welcome Back</h2>
              <LoginForm
                onToggleForm={() => handleNavigate('signup')}
                onSuccess={() => handleNavigate('projects')}
              />
            </div>
          </div>
        )}

        {currentPage === 'signup' && (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Create Account</h2>
              <SignupForm
                onToggleForm={() => handleNavigate('login')}
                onSuccess={() => handleNavigate('projects')}
              />
            </div>
          </div>
        )}

        {currentPage === 'projects' && (
          <ProjectsPage onViewProject={handleViewProject} />
        )}

        {currentPage === 'project-detail' && selectedProjectId && (
          <ProjectDetailPage
            projectId={selectedProjectId}
            onBack={() => handleNavigate('projects')}
            onShowAuth={(tab) => handleNavigate(tab)}
          />
        )}

        {currentPage === 'dashboard' && user && (
          <InvestorDashboard onViewProject={handleViewProject} />
        )}

        {currentPage === 'admin' && user && isAdmin && (
          <AdminDashboard />
        )}

        {currentPage === 'profile' && user && (
          <ProfilePage />
        )}

        {currentPage === 'favorites' && user && (
          <FavoritesPage onViewProject={handleViewProject} />
        )}
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
