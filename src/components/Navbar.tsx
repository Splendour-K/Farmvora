import { Sprout, LogIn, UserPlus, LogOut, LayoutDashboard, User, Heart, Shield, ShoppingBag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';

interface NavbarProps {
  onNavigate: (page: string, projectId?: string) => void;
  currentPage: string;
}

export function Navbar({ onNavigate, currentPage }: NavbarProps) {
  const { user, profile, isAdmin, signOut } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-xl font-bold text-green-600 hover:text-green-700 transition-colors"
          >
            <Sprout className="w-8 h-8" />
            FarmVora
          </button>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <button
                  onClick={() => onNavigate('projects')}
                  className={`text-gray-700 hover:text-green-600 transition-colors ${
                    currentPage === 'projects' ? 'text-green-600 font-semibold' : ''
                  }`}
                >
                  Projects
                </button>
                <button
                  onClick={() => onNavigate('store')}
                  className={`flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors ${
                    currentPage === 'store' ? 'text-orange-600 font-semibold' : ''
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Store
                </button>
                {isAdmin ? (
                  <button
                    onClick={() => onNavigate('admin')}
                    className={`flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors ${
                      currentPage === 'admin' ? 'text-green-600 font-semibold' : ''
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => onNavigate('dashboard')}
                      className={`flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors ${
                        currentPage === 'dashboard' ? 'text-green-600 font-semibold' : ''
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => onNavigate('favorites')}
                      className={`flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors ${
                        currentPage === 'favorites' ? 'text-green-600 font-semibold' : ''
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                      Watchlist
                    </button>
                    <NotificationDropdown onNavigate={onNavigate} />
                  </>
                )}
                <button
                  onClick={() => onNavigate('profile')}
                  className={`flex items-center gap-2 text-gray-700 hover:text-green-600 transition-colors ${
                    currentPage === 'profile' ? 'text-green-600 font-semibold' : ''
                  }`}
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={signOut}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('projects')}
                  className={`text-gray-700 hover:text-green-600 transition-colors ${
                    currentPage === 'projects' ? 'text-green-600 font-semibold' : ''
                  }`}
                >
                  Projects
                </button>
                <button
                  onClick={() => onNavigate('store')}
                  className={`flex items-center gap-2 text-gray-700 hover:text-orange-600 transition-colors ${
                    currentPage === 'store' ? 'text-orange-600 font-semibold' : ''
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Store
                </button>
                <button
                  onClick={() => onNavigate('login')}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-green-600 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </button>
                <button
                  onClick={() => onNavigate('signup')}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
