import { Transaction } from '../models/Transaction.js';

export const getAnalyticsData = async (req, res) => {
  try {
    const { period = '6months', startDate, endDate } = req.query;
    
    // Build date filter based on period
    let dateFilter = {};
    const now = new Date();
    
    if (startDate && endDate) {
      dateFilter = {
        date: {
          $gte: new Date(startDate).toISOString(),
          $lte: new Date(endDate).toISOString()
        }
      };
    } else {
      let monthsBack;
      switch (period) {
        case '3months':
          monthsBack = 3;
          break;
        case '1year':
          monthsBack = 12;
          break;
        default:
          monthsBack = 6;
      }
      
      const startPeriod = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
      dateFilter = {
        date: { $gte: startPeriod.toISOString() }
      };
    }

    // Fetch all transactions for the period
    const transactions = await Transaction.find(dateFilter);
    
    if (transactions.length === 0) {
      return res.json({
        success: true,
        message: 'No data available for the selected period',
        data: {
          monthlyTrends: [],
          categoryBreakdown: [],
          statusDistribution: [],
          userActivity: [],
          amountDistribution: [],
          timeSeriesData: [],
          performanceMetrics: [],
          summary: {
            totalRevenue: 0,
            totalExpenses: 0,
            netProfit: 0,
            avgTransaction: 0,
            totalTransactions: 0
          }
        }
      });
    }

    // Process analytics data
    const analyticsData = await processAnalyticsData(transactions);
    
    res.json({
      success: true,
      message: 'Analytics data retrieved successfully',
      data: analyticsData
    });

  } catch (error) {
    console.error('❌ Error fetching analytics data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    });
  }
};

const processAnalyticsData = async (transactions) => {
  // Monthly trends analysis
  const monthlyTrends = processMonthlyTrends(transactions);
  
  // Category breakdown
  const categoryBreakdown = processCategoryBreakdown(transactions);
  
  // Status distribution
  const statusDistribution = processStatusDistribution(transactions);
  
  // User activity analysis
  const userActivity = processUserActivity(transactions);
  
  // Amount distribution
  const amountDistribution = processAmountDistribution(transactions);
  
  // Time series data (daily)
  const timeSeriesData = processTimeSeriesData(transactions);
  
  // Performance metrics
  const performanceMetrics = processPerformanceMetrics(transactions);
  
  // Summary calculations
  const summary = calculateSummary(transactions);

  return {
    monthlyTrends,
    categoryBreakdown,
    statusDistribution,
    userActivity,
    amountDistribution,
    timeSeriesData,
    performanceMetrics,
    summary
  };
};

const processMonthlyTrends = (transactions) => {
  const monthlyData = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        revenue: 0,
        expense: 0,
        transactions: 0,
        revenueCount: 0,
        expenseCount: 0
      };
    }
    
    const amount = Math.abs(transaction.amount);
    
    if (transaction.category === 'Revenue') {
      monthlyData[monthKey].revenue += amount;
      monthlyData[monthKey].revenueCount += 1;
    } else {
      monthlyData[monthKey].expense += amount;
      monthlyData[monthKey].expenseCount += 1;
    }
    monthlyData[monthKey].transactions += 1;
  });

  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { 
        month: 'short', 
        year: 'numeric' 
      }),
      revenue: Math.round(data.revenue * 100) / 100,
      expense: Math.round(data.expense * 100) / 100,
      net: Math.round((data.revenue - data.expense) * 100) / 100,
      transactions: data.transactions,
      revenueTransactions: data.revenueCount,
      expenseTransactions: data.expenseCount,
      avgTransactionSize: Math.round(((data.revenue + data.expense) / data.transactions) * 100) / 100
    }))
    .sort((a, b) => new Date(a.month + ' 1').getTime() - new Date(b.month + ' 1').getTime());
};

