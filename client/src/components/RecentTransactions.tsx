import React from 'react';
import { Transaction } from '../types';
import { ArrowUpRight, ArrowDownLeft, MoreHorizontal, Eye } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  const formatAmount = (amount: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(Math.abs(amount));

    return amount >= 0 ? `+${formatted}` : `-${formatted}`;
  };

  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="card-enhanced card-hover">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">Recent Transactions</h3>
          <p className="text-gray-400 text-sm">Latest financial activities</p>
        </div>
        <button className="flex items-center space-x-2 text-green-400 hover:text-green-300 text-sm font-medium transition-colors duration-200 hover-scale">
          <Eye className="w-4 h-4" />
          <span>View All</span>
        </button>
      </div>

      {/* Transactions list */}
      <div className="p-6 space-y-4">
        {recentTransactions.map((transaction, index) => (
          <div
            key={transaction.id}
            className="group flex items-center justify-between p-4 hover:bg-gray-700/30 rounded-xl transition-all duration-200 hover-lift"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="relative">
                <img
                  src={transaction.avatar}
                  alt={transaction.name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-gray-600 group-hover:border-green-500/50 transition-all duration-200"
                />
                <div className={`
                  absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs
                  ${transaction.amount >= 0 ? 'bg-green-500' : 'bg-orange-500'}
                `}>
                  {transaction.amount >= 0 ? (
                    <ArrowUpRight className="w-3 h-3" />
                  ) : (
                    <ArrowDownLeft className="w-3 h-3" />
                  )}
                </div>
              </div>

              {/* Transaction details */}
              <div className="flex-1">
                <div className="text-white font-medium text-sm group-hover:text-green-400 transition-colors duration-200">
                  {transaction.name}
                </div>
                <div className="text-gray-400 text-xs mt-1">
                  {transaction.type === 'Income' ? 'Payment received' : 'Payment sent'}
                </div>
                <div className="text-gray-500 text-xs mt-1">
                  {new Date(transaction.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>

            {/* Amount and actions */}
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className={`font-semibold text-sm ${transaction.amount >= 0 ? 'text-green-400' : 'text-orange-400'
                  }`}>
                  {formatAmount(transaction.amount)}
                </div>
                <div className={`
                  text-xs px-2 py-1 rounded-full mt-1
                  ${transaction.status === 'Completed'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-yellow-500/20 text-yellow-400'
                  }
                `}>
                  {transaction.status}
                </div>
              </div>

              <button className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-gray-600/50 text-gray-400 hover:text-white transition-all duration-200">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 pb-6">
        <button className="w-full btn-secondary text-center py-3 rounded-xl">
          View All Transactions
        </button>
      </div>
    </div>
  );
};

export default RecentTransactions;