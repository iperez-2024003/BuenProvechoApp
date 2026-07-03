import { motion, AnimatePresence } from 'framer-motion';
import { Star, Crown } from 'lucide-react';

export const VipClientsTable = ({ clients }) => {
  return (
    <div className="bg-white/80 backdrop-blur-3xl rounded-[3rem] border border-[#dcc7a5]/70 shadow-[0_30px_100px_rgba(110,80,45,0.14)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#dcc7a5]/70">
              <th className="p-4 md:p-8 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Cliente</th>
              <th className="p-4 md:p-8 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] text-center">Actividad</th>
              <th className="p-4 md:p-8 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] text-right">Inversión</th>
              <th className="p-4 md:p-8 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] text-center">Estatus</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#dcc7a5]/50">
            <AnimatePresence>
              {clients.map((client, i) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="group hover:bg-[#f7efe1] transition-all"
                >
                  <td className="p-4 md:p-8">
                    <div className="flex items-center gap-6">
                      <div className="w-12 h-12 md:w-14 md:h-14 bg-[#f3e4ca] text-[#8b6435] rounded-2xl flex items-center justify-center font-black border border-[#dcc7a5]/70 group-hover:scale-110 transition-transform duration-500">
                        {(client.user?.username || client.user?.email || 'VIP').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-zinc-900 uppercase tracking-tight">{client.user?.username || 'Cliente VIP'}</p>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{client.user?.email || 'Sin email'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 md:p-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#f3e4ca] text-[#8b6435] rounded-xl font-black text-[10px] uppercase tracking-widest">
                      <Star className="w-3.5 h-3.5" />
                      {client.total_orders} pedidos
                    </div>
                  </td>
                  <td className="p-4 md:p-8 text-right">
                    <p className="text-xl font-black text-zinc-900 tracking-tighter">Q{parseFloat(client.total_spent).toLocaleString()}</p>
                    <p className="text-[9px] text-zinc-600 font-black uppercase tracking-[0.2em]">Total Gastado</p>
                  </td>
                  <td className="p-4 md:p-8 text-center">
                     {i < 3 ? (
                       <div className="flex items-center justify-center gap-2 text-[#b98c52]">
                         <Crown className="w-5 h-5" />
                         <span className="font-black text-[10px] uppercase tracking-[0.2em]">Global Elite</span>
                       </div>
                     ) : (
                       <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Premium</span>
                     )}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};
