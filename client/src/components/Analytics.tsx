import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadialBarChart,
  RadialBar,
  ComposedChart
} from 'recharts';
import { Calendar, TrendingUp, DollarSign, Users, Filter, Download, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';

interface AnalyticsData {
  monthlyTrends: any[];
  categoryBreakdown: any[];
  statusDistribution: any[];
  userActivity: any[];
  amountDistribution: any[];
  timeSeriesData: any[];
  performanceMetrics: any[];
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    avgTransaction: number;
    totalTransactions: number;
    profitMargin: number;
  };
}

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getAnalyticsData(selectedPeriod);
      setAnalyticsData(response.data);
    } catch (error: any) {
      console.error('Failed to fetch analytics data:', error);
      setError(error.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#F97316'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => {
            const entryName = entry.name || entry.dataKey || 'Value';
            const entryValue = entry.value;
            
            // Check if this is a monetary value
            const isMonetary = typeof entryName === 'string' && (
              entryName.toLowerCase().includes('amount') || 
              entryName.toLowerCase().includes('revenue') || 
              entryName.toLowerCase().includes('expense') || 
              entryName.toLowerCase().includes('profit') ||
              entryName.toLowerCase().includes('net') ||
              entryName === 'totalAmount' ||
              entryName === 'avgAmount'
            );
            
            const formattedValue = typeof entryValue === 'number' ? 
              (isMonetary ? `$${entryValue.toLocaleString()}` : entryValue.toLocaleString()) : 
              entryValue;
            
            return (
              <p key={index} className="text-white font-semibold" style={{ color: entry.color }}>
                {entryName}: {formattedValue}
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Retry</span>
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h2>
          <p className="text-gray-400">Comprehensive financial insights from real transaction data</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          
          <button
            onClick={handleRefresh}
            className="flex items-center space-x-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          
          <button className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { 
            title: 'Total Revenue', 
            value: analyticsData.summary.totalRevenue, 
            icon: TrendingUp, 
            color: 'text-green-500',
            change: analyticsData.summary.profitMargin > 0 ? '+' + analyticsData.summary.profitMargin.toFixed(1) + '%' : analyticsData.summary.profitMargin.toFixed(1) + '%'
          },
          { 
            title: 'Total Expenses', 
            value: analyticsData.summary.totalExpenses, 
            icon: DollarSign, 
            color: 'text-red-500',
            change: 'Expense Ratio'
          },
          { 
            title: 'Net Profit', 
            value: analyticsData.summary.netProfit, 
            icon: TrendingUp, 
            color: analyticsData.summary.netProfit >= 0 ? 'text-green-500' : 'text-red-500',
            change: 'Profit Margin: ' + analyticsData.summary.profitMargin.toFixed(1) + '%'
          },
          { 
            title: 'Avg Transaction', 
            value: analyticsData.summary.avgTransaction, 
            icon: Users, 
            color: 'text-blue-500',
            change: analyticsData.summary.totalTransactions + ' total'
          }
        ].map((metric, index) => (
          <div key={index} className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-400 text-sm font-medium">{metric.title}</div>
              <metric.icon className={`w-5 h-5 ${metric.color}`} />
            </div>
            <div className="text-2xl font-bold text-white mb-2">
              ${metric.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
            <div className="text-xs text-gray-400">{metric.change}</div>
          </div>
        ))}
      </div>

      {/* Revenue vs Expenses Trend */}
      {analyticsData.monthlyTrends.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Revenue vs Expenses Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={analyticsData.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `$${value}`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                <Area type="monotone" dataKey="expense" stackId="1" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                <Line type="monotone" dataKey="net" stroke="#3B82F6" strokeWidth={3} dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Category Breakdown and Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Pie Chart */}
        {analyticsData.categoryBreakdown.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Category Breakdown</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ category, percentage }) => `${category} (${percentage.toFixed(1)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {analyticsData.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Status Distribution */}
        {analyticsData.statusDistribution.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Transaction Status Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={analyticsData.statusDistribution}>
                  <RadialBar
                    minAngle={15}
                    label={{ position: 'insideStart', fill: '#fff' }}
                    background
                    clockWise
                    dataKey="percentage"
                    fill="#10B981"
                  />
                  <Legend iconSize={18} layout="vertical" verticalAlign="middle" align="right" />
                  <Tooltip content={<CustomTooltip />} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* User Activity and Amount Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Users by Activity */}
        {analyticsData.userActivity.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Top Users by Transaction Volume</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.userActivity.slice(0, 8)} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `$${value}`} />
                  <YAxis dataKey="user" type="category" stroke="#9CA3AF" fontSize={12} width={100} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="totalAmount" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Amount Distribution */}
        {analyticsData.amountDistribution.length > 0 && (
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Transaction Amount Distribution</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.amountDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="range" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Time Series Analysis */}
      {analyticsData.timeSeriesData.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Daily Transaction Activity</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF" 
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="amount" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="count" stroke="#F97316" fill="#F97316" fillOpacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      {analyticsData.performanceMetrics.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Performance Efficiency</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart data={analyticsData.performanceMetrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="revenue" stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `$${value}`} />
                <YAxis dataKey="profitMargin" stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `${value}%`} />
                <Tooltip content={<CustomTooltip />} />
                <Scatter dataKey="profit" fill="#10B981" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Data Summary */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Data Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-500">{analyticsData.summary.totalTransactions}</div>
            <div className="text-gray-400 text-sm">Total Transactions</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-500">{analyticsData.categoryBreakdown.length}</div>
            <div className="text-gray-400 text-sm">Categories</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-500">{analyticsData.userActivity.length}</div>
            <div className="text-gray-400 text-sm">Active Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-500">{analyticsData.summary.profitMargin.toFixed(1)}%</div>
            <div className="text-gray-400 text-sm">Profit Margin</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;