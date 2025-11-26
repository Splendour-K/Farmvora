import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Hero } from './components/landing/Hero';
import { FeaturedProducts } from './components/landing/FeaturedProducts';
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
import { AboutPage } from './pages/AboutPage';

// Homepage component
function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <>
      <Hero
        onGetStarted={() => navigate(user ? '/projects' : '/signup')}
        onBrowseProjects={() => navigate('/projects')}
        onVisitStore={() => navigate('/store')}
      />
      <FeaturedProducts onVisitStore={() => navigate('/store')} />
      <Stats />
      <WhyChooseUs />
      <HowItWorks />
      <CallToAction onGetStarted={() => navigate(user ? '/projects' : '/signup')} />
    </>
  );
}

// Login page component
function LoginPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Welcome Back</h2>
        <LoginForm
          onToggleForm={() => navigate('/signup')}
          onSuccess={() => navigate('/projects')}
        />
      </div>
    </div>
  );
}

// Signup page component
function SignupPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Create Account</h2>
        <SignupForm
          onToggleForm={() => navigate('/login')}
          onSuccess={() => navigate('/projects')}
        />
      </div>
    </div>
  );
}

// Protected Route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

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

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// Admin Route wrapper
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();

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

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}


function AppContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/cart" element={<CartPage />} />

          {/* Protected routes (require authentication) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <InvestorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/favorites"
            element={
              <ProtectedRoute>
                <FavoritesPage />
              </ProtectedRoute>
            }
          />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

