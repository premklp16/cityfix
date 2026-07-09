import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { STATUS_COLORS } from '../../utils/constants';

// Helper to map status to hex colors for Recharts
const getStatusHexColor = (status) => {
  const colorMap = {
    'Reported': '#94a3b8',    // slate-400
    'Under Review': '#3b82f6', // blue-500
    'Assigned': '#8b5cf6',     // violet-500
    'In Progress': '#f59e0b',  // amber-500
    'Resolved': '#10b981',     // emerald-500
    'Rejected': '#ef4444'      // red-500
  };
  return colorMap[status] || '#cbd5e1';
};

const StatusChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-gray-500">No data available</div>;
  }

  // Format data for Recharts
  const chartData = data.map(item => ({
    name: item._id,
    value: item.count
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-lg rounded-lg">
          <p className="font-semibold text-gray-800">{payload[0].name}</p>
          <p className="text-primary-600 font-medium">Count: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getStatusHexColor(entry.name)} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend layout="vertical" verticalAlign="middle" align="right" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatusChart;
