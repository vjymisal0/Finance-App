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
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (!dashboardData) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-400">Failed to load dashboard data</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dashboardData.metrics.map((metric: any, index: number) => (
            <MetricCard
              key={metric.title}
              metric={metric}
              highlighted={index === 3}
            />
          ))}
        </div>

        {/* Chart and Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
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
    <div>
      <TransactionTable
        onAddAlert={addAlert}
        fullView={true}
      />
    </div>
  );

  const renderAnalytics = () => (
    <div>
      <Analytics />
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
        return (
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Wallet</h2>
            <p className="text-gray-400">Wallet functionality coming soon...</p>
          </div>
        );
      default:
        return (
          <div className="bg-gray-800 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Coming Soon</h2>
            <p className="text-gray-400">This feature is under development...</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Alert System */}
      <AlertSystem alerts={alerts} onRemoveAlert={removeAlert} />

      {/* Main Content */}
      <div className="ml-64 pt-5 px-6 py-4">
        {renderContent()}
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
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
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