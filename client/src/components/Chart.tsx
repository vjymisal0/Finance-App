import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartData } from '../types';
import { apiService } from '../services/api';

interface ChartProps {
  data?: ChartData[];
}

const Chart: React.FC<ChartProps> = ({ data: propData }) => {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [chartSummary, setChartSummary] = useState<any>(null);

  // Fetch chart data from API
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Determine months based on period
        const months = selectedPeriod === 'yearly' ? 5 : selectedPeriod === 'weekly' ? 3 : 12;

        const [chartResponse, summaryResponse] = await Promise.all([
          apiService.getChartData(selectedPeriod, months),
          apiService.getChartSummary('current_month')
        ]);

        setChartData(chartResponse.data);
        setChartSummary(summaryResponse.data);
      } catch (error: any) {
        console.error('Failed to fetch chart data:', error);
        setError(error.message || 'Failed to load chart data');

        // Fallback to prop data or default data
        if (propData) {
          setChartData(propData);
        } else {
          setChartData(getDefaultChartData());
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [selectedPeriod, propData]);

  const getDefaultChartData = (): ChartData[] => {
    return [
      { month: 'Jan', income: 0, expenses: 0 },
      { month: 'Feb', income: 0, expenses: 0 },
      { month: 'Mar', income: 0, expenses: 0 },
      { month: 'Apr', income: 0, expenses: 0 },
      { month: 'May', income: 0, expenses: 0 },
      { month: 'Jun', income: 0, expenses: 0 },
    ];
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-white font-semibold" style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toLocaleString()}
            </p>
          ))}
          {payload.length >= 2 && (
            <p className="text-blue-400 font-semibold border-t border-gray-600 pt-2 mt-2">
              Net: ${(payload[0].value - payload[1].value).toLocaleString()}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-center h-72">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading chart data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">Financial Overview</h3>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-400 text-sm">Income</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
              <span className="text-gray-400 text-sm">Expenses</span>
            </div>
          </div>

          <select
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value)}
            className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-500 text-sm">{error}</p>
          <p className="text-gray-400 text-xs mt-1">Showing fallback data</p>
        </div>
      )}

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="month"
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
              name="Income"
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#F59E0B"
              strokeWidth={3}
              dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
              name="Expenses"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Summary */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 bg-gray-700 rounded-lg">
          <div className="text-green-500 text-lg font-bold">
            ${chartSummary?.totalIncome?.toLocaleString() || '0'}
          </div>
          <div className="text-gray-400 text-xs">Total Income</div>
        </div>

        <div className="p-3 bg-gray-700 rounded-lg">
          <div className="text-orange-500 text-lg font-bold">
            ${chartSummary?.totalExpenses?.toLocaleString() || '0'}
          </div>
          <div className="text-gray-400 text-xs">Total Expenses</div>
        </div>

        <div className="p-3 bg-gray-700 rounded-lg">
          <div className={`text-lg font-bold ${(chartSummary?.netIncome || 0) >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
            ${chartSummary?.netIncome?.toLocaleString() || '0'}
          </div>
          <div className="text-gray-400 text-xs">Net Income</div>
        </div>
      </div>

      {/* Additional Insights */}
      {chartSummary && (
        <div className="mt-4 p-3 bg-gray-700 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">
              {chartSummary.transactionCount} transactions this month
            </span>
            {chartSummary.topCategory && (
              <span className="text-gray-400">
                Top category: <span className="text-white">{chartSummary.topCategory.name}</span>
              </span>
            )}
            <span className="text-gray-400">
              Avg: ${chartSummary.avgTransactionAmount?.toLocaleString() || '0'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chart;