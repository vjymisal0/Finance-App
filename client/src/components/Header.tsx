import React, { useState } from 'react';
import { Search, Bell, User, LogOut, Settings, HelpCircle, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeTab: string;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange, activeTab }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Function to get display name for active tab
  const getTabDisplayName = (tab: string) => {
    const tabNames: { [key: string]: string } = {
      'dashboard': 'Dashboard',
      'transactions': 'Transactions',
      'wallet': 'Wallet',
      'analytics': 'Analytics',
      'personal': 'Personal Finance',
      'message': 'Messages',
      'setting': 'Settings'
    };
    return tabNames[tab] || 'Dashboard';
  };

  // Function to get tab emoji/icon
  const getTabEmoji = (tab: string) => {
    const tabEmojis: { [key: string]: string } = {
      'dashboard': '📊',
      'transactions': '💳',
      'wallet': '👛',
      'analytics': '📈',
      'personal': '👤',
      'message': '💬',
      'setting': '⚙️'
    };
    return tabEmojis[tab] || '📊';
  };

  // Function to get tab description
  const getTabDescription = (tab: string) => {
    const descriptions: { [key: string]: string } = {
      'dashboard': 'Overview of your financial data',
      'transactions': 'Manage your financial transactions',
      'wallet': 'Digital wallet management',
      'analytics': 'Financial insights and reports',
      'personal': 'Personal finance management',
      'message': 'Notifications and messages',
      'setting': 'Account and app settings'
    };
    return descriptions[tab] || 'Overview of your financial data';
  };

  return (
    <div className="sticky top-0 z-30 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800 lg:ml-64">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4">
        {/* Left section - Current Tab Display */}
        <div className="flex items-center space-x-3">
          {/* Mobile menu button - only visible on mobile */}
          <button className="lg:hidden p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all duration-200">
            <Menu className="w-5 h-5" />
          </button>

          {/* Tab Display */}
          <div className="flex items-center space-x-3">
            <span className="text-2xl hidden sm:inline">{getTabEmoji(activeTab)}</span>
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-white">
                {getTabDisplayName(activeTab)}
              </h1>
              <p className="text-xs sm:text-sm text-gray-400 hidden sm:block">
                {getTabDescription(activeTab)}
              </p>
            </div>
          </div>
        </div>

        {/* Center section - Search bar (hidden on small screens) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-gray-800/80 text-white placeholder-gray-400 pl-10 pr-4 py-2.5 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Right section - Notifications and User */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Mobile search button */}
          <button className="md:hidden p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all duration-200">
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications */}
          <div className="relative">
            <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all duration-200 relative">
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </button>
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 sm:space-x-3 p-1 rounded-lg hover:bg-gray-800 transition-all duration-200"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-600 hover:border-green-500 transition-colors"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center border-2 border-gray-600 hover:border-green-500 transition-colors">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}

              {/* User name - hidden on small screens */}
              <div className="hidden sm:block text-left">
                <div className="text-white font-medium text-sm">{user?.name}</div>
                <div className="text-gray-400 text-xs capitalize">{user?.role}</div>
              </div>
            </button>

            {/* User dropdown */}
            {showUserMenu && (
              <>
                {/* Backdrop for mobile */}
                <div
                  className="fixed inset-0 z-40 md:hidden"
                  onClick={() => setShowUserMenu(false)}
                />

                <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-2xl border border-gray-700/50 animate-fade-in-up z-50">
                  {/* User info header */}
                  <div className="p-4 border-b border-gray-700/50">
                    <div className="flex items-center space-x-3">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center border-2 border-gray-600">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-sm truncate">{user?.name}</div>
                        <div className="text-gray-400 text-xs truncate">{user?.email}</div>
                        <div className="text-xs text-green-400 capitalize mt-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                            {user?.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="p-2">
                    <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200 text-left">
                      <User className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">Profile Settings</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200 text-left">
                      <Settings className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">Preferences</span>
                    </button>
                    <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700/50 transition-all duration-200 text-left">
                      <HelpCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">Help & Support</span>
                    </button>

                    <hr className="my-2 border-gray-700/50" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 text-left"
                    >
                      <LogOut className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search bar - shown when search button is clicked */}
      <div className="md:hidden px-4 pb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-gray-800/80 text-white placeholder-gray-400 pl-10 pr-4 py-2.5 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200 backdrop-blur-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default Header;