import { Transaction } from '../models/Transaction.js';

export const getTransactions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = 'all',
      type = 'all',
      category = 'all',
      dateRange = 'all'
    } = req.query;

    // Build query
    let query = {};

    // Search filter - search through user names, user_id, and category
    if (search) {
      query.$or = [
        { user_name: { $regex: search, $options: 'i' } },
        { user_id: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Status filter
    if (status !== 'all') {
      query.status = { $regex: new RegExp(status, 'i') };
    }

    // Category filter
    if (category !== 'all') {
      query.category = { $regex: new RegExp(category, 'i') };
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      let startDate;

      switch (dateRange) {
        case '7days':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case '90days':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
      }

      if (startDate) {
        query.date = { $gte: startDate.toISOString() };
      }
    }

    // Get paginated results
    const { transactions, total } = await Transaction.findWithPagination(
      query,
      parseInt(page),
      parseInt(limit)
    );

    // Transform data to match frontend expectations
    const transformedTransactions = transactions.map(Transaction.transformForResponse);

    res.json({
      success: true,
      message: 'Transactions retrieved successfully',
      data: transformedTransactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: total
      }
    });

  } catch (error) {
    console.error('❌ Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch transactions'
    });
  }
};

export const exportTransactions = async (req, res) => {
  try {
    const { columns, dateRange, filters, format } = req.body;

    // Build query based on filters
    let query = {};

    if (filters.status !== 'all') {
      query.status = { $regex: new RegExp(filters.status, 'i') };
    }

    if (filters.category !== 'all') {
      query.category = { $regex: new RegExp(filters.category, 'i') };
    }

    // Date range filter
    if (dateRange.start && dateRange.end) {
      query.date = {
        $gte: dateRange.start,
        $lte: dateRange.end
      };
    }

    const transactions = await Transaction.find(query);

    // Transform data for export with actual user names from database
    const exportData = transactions.map(transaction => {
      const transformed = Transaction.transformForResponse(transaction);
      return {
        name: transformed.name, // Uses actual user_name from database
        email: transformed.email,
        date: transformed.date,
        amount: transformed.amount,
        status: transformed.status,
        type: transformed.type,
        category: transformed.category,
        description: transformed.description
      };
    });

    // Create CSV content
    const headers = columns;
    const csvContent = [
      headers.join(','),
      ...exportData.map(transaction =>
        columns.map(column => {
          const value = transaction[column];
          return typeof value === 'string' ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    res.send(csvContent);

  } catch (error) {
    console.error('❌ Error exporting transactions:', error);
    res.status(500).json({
      success: false,
      message: 'Export failed'
    });
  }
};