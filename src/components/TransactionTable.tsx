import React, { useState, useEffect } from 'react';
import { Download, Filter, Calendar, ChevronDown, ChevronUp, Search } from 'lucide-react';
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

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-medium";
    switch (status.toLowerCase()) {
      case 'completed':
        return `${baseClasses} bg-green-500/20 text-green-500`;
      case 'pending':
        return `${baseClasses} bg-yellow-500/20 text-yellow-500`;
      case 'failed':
        return `${baseClasses} bg-red-500/20 text-red-500`;
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
    <div className="bg-gray-800 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">
          {fullView ? 'All Transactions' : 'Transactions'}
        </h3>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-gray-700 text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 w-64"
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
              className="bg-transparent text-white text-sm focus:outline-none"
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
            className="flex items-center space-x-2 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          
          {/* Export Button */}
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center space-x-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="mb-6 p-4 bg-gray-700 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({
                ...filters,
                type: e.target.value as FilterOptions['type']
              })}
              className="w-full bg-gray-600 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
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
              <option value="freelance">Freelance</option>
              <option value="salary">Salary</option>
              <option value="shopping">Shopping</option>
              <option value="utilities">Utilities</option>
              <option value="coffee">Coffee</option>
            </select>
          </div>
          
          <div>
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
          {/* Table */}
          <div className="overflow-x-auto">
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
                {sortedTransactions.map((transaction) => (
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
                      <span className={`font-semibold ${
                        transaction.amount >= 0 ? 'text-green-500' : 'text-orange-500'
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

          {/* Pagination */}
          {fullView && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-gray-400">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} transactions
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-gray-400">
                  Page {pagination.page} of {totalPages}
                </span>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === totalPages}
                  className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Results Summary */}
          <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
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