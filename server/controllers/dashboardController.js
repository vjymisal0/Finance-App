import { Transaction } from '../models/Transaction.js';

export const getDashboardData = async (req, res) => {
  try {
    // Get all transactions for calculations
    const allTransactions = await Transaction.find({});
    
    // Calculate metrics
    const totalIncome = allTransactions
      .filter(t => t.category === 'Revenue')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = allTransactions
      .filter(t => t.category !== 'Revenue')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = totalIncome - totalExpenses;
    const savings = balance * 0.2; // Assume 20% savings rate

    // Mock metrics with real calculations
    const metrics = [
      {
        title: 'Balance',
        amount: balance,
        icon: 'Wallet',
        change: 12.5,
        changeType: 'increase'
      },
      {
        title: 'Revenue',
        amount: totalIncome,
        icon: 'TrendingUp',
        change: 8.2,
        changeType: 'increase'
      },
      {
        title: 'Expenses',
        amount: totalExpenses,
        icon: 'CreditCard',
        change: -3.1,
        changeType: 'decrease'
      },
      {
        title: 'Savings',
        amount: savings,
        icon: 'PiggyBank',
        change: 15.7,
        changeType: 'increase'
      }
    ];

    // Generate chart data (mock for now, you can enhance this)
    const chartData = [
      { month: 'Jan', income: 4000, expenses: 2400 },
      { month: 'Feb', income: 3000, expenses: 1398 },
      { month: 'Mar', income: 2000, expenses: 9800 },
      { month: 'Apr', income: 2780, expenses: 3908 },
      { month: 'May', income: 1890, expenses: 4800 },
      { month: 'Jun', income: 2390, expenses: 3800 },
      { month: 'Jul', income: 3490, expenses: 4300 },
      { month: 'Aug', income: 4000, expenses: 2400 },
      { month: 'Sep', income: 3000, expenses: 1398 },
      { month: 'Oct', income: 2000, expenses: 9800 },
      { month: 'Nov', income: 2780, expenses: 3908 },
      { month: 'Dec', income: 1890, expenses: 4800 }
    ];

    // Get recent transactions
    const { transactions: recentTransactions } = await Transaction.findWithPagination({}, 1, 5);
    const transformedRecentTransactions = recentTransactions.map(transaction => ({
      ...Transaction.transformForResponse(transaction),
      amount: transaction.category === 'Revenue' ? transaction.amount : -transaction.amount
    }));

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