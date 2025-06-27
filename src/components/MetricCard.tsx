import React from 'react';
import { TrendingUp, TrendingDown, Wallet, CreditCard, PiggyBank } from 'lucide-react';
import { MetricCard as MetricCardType } from '../types';

interface MetricCardProps {
  metric: MetricCardType;
  highlighted?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric, highlighted = false }) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Wallet':
        return <Wallet className="w-6 h-6" />;
      case 'TrendingUp':
        return <TrendingUp className="w-6 h-6" />;
      case 'CreditCard':
        return <CreditCard className="w-6 h-6" />;
      case 'PiggyBank':
        return <PiggyBank className="w-6 h-6" />;
      default:
        return <Wallet className="w-6 h-6" />;
    }
  };

  return (
    <div className={`bg-gray-800 rounded-xl p-6 transition-all duration-300 hover:bg-gray-750 ${
      highlighted ? 'ring-2 ring-green-500' : ''
    }`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-gray-400 text-sm font-medium">{metric.title}</div>
        <div className="text-green-500">
          {getIcon(metric.icon)}
        </div>
      </div>
      
      <div className="text-3xl font-bold text-white mb-2">
        {formatAmount(metric.amount)}
      </div>
      
      <div className="flex items-center">
        {metric.changeType === 'increase' ? (
          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
        ) : (
          <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
        )}
        <span className={`text-sm font-medium ${
          metric.changeType === 'increase' ? 'text-green-500' : 'text-red-500'
        }`}>
          {metric.change > 0 ? '+' : ''}{metric.change}%
        </span>
        <span className="text-gray-400 text-sm ml-1">from last month</span>
      </div>
    </div>
  );
};

export default MetricCard;