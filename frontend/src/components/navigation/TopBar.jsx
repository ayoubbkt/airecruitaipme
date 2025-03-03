import React from 'react';

const TopBar = ({ toggleSidebar }) => {
  return (
    <div className="bg-white shadow-sm p-4 flex items-center justify-between">
      <button onClick={toggleSidebar} className="p-2 rounded-full hover:bg-slate-100">
        <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <div className="text-lg font-semibold text-slate-800">RecrutPME</div>
    </div>
  );
};

export default TopBar;