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
        return <Wallet className="w-5 h-5" />;
      case 'TrendingUp':
        return <TrendingUp className="w-5 h-5" />;
      case 'CreditCard':
        return <CreditCard className="w-5 h-5" />;
      case 'PiggyBank':
        return <PiggyBank className="w-5 h-5" />;
      default:
        return <Wallet className="w-5 h-5" />;
    }
  };

  return (
    <div className={`bg-gray-800 rounded-lg p-3 transition-all duration-200 hover:bg-gray-750 ${
      highlighted ? '' : ''
    }`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-gray-400 text-xs font-medium uppercase tracking-wide">{metric.title}</div>
        <div className="text-green-500">
          {getIcon(metric.icon)}
        </div>
      </div>
      
      <div className="text-xl font-bold text-white mb-1">
        {formatAmount(metric.amount)}
      </div>
      
      <div className="flex items-center">
        {metric.changeType === 'increase' ? (
          <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
        ) : (
          <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
        )}
        <span className={`text-xs font-medium ${
          metric.changeType === 'increase' ? 'text-green-500' : 'text-red-500'
        }`}>
          {metric.change > 0 ? '+' : ''}{metric.change}%
        </span>
        <span className="text-gray-500 text-xs ml-1">vs last month</span>
      </div>
    </div>
  );
};

export default MetricCard;