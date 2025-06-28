import React, { useState, useMemo, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthPage from './components/auth/AuthPage';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MetricCard from './components/MetricCard';
import Chart from './components/Chart';
import RecentTransactions from './components/RecentTransactions';
import TransactionTable from './components/TransactionTable';
import AlertSystem from './components/AlertSystem';
import Analytics from './components/Analytics';
import { apiService } from './services/api';
import { Transaction, Alert } from './types';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Add alert function
  const addAlert = (type: Alert['type'], message: string) => {
    const newAlert: Alert = {
      id: Date.now().toString(),
      type,
      message,
      timestamp: Date.now()
    };
    setAlerts(prev => [...prev, newAlert]);
  };

  // Remove alert function
  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getDashboardData();
        setDashboardData(response.data);
      } catch (error) {
        addAlert('error', 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const renderDashboard = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-gray-400 text-lg">Loading your financial data...</p>
            <p className="text-gray-500 text-sm mt-2">This may take a few moments</p>
          </div>
        </div>
      );
    }

    if (!dashboardData) {
      return (
        <div className="text-center py-20">
          <div className="glass rounded-2xl p-8 max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-400 text-2xl">⚠️</span>
            </div>
            <p className="text-red-400 text-lg font-medium mb-2">Failed to load dashboard data</p>
            <p className="text-gray-400 text-sm">Please try refreshing the page</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-fade-in-up">
        {/* Welcome Section */}
        <div className="glass rounded-2xl p-6 border border-gray-700/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome back! 👋
              </h2>
              <p className="text-gray-400">
                Here's what's happening with your finances today.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-400">Today's Date</div>
                <div className="text-white font-medium">
                  {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardData.metrics.map((metric: any, index: number) => (
            <div key={metric.title} style={{ animationDelay: `${index * 100}ms` }}>
              <MetricCard
                metric={metric}
                highlighted={index === 0}
              />
            </div>
          ))}
        </div>

        {/* Chart and Recent Transactions */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <Chart data={dashboardData.chartData} />
          </div>
          <div>
            <RecentTransactions transactions={dashboardData.recentTransactions} />
          </div>
        </div>

        {/* Transactions Table */}
        <div>
          <TransactionTable
            onAddAlert={addAlert}
          />
        </div>
      </div>
    );
  };

  const renderTransactions = () => (
    <div className="animate-fade-in-up">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">All Transactions</h2>
        <p className="text-gray-400">Manage and track all your financial transactions</p>
      </div>
      <TransactionTable
        onAddAlert={addAlert}
        fullView={true}
      />
    </div>
  );

  const renderAnalytics = () => (
    <div className="animate-fade-in-up">
      <Analytics />
    </div>
  );

  const renderComingSoon = (title: string, description: string) => (
    <div className="flex items-center justify-center min-h-[60vh] animate-fade-in-up">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow">
          <span className="text-white text-4xl">🚀</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
        <p className="text-gray-400 mb-8">{description}</p>
        <div className="glass rounded-xl p-6">
          <p className="text-sm text-gray-300 mb-4">
            This feature is currently under development and will be available soon.
          </p>
          <button className="btn-primary">
            Get Notified
          </button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'transactions':
        return renderTransactions();
      case 'analytics':
        return renderAnalytics();
      case 'wallet':
        return renderComingSoon('Digital Wallet', 'Manage your digital assets and cryptocurrencies in one place.');
      case 'personal':
        return renderComingSoon('Personal Finance', 'Get personalized insights and recommendations for your financial goals.');
      case 'message':
        return renderComingSoon('Messages & Notifications', 'Stay updated with important financial alerts and communications.');
      case 'setting':
        return renderComingSoon('Settings & Preferences', 'Customize your dashboard and manage your account settings.');
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Alert System */}
      <AlertSystem alerts={alerts} onRemoveAlert={removeAlert} />

      {/* Main Content */}
      <div className="lg:ml-64 pt-4">
        <div className="px-4 sm:px-6 lg:px-8 pb-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-gray-400 text-xl">Loading FinStack...</p>
          <p className="text-gray-500 text-sm mt-2">Preparing your financial dashboard</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
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