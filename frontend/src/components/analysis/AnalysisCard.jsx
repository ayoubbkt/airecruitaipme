import React from 'react';


const AnalysisCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start">
        <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisCard;