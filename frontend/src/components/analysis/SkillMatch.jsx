import React from 'react';
import { Check, X } from 'lucide-react';



const SkillMatch = ({ name, matched, confidence }) => {
  return (
    <div className="mb-2">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          {matched ? (
            <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mr-2">
              <Check className="w-3 h-3 text-green-600" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center mr-2">
              <X className="w-3 h-3 text-red-600" />
            </div>
          )}
          <p className="text-sm text-slate-700">{name}</p>
        </div>
        <p className="text-xs font-medium text-slate-600">{confidence}%</p>
      </div>
      <div className="w-full bg-slate-200 rounded-full h-1.5">
        <div 
          className={`h-1.5 rounded-full ${matched ? 'bg-green-500' : 'bg-slate-400'}`}
          style={{ width: `${confidence}%` }}
        ></div>
      </div>
    </div>
  );
};

export default SkillMatch;