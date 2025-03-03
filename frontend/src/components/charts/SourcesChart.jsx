import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const SourcesChart = ({ data }) => {
  const chartData = {
    labels: data.map(source => source.name),
    datasets: [
      {
        data: data.map(source => source.percentage),
        backgroundColor: data.map(source => source.color),
      },
    ],
  };

  return (
    <div className="w-full h-full">
      <Doughnut data={chartData} />
    </div>
  );
};

export default SourcesChart;