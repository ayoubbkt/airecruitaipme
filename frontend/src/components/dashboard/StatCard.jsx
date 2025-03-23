import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';


const StatCard = ({ title, value, trend, trendUp, icon, color }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600',
    indigo: 'bg-indigo-50 text-indigo-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    red: 'bg-red-50 text-red-600',
  };

  
  const iconClass = colorMap[color] || 'bg-blue-50 text-blue-600';
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 rounded-lg ${iconClass} flex items-center justify-center`}>
          {icon}
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center ${trendUp ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
          {trendUp ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          {trend}
        </div>
      </div>
      <h4 className="text-slate-500 text-sm mb-1">{title}</h4>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
};

export default StatCard;