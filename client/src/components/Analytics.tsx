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
import { Calendar, TrendingUp, DollarSign, Users, Filter, Download } from 'lucide-react';
import { apiService } from '../services/api';

interface AnalyticsData {
  monthlyTrends: any[];
  categoryBreakdown: any[];
  statusDistribution: any[];
  userActivity: any[];
  amountDistribution: any[];
  timeSeriesData: any[];
  performanceMetrics: any[];
}

const Analytics: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');
  const [selectedMetric, setSelectedMetric] = useState('amount');

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // Since we don't have a specific analytics endpoint, we'll use the existing data
      const response = await apiService.getTransactions(1, 100);
      const transactions = response.data;
      
      // Process data for different visualizations
      const processedData = processTransactionData(transactions);
      setAnalyticsData(processedData);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processTransactionData = (transactions: any[]): AnalyticsData => {
    // Monthly trends
    const monthlyTrends = processMonthlyTrends(transactions);
    
    // Category breakdown
    const categoryBreakdown = processCategoryBreakdown(transactions);
    
    // Status distribution
    const statusDistribution = processStatusDistribution(transactions);
    
    // User activity
    const userActivity = processUserActivity(transactions);
    
    // Amount distribution
    const amountDistribution = processAmountDistribution(transactions);
    
    // Time series data
    const timeSeriesData = processTimeSeriesData(transactions);
    
    // Performance metrics
    const performanceMetrics = processPerformanceMetrics(transactions);

    return {
      monthlyTrends,
      categoryBreakdown,
      statusDistribution,
      userActivity,
      amountDistribution,
      timeSeriesData,
      performanceMetrics
    };
  };

  const processMonthlyTrends = (transactions: any[]) => {
    const monthlyData: { [key: string]: { revenue: number; expense: number; count: number } } = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, expense: 0, count: 0 };
      }
      
      if (transaction.type === 'Income') {
        monthlyData[monthKey].revenue += transaction.amount;
      } else {
        monthlyData[monthKey].expense += Math.abs(transaction.amount);
      }
      monthlyData[monthKey].count += 1;
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: data.revenue,
        expense: data.expense,
        net: data.revenue - data.expense,
        transactions: data.count
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-12);
  };

  const processCategoryBreakdown = (transactions: any[]) => {
    const categoryData: { [key: string]: { amount: number; count: number } } = {};
    
    transactions.forEach(transaction => {
      const category = transaction.category || 'Other';
      if (!categoryData[category]) {
        categoryData[category] = { amount: 0, count: 0 };
      }
      categoryData[category].amount += Math.abs(transaction.amount);
      categoryData[category].count += 1;
    });

    return Object.entries(categoryData).map(([category, data]) => ({
      category,
      amount: data.amount,
      count: data.count,
      percentage: (data.amount / Object.values(categoryData).reduce((sum, cat) => sum + cat.amount, 0)) * 100
    }));
  };

  const processStatusDistribution = (transactions: any[]) => {
    const statusData: { [key: string]: number } = {};
    
    transactions.forEach(transaction => {
      const status = transaction.status || 'Unknown';
      statusData[status] = (statusData[status] || 0) + 1;
    });

    return Object.entries(statusData).map(([status, count]) => ({
      status,
      count,
      percentage: (count / transactions.length) * 100
    }));
  };

  const processUserActivity = (transactions: any[]) => {
    const userActivity: { [key: string]: { transactions: number; totalAmount: number } } = {};
    
    transactions.forEach(transaction => {
      const user = transaction.name || 'Unknown User';
      if (!userActivity[user]) {
        userActivity[user] = { transactions: 0, totalAmount: 0 };
      }
      userActivity[user].transactions += 1;
      userActivity[user].totalAmount += Math.abs(transaction.amount);
    });

    return Object.entries(userActivity)
      .map(([user, data]) => ({
        user,
        transactions: data.transactions,
        totalAmount: data.totalAmount,
        avgAmount: data.totalAmount / data.transactions
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .slice(0, 10);
  };

  const processAmountDistribution = (transactions: any[]) => {
    const ranges = [
      { min: 0, max: 100, label: '$0-$100' },
      { min: 100, max: 500, label: '$100-$500' },
      { min: 500, max: 1000, label: '$500-$1K' },
      { min: 1000, max: 5000, label: '$1K-$5K' },
      { min: 5000, max: Infinity, label: '$5K+' }
    ];

    return ranges.map(range => {
      const count = transactions.filter(t => {
        const amount = Math.abs(t.amount);
        return amount >= range.min && amount < range.max;
      }).length;

      return {
        range: range.label,
        count,
        percentage: (count / transactions.length) * 100
      };
    });
  };

  const processTimeSeriesData = (transactions: any[]) => {
    const dailyData: { [key: string]: { amount: number; count: number } } = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date).toISOString().split('T')[0];
      if (!dailyData[date]) {
        dailyData[date] = { amount: 0, count: 0 };
      }
      dailyData[date].amount += Math.abs(transaction.amount);
      dailyData[date].count += 1;
    });

    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        amount: data.amount,
        count: data.count,
        avgAmount: data.amount / data.count
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30);
  };

  const processPerformanceMetrics = (transactions: any[]) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const metrics = [];
    for (let i = 0; i < 6; i++) {
      const month = currentMonth - i;
      const year = month < 0 ? currentYear - 1 : currentYear;
      const adjustedMonth = month < 0 ? 12 + month : month;
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === adjustedMonth && tDate.getFullYear() === year;
      });

      const revenue = monthTransactions
        .filter(t => t.type === 'Income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === 'Expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

      metrics.unshift({
        month: new Date(year, adjustedMonth).toLocaleDateString('en-US', { month: 'short' }),
        revenue,
        expenses,
        profit: revenue - expenses,
        efficiency: revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0
      });
    }

    return metrics;
  };

  const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#F97316'];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-white font-semibold" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? 
                (entry.name.includes('$') || entry.name.includes('Amount') ? 
                  `$${entry.value.toLocaleString()}` : 
                  entry.value.toLocaleString()
                ) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">Failed to load analytics data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Analytics Dashboard</h2>
          <p className="text-gray-400">Comprehensive financial insights and trends</p>
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
          
          <button className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'Total Revenue', value: analyticsData.monthlyTrends.reduce((sum, item) => sum + item.revenue, 0), icon: TrendingUp, color: 'text-green-500' },
          { title: 'Total Expenses', value: analyticsData.monthlyTrends.reduce((sum, item) => sum + item.expense, 0), icon: DollarSign, color: 'text-red-500' },
          { title: 'Net Profit', value: analyticsData.monthlyTrends.reduce((sum, item) => sum + item.net, 0), icon: TrendingUp, color: 'text-blue-500' },
          { title: 'Avg Transaction', value: analyticsData.categoryBreakdown.reduce((sum, item) => sum + item.amount, 0) / analyticsData.categoryBreakdown.reduce((sum, item) => sum + item.count, 0), icon: Users, color: 'text-purple-500' }
        ].map((metric, index) => (
          <div key={index} className="bg-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-400 text-sm font-medium">{metric.title}</div>
              <metric.icon className={`w-5 h-5 ${metric.color}`} />
            </div>
            <div className="text-2xl font-bold text-white">
              ${metric.value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </div>
        ))}
      </div>

      {/* Revenue vs Expenses Trend */}
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

      {/* Category Breakdown and Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Pie Chart */}
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

        {/* Status Distribution */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Transaction Status</h3>
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
      </div>

      {/* User Activity and Amount Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Users by Activity */}
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold text-white mb-4">Top Users by Transaction Volume</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.userActivity} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `$${value}`} />
                <YAxis dataKey="user" type="category" stroke="#9CA3AF" fontSize={12} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="totalAmount" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Amount Distribution */}
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
      </div>

      {/* Time Series Analysis */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Daily Transaction Activity (Last 30 Days)</h3>
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

      {/* Performance Metrics */}
      <div className="bg-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Performance Efficiency</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={analyticsData.performanceMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="revenue" stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `$${value}`} />
              <YAxis dataKey="efficiency" stroke="#9CA3AF" fontSize={12} tickFormatter={(value) => `${value}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Scatter dataKey="profit" fill="#10B981" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;