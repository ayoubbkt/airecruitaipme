import React from 'react';
import { Eye, Download } from 'lucide-react';


const CandidateAnalysisRow = ({ candidate, onViewDetails }) => {
  // Determine color based on score
  let scoreColor = "bg-red-100 text-red-800";
  let matchColor = "bg-red-100 text-red-800";
  let matchText = "Insuffisante";
  
  
  if (candidate.score >= 85) {
    scoreColor = "bg-green-100 text-green-800";
    matchColor = "bg-green-100 text-green-800";
    matchText = "Excellente";
  } else if (candidate.score >= 70) {
    scoreColor = "bg-yellow-100 text-yellow-800";
    matchColor = "bg-yellow-100 text-yellow-800";
    matchText = "Bonne";
  } else if (candidate.score >= 50) {
    scoreColor = "bg-orange-100 text-orange-800";
    matchColor = "bg-orange-100 text-orange-800";
    matchText = "Moyenne";
  }
  
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium">
            {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-slate-900">{candidate.firstName} {candidate.lastName}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex flex-wrap gap-1">
          {candidate.skills.slice(0, 4).map((skill, idx) => (
            <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
              {skill}
            </span>
          ))}
          {candidate.skills.length > 4 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              +{candidate.skills.length - 4}
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-sm text-slate-600">{candidate.yearsOfExperience} ans</span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${scoreColor}`}>
          {candidate.score}%
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${matchColor}`}>
          {matchText}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex space-x-2">
          <button 
            className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
            onClick={onViewDetails}
          >
            <Eye className="h-4 w-4" />
          </button>
          <button 
            className="p-1.5 rounded bg-slate-50 text-slate-600 hover:bg-slate-100"
            onClick={() => window.open(`/api/cv/download/${candidate.id}`, '_blank')}
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default CandidateAnalysisRow;