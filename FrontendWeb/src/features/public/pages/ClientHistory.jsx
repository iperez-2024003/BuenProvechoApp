import { useEffect, useMemo, useState } from 'react';
import { getOrders, getInvoice } from '../../../shared/api/orders';
import { getReservations } from '../../../shared/api/reservations';
import { createReview } from '../../../shared/api/reviews';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { showError, showSuccess } from '../../../shared/utils/toast';
import { translateStatus } from '../../../shared/utils/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { 
  History, 
  Star, 
  ShoppingBag, 
  Calendar, 
  MessageSquare, 
  ChevronRight, 
  X, 
  Zap,
  Loader2,
  Trophy,
  FileText,
  Search,
} from 'lucide-react';
import { ActiveOrderTracker } from '../../orders/components/ActiveOrderTracker';

const StarRating = ({ value, onChange }) => (
  <div className="flex gap-2">
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        onClick={() => onChange(star)}
        className={`text-3xl transition-all hover:scale-125 ${value >= star ? 'text-[#b98c52]' : 'text-zinc-800'}`}
      >
        <Star className={`w-8 h-8 ${value >= star ? 'fill-current' : ''}`} />
      </button>
    ))}
  </div>
);

export const ClientHistory = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState({ open: false, order: null });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [orderFilter, setOrderFilter] = useState('all');
  const [reservationFilter, setReservationFilter] = useState('all');
  const [reviewedOrders, setReviewedOrders] = useState([]);

  const statusClass = {
    pending: 'bg-[#fffaf3] text-amber-600 border-[#1c1712] shadow-[2px_2px_0px_#1c1712]',
    preparing: 'bg-[#fffaf3] text-orange-600 border-[#1c1712] shadow-[2px_2px_0px_#1c1712]',
    ready: 'bg-[#fffaf3] text-emerald-600 border-[#1c1712] shadow-[2px_2px_0px_#1c1712]',
    served: 'bg-[#1c1712] text-[#fffaf3] border-[#1c1712] shadow-[2px_2px_0px_#b98c52]',
    paid: 'bg-emerald-600 text-white border-[#1c1712] shadow-[2px_2px_0px_#1c1712]',
    confirmed: 'bg-indigo-600 text-white border-[#1c1712] shadow-[2px_2px_0px_#1c1712]',
    completed: 'bg-[#1c1712] text-[#fffaf3] border-[#1c1712] shadow-[2px_2px_0px_#b98c52]',
    no_show: 'bg-rose-600 text-white border-[#1c1712] shadow-[2px_2px_0px_#1c1712]',
    cancelled: 'bg-zinc-200 text-zinc-600 border-[#1c1712] shadow-[2px_2px_0px_#1c1712]',
  };

  const loadData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [ordersResponse, reservationsResponse] = await Promise.all([
        getOrders({ user_id: user.id, limit: 100 }),
        getReservations({ user_id: user.id, limit: 100 }),
      ]);
      setOrders(ordersResponse.data?.data || []);
      setReservations(reservationsResponse.data?.data || []);
    } catch (error) {
      showError('No se pudo sincronizar tu historial premium');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const completedOrders = useMemo(
    () => orders.filter((order) => ['served', 'paid'].includes(order.status)),
    [orders]
  );
  
  const filteredOrders = useMemo(
    () => (orderFilter === 'all' ? orders : orders.filter((order) => order.status === orderFilter)),
    [orders, orderFilter]
  );
  
  const filteredReservations = useMemo(
    () =>
      reservationFilter === 'all'
        ? reservations
        : reservations.filter((reservation) => reservation.status === reservationFilter),
    [reservations, reservationFilter]
  );

  const handleDownloadTicket = async (orderId) => {
    try {
      const response = await getInvoice(orderId);
      const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(blobUrl, '_blank', 'noopener,noreferrer');
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 10000);
    } catch (error) {
      showError('No se pudo generar el ticket en este momento');
    }
  };

  const submitReview = async () => {
    try {
      if (!reviewModal.order?.restaurant_id) return;
      await createReview({
        restaurant_id: reviewModal.order.restaurant_id,
        rating,
        comment: comment.trim(),
      });
      showSuccess('Tu opinión ha sido registrada en el Club Gourmet');
      setReviewedOrders((prev) => [...prev, reviewModal.order.id]);
      setReviewModal({ open: false, order: null });
      setRating(5);
      setComment('');
    } catch (error) {
      showError('Error al procesar la reseña');
    }
  };

  if (loading) {
    return (
      <div className="h-72 md:h-96 flex flex-col items-center justify-center gap-6 bg-[#fffaf3]">
        <div className="w-16 h-16 border-4 border-[#1c1712] border-t-[#b98c52] rounded-full animate-spin shadow-[4px_4px_0px_#1c1712]" />
        <p className="text-[#1c1712] font-black uppercase tracking-[0.4em] text-[10px]">Sincronizando Bitácora...</p>
      </div>
    );
  }

  const filterBtn = (key, active, label, onClick) => (
    <button
      key={key}
      onClick={onClick}
      className={`px-6 py-3 rounded border-2 border-[#1c1712] text-[10px] font-black uppercase tracking-widest transition-all transform active:translate-y-1 ${
        active 
        ? 'bg-[#1c1712] text-[#fffaf3] shadow-[4px_4px_0px_#b98c52]' 
        : 'bg-white text-[#1c1712] hover:-translate-y-1 hover:shadow-[4px_4px_0px_#1c1712] active:shadow-none shadow-none'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-12 font-outfit animate-in fade-in duration-700 pb-20">
      {/* Header Premium - Neobrutalista */}
      <div className="bg-[#b98c52] text-[#1c1712] rounded-xl p-8 md:p-14 shadow-[12px_12px_0px_#1c1712] border-2 border-[#1c1712] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-20 hidden md:block">
           <History className="w-48 h-48 text-[#1c1712]" />
        </div>
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center rounded border-2 border-[#1c1712] bg-[#fffaf3] px-4 py-2 shadow-[4px_4px_0px_#1c1712]">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#1c1712]">Pasaporte Gastronómico</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8] mb-8">
            Tu <span className="text-[#fffaf3]">Bitácora</span>
          </h1>
          <p className="max-w-2xl text-[#1c1712] font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs leading-relaxed">
            Revive tus mejores momentos y gestiona tus experiencias pasadas en la red más exclusiva de alta cocina. Diseño neobrutalista premium.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
        {/* Sección Pedidos */}
        <section>
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 border border-primary-200">
                <ShoppingBag size={20} />
              </div>
              <h2 className="text-2xl font-black text-ink uppercase tracking-tight">Pedidos</h2>
            </div>
            <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-primary-100">
              {orders.length} Totales
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-8 px-2">
            {['all', 'pending', 'served', 'paid', 'cancelled'].map((status) => (
              filterBtn(status, orderFilter === status, status === 'all' ? 'Todos' : translateStatus(status), () => setOrderFilter(status))
            ))}
          </div>

          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4 scrollbar-hide">
            {filteredOrders.map((order) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={order.id} 
              >
                <div className="p-6 md:p-8 rounded-xl border-2 border-[#1c1712] bg-white transition-all group hover:-translate-y-1 hover:shadow-[8px_8px_0px_#1c1712]">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-[10px] font-black text-[#b98c52] uppercase tracking-widest mb-1">Orden de Servicio</p>
                      <p className="font-black text-[#1c1712] text-2xl uppercase tracking-tighter">#{order.order_number?.split('-').pop()}</p>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded border-2 ${statusClass[order.status] || 'bg-white text-[#1c1712] border-[#1c1712]'}`}>
                      {translateStatus(order.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t-2 border-[#1c1712]/5">
                    <div className="flex items-center gap-6">
                      <p className="text-3xl font-black text-[#1c1712]">Q{order.total}</p>
                      <button
                        onClick={() => handleDownloadTicket(order.id)}
                        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#1c1712] bg-[#fffaf3] border-2 border-[#1c1712] px-4 py-2 shadow-[3px_3px_0px_#1c1712] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#1c1712] active:translate-y-0.5 active:shadow-none"
                      >
                        <FileText className="w-4 h-4" /> Ver Ticket
                      </button>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                      {new Date(order.createdAt || order.created_at).toLocaleDateString('es-GT')}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
            {orders.length === 0 && (
              <div className="bg-[#fffaf3] rounded-xl p-16 text-center border-2 border-dashed border-[#1c1712]">
                 <ShoppingBag className="w-12 h-12 text-[#1c1712]/20 mx-auto mb-4" />
                 <p className="text-[#1c1712] font-black uppercase tracking-widest text-[10px]">Sin órdenes registradas</p>
              </div>
            )}
          </div>
        </section>

        {/* Sección Reservaciones */}
        <section>
          <div className="flex items-center justify-between mb-8 px-2">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 border border-primary-200">
                <Calendar size={20} />
              </div>
              <h2 className="text-2xl font-black text-ink uppercase tracking-tight">Reservas</h2>
            </div>
            <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-primary-100">
              {reservations.length} Totales
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-8 px-2">
            {['all', 'confirmed', 'completed', 'cancelled'].map((status) => (
              filterBtn(status, reservationFilter === status, status === 'all' ? 'Todos' : translateStatus(status), () => setReservationFilter(status))
            ))}
          </div>

          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-4 scrollbar-hide">
            {filteredReservations.map((reservation) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={reservation.id} 
              >
                <div className="p-6 md:p-8 rounded-xl border-2 border-[#1c1712] bg-white transition-all group hover:-translate-y-1 hover:shadow-[8px_8px_0px_#b98c52]">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-[10px] font-black text-[#b98c52] uppercase tracking-widest mb-1">Sede Gourmet</p>
                      <p className="font-black text-[#1c1712] text-2xl uppercase tracking-tighter">{reservation.restaurant?.name || 'Sede Premium'}</p>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded border-2 ${statusClass[reservation.status] || 'bg-white text-[#1c1712] border-[#1c1712]'}`}>
                      {translateStatus(reservation.status)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t-2 border-[#1c1712]/5">
                    <div className="flex items-center gap-3 text-xs font-black text-[#1c1712] uppercase tracking-tight">
                       <Zap className="w-4 h-4 text-[#b98c52]" />
                       {reservation.reservation_date} <span className="text-[#1c1712]/10 mx-1">|</span> {reservation.reservation_time?.slice(0, 5)}
                    </div>
                    <div className="rounded border-2 border-[#1c1712] bg-[#fffaf3] px-4 py-1 text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0px_#1c1712]">
                      {reservation.party_size} Comensales
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
            {reservations.length === 0 && (
              <div className="bg-[#fffaf3] rounded-xl p-16 text-center border-2 border-dashed border-[#1c1712]">
                 <Calendar className="w-12 h-12 text-[#1c1712]/20 mx-auto mb-4" />
                 <p className="text-[#1c1712] font-black uppercase tracking-widest text-[10px]">Sin reservas futuras</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* RASTREADOR DE PEDIDOS ACTIVOS */}
      <section className="px-2">
        <ActiveOrderTracker />
      </section>

      {/* Sección Calificaciones */}
      <section className="pt-20 border-t border-primary-100">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 px-2">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 border border-primary-200">
                <Trophy size={24} />
              </div>
              <h2 className="text-4xl font-black text-ink uppercase tracking-tighter">Califica tu <span className="text-primary-500 italic">Experiencia</span></h2>
            </div>
            <p className="text-muted-brown font-medium text-xs md:text-sm uppercase tracking-widest">Comparte tu paladar con la comunidad gourmet.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {completedOrders.map((order) => (
            <motion.div 
              whileHover={{ y: -5 }}
              key={order.id} 
            >
              <div className="p-8 h-full flex flex-col justify-between rounded-xl border-2 border-[#1c1712] bg-white shadow-[6px_6px_0px_#1c1712] transition-all hover:shadow-[8px_8px_0px_#b98c52]">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="rounded border-2 border-[#1c1712] bg-[#fffaf3] px-2 py-0.5 text-[8px] font-black uppercase tracking-widest">Finalizado</div>
                    <Star className="w-4 h-4 text-[#b98c52] fill-[#b98c52]" />
                  </div>
                  <p className="font-black text-[#1c1712] text-3xl mb-1 uppercase tracking-tighter">#{order.order_number?.split('-').pop()}</p>
                  <p className="text-sm font-black text-[#b98c52] mb-8 uppercase tracking-widest">Q{order.total}</p>
                </div>
                <button
                  onClick={() => setReviewModal({ open: true, order })}
                  disabled={reviewedOrders.includes(order.id)}
                  className={`w-full py-4 rounded border-2 border-[#1c1712] font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 transform active:translate-y-1 ${
                    reviewedOrders.includes(order.id)
                    ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed shadow-none'
                    : 'bg-[#1c1712] text-[#fffaf3] shadow-[4px_4px_0px_#b98c52] hover:bg-[#b98c52] hover:text-[#1c1712]'
                  }`}
                >
                  {reviewedOrders.includes(order.id) ? 'Opinión Registrada' : (
                    <>
                      <MessageSquare className="w-4 h-4" /> Dejar Reseña
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
          {completedOrders.length === 0 && (
            <div className="col-span-full py-20 bg-[#fffaf3] rounded-xl border-2 border-dashed border-[#1c1712] text-center">
               <p className="text-[#1c1712] font-black uppercase tracking-[0.4em] text-[10px]">No hay pedidos pendientes de calificación</p>
            </div>
          )}
        </div>
      </section>

      {/* MODAL DE RESEÑA */}
      <AnimatePresence>
        {reviewModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-white rounded-[3rem] md:rounded-[4rem] p-10 md:p-14 border border-primary-200 shadow-gold relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-primary-600"></div>

              <button 
                onClick={() => setReviewModal({ open: false, order: null })} 
                className="absolute top-8 right-8 p-3 rounded-2xl bg-primary-50 text-primary-600 hover:bg-primary-500 hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="mb-12 text-center">
                <Badge variant="primary" className="mb-4">Club Gourmet</Badge>
                <h3 className="text-3xl font-black text-ink tracking-tighter uppercase leading-none">Calificar <span className="text-primary-500 italic">Sabor</span></h3>
                <p className="text-muted-brown font-medium mt-4 text-xs">Tu opinión es la brújula de nuestra excelencia.</p>
              </div>
              
              <div className="flex flex-col items-center gap-10 mb-12">
                <StarRating value={rating} onChange={setRating} />
                <div className="w-full space-y-3">
                  <label className="text-[10px] font-black text-muted-brown uppercase tracking-widest px-2 block">Tu Comentario</label>
                  <textarea
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    className="w-full min-h-[140px] bg-primary-50/30 border border-primary-100 rounded-[2rem] p-6 text-sm font-medium text-ink focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-400 transition-all placeholder:text-primary-200 resize-none"
                    placeholder="Describe los matices de tu platillo..."
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setReviewModal({ open: false, order: null })}
                  className="flex-1 py-4 rounded-2xl bg-white border border-primary-100 text-muted-brown font-black uppercase tracking-widest text-[10px] hover:text-ink transition-all"
                >
                  Omitir
                </button>
                <Button
                  onClick={submitReview}
                  className="flex-1 py-4 rounded-2xl shadow-gold"
                >
                  Enviar Reseña ✨
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ClientHistory;

