import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowUpRight } from 'lucide-react';

export const TransactionCard = ({ label, value, status, onClick }) => {
  return (
    <motion.button
      whileHover={{ x: 4 }}
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white/50 border border-primary-200/60 rounded-2xl hover:bg-white hover:border-primary-400 transition-all group"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600">
          <ArrowUpRight size={20} />
        </div>
        <div className="text-left">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-brown leading-none mb-1">{label}</p>
          <h5 className="text-sm font-bold text-ink">Ver detalles operativos</h5>
        </div>
      </div>
      <ChevronRight size={18} className="text-primary-300 group-hover:text-primary-500 transition-colors" />
    </motion.button>
  );
};