const processCategoryBreakdown = (transactions) => {
  const categoryData = {};
  const totalAmount = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  transactions.forEach(transaction => {
    const category = transaction.category || 'Other';
    const amount = Math.abs(transaction.amount);
    
    if (!categoryData[category]) {
      categoryData[category] = {
        amount: 0,
        count: 0,
        avgAmount: 0
      };
    }
    
    categoryData[category].amount += amount;
    categoryData[category].count += 1;
  });

  return Object.entries(categoryData)
    .map(([category, data]) => ({
      category,
      amount: Math.round(data.amount * 100) / 100,
      count: data.count,
      avgAmount: Math.round((data.amount / data.count) * 100) / 100,
      percentage: Math.round((data.amount / totalAmount) * 10000) / 100
    }))
    .sort((a, b) => b.amount - a.amount);
};

const processStatusDistribution = (transactions) => {
  const statusData = {};
  const total = transactions.length;
  
  transactions.forEach(transaction => {
    const status = transaction.status || 'Completed';
    statusData[status] = (statusData[status] || 0) + 1;
  });

  return Object.entries(statusData)
    .map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / total) * 10000) / 100
    }))
    .sort((a, b) => b.count - a.count);
};

const processUserActivity = (transactions) => {
  const userActivity = {};
  
  transactions.forEach(transaction => {
    const userId = transaction.user_id || 'Unknown';
    const amount = Math.abs(transaction.amount);
    
    if (!userActivity[userId]) {
      userActivity[userId] = {
        transactions: 0,
        totalAmount: 0,
        revenue: 0,
        expenses: 0,
        lastTransaction: transaction.date
      };
    }
    
    userActivity[userId].transactions += 1;
    userActivity[userId].totalAmount += amount;
    
    if (transaction.category === 'Revenue') {
      userActivity[userId].revenue += amount;
    } else {
      userActivity[userId].expenses += amount;
    }
    
    // Update last transaction date if this one is more recent
    if (new Date(transaction.date) > new Date(userActivity[userId].lastTransaction)) {
      userActivity[userId].lastTransaction = transaction.date;
    }
  });

  return Object.entries(userActivity)
    .map(([user, data]) => ({
      user,
      transactions: data.transactions,
      totalAmount: Math.round(data.totalAmount * 100) / 100,
      revenue: Math.round(data.revenue * 100) / 100,
      expenses: Math.round(data.expenses * 100) / 100,
      avgAmount: Math.round((data.totalAmount / data.transactions) * 100) / 100,
      lastTransaction: data.lastTransaction,
      netValue: Math.round((data.revenue - data.expenses) * 100) / 100
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 15); // Top 15 users
};

const processAmountDistribution = (transactions) => {
  const ranges = [
    { min: 0, max: 100, label: '$0-$100' },
    { min: 100, max: 500, label: '$100-$500' },
    { min: 500, max: 1000, label: '$500-$1K' },
    { min: 1000, max: 5000, label: '$1K-$5K' },
    { min: 5000, max: 10000, label: '$5K-$10K' },
    { min: 10000, max: Infinity, label: '$10K+' }
  ];

  const total = transactions.length;

  return ranges.map(range => {
    const matchingTransactions = transactions.filter(t => {
      const amount = Math.abs(t.amount);
      return amount >= range.min && amount < range.max;
    });

    const totalAmount = matchingTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      range: range.label,
      count: matchingTransactions.length,
      totalAmount: Math.round(totalAmount * 100) / 100,
      percentage: Math.round((matchingTransactions.length / total) * 10000) / 100,
      avgAmount: matchingTransactions.length > 0 ? 
        Math.round((totalAmount / matchingTransactions.length) * 100) / 100 : 0
    };
  }).filter(range => range.count > 0);
};

const processTimeSeriesData = (transactions) => {
  const dailyData = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.date).toISOString().split('T')[0];
    const amount = Math.abs(transaction.amount);
    
    if (!dailyData[date]) {
      dailyData[date] = {
        amount: 0,
        count: 0,
        revenue: 0,
        expenses: 0
      };
    }
    
    dailyData[date].amount += amount;
    dailyData[date].count += 1;
    
    if (transaction.category === 'Revenue') {
      dailyData[date].revenue += amount;
    } else {
      dailyData[date].expenses += amount;
    }
  });

  return Object.entries(dailyData)
    .map(([date, data]) => ({
      date,
      amount: Math.round(data.amount * 100) / 100,
      count: data.count,
      revenue: Math.round(data.revenue * 100) / 100,
      expenses: Math.round(data.expenses * 100) / 100,
      avgAmount: Math.round((data.amount / data.count) * 100) / 100,
      net: Math.round((data.revenue - data.expenses) * 100) / 100
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-60); // Last 60 days
};

const processPerformanceMetrics = (transactions) => {
  const monthlyMetrics = {};
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const amount = Math.abs(transaction.amount);
    
    if (!monthlyMetrics[monthKey]) {
      monthlyMetrics[monthKey] = {
        revenue: 0,
        expenses: 0,
        transactions: 0,
        completedTransactions: 0
      };
    }
    
    if (transaction.category === 'Revenue') {
      monthlyMetrics[monthKey].revenue += amount;
    } else {
      monthlyMetrics[monthKey].expenses += amount;
    }
    
    monthlyMetrics[monthKey].transactions += 1;
    
    if (transaction.status === 'Completed' || transaction.status === 'Paid') {
      monthlyMetrics[monthKey].completedTransactions += 1;
    }
  });

  return Object.entries(monthlyMetrics)
    .map(([month, data]) => {
      const profit = data.revenue - data.expenses;
      const profitMargin = data.revenue > 0 ? (profit / data.revenue) * 100 : 0;
      const completionRate = data.transactions > 0 ? (data.completedTransactions / data.transactions) * 100 : 0;
      
      return {
        month: new Date(month + '-01').toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        }),
        revenue: Math.round(data.revenue * 100) / 100,
        expenses: Math.round(data.expenses * 100) / 100,
        profit: Math.round(profit * 100) / 100,
        profitMargin: Math.round(profitMargin * 100) / 100,
        completionRate: Math.round(completionRate * 100) / 100,
        efficiency: Math.round(((data.revenue / (data.revenue + data.expenses)) * 100) * 100) / 100,
        transactions: data.transactions
      };
    })
    .sort((a, b) => new Date(a.month + ' 1').getTime() - new Date(b.month + ' 1').getTime())
    .slice(-12); // Last 12 months
};

