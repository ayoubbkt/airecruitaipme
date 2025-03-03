import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const SkillMatch = ({ name, matched, confidence }) => {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center">
        {matched ? (
          <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
        ) : (
          <XCircle className="h-4 w-4 text-red-600 mr-2" />
        )}
        <p className="text-sm text-slate-700">{name}</p>
      </div>
      {matched && confidence && (
        <p className="text-xs text-slate-500">{Math.round(confidence * 100)}% confiance</p>
      )}
    </div>
  );
};

export default SkillMatch;