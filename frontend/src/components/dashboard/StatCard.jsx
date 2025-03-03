import React from 'react';

const StatCard = ({ title, value, trend, trendUp, icon, color }) => {
  const colorStyles = {
    blue: 'border-blue-500 bg-blue-50 text-blue-600',
    indigo: 'border-indigo-500 bg-indigo-50 text-indigo-600',
    purple: 'border-purple-500 bg-purple-50 text-purple-600',
    green: 'border-green-500 bg-green-50 text-green-600'
  };

  return (
    <div className={`border-l-4 ${colorStyles[color]} p-4 rounded-lg shadow-sm`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        {icon}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        <div className={`text-sm ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </div>
      </div>
    </div>
  );
};

export default StatCard;