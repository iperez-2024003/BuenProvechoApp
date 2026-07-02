import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { pedidosApi as api } from '../../../shared/api/axios';
import { useSocket, useSocketEvent } from '../../../shared/hooks/useSocket';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  ClockIcon,
  FireIcon,
  CheckCircleIcon,
  BeakerIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

export const KitchenDisplay = () => {
  const { id: restaurantId } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const statusFlow = {
    pending: { next: 'confirmed', label: 'CONFIRMAR PEDIDO', tone: 'bg-[#d7b77f] hover:bg-[#c89d57] text-white' },
    confirmed: { next: 'preparing', label: 'INICIAR PREPARACIÓN', tone: 'bg-orange-500 hover:bg-orange-400 text-white' },
    preparing: { next: 'ready', label: 'MARCAR COMO LISTO', tone: 'bg-emerald-600 hover:bg-emerald-500 text-white' },
    ready: { next: 'served', label: 'MARCAR COMO SERVIDO', tone: 'bg-sky-600 hover:bg-sky-500 text-white' },
  };

  const fetchKitchenOrders = async () => {
    try {
      const res = await api.get(`/orders/kitchen/${restaurantId}`);
      setOrders(res.data.data || res.data.orders || []);
    } catch (error) {
      console.error('Error fetching kitchen orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useSocket(restaurantId);

  useSocketEvent('new_order', () => {
    toast('🍳 ¡Nuevo pedido en cocina!', { icon: '🔥', style: { background: '#fffaf3', color: '#2f2317', border: '1px solid #dcc7a5' } });
    fetchKitchenOrders();
  });

  useSocketEvent('order_status_updated', () => {
    fetchKitchenOrders();
  });

  useEffect(() => {
    if (restaurantId) fetchKitchenOrders();
  }, [restaurantId]);

  const handleUpdateStatus = async (orderId, currentStatus) => {
    try {
      const nextStatus = statusFlow[currentStatus]?.next;
      if (!nextStatus) {
        toast.error('Este pedido ya no se puede mover desde cocina');
        return;
      }
      await api.patch(`/orders/${orderId}/status`, { status: nextStatus });
      toast.success(
        nextStatus === 'confirmed'
          ? 'Pedido confirmado'
          : nextStatus === 'preparing'
            ? 'Empezando preparación...'
            : nextStatus === 'ready'
              ? 'Pedido listo'
              : 'Pedido servido'
      );
      fetchKitchenOrders();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-[#f7f1e7]">
      <div className="w-16 h-16 border-4 border-[#dcc7a5] border-t-[#b98c52] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f7f1e7] p-6 text-zinc-900 overflow-x-auto">
      <div className="flex justify-between items-center mb-8 px-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
            <FireIcon className="w-8 h-8 text-[#b98c52]" />
            KITCHEN DISPLAY SYSTEM
          </h1>
          <p className="text-zinc-600 text-sm font-bold uppercase tracking-widest">Control de producción en tiempo real</p>
        </div>
        <div className="bg-white/80 px-6 py-3 rounded-2xl border border-[#dcc7a5] flex items-center gap-4 shadow-lg">
          <div className="text-right">
            <p className="text-xs text-zinc-500 font-bold">ÓRDENES ACTIVAS</p>
            <p className="text-2xl font-black text-[#b98c52]">{orders.length}</p>
          </div>
          <div className="w-px h-8 bg-[#dcc7a5]" />
          <ClockIcon className="w-6 h-6 text-[#b98c52]" />
        </div>
      </div>

      <div className="flex gap-6 pb-8 min-w-max h-[calc(100vh-160px)]">
        <AnimatePresence mode="popLayout">
          {orders.map((order, index) => (
            <motion.div
              key={order.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8, x: 50 }}
              className={`w-80 flex flex-col rounded-3xl border-2 transition-all shadow-2xl ${order.status === 'pending'
                  ? 'bg-white/80 border-[#dcc7a5]'
                  : 'bg-[#fffaf3] border-[#dcc7a5] shadow-[0_30px_100px_rgba(110,80,45,0.14)]'
                }`}
            >
              {/* Header de la tarjeta */}
              <div className={`p-5 rounded-t-3xl ${order.status === 'preparing' ? 'bg-gradient-to-r from-[#d7b77f] to-[#b98c52]' : 'bg-[#f3e4ca]'}`}>
                <div className="flex justify-between items-start mb-1">
                  <span className="text-2xl font-black">#{order.order_number}</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${order.status === 'pending' ? 'bg-white/70 text-[#8b6435]' : 'bg-white/70 text-[#2f2317]'
                    }`}>
                    {order.status === 'pending' ? 'NUEVO' : order.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs font-bold opacity-70 truncate">{order.customer_name || 'Sin nombre'}</p>
              </div>

              {/* Items */}
              <div className="flex-1 p-5 overflow-y-auto space-y-4">
                {order.items?.map((item, i) => (
                  <div key={i} className="border-b border-[#dcc7a5]/70 pb-3 last:border-0">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xl font-bold text-zinc-900 flex-1">{item.MenuItem?.name || item.menu_item?.name || 'Platillo sin nombre'}</span>
                      <span className="bg-[#f3e4ca] text-[#8b6435] w-8 h-8 rounded-lg flex items-center justify-center font-black">x{item.quantity}</span>
                    </div>
                    {item.special_instructions && (
                      <div className="mt-2 flex items-start gap-2 bg-[#fffaf3] p-2 rounded-xl border border-[#dcc7a5]">
                        <ChatBubbleLeftRightIcon className="w-4 h-4 text-[#b98c52] mt-0.5 shrink-0" />
                        <p className="text-[11px] text-zinc-600 font-bold leading-tight">{item.special_instructions}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Footer / Acción */}
              <div className="p-5 bg-white/70 rounded-b-3xl mt-auto border-t border-[#dcc7a5]">
                <div className="flex items-center justify-between mb-4 text-zinc-500">
                  <div className="flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    <span className="text-xs font-bold">{new Date(order.createdAt || order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {order.order_type === 'delivery' && (
                    <span className="text-[10px] font-black bg-slate-800 px-2 py-1 rounded-md">DOMICILIO</span>
                  )}
                </div>

                <button
                  onClick={() => handleUpdateStatus(order.id, order.status)}
                  className={`w-full py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 active:scale-95 ${statusFlow[order.status]?.tone || 'bg-zinc-800 text-white'}`}
                >
                  {order.status === 'ready' ? (
                    <>
                      <CheckCircleIcon className="w-6 h-6" />
                      MARCAR COMO SERVIDO
                    </>
                  ) : (
                    <>
                      <BeakerIcon className="w-6 h-6" />
                      {statusFlow[order.status]?.label || 'AVANZAR ESTADO'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {orders.length === 0 && (
          <div className="w-full flex flex-col items-center justify-center text-slate-600 opacity-20 select-none">
            <FireIcon className="w-32 h-32 mb-4" />
            <p className="text-3xl font-black italic">COCINA LIMPIA. BUEN TRABAJO.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KitchenDisplay;
