import { Transaction } from '../models/Transaction.js';

export const getDashboardData = async (req, res) => {
  try {
    // Get all transactions for calculations
    const allTransactions = await Transaction.find({});

    if (allTransactions.length === 0) {
      // Return default data if no transactions exist
      return res.json({
        success: true,
        message: 'Dashboard data retrieved successfully',
        data: {
          metrics: [
            {
              title: 'Balance',
              amount: 0,
              icon: 'Wallet',
              change: 0,
              changeType: 'increase'
            },
            {
              title: 'Revenue',
              amount: 0,
              icon: 'TrendingUp',
              change: 0,
              changeType: 'increase'
            },
            {
              title: 'Expenses',
              amount: 0,
              icon: 'CreditCard',
              change: 0,
              changeType: 'decrease'
            },
            {
              title: 'Savings',
              amount: 0,
              icon: 'PiggyBank',
              change: 0,
              changeType: 'increase'
            }
          ],
          chartData: [],
          recentTransactions: []
        }
      });
    }

    // Calculate actual metrics from database
    const totalIncome = allTransactions
      .filter(t => t.category === 'Revenue')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const totalExpenses = allTransactions
      .filter(t => t.category !== 'Revenue')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const balance = totalIncome - totalExpenses;
    const savings = balance > 0 ? balance * 0.2 : 0; // Assume 20% savings rate if profitable

    // Calculate month-over-month changes
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const lastMonthTransactions = allTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= lastMonth && transactionDate < currentMonth;
    });

    const currentMonthTransactions = allTransactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= currentMonth;
    });

    // Calculate changes
    const lastMonthIncome = lastMonthTransactions
      .filter(t => t.category === 'Revenue')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const currentMonthIncome = currentMonthTransactions
      .filter(t => t.category === 'Revenue')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const lastMonthExpenses = lastMonthTransactions
      .filter(t => t.category !== 'Revenue')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const currentMonthExpenses = currentMonthTransactions
      .filter(t => t.category !== 'Revenue')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    // Calculate percentage changes
    const incomeChange = lastMonthIncome > 0 ?
      ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0;

    const expenseChange = lastMonthExpenses > 0 ?
      ((currentMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100 : 0;

    const lastMonthBalance = lastMonthIncome - lastMonthExpenses;
    const currentMonthBalance = currentMonthIncome - currentMonthExpenses;
    const balanceChange = lastMonthBalance !== 0 ?
      ((currentMonthBalance - lastMonthBalance) / Math.abs(lastMonthBalance)) * 100 : 0;

    const lastMonthSavings = lastMonthBalance > 0 ? lastMonthBalance * 0.2 : 0;
    const currentMonthSavings = currentMonthBalance > 0 ? currentMonthBalance * 0.2 : 0;
    const savingsChange = lastMonthSavings !== 0 ?
      ((currentMonthSavings - lastMonthSavings) / Math.abs(lastMonthSavings)) * 100 : 0;

    // Real metrics with actual calculations
    const metrics = [
      {
        title: 'Balance',
        amount: balance,
        icon: 'Wallet',
        change: Math.round(balanceChange * 10) / 10,
        changeType: balanceChange >= 0 ? 'increase' : 'decrease'
      },
      {
        title: 'Revenue',
        amount: totalIncome,
        icon: 'TrendingUp',
        change: Math.round(incomeChange * 10) / 10,
        changeType: incomeChange >= 0 ? 'increase' : 'decrease'
      },
      {
        title: 'Expenses',
        amount: totalExpenses,
        icon: 'CreditCard',
        change: Math.round(Math.abs(expenseChange) * 10) / 10,
        changeType: expenseChange <= 0 ? 'decrease' : 'increase'
      },
      {
        title: 'Savings',
        amount: savings,
        icon: 'PiggyBank',
        change: Math.round(savingsChange * 10) / 10,
        changeType: savingsChange >= 0 ? 'increase' : 'decrease'
      }
    ];

    // Generate chart data from actual transactions (last 12 months)
    const chartData = generateChartData(allTransactions);

    // Get recent transactions with actual user names
    const { transactions: recentTransactions } = await Transaction.findWithPagination({}, 1, 5);
    const transformedRecentTransactions = recentTransactions.map(transaction => {
      const transformed = Transaction.transformForResponse(transaction);
      return {
        ...transformed,
        amount: transaction.category === 'Revenue' ? transaction.amount : -transaction.amount
      };
    });

    res.json({
      success: true,
      message: 'Dashboard data retrieved successfully',
      data: {
        metrics,
        chartData,
        recentTransactions: transformedRecentTransactions
      }
    });

  } catch (error) {
    console.error('❌ Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data'
    });
  }
};

// Helper function to generate chart data from actual transactions
const generateChartData = (transactions) => {
  const monthlyData = {};
  const now = new Date();

  // Initialize last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
    monthlyData[monthKey] = { income: 0, expenses: 0 };
  }

  // Process transactions
  transactions.forEach(transaction => {
    const transactionDate = new Date(transaction.date);
    const monthKey = transactionDate.toLocaleDateString('en-US', { month: 'short' });
    const amount = Math.abs(transaction.amount);

    if (monthlyData[monthKey]) {
      if (transaction.category === 'Revenue') {
        monthlyData[monthKey].income += amount;
      } else {
        monthlyData[monthKey].expenses += amount;
      }
    }
  });

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    income: Math.round(data.income),
    expenses: Math.round(data.expenses)
  }));
};