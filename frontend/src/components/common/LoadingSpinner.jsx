import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center h-32">
      <div className="w-10 h-10 border-4 border-t-blue-500 border-b-indigo-600 border-l-blue-300 border-r-indigo-300 rounded-full animate-spin"></div>
    </div>
  );
};

export default LoadingSpinner;