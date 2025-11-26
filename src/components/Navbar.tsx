import { LogIn, UserPlus, LogOut, LayoutDashboard, User, Heart, Shield, ShoppingBag, Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            onClick={() => handleNavigate('/')}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <div className="flex items-baseline text-xl sm:text-2xl font-bold leading-none">
              <span className="text-[#EF4444]">Farm</span>
              <span className="text-[#106861]">Vora</span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-4 xl:gap-6">
            {user ? (
              <>
                <button
                  onClick={() => handleNavigate('/projects')}
                  className={`text-sm xl:text-base text-gray-700 hover:text-green-600 transition-colors ${
                    isActive('/projects') ? 'text-green-600 font-semibold' : ''
                  }`}
                >
                  Projects
                </button>
                <button
                  onClick={() => handleNavigate('/store')}
                  className={`flex items-center gap-1 text-sm xl:text-base text-gray-700 hover:text-orange-600 transition-colors ${
                    isActive('/store') ? 'text-orange-600 font-semibold' : ''
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span className="hidden xl:inline">Store</span>
                </button>
                {isAdmin ? (
                  <button
                    onClick={() => handleNavigate('/admin')}
                    className={`flex items-center gap-1 text-sm xl:text-base text-gray-700 hover:text-green-600 transition-colors ${
                      isActive('/admin') ? 'text-green-600 font-semibold' : ''
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    <span className="hidden xl:inline">Admin</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleNavigate('/dashboard')}
                      className={`flex items-center gap-1 text-sm xl:text-base text-gray-700 hover:text-green-600 transition-colors ${
                        isActive('/dashboard') ? 'text-green-600 font-semibold' : ''
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span className="hidden xl:inline">Dashboard</span>
                    </button>
                    <button
                      onClick={() => handleNavigate('/favorites')}
                      className={`flex items-center gap-1 text-sm xl:text-base text-gray-700 hover:text-green-600 transition-colors ${
                        isActive('/favorites') ? 'text-green-600 font-semibold' : ''
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                      <span className="hidden xl:inline">Watchlist</span>
                    </button>
                    <NotificationDropdown />
                  </>
                )}
                <button
                  onClick={() => handleNavigate('/profile')}
                  className={`flex items-center gap-1 text-sm xl:text-base text-gray-700 hover:text-green-600 transition-colors ${
                    isActive('/profile') ? 'text-green-600 font-semibold' : ''
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden xl:inline">Profile</span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden xl:inline">Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigate('/projects')}
                  className={`text-sm xl:text-base text-gray-700 hover:text-green-600 transition-colors ${
                    isActive('/projects') ? 'text-green-600 font-semibold' : ''
                  }`}
                >
                  Projects
                </button>
                <button
                  onClick={() => handleNavigate('/store')}
                  className={`flex items-center gap-1 text-sm xl:text-base text-gray-700 hover:text-orange-600 transition-colors ${
                    isActive('/store') ? 'text-orange-600 font-semibold' : ''
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Store
                </button>
                <button
                  onClick={() => handleNavigate('/login')}
                  className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 hover:text-green-600 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </button>
                <button
                  onClick={() => handleNavigate('/signup')}
                  className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-gray-700 hover:text-green-600 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 py-4 space-y-2">
            {user ? (
              <>
                <button
                  onClick={() => handleNavigate('/projects')}
                  className={`w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors ${
                    isActive('/projects') ? 'text-green-600 font-semibold bg-green-50' : ''
                  }`}
                >
                  Projects
                </button>
                <button
                  onClick={() => handleNavigate('/store')}
                  className={`w-full text-left px-4 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition-colors ${
                    isActive('/store') ? 'text-orange-600 font-semibold bg-orange-50' : ''
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Store
                </button>
                {isAdmin ? (
                  <button
                    onClick={() => handleNavigate('/admin')}
                    className={`w-full text-left px-4 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors ${
                      isActive('/admin') ? 'text-green-600 font-semibold bg-green-50' : ''
                    }`}
                  >
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => handleNavigate('/dashboard')}
                      className={`w-full text-left px-4 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors ${
                        isActive('/dashboard') ? 'text-green-600 font-semibold bg-green-50' : ''
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => handleNavigate('/favorites')}
                      className={`w-full text-left px-4 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors ${
                        isActive('/favorites') ? 'text-green-600 font-semibold bg-green-50' : ''
                      }`}
                    >
                      <Heart className="w-4 h-4" />
                      Watchlist
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleNavigate('/profile')}
                  className={`w-full text-left px-4 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors ${
                    isActive('/profile') ? 'text-green-600 font-semibold bg-green-50' : ''
                  }`}
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 flex items-center gap-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleNavigate('/projects')}
                  className={`w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors ${
                    isActive('/projects') ? 'text-green-600 font-semibold bg-green-50' : ''
                  }`}
                >
                  Projects
                </button>
                <button
                  onClick={() => handleNavigate('/store')}
                  className={`w-full text-left px-4 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition-colors ${
                    isActive('/store') ? 'text-orange-600 font-semibold bg-orange-50' : ''
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  Store
                </button>
                <button
                  onClick={() => handleNavigate('/login')}
                  className="w-full text-left px-4 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-50 hover:text-green-600 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </button>
                <button
                  onClick={() => handleNavigate('/signup')}
                  className="mx-4 mt-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 justify-center"
                >
                  <UserPlus className="w-4 h-4" />
                  Sign Up
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
