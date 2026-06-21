import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReservationStore } from '../store/useReservationStore';
import { translateStatus } from '../../../shared/utils/i18n';
import { 
  Calendar, 
  RefreshCcw, 
  User, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Loader2,
  Users
} from 'lucide-react';

const RESERVATION_COLUMNS = [
  { id: 'pending', label: 'Pendientes', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  { id: 'confirmed', label: 'Confirmadas', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  { id: 'completed', label: 'Finalizadas', color: 'bg-[#f3e4ca] text-[#8b6435] border-[#dcc7a5]' },
  { id: 'no_show', label: 'No asistió', color: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
  { id: 'cancelled', label: 'Canceladas', color: 'bg-white text-zinc-400 border-zinc-200' },
];

const ReservationsKanban = () => {
  const { id: restaurantId } = useParams();
  const {
    reservations,
    loading,
    fetchReservations,
    confirmReservation,
    updateReservationStatus,
    cancelReservation,
  } = useReservationStore();

  useEffect(() => {
    if (!restaurantId) return;
    fetchReservations({ restaurant_id: restaurantId, limit: 100 });
    const interval = setInterval(() => {
      fetchReservations({ restaurant_id: restaurantId, limit: 100 });
    }, 15000);
    return () => clearInterval(interval);
  }, [restaurantId, fetchReservations]);

  return (
    <div className="font-outfit space-y-12 animate-in fade-in duration-700 w-full min-w-0 overflow-x-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <p className="text-[10px] font-black text-[#b98c52] uppercase tracking-[0.4em] mb-2">Guest Relations</p>
           <h1 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tighter uppercase leading-none">Reservas <span className="text-[#8b6435]">Kanban</span></h1>
        </div>
        
        <button
          onClick={() => fetchReservations({ restaurant_id: restaurantId, limit: 100 })}
          className="w-full md:w-auto flex items-center justify-center gap-3 px-6 md:px-8 py-4 rounded-2xl bg-[#fffaf3] text-zinc-900 font-black uppercase tracking-widest text-[10px] border border-[#dcc7a5] hover:border-[#b98c52] transition-all shadow-2xl"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Sincronizar
        </button>
      </div>

      {loading && reservations.length === 0 ? (
        <div className="h-[50vh] flex flex-col items-center justify-center gap-6">
          <Loader2 className="w-12 h-12 text-[#b98c52] animate-spin" />
          <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">Cargando Reservas Premium...</p>
        </div>
      ) : (
        <div className="flex gap-6 md:gap-8 overflow-x-auto pb-10 items-start h-[calc(100vh-280px)] md:h-[calc(100vh-220px)] scrollbar-thin scrollbar-thumb-zinc-800">
          {RESERVATION_COLUMNS.map((column) => {
            const columnReservations = reservations.filter((r) => r.status === column.id);
            return (
              <div
                key={column.id}
                className="min-w-[260px] md:min-w-[350px] w-[260px] md:w-[350px] h-full flex flex-col"
              >
                <div className={`flex items-center justify-between mb-6 px-6 py-4 rounded-3xl border ${column.color} backdrop-blur-xl`}>
                  <h3 className="font-black uppercase tracking-widest text-[11px]">{column.label}</h3>
                  <span className="text-[10px] font-black w-8 h-8 rounded-xl bg-white/70 flex items-center justify-center border border-current/10">
                    {columnReservations.length}
                  </span>
                </div>
                
                <div className="space-y-4 overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-zinc-800">
                  <AnimatePresence mode="popLayout">
                    {columnReservations.map((reservation) => (
                      <motion.article
                        key={reservation.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] border border-[#dcc7a5]/70 p-8 group hover:border-[#b98c52]/30 transition-all relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                           <Users className="w-12 h-12 text-[#b98c52]" />
                        </div>

                        <div className="relative z-10">
                          <div className="flex justify-between items-center mb-6">
                            <span className="text-[10px] font-black tracking-[0.2em] text-zinc-500 uppercase">
                              #{reservation.reservation_number?.split('-').pop()}
                            </span>
                            <div className="flex items-center gap-2 text-[#8b6435] font-black text-xs uppercase tracking-widest bg-[#f3e4ca] px-3 py-1.5 rounded-full border border-[#dcc7a5]">
                              <Clock className="w-3.5 h-3.5" />
                              {reservation.reservation_time?.slice(0, 5)}
                            </div>
                          </div>

                          <h4 className="text-xl font-black text-zinc-900 tracking-tight uppercase mb-2 group-hover:text-[#8b6435] transition-colors">{reservation.customer_name}</h4>
                          
                          <div className="space-y-2 mb-8">
                            <div className="flex items-center gap-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                               <Calendar className="w-3.5 h-3.5 text-[#b98c52]" />
                               {reservation.reservation_date}
                            </div>
                            <div className="flex items-center gap-3 text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                               <User className="w-3.5 h-3.5 text-[#b98c52]" />
                               {reservation.party_size} Comensales
                            </div>
                          </div>

                          {reservation.special_requests && (
                             <div className="bg-[#fffaf3] border border-[#dcc7a5] p-4 rounded-2xl mb-8">
                               <p className="text-[9px] font-black text-[#8b6435] uppercase tracking-widest mb-1">Notas Especiales</p>
                               <p className="text-xs text-zinc-600 font-medium">{reservation.special_requests}</p>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-3">
                            {reservation.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => confirmReservation(reservation.id)}
                                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#d7b77f] to-[#b98c52] text-white font-black uppercase tracking-widest text-[9px] hover:to-[#a97d45] transition-all flex items-center justify-center gap-2"
                                >
                                  <CheckCircle2 className="w-4 h-4" /> Confirmar
                                </button>
                                <button
                                  onClick={() => cancelReservation(reservation.id)}
                                  className="flex-1 py-4 rounded-2xl bg-[#fffaf3] text-zinc-600 font-black uppercase tracking-widest text-[9px] hover:bg-rose-500 hover:text-white transition-all border border-[#dcc7a5] hover:border-rose-500 flex items-center justify-center gap-2"
                                >
                                  <XCircle className="w-4 h-4" /> Cancelar
                                </button>
                              </>
                            )}

                            {reservation.status === 'confirmed' && (
                              <>
                                <button
                                  onClick={() => updateReservationStatus(reservation.id, 'completed')}
                                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#d7b77f] to-[#b98c52] text-white font-black uppercase tracking-widest text-[9px] hover:to-[#a97d45] transition-all flex items-center justify-center gap-2"
                                >
                                  <CheckCircle2 className="w-4 h-4" /> Finalizar
                                </button>
                                <button
                                  onClick={() => updateReservationStatus(reservation.id, 'no_show')}
                                  className="flex-1 py-4 rounded-2xl bg-[#fffaf3] text-zinc-600 font-black uppercase tracking-widest text-[9px] hover:bg-amber-500 hover:text-white transition-all border border-[#dcc7a5] hover:border-amber-500 flex items-center justify-center gap-2"
                                >
                                  <AlertCircle className="w-4 h-4" /> No asistió
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </motion.article>
                    ))}
                  </AnimatePresence>

                  {columnReservations.length === 0 && (
                    <div className="h-40 rounded-[2.5rem] border-2 border-dashed border-[#dcc7a5] flex flex-col items-center justify-center gap-4 text-center px-10 bg-white/60">
                      <p className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.2em]">Bandeja Vacía</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReservationsKanban;

