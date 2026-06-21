import React from 'react';
import { motion } from 'framer-motion';

export const ActionButton = ({ label, icon: Icon, onClick, color = 'gold' }) => {
  const colors = {
    gold: 'bg-primary-50 text-primary-600 border-primary-200 hover:bg-primary-500 hover:text-white',
    blue: 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-500 hover:text-white',
    orange: 'bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-500 hover:text-white',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-200 hover:bg-cyan-500 hover:text-white',
  };

  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border transition-all duration-300
        w-32 h-32 shadow-sm hover:shadow-gold group
        ${colors[color] || colors.gold}
      `}
    >
      <div className="p-2 rounded-xl bg-white shadow-inner group-hover:bg-white/20 transition-colors">
        <Icon size={24} />
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-center leading-tight">
        {label}
      </span>
    </motion.button>
  );
};
