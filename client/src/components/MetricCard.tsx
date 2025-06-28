import React from 'react';
import { TrendingUp, TrendingDown, Wallet, CreditCard, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';
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

  const getGradient = (index: number) => {
    const gradients = [
      'from-green-500 to-emerald-600',
      'from-blue-500 to-cyan-600',
      'from-purple-500 to-pink-600',
      'from-orange-500 to-red-600'
    ];
    return gradients[index % gradients.length];
  };

  const isPositive = metric.changeType === 'increase';

  return (
    <div className={`
      group relative overflow-hidden rounded-2xl transition-all duration-300 hover-lift card-hover
      ${highlighted 
        ? 'bg-gradient-to-br from-green-500/20 to-blue-500/20 border-2 border-green-500/30 shadow-glow' 
        : 'card-enhanced'
      }
    `}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16" />
      </div>

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-gray-400 text-sm font-medium uppercase tracking-wider">
            {metric.title}
          </div>
          <div className={`
            p-3 rounded-xl transition-all duration-300 group-hover:scale-110
            ${highlighted 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-gray-700/50 text-gray-400 group-hover:text-green-400'
            }
          `}>
            {getIcon(metric.icon)}
          </div>
        </div>
        
        {/* Amount */}
        <div className="mb-4">
          <div className={`
            text-3xl font-bold transition-all duration-300
            ${highlighted ? 'text-white' : 'text-white group-hover:text-green-400'}
          `}>
            {formatAmount(metric.amount)}
          </div>
        </div>
        
        {/* Change indicator */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className={`
              flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium transition-all duration-300
              ${isPositive 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }
            `}>
              {isPositive ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              <span>
                {metric.change > 0 ? '+' : ''}{metric.change}%
              </span>
            </div>
          </div>
          
          <div className="text-gray-500 text-xs">
            vs last month
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`
              h-full transition-all duration-1000 ease-out
              ${isPositive ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-red-500 to-orange-400'}
            `}
            style={{ 
              width: `${Math.min(Math.abs(metric.change) * 2, 100)}%`,
              animationDelay: '0.5s'
            }}
          />
        </div>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default MetricCard;