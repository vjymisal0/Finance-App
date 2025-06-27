import React from 'react';
import { Transaction } from '../types';

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

  const recentTransactions = transactions.slice(0, 3);

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Recent Transaction</h3>
        <button className="text-green-500 text-sm font-medium hover:text-green-400 transition-colors">
          See all
        </button>
      </div>
      
      <div className="space-y-4">
        {recentTransactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-gray-700 rounded-lg transition-colors">
            <div className="flex items-center">
              <img 
                src={transaction.avatar} 
                alt={transaction.name}
                className="w-10 h-10 rounded-full mr-3 object-cover"
              />
              <div>
                <div className="text-white font-medium text-sm">{transaction.name}</div>
                <div className="text-gray-400 text-xs">
                  {transaction.type === 'Income' ? 'Transfer from' : 'Transfer to'}
                </div>
              </div>
            </div>
            
            <div className={`font-semibold ${
              transaction.amount >= 0 ? 'text-green-500' : 'text-orange-500'
            }`}>
              {formatAmount(transaction.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;