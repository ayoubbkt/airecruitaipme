import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const SourcesChart = ({ data }) => {
  // Ensure data is in the correct format for the chart
  const chartData = data.map(item => ({
    name: item.name,
    value: item.percentage,
    color: item.color
  }));


  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={30}
          outerRadius={60}
          paddingAngle={5}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [`${value}%`, 'Pourcentage']}
          labelFormatter={(name) => `Source: ${name}`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default SourcesChart;