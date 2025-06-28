import React, { useState, useEffect } from 'react';
import { Download, Filter, Calendar, ChevronDown, ChevronUp, Search, MoreHorizontal, Eye } from 'lucide-react';
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

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTransactions(
        pagination.page,
        pagination.limit,
        filters,
        searchQuery
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
  }, [pagination.page, pagination.limit, filters, searchQuery]);

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sort transactions locally
  const sortedTransactions = [...transactions].sort((a, b) => {
    let aValue, bValue;

    switch (sortField) {
      case 'date':
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
        break;
      case 'amount':
        aValue = Math.abs(a.amount);
        bValue = Math.abs(b.amount);
        break;
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'status':
        aValue = a.status.toLowerCase();
        bValue = b.status.toLowerCase();
        break;
      default:
        return 0;
    }

    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleExport = (config: any) => {
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

  const formatDateMobile = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status.toLowerCase()) {
      case 'paid':
      case 'completed':
        return `${baseClasses} bg-green-500/20 text-green-500`;
      case 'pending':
        return `${baseClasses} bg-yellow-500/20 text-yellow-500`;
      default:
        return `${baseClasses} bg-gray-500/20 text-gray-500`;
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ?
      <ChevronUp className="w-4 h-4 ml-1" /> :
      <ChevronDown className="w-4 h-4 ml-1" />;
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="card-enhanced">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between p-4 sm:p-6 border-b border-gray-700/50 space-y-4 lg:space-y-0">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">
            {fullView ? 'All Transactions' : 'Transactions'}
          </h3>
          <p className="text-gray-400 text-sm">
            {fullView ? 'Complete transaction history' : 'Recent transaction activity'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 bg-gray-700/50 text-white placeholder-gray-400 pl-10 pr-4 py-2.5 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all duration-200"
            />
          </div>

          {/* Date Filter */}
          <div className="flex items-center space-x-2 bg-gray-700/50 px-4 py-2.5 rounded-lg border border-gray-600">
            <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({
                ...filters,
                dateRange: e.target.value as FilterOptions['dateRange']
              })}
              className="bg-transparent text-white text-sm focus:outline-none min-w-0"
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
            className="flex items-center justify-center space-x-2 bg-gray-700/50 text-white px-4 py-2.5 rounded-lg hover:bg-gray-600/50 transition-colors border border-gray-600"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
          </button>

          {/* Export Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-2.5 rounded-lg hover:bg-green-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="p-4 sm:p-6 bg-gray-700/30 border-b border-gray-700/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({
                  ...filters,
                  status: e.target.value as FilterOptions['status']
                })}
                className="w-full bg-gray-600 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-500"
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
                className="w-full bg-gray-600 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-500"
              >
                <option value="all">All Categories</option>
                <option value="revenue">Revenue</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Min Amount</label>
              <input
                type="number"
                placeholder="0"
                value={filters.amountRange.min}
                onChange={(e) => setFilters({
                  ...filters,
                  amountRange: {
                    ...filters.amountRange,
                    min: Number(e.target.value)
                  }
                })}
                className="w-full bg-gray-600 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Max Amount</label>
              <input
                type="number"
                placeholder="10000"
                value={filters.amountRange.max}
                onChange={(e) => setFilters({
                  ...filters,
                  amountRange: {
                    ...filters.amountRange,
                    max: Number(e.target.value)
                  }
                })}
                className="w-full bg-gray-600 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading transactions...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th
                    className="text-left text-gray-400 font-medium pb-4 px-6 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center">
                      Name
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th
                    className="text-left text-gray-400 font-medium pb-4 px-6 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('date')}
                  >
                    <div className="flex items-center">
                      Date
                      <SortIcon field="date" />
                    </div>
                  </th>
                  <th
                    className="text-left text-gray-400 font-medium pb-4 px-6 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center">
                      Amount
                      <SortIcon field="amount" />
                    </div>
                  </th>
                  <th
                    className="text-left text-gray-400 font-medium pb-4 px-6 cursor-pointer hover:text-white transition-colors"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      <SortIcon field="status" />
                    </div>
                  </th>
                  <th className="text-left text-gray-400 font-medium pb-4 px-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors"
                  >
                    <td className="py-4 px-6">
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
                    <td className="py-4 px-6 text-gray-300">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-semibold ${transaction.amount >= 0 ? 'text-green-500' : 'text-orange-500'
                        }`}>
                        {formatAmount(transaction.amount)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={getStatusBadge(transaction.status)}>
                        {transaction.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <button className="p-2 rounded-lg hover:bg-gray-600/50 text-gray-400 hover:text-white transition-colors">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden">
            <div className="p-4 space-y-4">
              {sortedTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-gray-700/30 rounded-xl p-4 hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
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
                    <button className="p-2 rounded-lg hover:bg-gray-600/50 text-gray-400 hover:text-white transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-gray-400 text-xs">
                        {formatDateMobile(transaction.date)}
                      </div>
                      <span className={getStatusBadge(transaction.status)}>
                        {transaction.status}
                      </span>
                    </div>
                    <div className={`font-semibold text-lg ${transaction.amount >= 0 ? 'text-green-500' : 'text-orange-500'
                      }`}>
                      {formatAmount(transaction.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {fullView && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-6 border-t border-gray-700/50 space-y-4 sm:space-y-0">
              <div className="text-sm text-gray-400 text-center sm:text-left">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} transactions
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-gray-400 px-4">
                  Page {pagination.page} of {totalPages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === totalPages}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between text-sm text-gray-400 space-y-2 sm:space-y-0">
            <span>
              Showing {sortedTransactions.length} of {pagination.total} transactions
            </span>
            {sortedTransactions.length === 0 && (
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