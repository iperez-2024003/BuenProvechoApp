import React from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../../features/auth/store/useAuthStore';

export const Card = ({ children, className = '', hover = true, simple: manualSimple }) => {
  const { role } = useAuthStore();
  const isSimple = manualSimple !== undefined ? manualSimple : (role && role !== 'CLIENT_ROLE');

  return (
    <motion.div
      whileHover={hover ? (isSimple ? { y: -4, shadow: '6px 6px 0px #1c1712' } : { y: -8, shadow: '12px 12px 0px #1c1712' }) : {}}
      className={`
        bg-white ${isSimple ? 'border-2' : 'border-4'} border-[#1c1712]
        rounded-none ${isSimple ? 'p-6 shadow-[4px_4px_0px_#1c1712]' : 'p-8 shadow-[8px_8px_0px_#1c1712]'}
        transition-all duration-200
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};
