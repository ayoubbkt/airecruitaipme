import React from 'react';

const CandidateRow = ({ candidate }) => {
  return (
    <tr className="hover:bg-slate-50">
      <td className="px-6 py-4 whitespace-nowrap">{candidate.firstName} {candidate.lastName}</td>
      <td className="px-6 py-4 whitespace-nowrap">{candidate.position || 'N/A'}</td>
      <td className="px-6 py-4 whitespace-nowrap">{candidate.skills.join(', ')}</td>
      <td className="px-6 py-4 whitespace-nowrap">{candidate.score || 'N/A'}%</td>
      <td className="px-6 py-4 whitespace-nowrap">Actions</td>
    </tr>
  );
};

export default CandidateRow;