import React, { useState, useEffect } from 'react';
import { Download, Filter, Calendar, ChevronDown, ChevronUp, Search, ArrowUpDown } from 'lucide-react';
import { Transaction, FilterOptions, PaginationOptions } from '../types';
import { apiService } from '../services/api';
import ExportModal from './ExportModal';

interface TransactionTableProps {
  onAddAlert: (type: 'success' | 'error' | 'warning' | 'info', message: string) => void;
  fullView?: boolean;
}

type SortField = 'date' | 'amount' | 'name' | 'status';
type SortDirection = 'asc' | 'desc';

const TransactionTable: React.FC<TransactionTableProps> = ({
  onAddAlert,
  fullView = false
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationOptions>({
    page: 1,
    limit: fullView ? 20 : 5,
    total: 0
  });
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'all',
    status: 'all',
    type: 'all',
    category: 'all',
    user: 'all',
    amountRange: { min: 0, max: 10000 }
  });

  // Fetch transactions with server-side sorting
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTransactions(
        pagination.page,
        pagination.limit,
        filters,
        searchQuery,
        sortField,
        sortDirection
      );
      setTransactions(response.data);
      if (response.pagination) {
        setPagination(prev => ({
          ...prev,
          total: response.pagination!.total
        }));
      }
    } catch (error) {
      onAddAlert('error', 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [pagination.page, pagination.limit, filters, searchQuery, sortField, sortDirection]);

  // Handle sort - now triggers server-side sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    // Reset to first page when sorting changes
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleExport = (config: any) => {
    // Include current sorting in export config
    const exportConfig = {
      ...config,
      sortField,
      sortDirection
    };
    onAddAlert('success', `Successfully exported ${transactions.length} transactions`);
  };

  const formatAmount = (amount: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(Math.abs(amount));

    return amount >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status.toLowerCase()) {
      case 'paid':
        return `${baseClasses} bg-green-500/20 text-green-500`;
      case 'pending':
        return `${baseClasses} bg-yellow-500/20 text-yellow-500`;
      default:
        return `${baseClasses} bg-gray-500/20 text-gray-500`;
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 ml-1 text-gray-500" />;
    }
    return sortDirection === 'asc' ?
      <ChevronUp className="w-4 h-4 ml-1 text-green-400" /> :
      <ChevronDown className="w-4 h-4 ml-1 text-green-400" />;
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="bg-gray-800 rounded-xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h3 className="text-xl font-bold text-white">
            {fullView ? 'All Transactions' : 'Transactions'}
          </h3>
          {sortField !== 'date' || sortDirection !== 'desc' ? (
            <p className="text-sm text-gray-400 mt-1">
              Sorted by {sortField} ({sortDirection === 'asc' ? 'ascending' : 'descending'})
            </p>
          ) : null}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-700 text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-64"
            />
          </div>

          {/* Date Filter */}
          <div className="flex items-center space-x-2 bg-gray-700 px-4 py-2 rounded-lg">
            <Calendar className="w-4 h-4 text-gray-400" />
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({
                ...filters,
                dateRange: e.target.value as FilterOptions['dateRange']
              })}
              className="bg-gray-700 text-white text-sm focus:outline-none"
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
            </select>
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center space-x-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>

          {/* Export Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({
                ...filters,
                status: e.target.value as FilterOptions['status']
              })}
              className="w-full bg-gray-600 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({
                ...filters,
                category: e.target.value
              })}
              className="w-full bg-gray-600 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Categories</option>
              <option value="revenue">Revenue</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          <div className="sm:col-span-2 lg:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Amount Range</label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.amountRange.min}
                onChange={(e) => setFilters({
                  ...filters,
                  amountRange: {
                    ...filters.amountRange,
                    min: Number(e.target.value)
                  }
                })}
                className="w-full bg-gray-600 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.amountRange.max}
                onChange={(e) => setFilters({
                  ...filters,
                  amountRange: {
                    ...filters.amountRange,
                    max: Number(e.target.value)
                  }
                })}
                className="w-full bg-gray-600 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th
                    className="text-left text-gray-400 font-medium pb-4 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Name
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th
                    className="text-left text-gray-400 font-medium pb-4 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center">
                      Date
                      <SortIcon field="date" />
                    </div>
                  </th>
                  <th
                    className="text-left text-gray-400 font-medium pb-4 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center">
                      Amount
                      <SortIcon field="amount" />
                    </div>
                  </th>
                  <th
                    className="text-left text-gray-400 font-medium pb-4 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      <SortIcon field="status" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-gray-700 hover:bg-gray-750 transition-colors"
                  >
                    <td className="py-4">
                      <div className="flex items-center">
                        <img
                          src={transaction.avatar}
                          alt={transaction.name}
                          className="w-10 h-10 rounded-full mr-3 object-cover"
                        />
                        <div>
                          <div className="text-white font-medium">{transaction.name}</div>
                          <div className="text-gray-400 text-sm">{transaction.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-gray-300">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="py-4">
                      <span className={`font-semibold ${transaction.amount >= 0 ? 'text-green-500' : 'text-orange-500'
                        }`}>
                        {formatAmount(transaction.amount)}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={getStatusBadge(transaction.status)}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Card Layout */}
          <div className="lg:hidden space-y-4">
            {/* Sort Controls for Mobile */}
            <div className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3">
              <span className="text-sm text-gray-300">Sort by:</span>
              <div className="flex items-center space-x-2">
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value as SortField)}
                  className="bg-gray-600 text-white text-sm px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="date">Date</option>
                  <option value="name">Name</option>
                  <option value="amount">Amount</option>
                  <option value="status">Status</option>
                </select>
                <button
                  onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                  className="bg-gray-600 text-white p-1 rounded hover:bg-gray-500 transition-colors"
                >
                  {sortDirection === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="bg-gray-700/50 rounded-lg p-4 border border-gray-600"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={transaction.avatar}
                      alt={transaction.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <div className="text-white font-medium text-sm">{transaction.name}</div>
                      <div className="text-gray-400 text-xs">{transaction.email}</div>
                    </div>
                  </div>
                  <span className={getStatusBadge(transaction.status)}>
                    {transaction.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-gray-400 text-sm">
                    {formatDate(transaction.date)}
                  </div>
                  <div className={`font-semibold text-lg ${transaction.amount >= 0 ? 'text-green-500' : 'text-orange-500'
                    }`}>
                    {formatAmount(transaction.amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {fullView && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-6 space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-400 text-center sm:text-left">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} transactions
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Previous
                </button>
                <span className="text-gray-400 text-sm">
                  Page {pagination.page} of {totalPages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === totalPages}
                  className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-400 space-y-2 sm:space-y-0">
            <span>
              Showing {transactions.length} of {pagination.total} transactions
            </span>
            {transactions.length === 0 && (
              <span className="text-yellow-500">No transactions match your current filters</span>
            )}
          </div>
        </>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />
    </div>
  );
};

export default TransactionTable;