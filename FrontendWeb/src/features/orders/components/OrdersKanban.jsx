import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useOrderStore } from '../store/useOrderStore';
import { motion, AnimatePresence } from 'framer-motion';
import { translateStatus } from '../../../shared/utils/i18n';
import { pedidosApi as api } from '../../../shared/api/axios';
import { useSocket, useSocketEvent } from '../../../shared/hooks/useSocket';
import { showError, showSuccess } from '../../../shared/utils/toast';
import {
  ClipboardList,
  RefreshCcw,
  Flame,
  CheckCircle2,
  Truck,
  Package,
  UtensilsCrossed,
  FileText,
  Loader2,
  ChevronRight,
  Bell
} from 'lucide-react';

const ORDER_STATUSES = [
  { id: 'pending', label: 'Pendientes', color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
  { id: 'preparing', label: 'En Cocina', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  { id: 'ready', label: 'Listos', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  { id: 'served', label: 'Entregados', color: 'bg-[#d7b77f]/10 text-[#b98c52] border-[#d7b77f]/20' }
];

export const OrdersKanban = () => {
  const { id: restaurantId } = useParams();
  const { orders, loading, fetchRestaurantOrders, updateOrderStatus } = useOrderStore();

  useSocket(restaurantId);

  useSocketEvent('new_order', (newOrder) => {
    showSuccess(`🔔 ¡Nueva Orden #${newOrder.order_number}!`);
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(() => { });
    fetchRestaurantOrders(restaurantId);
  });

  useSocketEvent('order_status_updated', (data) => {
    fetchRestaurantOrders(restaurantId);
  });

  useEffect(() => {
    if (restaurantId) {
      fetchRestaurantOrders(restaurantId);
    }
  }, [restaurantId, fetchRestaurantOrders]);

  const handleStatusChange = (orderId, currentStatus) => {
    const currentIndex = ORDER_STATUSES.findIndex(s => s.id === currentStatus);
    if (currentIndex < ORDER_STATUSES.length - 1) {
      const nextStatus = ORDER_STATUSES[currentIndex + 1].id;
      updateOrderStatus(orderId, nextStatus);
    }
  };

  const handleDownloadTicket = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}/invoice`, { responseType: 'blob' });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
    } catch (error) {
      showError(error.response?.data?.message || 'No se pudo abrir el ticket');
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="h-[70vh] flex flex-col justify-center items-center font-outfit">
        <Loader2 className="w-12 h-12 text-[#b98c52] animate-spin" />
        <p className="mt-6 text-zinc-500 font-black animate-pulse uppercase tracking-[0.4em] text-[10px]">Sincronizando Comanda Digital...</p>
      </div>
    );
  }

  return (
    <div className="font-outfit space-y-12 animate-in fade-in duration-700 w-full min-w-0 overflow-x-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <p className="text-[10px] font-black text-[#b98c52] uppercase tracking-[0.4em] mb-2">Service Operations</p>
          <h1 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tighter uppercase leading-none">Command <span className="text-[#8b6435]">Center</span></h1>
        </div>

        <button
          onClick={() => fetchRestaurantOrders(restaurantId)}
          className="w-full md:w-auto flex items-center justify-center gap-3 px-6 md:px-8 py-4 rounded-2xl bg-[#fffaf3] text-zinc-900 font-black uppercase tracking-widest text-[10px] border border-[#dcc7a5] hover:border-[#b98c52] transition-all shadow-2xl"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Sincronizar
        </button>
      </div>

      <div className="flex gap-6 md:gap-8 overflow-x-auto pb-10 h-[calc(100vh-280px)] md:h-[calc(100vh-220px)] items-start scrollbar-thin scrollbar-thumb-zinc-800">
        {ORDER_STATUSES.map(status => {
          const columnOrders = orders.filter(o => o.status === status.id);

          return (
            <div key={status.id} className="min-w-[260px] md:min-w-[350px] w-[260px] md:w-[350px] flex-shrink-0 flex flex-col h-full">
              <div className={`flex items-center justify-between mb-6 px-6 py-4 rounded-3xl border ${status.color} backdrop-blur-xl`}>
                <h3 className="font-black uppercase tracking-widest text-[11px]">{status.label}</h3>
                <span className="text-[10px] font-black w-8 h-8 rounded-xl bg-black/40 flex items-center justify-center border border-current/10">
                  {columnOrders.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                <AnimatePresence mode="popLayout">
                  {columnOrders.map(order => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={order.id}
                      className="bg-white/80 backdrop-blur-3xl p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-[#dcc7a5]/70 hover:border-[#b98c52]/30 transition-all relative overflow-hidden group"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">#{order.order_number?.split('-').pop()}</span>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${order.order_type === 'delivery' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                          order.order_type === 'takeout' ? 'bg-[#f3e4ca] text-[#8b6435] border-[#dcc7a5]' :
                            'bg-[#fffaf3] text-zinc-600 border-[#dcc7a5]'
                          }`}>
                          {order.order_type === 'dine_in' ? <UtensilsCrossed className="w-3 h-3" /> :
                            order.order_type === 'delivery' ? <Truck className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                          {order.order_type === 'dine_in' ? 'Salón' :
                            order.order_type === 'delivery' ? 'Domicilio' : 'Para llevar'}
                        </div>
                      </div>

                      <h4 className="text-xl font-black text-zinc-900 tracking-tight uppercase mb-2 group-hover:text-[#8b6435] transition-colors">{order.customer_name}</h4>

                      <div className="space-y-1 mb-6">
                        {order.order_type === 'delivery' && order.delivery_address && (
                          <div className="flex items-center gap-2 text-amber-600 text-[10px] font-bold uppercase tracking-widest">
                            <ChevronRight className="w-3 h-3" /> {order.delivery_address}
                          </div>
                        )}
                        {order.notes && (
                          <div className="flex items-center gap-2 text-rose-500 text-[10px] font-black uppercase tracking-widest bg-rose-500/5 p-2 rounded-xl border border-rose-500/10 mt-2">
                            <Bell className="w-3 h-3 animate-pulse" /> {order.notes}
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 mb-8 bg-[#fffaf3] p-4 rounded-2xl border border-[#dcc7a5]">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[11px] font-bold uppercase tracking-widest">
                            <span className="text-zinc-600"><span className="text-[#b98c52] mr-2">{item.quantity}x</span> {item.MenuItem?.name}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-zinc-800/50">
                        <span className="text-2xl font-black text-zinc-900 tracking-tighter">Q{order.total}</span>

                        {status.id !== 'served' ? (
                          <button
                            onClick={() => handleStatusChange(order.id, status.id)}
                            className="px-6 py-3 bg-gradient-to-r from-[#d7b77f] to-[#b98c52] text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:to-[#a97d45] transition-all shadow-2xl shadow-[rgba(185,140,82,0.18)] flex items-center gap-2"
                          >
                            {status.id === 'pending' ? <Flame className="w-4 h-4" /> :
                              status.id === 'preparing' ? <CheckCircle2 className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            {status.id === 'pending' ? 'Cocinar' :
                              status.id === 'preparing' ? 'Listo' : 'Entregar'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDownloadTicket(order.id)}
                            className="px-6 py-3 bg-[#fffaf3] text-[#8b6435] border border-[#dcc7a5] text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-[#f4e8d3] transition-all flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" /> Ticket
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {columnOrders.length === 0 && (
                  <div className="h-40 rounded-[2.5rem] border-2 border-dashed border-[#dcc7a5] flex flex-col items-center justify-center gap-4 text-center px-10 bg-white/60">
                    <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em]">Bandeja Vacía</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersKanban;
