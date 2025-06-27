import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartData } from '../types';

interface ChartProps {
  data: ChartData[];
}

const Chart: React.FC<ChartProps> = ({ data }) => {
  const [activeView, setActiveView] = useState<'income' | 'expenses'>('income');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-white font-semibold">
              {entry.name}: ${entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Overview</h3>
        
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
          
          <select className="bg-gray-700 text-white px-3 py-1 rounded-lg text-sm border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500">
            <option>Monthly</option>
            <option>Weekly</option>
            <option>Yearly</option>
          </select>
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="income" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="expenses" 
              stroke="#F59E0B" 
              strokeWidth={3}
              dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#F59E0B', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 p-4 bg-gray-700 rounded-lg">
        <div className="text-green-500 text-2xl font-bold">$224.00</div>
        <div className="text-gray-400 text-sm">Current month highlight</div>
      </div>
    </div>
  );
};

export default Chart;