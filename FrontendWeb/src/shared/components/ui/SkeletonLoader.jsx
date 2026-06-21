import React from 'react';

export const SkeletonLoader = ({ className = '', height = 'h-4', width = 'w-full', rounded = 'rounded-lg' }) => {
  return (
    <div className={`animate-pulse bg-primary-100/50 ${height} ${width} ${rounded} ${className}`} />
  );
};
