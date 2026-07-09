import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { CATEGORY_COLORS } from '../../utils/constants';

const CategoryChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>;
  }

  // Sort data descending by count
  const chartData = [...data]
    .sort((a, b) => b.count - a.count)
    .map(item => ({
      name: item._id,
      count: item.count
    }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
          <p className="font-semibold text-gray-800 mb-1">{label}</p>
          <p className="text-gray-600">Total Reports: <span className="font-bold text-gray-900">{payload[0].value}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            axisLine={false}
            tickLine={false}
            angle={-45}
            textAnchor="end"
            height={60}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
          <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={50}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryChart;
