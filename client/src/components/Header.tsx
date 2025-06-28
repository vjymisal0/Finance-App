import React, { useState } from 'react';
import { Search, Bell, User, LogOut, Settings, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange }) => {
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="sticky top-0 z-30 bg-gray-900 border-b border-gray-800 lg:ml-64">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left section - Dashboard title */}
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold text-white">Dashboard</h1>
        </div>

        {/* Center section - Search bar (visual only) */}
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-gray-800 text-white placeholder-gray-400 pl-10 pr-4 py-2.5 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
        </div>

        {/* Right section - Notifications and User */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all duration-200">
              <Bell className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
            </button>
          </div>

          {/* User menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-1 rounded-lg hover:bg-gray-800 transition-all duration-200"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </button>

            {/* User dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl border border-gray-700 animate-fade-in-up">
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div>
                      <div className="text-white font-medium text-sm">{user?.name}</div>
                      <div className="text-gray-400 text-xs">{user?.email}</div>
                      <div className="text-xs text-blue-400 capitalize">{user?.role}</div>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200">
                    <User className="w-4 h-4" />
                    <span className="text-sm">Profile Settings</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200">
                    <Settings className="w-4 h-4" />
                    <span className="text-sm">Preferences</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-all duration-200">
                    <HelpCircle className="w-4 h-4" />
                    <span className="text-sm">Help & Support</span>
                  </button>
                  <hr className="my-2 border-gray-700" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;