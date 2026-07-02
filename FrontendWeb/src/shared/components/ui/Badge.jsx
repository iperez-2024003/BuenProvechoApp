import React from 'react';

export const Badge = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary: 'bg-[#fffaf3] text-[#1c1712] border-2 border-[#1c1712] shadow-[2px_2px_0px_#b98c52]',
    success: 'bg-[#22c55e] text-[#fffaf3] border-2 border-[#1c1712] shadow-[2px_2px_0px_#1c1712]',
    danger: 'bg-[#ef4444] text-[#fffaf3] border-2 border-[#1c1712] shadow-[2px_2px_0px_#1c1712]',
    warning: 'bg-[#f59e0b] text-[#1c1712] border-2 border-[#1c1712] shadow-[2px_2px_0px_#1c1712]',
    ink: 'bg-[#1c1712] text-[#fffaf3] border-2 border-[#1c1712] shadow-[2px_2px_0px_#b98c52]'
  };

  return (
    <span className={`px-4 py-1 rounded-none text-[10px] font-black uppercase tracking-[0.2em] ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
