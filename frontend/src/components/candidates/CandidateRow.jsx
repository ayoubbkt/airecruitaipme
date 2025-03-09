import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, Mail } from 'lucide-react';

const CandidateRow = ({ candidate }) => {
  // Determine color based on score
  let scoreColor = "bg-red-100 text-red-800";
  
  if (candidate.score >= 85) {
    scoreColor = "bg-green-100 text-green-800";
  } else if (candidate.score >= 70) {
    scoreColor = "bg-yellow-100 text-yellow-800";
  } else if (candidate.score >= 50) {
    scoreColor = "bg-orange-100 text-orange-800";
  }
  
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-6 py-3">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-medium">
            {candidate.firstName.charAt(0)}{candidate.lastName.charAt(0)}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-slate-800">{candidate.firstName} {candidate.lastName}</p>
            <p className="text-xs text-slate-500">{candidate.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-3">
        <p className="text-sm text-slate-700">{candidate.title}</p>
      </td>
      <td className="px-6 py-3">
        <div className="flex flex-wrap gap-1">
          {candidate.skills.slice(0, 3).map((skill, idx) => (
            <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
              {skill}
            </span>
          ))}
          {candidate.skills.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
              +{candidate.skills.length - 3}
            </span>
          )}
        </div>
      </td>
      <td className="px-6 py-3">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${scoreColor}`}>
          {candidate.score}%
        </span>
      </td>
      <td className="px-6 py-3">
        <div className="flex space-x-2">
          <Link to={`/cv/${candidate.id}`} className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100">
            <Eye className="h-4 w-4" />
          </Link>
          <a href={`mailto:${candidate.email}`} className="p-1.5 rounded bg-slate-50 text-slate-600 hover:bg-slate-100">
            <Mail className="h-4 w-4" />
          </a>
        </div>
      </td>
    </tr>
  );
};

export default CandidateRow;