import React from 'react';

const AnalysisCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <div className="flex items-center mb-2">
        {icon}
        <h4 className="ml-3 text-md font-medium text-slate-800">{title}</h4>
      </div>
      <p className="text-sm text-slate-600">{description}</p>
    </div>
  );
};

export default AnalysisCard;