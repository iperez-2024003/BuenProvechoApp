import { motion } from 'framer-motion';
import { Users, TrendingUp, DollarSign } from 'lucide-react';

export const VipStatsCards = ({ clients }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 px-4 md:px-0">
      <motion.div 
        whileHover={{ y: -10 }}
        className="bg-gradient-to-br from-[#d7b77f] to-[#b98c52] p-6 md:p-10 rounded-[3rem] text-white shadow-2xl shadow-[rgba(185,140,82,0.18)] relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-6 md:p-8 opacity-10 group-hover:scale-125 transition-transform duration-700">
          <Users className="w-16 md:w-24 h-16 md:h-24" />
        </div>
        <h4 className="text-5xl font-black mb-2 tracking-tighter">{clients.length}</h4>
        <p className="text-amber-50 font-black uppercase tracking-widest text-[10px]">Clientes VIP Activos</p>
      </motion.div>

      <motion.div 
        whileHover={{ y: -10 }}
        className="bg-white/80 backdrop-blur-3xl p-10 rounded-[3rem] border border-[#dcc7a5]/70 text-zinc-900 shadow-[0_30px_100px_rgba(110,80,45,0.14)]"
      >
        <TrendingUp className="w-8 h-8 mb-6 text-[#b98c52]" />
        <h4 className="text-4xl font-black mb-2 tracking-tighter">
          {(clients.reduce((acc, c) => acc + parseInt(c.total_orders || 0, 10), 0) / (clients.length || 1)).toFixed(1)}
        </h4>
        <p className="text-zinc-600 font-black uppercase tracking-widest text-[10px]">Promedio de Pedidos</p>
      </motion.div>

      <motion.div 
        whileHover={{ y: -10 }}
        className="bg-white/80 backdrop-blur-3xl p-10 rounded-[3rem] border border-[#dcc7a5]/70 text-zinc-900 shadow-[0_30px_100px_rgba(110,80,45,0.14)]"
      >
        <DollarSign className="w-8 h-8 mb-6 text-emerald-500" />
        <h4 className="text-4xl font-black mb-2 tracking-tighter">
          Q{(clients.reduce((acc, c) => acc + parseFloat(c.total_spent || 0), 0) / (clients.length || 1)).toLocaleString()}
        </h4>
        <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">Inversión Media</p>
      </motion.div>
    </div>
  );
};
