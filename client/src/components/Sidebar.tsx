import React, { useState } from 'react';
import {
  LayoutDashboard,
  CreditCard,
  Wallet,
  BarChart3,
  User,
  MessageSquare,
  Settings,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'message', label: 'Message', icon: MessageSquare },
    { id: 'setting', label: 'Setting', icon: Settings }
  ];

  const handleMenuItemClick = (itemId: string) => {
    onTabChange(itemId);
    setIsMobileMenuOpen(false); // Close mobile menu when item is selected
  };

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white transition-all duration-200 shadow-lg"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        w-64 bg-gray-900 h-screen p-6 fixed left-0 top-0 z-40 transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo Section */}
        <div className="flex items-center mb-8">
          <div className="w-10 h-10 mr-3 flex-shrink-0">
            <img
              src="/salary.png"
              alt="FinStack Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-white text-xl font-bold">FinStack</span>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleMenuItemClick(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${isActive
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-glow'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;