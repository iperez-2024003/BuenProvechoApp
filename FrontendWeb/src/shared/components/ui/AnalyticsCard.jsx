import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const AnalyticsCard = ({ title, value, icon: Icon, trend, trendValue, color = 'gold' }) => {
  const colors = {
    gold: 'text-primary-500 bg-primary-50 border-primary-100',
    blue: 'text-blue-500 bg-blue-50 border-blue-100',
    green: 'text-green-500 bg-green-50 border-green-100',
    bronze: 'text-primary-600 bg-primary-100 border-primary-200',
  };

  const selectedColor = colors[color] || colors.gold;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-primary-200/50 shadow-premium group relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
      
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl border ${selectedColor}`}>
          <Icon size={24} />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black ${trend === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trendValue}%
          </div>
        )}
      </div>

      <div>
        <p className="text-[10px] font-black text-muted-brown uppercase tracking-[0.2em] mb-1">{title}</p>
        <h3 className="text-3xl font-black text-ink tracking-tighter">{value}</h3>
      </div>

      <div className="mt-4 pt-4 border-t border-primary-50 flex items-center justify-between">
        <span className="text-[9px] font-bold text-muted-brown uppercase tracking-widest">Ver reporte</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`w-1 rounded-full bg-primary-200 h-${i * 2} group-hover:bg-primary-400 transition-all duration-500`} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};
