import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TrendChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>;
  }

  // Format dates for display
  const chartData = data.map(item => {
    // Convert YYYY-MM to Month Short Name
    const [year, month] = item._id.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    const monthName = date.toLocaleString('default', { month: 'short' });
    
    return {
      name: `${monthName} ${year.substring(2)}`,
      sortKey: item._id,
      reports: item.count
    };
  }).sort((a, b) => a.sortKey.localeCompare(b.sortKey)); // Ensure chronological order

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
          <p className="font-semibold text-gray-800 mb-1">{label}</p>
          <p className="text-primary-600 font-medium">Reports: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#64748b' }} 
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="reports" 
            stroke="#3b82f6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorReports)" 
            activeDot={{ r: 6, fill: '#2563eb', stroke: '#fff', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TrendChart;
