import React, { useState } from 'react';
import { X, Download, Calendar, FileText } from 'lucide-react';
import { ExportConfig } from '../types';
import { apiService } from '../services/api';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (config: ExportConfig) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport }) => {
  const [config, setConfig] = useState<ExportConfig>({
    columns: ['name', 'email', 'date', 'amount', 'status', 'type', 'category'],
    dateRange: {
      start: '',
      end: ''
    },
    filters: {
      dateRange: 'all',
      status: 'all',
      type: 'all',
      category: 'all',
      user: 'all',
      amountRange: { min: 0, max: 10000 }
    },
    format: 'csv'
  });

  const [isExporting, setIsExporting] = useState(false);

  const availableColumns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'date', label: 'Date' },
    { key: 'amount', label: 'Amount' },
    { key: 'status', label: 'Status' },
    { key: 'type', label: 'Type' },
    { key: 'category', label: 'Category' },
    { key: 'description', label: 'Description' }
  ];

  const handleColumnToggle = (columnKey: string) => {
    setConfig(prev => ({
      ...prev,
      columns: prev.columns.includes(columnKey)
        ? prev.columns.filter(col => col !== columnKey)
        : [...prev.columns, columnKey]
    }));
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const blob = await apiService.exportTransactions(config);
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions_${new Date().toISOString().split('T')[0]}.${config.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      onExport(config);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FileText className="w-6 h-6 mr-2" />
            Export Transactions
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Column Selection */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Select Columns</h3>
            <div className="grid grid-cols-2 gap-3">
              {availableColumns.map(column => (
                <label key={column.key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={config.columns.includes(column.key)}
                    onChange={() => handleColumnToggle(column.key)}
                    className="w-4 h-4 text-green-500 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                  />
                  <span className="ml-2 text-gray-300">{column.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Date Range</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    value={config.dateRange.start}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, start: e.target.value }
                    }))}
                    className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="date"
                    value={config.dateRange.end}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      dateRange: { ...prev.dateRange, end: e.target.value }
                    }))}
                    className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Filters</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  value={config.filters.status}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    filters: { ...prev.filters, status: e.target.value as any }
                  }))}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={config.filters.type}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    filters: { ...prev.filters, type: e.target.value as any }
                  }))}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Export Format</h3>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="csv"
                  checked={config.format === 'csv'}
                  onChange={(e) => setConfig(prev => ({ ...prev, format: e.target.value as 'csv' }))}
                  className="w-4 h-4 text-green-500 bg-gray-700 border-gray-600 focus:ring-green-500 focus:ring-2"
                />
                <span className="ml-2 text-gray-300">CSV</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="format"
                  value="xlsx"
                  checked={config.format === 'xlsx'}
                  onChange={(e) => setConfig(prev => ({ ...prev, format: e.target.value as 'xlsx' }))}
                  className="w-4 h-4 text-green-500 bg-gray-700 border-gray-600 focus:ring-green-500 focus:ring-2"
                />
                <span className="ml-2 text-gray-300">Excel (XLSX)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || config.columns.length === 0}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isExporting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;