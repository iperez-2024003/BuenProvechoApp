import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getEvents, registerToEvent } from '../../../shared/api/events';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { showError, showSuccess } from '../../../shared/utils/toast';
import { translateEventType } from '../../../shared/utils/i18n';
import { getFallbackEvent } from '../../../shared/utils/getFallbackImage';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Ticket, 
  Users, 
  Sparkles,
  Loader2,
  CalendarCheck,
  ChevronRight,
  MapPin
} from 'lucide-react';

const EventsFeed = () => {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();
  const eventType = searchParams.get('type');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState(null);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const params = eventType === 'promotion'
        ? { event_type: 'promotion', status: 'scheduled', limit: 50 }
        : { upcoming: true, limit: 50, ...(eventType ? { event_type: eventType } : {}) };

      const response = await getEvents(params);
      const rawEvents = response.data?.events || [];

      // Normalize backend camelCase fields to frontend snake_case usage.
      const normalizedEvents = rawEvents.map((event) => ({
        ...event,
        id: event.id || event._id,
        event_type: event.event_type || event.eventType,
        event_date: event.event_date || (event.eventDate ? String(event.eventDate).slice(0, 10) : ''),
        start_time: event.start_time || event.startTime,
        end_time: event.end_time || event.endTime,
        max_participants: event.max_participants ?? event.maxParticipants,
        current_participants: event.current_participants ?? event.currentParticipants,
        price_per_person: event.price_per_person ?? event.pricePerPerson,
        image_url: event.image_url || event.imageUrl,
      }));

      setEvents(normalizedEvents);
    } catch (error) {
      showError('No se pudo sincronizar la cartelera de eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [eventType]);

  const handleRegister = async (event) => {
    try {
      setRegisteringId(event.id);
      const fullName = `${user?.name || ''} ${user?.surname || ''}`.trim();
      await registerToEvent(event.id, {
        // user_id is optional in backend; omit it to avoid cross-service ID mismatch
        participant_name: fullName || user?.username || 'Cliente',
        participant_email: user?.email,
        participant_phone: user?.phone || '00000000',
      });
      showSuccess(`¡Confirmado! Te has inscrito en "${event.name}"`);
      await loadEvents();
    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message || '';

      if (status === 409 || /already registered|ya (esta|estás) inscrito/i.test(message)) {
        showSuccess('Ya estabas inscrito en este evento');
      } else if (status === 400 && /full|capacidad|no spots/i.test(message)) {
        showError('Este evento ya no tiene cupos disponibles');
      } else {
        showError('No se pudo completar tu inscripción premium');
      }
    } finally {
      setRegisteringId(null);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex flex-col justify-center items-center font-outfit bg-[#fffaf3]">
        <div className="w-16 h-16 border-4 border-[#1c1712] border-t-[#b98c52] rounded-full animate-spin shadow-[4px_4px_0px_#1c1712]" />
        <p className="mt-8 text-[#1c1712] font-black uppercase tracking-[0.4em] text-[10px]">Sincronizando Experiencias...</p>
      </div>
    );
  }

  return (
    <div className="font-outfit space-y-12 animate-in fade-in duration-700">
      <div className="bg-[#b98c52] text-[#1c1712] rounded-xl p-8 md:p-14 shadow-[12px_12px_0px_#1c1712] border-2 border-[#1c1712] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-20 hidden md:block">
           <CalendarCheck className="w-48 h-48 text-[#1c1712]" />
        </div>
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center rounded border-2 border-[#1c1712] bg-[#fffaf3] px-4 py-2 shadow-[4px_4px_0px_#1c1712]">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#1c1712]">Cartelera Exclusiva</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8] mb-8">
            {eventType === 'promotion' ? 'Ofertas' : 'Experiencias'} <span className="text-[#fffaf3]">Premium</span>
          </h1>
          <p className="max-w-2xl text-[#1c1712] font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs leading-relaxed">
            {eventType === 'promotion'
              ? 'Promociones, beneficios y experiencias especiales activas para nuestra comunidad Gourmet. Diseño neobrutalista premium.'
              : 'Catas, cenas temáticas y masterclasses diseñadas para los paladares más exigentes de nuestra comunidad. Diseño neobrutalista premium.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
        <AnimatePresence>
          {events.map((event, index) => {
            const available = event.max_participants - event.current_participants;
            const soldOut = available <= 0;
            return (
              <motion.article 
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl border-2 border-[#1c1712] overflow-hidden group transition-all flex flex-col h-full shadow-[6px_6px_0px_#1c1712] hover:shadow-[10px_10px_0px_#b98c52] hover:-translate-y-1"
              >
                <div className="h-48 md:h-60 relative overflow-hidden border-b-2 border-[#1c1712]">
                  <img
                    src={event.image_url || getFallbackEvent(event.id)}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    alt={event.name}
                  />
                  <div className="absolute top-4 left-4">
                     <span className="bg-[#fffaf3] px-3 py-1.5 rounded border-2 border-[#1c1712] text-[9px] font-black text-[#1c1712] uppercase tracking-widest shadow-[2px_2px_0px_#1c1712]">
                       {translateEventType(event.event_type)}
                     </span>
                  </div>
                </div>

                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-2xl font-black text-[#1c1712] uppercase tracking-tighter mb-3 group-hover:text-[#b98c52] transition-colors">{event.name}</h3>
                  <p className="text-xs text-zinc-500 font-black uppercase tracking-widest leading-relaxed mb-8 line-clamp-2">{event.description || 'Una velada inigualable diseñada para sorprender tus sentidos con los mejores ingredientes.'}</p>
                  
                  <div className="space-y-4 mb-10 flex-1">
                      <div className="flex items-center gap-3 text-[#1c1712] font-black text-[10px] uppercase tracking-widest bg-[#fffaf3] p-3 border-2 border-[#1c1712] shadow-[3px_3px_0px_#1c1712]">
                        <Calendar className="w-4 h-4 text-[#b98c52]" />
                       {event.event_date}
                    </div>
                      <div className="flex items-center gap-3 text-[#1c1712] font-black text-[10px] uppercase tracking-widest bg-[#fffaf3] p-3 border-2 border-[#1c1712] shadow-[3px_3px_0px_#1c1712]">
                        <Clock className="w-4 h-4 text-[#b98c52]" />
                       {event.start_time?.slice(0, 5)} - {event.end_time?.slice(0, 5)}
                    </div>
                    <div className="flex justify-between items-center px-2 pt-2">
                        <div className="flex items-center gap-2 text-[#1c1712] font-black text-2xl tracking-tighter">
                          <Ticket className="w-5 h-5 text-[#b98c52]" />
                          Q{event.price_per_person}
                       </div>
                       <div className="flex items-center gap-2 text-[#b98c52] font-black text-[10px] uppercase tracking-[0.2em]">
                          <Users className="w-4 h-4 text-[#1c1712]" />
                          {available > 0 ? `${available} Cupos` : 'Sold Out'}
                       </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRegister(event)}
                    disabled={soldOut || registeringId === event.id}
                    className={`w-full py-5 rounded border-2 border-[#1c1712] font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-3 transform active:translate-y-1 ${
                      soldOut 
                      ? 'bg-zinc-200 text-zinc-400 border-zinc-300 cursor-not-allowed shadow-none' 
                      : 'bg-[#1c1712] text-[#fffaf3] shadow-[4px_4px_0px_#b98c52] hover:bg-[#b98c52] hover:text-[#1c1712] hover:shadow-[6px_6px_0px_#1c1712]'
                    }`}
                  >
                    {registeringId === event.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : soldOut ? (
                      'Capacidad Máxima'
                    ) : (
                      <>Reservar Cupo <Sparkles className="w-4 h-4" /></>
                    )}
                  </button>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
        {events.length === 0 && (
           <div className="col-span-full py-32 bg-[#fffaf3] rounded-xl border-4 border-dashed border-[#1c1712] text-center shadow-[8px_8px_0px_rgba(0,0,0,0.05)]">
             <Calendar className="w-20 h-20 text-[#1c1712]/10 mx-auto mb-8" />
             <p className="text-[#1c1712] font-black uppercase tracking-[0.5em] text-xs">
              {eventType === 'promotion' ? 'No hay ofertas activas en este momento' : 'No hay eventos programados en este momento'}
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsFeed;

