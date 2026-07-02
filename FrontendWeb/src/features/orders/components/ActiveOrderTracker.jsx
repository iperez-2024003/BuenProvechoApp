import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChefHat, CheckCircle2, ShoppingBag, ArrowRight, Zap } from 'lucide-react';
import { useOrderStore } from '../store/useOrderStore';
import { useAuthStore } from '../../auth/store/useAuthStore';

const STATUS_CONFIG = {
  pending: {
    label: 'Recibido',
    description: 'Estamos confirmando tu pedido...',
    icon: Clock,
    color: 'bg-zinc-100',
    step: 1
  },
  confirmed: {
    label: 'Confirmado',
    description: '¡Tu orden ha sido aceptada!',
    icon: ShoppingBag,
    color: 'bg-blue-50',
    step: 2
  },
  preparing: {
    label: 'En Cocina',
    description: 'El chef está preparando tu festín.',
    icon: ChefHat,
    color: 'bg-orange-50',
    step: 3
  },
  ready: {
    label: '¡Listo!',
    description: 'Tu pedido está listo para ser servido.',
    icon: Zap,
    color: 'bg-yellow-50',
    step: 4
  },
  served: {
    label: 'Servido',
    description: '¡Buen provecho! Disfruta tu comida.',
    icon: CheckCircle2,
    color: 'bg-green-50',
    step: 5
  }
};

export const ActiveOrderTracker = () => {
  const { user } = useAuthStore();
  const { activeOrders, fetchUserActiveOrders } = useOrderStore();

  useEffect(() => {
    if (user?.id) {
      fetchUserActiveOrders(user.id);
      
      // Polling cada 30 segundos para simular tiempo real si no hay sockets
      const interval = setInterval(() => {
        fetchUserActiveOrders(user.id);
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user?.id, fetchUserActiveOrders]);

  if (!activeOrders || activeOrders.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 bg-[#1c1712] rounded flex items-center justify-center border-2 border-[#1c1712] shadow-[2px_2px_0px_#b98c52]">
          <Zap size={16} className="text-[#fffaf3]" />
        </div>
        <h3 className="text-xl font-black text-[#1c1712] uppercase tracking-tighter">Sigue tu festín</h3>
      </div>

      <AnimatePresence>
        {activeOrders.map((order) => {
          const config = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
          const Icon = config.icon;

          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-4 border-[#1c1712] p-6 shadow-[8px_8px_0px_#1c1712] relative overflow-hidden"
            >
              {/* Barra de Progreso Superior */}
              <div className="absolute top-0 left-0 w-full h-2 bg-zinc-100">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(config.step / 5) * 100}%` }}
                  className="h-full bg-[#b98c52]"
                />
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className={`w-16 h-16 ${config.color} border-2 border-[#1c1712] flex items-center justify-center shadow-[4px_4px_0px_#1c1712]`}>
                    <Icon size={32} className="text-[#1c1712]" />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#b98c52]">Orden #{order.order_number}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    </div>
                    <h4 className="text-2xl font-black text-[#1c1712] uppercase tracking-tighter leading-none mb-2">
                      {config.label}
                    </h4>
                    <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">
                      {config.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-[#fffaf3] border-2 border-[#1c1712] p-4 shadow-[4px_4px_0px_#1c1712]">
                   <div className="text-right">
                      <p className="text-[9px] font-black text-[#b98c52] uppercase tracking-widest mb-1">Total</p>
                      <p className="text-xl font-black text-[#1c1712]">Q{order.total}</p>
                   </div>
                   <div className="w-px h-10 bg-[#1c1712]/10" />
                   <button className="p-2 hover:bg-[#1c1712] hover:text-[#fffaf3] transition-all rounded group">
                      <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
              </div>

              {/* Steps Visual */}
              <div className="mt-8 flex justify-between relative">
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-100 -translate-y-1/2 -z-10" />
                {[1, 2, 3, 4, 5].map((s) => (
                  <div 
                    key={s} 
                    className={`w-4 h-4 rounded-full border-2 border-[#1c1712] transition-all ${config.step >= s ? 'bg-[#b98c52] scale-125' : 'bg-white'}`}
                  />
                ))}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
