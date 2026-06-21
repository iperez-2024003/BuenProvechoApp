import React from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../../features/auth/store/useAuthStore';

export const Button = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  isLoading = false,
  simple: manualSimple,
  ...props 
}) => {
  const { role } = useAuthStore();
  const isSimple = manualSimple !== undefined ? manualSimple : (role && role !== 'CLIENT_ROLE');

  const variants = {
    primary: isSimple 
      ? 'bg-[#1c1712] text-[#fffaf3] border-2 border-[#1c1712] shadow-[4px_4px_0px_#b98c52]' 
      : 'bg-[#1c1712] text-[#fffaf3] border-4 border-[#1c1712] shadow-[6px_6px_0px_#b98c52] hover:shadow-[8px_8px_0px_#b98c52]',
    secondary: isSimple
      ? 'bg-[#b98c52] text-[#1c1712] border-2 border-[#1c1712] shadow-[4px_4px_0px_#1c1712]'
      : 'bg-[#b98c52] text-[#1c1712] border-4 border-[#1c1712] shadow-[6px_6px_0px_#1c1712] hover:shadow-[8px_8px_0px_#1c1712]',
    ghost: isSimple
      ? 'bg-[#fffaf3] text-[#1c1712] border-2 border-[#1c1712] shadow-[3px_3px_0px_#1c1712]'
      : 'bg-[#fffaf3] text-[#1c1712] border-4 border-[#1c1712] shadow-[4px_4px_0px_#1c1712] hover:shadow-[6px_6px_0px_#1c1712]',
    danger: isSimple
      ? 'bg-[#ef4444] text-[#fffaf3] border-2 border-[#1c1712] shadow-[3px_3px_0px_#1c1712]'
      : 'bg-[#ef4444] text-[#fffaf3] border-4 border-[#1c1712] shadow-[4px_4px_0px_#1c1712] hover:shadow-[6px_6px_0px_#1c1712]'
  };

  return (
    <motion.button
      whileHover={isSimple ? { y: -2 } : { y: -4 }}
      whileTap={{ y: 1, shadow: 'none' }}
      className={`
        ${isSimple ? 'px-5 py-2.5' : 'px-8 py-4'} rounded-xl font-black uppercase ${isSimple ? 'tracking-widest text-[9px]' : 'tracking-[0.2em] text-[11px]'} transition-all duration-200
        flex items-center justify-center gap-2 disabled:opacity-50
        ${variants[variant]} ${className}
      `}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <div className={`w-4 h-4 border-${isSimple ? '2' : '4'} border-current border-t-transparent animate-spin`} />
      ) : children}
    </motion.button>
  );
};
