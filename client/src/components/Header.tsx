import React, { useState } from 'react';
import { Search, Bell, User, LogOut, Menu, X, Settings, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Search suggestions for dashboard sections
  const searchSuggestions = [
    'metrics', 'balance', 'revenue', 'expenses', 'savings',
    'chart', 'overview', 'trends', 'financial overview',
    'recent transactions', 'recent', 'latest', 'activities',
    'transactions', 'transaction table', 'all transactions'
  ];

  const getSearchPlaceholder = () => {
    const suggestions = ['metrics', 'chart', 'recent transactions', 'transactions'];
    const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    return `Search dashboard sections... (try "${randomSuggestion}")`;
  };

  return (
    <div className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50 lg:ml-64">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all duration-200"
          >
            {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Page title */}
          <div className="hidden sm:block">
            <h1 className="text-2xl font-bold text-white gradient-text">Dashboard</h1>
            <p className="text-sm text-gray-400">Welcome back, {user?.name}</p>
          </div>
        </div>

        {/* Center section - Search */}
        <div className="flex-1 max-w-2xl mx-4 sm:mx-8">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-green-400 transition-colors duration-200" />
            <input
              type="text"
              placeholder={getSearchPlaceholder()}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-gray-800/80 text-white placeholder-gray-400 pl-12 pr-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200 backdrop-blur-sm"
            />
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/10 to-blue-500/10 opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none" />

            {/* Search hint */}
            {searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-xl p-3 shadow-xl">
                <p className="text-gray-400 text-sm mb-2">💡 Dashboard search suggestions:</p>
                <div className="flex flex-wrap gap-2">
                  {searchSuggestions
                    .filter(suggestion =>
                      suggestion.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      searchQuery.toLowerCase().includes(suggestion.toLowerCase())
                    )
                    .slice(0, 4)
                    .map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => onSearchChange(suggestion)}
                        className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm hover:bg-green-500/30 transition-colors duration-200"
                      >
                        {suggestion}
                      </button>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-3">
          {/* Notifications */}
          <div className="relative">
            <button className="p-3 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition-all duration-200 hover-lift">
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            </button>
          </div>

          {/* Help */}
          <button className="hidden sm:flex p-3 rounded-xl bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition-all duration-200 hover-lift">
            <HelpCircle className="w-5 h-5" />
          </button>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-xl bg-gray-800/80 hover:bg-gray-700 transition-all duration-200 hover-lift"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-xl object-cover border-2 border-gray-600"
                />
              ) : (
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="hidden md:block text-left">
                <div className="text-white text-sm font-medium">{user?.name}</div>
                <div className="text-gray-400 text-xs capitalize">{user?.role}</div>
              </div>
            </button>

            {/* User dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 glass rounded-xl shadow-xl-colored border border-gray-700/50 animate-fade-in-up">
                <div className="p-4 border-b border-gray-700/50">
                  <div className="flex items-center space-x-3">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-12 h-12 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div>
                      <div className="text-white font-medium">{user?.name}</div>
                      <div className="text-gray-400 text-sm">{user?.email}</div>
                      <div className="text-xs text-green-400 capitalize">{user?.role}</div>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200">
                    <User className="w-4 h-4" />
                    <span>Profile Settings</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200">
                    <Settings className="w-4 h-4" />
                    <span>Preferences</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200">
                    <HelpCircle className="w-4 h-4" />
                    <span>Help & Support</span>
                  </button>
                  <hr className="my-2 border-gray-700/50" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search (shown when mobile menu is open) */}
      {showMobileMenu && (
        <div className="lg:hidden px-4 pb-4 border-t border-gray-700/50 animate-fade-in-up">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search dashboard sections..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-gray-800 text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;