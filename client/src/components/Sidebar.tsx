import React from 'react';
import { 
  LayoutDashboard, 
  CreditCard, 
  Wallet, 
  BarChart3, 
  User, 
  MessageSquare, 
  Settings 
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'personal', label: 'Personal', icon: User },
    { id: 'message', label: 'Message', icon: MessageSquare },
    { id: 'setting', label: 'Setting', icon: Settings }
  ];

  return (
    <div className="w-64 bg-gray-900 h-screen p-6 fixed left-0 top-0 z-40">
      <div className="flex items-center mb-8">
        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-lg">P</span>
        </div>
        <span className="text-white text-xl font-bold ml-3">Penta</span>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? ' text-green-500' 
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
  );
};

export default Sidebar;