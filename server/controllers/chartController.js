import { Transaction } from '../models/Transaction.js';

export const getChartData = async (req, res) => {
    try {
        const { period = 'monthly', months = 12 } = req.query;

        // Calculate date range
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

        // Fetch transactions within the date range
        const transactions = await Transaction.find({
            date: { $gte: startDate.toISOString() }
        });

        if (transactions.length === 0) {
            return res.json({
                success: true,
                message: 'No transaction data available',
                data: generateDefaultChartData(months)
            });
        }

        // Process data based on period
        let chartData;
        switch (period) {
            case 'weekly':
                chartData = processWeeklyData(transactions);
                break;
            case 'yearly':
                chartData = processYearlyData(transactions);
                break;
            default:
                chartData = processMonthlyData(transactions, months);
        }

        res.json({
            success: true,
            message: 'Chart data retrieved successfully',
            data: chartData
        });

    } catch (error) {
        console.error('❌ Error fetching chart data:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch chart data'
        });
    }
};

const processMonthlyData = (transactions, months) => {
    const monthlyData = {};

    // Initialize all months with zero values
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyData[monthKey] = {
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            income: 0,
            expenses: 0,
            netIncome: 0,
            transactionCount: 0
        };
    }

    // Process transactions
    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        if (monthlyData[monthKey]) {
            const amount = Math.abs(transaction.amount);

            if (transaction.category === 'Revenue') {
                monthlyData[monthKey].income += amount;
            } else {
                monthlyData[monthKey].expenses += amount;
            }

            monthlyData[monthKey].transactionCount += 1;
        }
    });

    // Calculate net income and format data
    return Object.values(monthlyData).map(data => ({
        ...data,
        income: Math.round(data.income * 100) / 100,
        expenses: Math.round(data.expenses * 100) / 100,
        netIncome: Math.round((data.income - data.expenses) * 100) / 100
    }));
};

const processWeeklyData = (transactions) => {
    const weeklyData = {};
    const now = new Date();

    // Initialize last 12 weeks
    for (let i = 11; i >= 0; i--) {
        const weekStart = new Date(now.getTime() - (i * 7 * 24 * 60 * 60 * 1000));
        const weekKey = `Week ${Math.ceil((weekStart.getDate()) / 7)}`;
        weeklyData[weekKey] = {
            month: weekKey,
            income: 0,
            expenses: 0,
            transactionCount: 0
        };
    }

    transactions.forEach(transaction => {
        const date = new Date(transaction.date);
        const weekNumber = Math.ceil(date.getDate() / 7);
        const weekKey = `Week ${weekNumber}`;

        if (weeklyData[weekKey]) {
            const amount = Math.abs(transaction.amount);

            if (transaction.category === 'Revenue') {
                weeklyData[weekKey].income += amount;
            } else {
                weeklyData[weekKey].expenses += amount;
            }

            weeklyData[weekKey].transactionCount += 1;
        }
    });

    return Object.values(weeklyData).map(data => ({
        ...data,
        income: Math.round(data.income * 100) / 100,
        expenses: Math.round(data.expenses * 100) / 100
    }));
};

const processYearlyData = (transactions) => {
    const yearlyData = {};

    transactions.forEach(transaction => {
        const year = new Date(transaction.date).getFullYear();

        if (!yearlyData[year]) {
            yearlyData[year] = {
                month: year.toString(),
                income: 0,
                expenses: 0,
                transactionCount: 0
            };
        }

        const amount = Math.abs(transaction.amount);

        if (transaction.category === 'Revenue') {
            yearlyData[year].income += amount;
        } else {
            yearlyData[year].expenses += amount;
        }

        yearlyData[year].transactionCount += 1;
    });

    return Object.values(yearlyData)
        .map(data => ({
            ...data,
            income: Math.round(data.income * 100) / 100,
            expenses: Math.round(data.expenses * 100) / 100
        }))
        .sort((a, b) => parseInt(a.month) - parseInt(b.month));
};

const generateDefaultChartData = (months) => {
    const defaultData = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        defaultData.push({
            month: date.toLocaleDateString('en-US', { month: 'short' }),
            income: 0,
            expenses: 0,
            netIncome: 0,
            transactionCount: 0
        });
    }

    return defaultData;
};

export const getChartSummary = async (req, res) => {
    try {
        const { period = 'current_month' } = req.query;

        let dateFilter = {};
        const now = new Date();

        switch (period) {
            case 'current_month':
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                dateFilter = { date: { $gte: startOfMonth.toISOString() } };
                break;
            case 'last_month':
                const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
                dateFilter = {
                    date: {
                        $gte: startOfLastMonth.toISOString(),
                        $lte: endOfLastMonth.toISOString()
                    }
                };
                break;
            case 'current_year':
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                dateFilter = { date: { $gte: startOfYear.toISOString() } };
                break;
        }

        const transactions = await Transaction.find(dateFilter);

        const summary = {
            totalIncome: 0,
            totalExpenses: 0,
            netIncome: 0,
            transactionCount: transactions.length,
            avgTransactionAmount: 0,
            topCategory: null,
            growthRate: 0
        };

        transactions.forEach(transaction => {
            const amount = Math.abs(transaction.amount);

            if (transaction.category === 'Revenue') {
                summary.totalIncome += amount;
            } else {
                summary.totalExpenses += amount;
            }
        });

        summary.netIncome = summary.totalIncome - summary.totalExpenses;
        summary.avgTransactionAmount = transactions.length > 0 ?
            (summary.totalIncome + summary.totalExpenses) / transactions.length : 0;

        // Find top category
        const categoryTotals = {};
        transactions.forEach(transaction => {
            const category = transaction.category || 'Other';
            const amount = Math.abs(transaction.amount);
            categoryTotals[category] = (categoryTotals[category] || 0) + amount;
        });

        if (Object.keys(categoryTotals).length > 0) {
            const topCategoryEntry = Object.entries(categoryTotals)
                .sort(([, a], [, b]) => b - a)[0];
            summary.topCategory = {
                name: topCategoryEntry[0],
                amount: topCategoryEntry[1]
            };
        }

        // Round values
        summary.totalIncome = Math.round(summary.totalIncome * 100) / 100;
        summary.totalExpenses = Math.round(summary.totalExpenses * 100) / 100;
        summary.netIncome = Math.round(summary.netIncome * 100) / 100;
        summary.avgTransactionAmount = Math.round(summary.avgTransactionAmount * 100) / 100;

        res.json({
            success: true,
            message: 'Chart summary retrieved successfully',
            data: summary
        });

    } catch (error) {
        console.error('❌ Error fetching chart summary:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch chart summary'
        });
    }
};