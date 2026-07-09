import React from 'react';

const Spinner = ({ size = 'md', className = '', colorClass = 'border-primary-600' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} rounded-full border-gray-200 border-t-transparent ${colorClass} animate-spin`}
      ></div>
    </div>
  );
};

export default Spinner;