const calculateSummary = (transactions) => {
  const revenue = transactions
    .filter(t => t.category === 'Revenue')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const expenses = transactions
    .filter(t => t.category !== 'Revenue')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const totalAmount = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  return {
    totalRevenue: Math.round(revenue * 100) / 100,
    totalExpenses: Math.round(expenses * 100) / 100,
    netProfit: Math.round((revenue - expenses) * 100) / 100,
    avgTransaction: transactions.length > 0 ? 
      Math.round((totalAmount / transactions.length) * 100) / 100 : 0,
    totalTransactions: transactions.length,
    profitMargin: revenue > 0 ? Math.round(((revenue - expenses) / revenue) * 10000) / 100 : 0
  };
};

export const getAnalyticsSummary = async (req, res) => {
  try {
    const { period = '1year' } = req.query;
    
    // Get date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90days':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '6months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
        break;
      default:
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
    }
    
    const transactions = await Transaction.find({
      date: { $gte: startDate.toISOString() }
    });
    
    const summary = calculateSummary(transactions);
    
    // Additional insights
    const insights = {
      topCategory: null,
      mostActiveUser: null,
      avgDailyTransactions: 0,
      growthRate: 0
    };
    
    if (transactions.length > 0) {
      // Find top category
      const categoryBreakdown = processCategoryBreakdown(transactions);
      insights.topCategory = categoryBreakdown[0];
      
      // Find most active user
      const userActivity = processUserActivity(transactions);
      insights.mostActiveUser = userActivity[0];
      
      // Calculate average daily transactions
      const daysDiff = Math.ceil((now - startDate) / (1000 * 60 * 60 * 24));
      insights.avgDailyTransactions = Math.round((transactions.length / daysDiff) * 100) / 100;
    }
    
    res.json({
      success: true,
      message: 'Analytics summary retrieved successfully',
      data: {
        summary,
        insights,
        period,
        dataPoints: transactions.length
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching analytics summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics summary'
    });
  }
};