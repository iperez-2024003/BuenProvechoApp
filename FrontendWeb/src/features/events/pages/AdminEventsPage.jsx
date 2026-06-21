import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { cancelEvent, createEvent, deleteEvent, getEvents, updateEvent } from '../../../shared/api/events';
import { showError, showSuccess } from '../../../shared/utils/toast';
import { translateEventType, translateStatus } from '../../../shared/utils/i18n';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Plus,
  Clock,
  Users,
  DollarSign,
  Image as ImageIcon,
  FileText,
  Tag,
  Loader2,
  Sparkles,
  ChevronRight,
  PartyPopper,
  Edit3,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import { EventModal } from '../components/EventModal';
import { ParticipantsModal } from '../components/ParticipantsModal';

const AdminEventsPage = () => {
  const { id: restaurantId } = useParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);
  const [eventForParticipants, setEventForParticipants] = useState(null);

  const getEventId = (event) => event?.id || event?._id || event?.eventId || event?.event_id || '';

  const loadEvents = async () => {
    if (!restaurantId) return;
    try {
      setLoading(true);
      const response = await getEvents({ restaurant_id: restaurantId, limit: 100 });
      const normalizedEvents = (response.data?.events || []).map((event) => ({
        ...event,
        id: getEventId(event),
      }));
      setEvents(normalizedEvents);
    } catch (error) {
      showError('No se pudo sincronizar la agenda de eventos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [restaurantId]);

  const handleOpenModal = (event = null) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
  };

  const handleOpenParticipants = (event) => {
    setEventForParticipants(event);
    setParticipantsModalOpen(true);
  };

  const handleCloseParticipants = () => {
    setParticipantsModalOpen(false);
    setEventForParticipants(null);
  };

  const handleSubmitEvent = async (formData) => {
    try {
      if (!restaurantId) return;
      setCreating(true);

      const payload = {
        ...formData,
        restaurant_id: restaurantId,
        start_time: formData.start_time.length === 5 ? `${formData.start_time}:00` : formData.start_time,
        end_time: formData.end_time.length === 5 ? `${formData.end_time}:00` : formData.end_time,
        max_participants: Number(formData.max_participants),
        price_per_person: Number(formData.price_per_person),
      };

      const selectedEventId = getEventId(selectedEvent);

      if (selectedEventId) {
        await updateEvent(selectedEventId, payload);
        showSuccess('¡Evento actualizado con éxito!');
      } else {
        await createEvent(payload);
        showSuccess('¡Experiencia publicada con éxito!');
      }

      handleCloseModal();
      await loadEvents();
    } catch (error) {
      const backendError = error.response?.data?.errors?.map((item) => item.message).join(', ');
      showError(backendError || error.response?.data?.message || 'Falla en la publicación del evento');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEvent = async (event) => {
    const eventId = getEventId(event);

    if (!eventId) {
      showError('No se encontró el ID del evento para eliminarlo');
      return;
    }

    const confirmed = window.confirm(`¿Eliminar el evento "${event.name}"?`);
    if (!confirmed) return;

    try {
      setCreating(true);
      await deleteEvent(eventId);
      showSuccess('Evento eliminado correctamente');
      await loadEvents();
    } catch (error) {
      showError('No se pudo eliminar el evento');
    } finally {
      setCreating(false);
    }
  };

  const handleCancelEvent = async (event) => {
    const eventId = getEventId(event);

    if (!eventId) {
      showError('No se encontró el ID del evento para cancelarlo');
      return;
    }

    const confirmed = window.confirm(`¿Cancelar el evento "${event.name}"?`);
    if (!confirmed) return;

    try {
      setCreating(true);
      await cancelEvent(eventId);
      showSuccess('Evento cancelado correctamente');
      await loadEvents();
    } catch (error) {
      showError(error.response?.data?.message || 'No se pudo cancelar el evento');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 font-outfit">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="relative overflow-hidden bg-[#fffaf3]/60 backdrop-blur-3xl rounded-[3rem] border border-[#dcc7a5] p-10 lg:p-12 flex-1">
          <div className="absolute top-0 right-0 p-12 opacity-5 scale-150 rotate-12">
            <PartyPopper className="w-64 h-64 text-[#b98c52]" />
          </div>
          <div className="relative z-10">
            <span className="text-[10px] font-black text-[#b98c52] uppercase tracking-[0.4em] mb-4 block">Eventos & Experiencias</span>
            <h1 className="text-5xl font-black text-zinc-900 tracking-tighter uppercase leading-none mb-4">
              Cartelera <span className="text-[#b98c52] italic">Premium</span>
            </h1>
            <p className="text-zinc-600 font-bold uppercase tracking-widest text-[10px] leading-relaxed max-w-lg">
              Gestiona y publica experiencias gastronómicas exclusivas para tu comunidad de comensales.
            </p>
            <p className="mt-4 inline-flex items-center rounded-full border border-[#d7b77f]/30 bg-[#fffaf3] px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#8b6435]">
              Aquí mismo publicas promociones, catas y experiencias especiales
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleOpenModal()}
          className="h-fit w-full md:w-auto px-6 md:px-10 py-6 bg-gradient-to-r from-[#d7b77f] to-[#b98c52] text-white rounded-[2rem] font-black uppercase tracking-[0.3em] text-[10px] shadow-2xl shadow-[rgba(185,140,82,0.2)] hover:to-[#a97d45] transition-all border border-[#d7b77f]/30 flex items-center justify-center gap-3 shrink-0"
        >
          <Plus className="w-5 h-5" /> Nueva Experiencia
        </motion.button>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        <div className="flex items-center justify-between px-6">
          <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.4em]">Agenda de Programación</h3>
          <span className="text-[10px] font-black text-[#b98c52] uppercase tracking-widest bg-[#d7b77f]/10 px-4 py-2 rounded-full border border-[#d7b77f]/20">{events.length} Eventos Activos</span>
        </div>

        {loading ? (
          <div className="py-32 flex flex-col items-center justify-center gap-6 bg-zinc-900/20 rounded-[4rem] border border-dashed border-zinc-800">
            <Loader2 className="w-12 h-12 text-[#b98c52] animate-spin" />
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Sincronizando Cartelería...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {events.map((event, i) => (
                <motion.div
                  key={getEventId(event) || `${event.name || 'event'}-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group bg-[#fffaf3]/70 backdrop-blur-3xl rounded-[3rem] border border-[#dcc7a5]/30 overflow-hidden hover:border-[#dcc7a5]/50 transition-all flex flex-col shadow-2xl h-full"
                >
                  <div className="h-52 relative overflow-hidden shrink-0">
                    <img
                      src={event.imageUrl || event.image_url || 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=2070&auto=format&fit=crop'}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      alt={event.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                      <span className="px-4 py-2 rounded-xl bg-[#f3e4ca]/80 backdrop-blur-xl text-[#b98c52] text-[9px] font-black uppercase tracking-widest border border-[#dcc7a5]/20">
                        {translateEventType(event.event_type)}
                      </span>
                    </div>

                    <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                      <div className="flex flex-col gap-1">
                        <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest leading-none mb-1">Precio Entrada</p>
                        <p className="text-3xl font-black text-white tracking-tighter leading-none">Q{event.price_per_person}</p>
                      </div>
                      <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${event.status === 'scheduled' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                        }`}>
                        {translateStatus(event.status)}
                      </span>
                    </div>
                  </div>

                  <div className="p-8 flex-1 flex flex-col">
                    <h4 className="text-2xl font-black text-zinc-900 tracking-tight uppercase truncate mb-4 group-hover:text-[#b98c52] transition-colors">{event.name}</h4>

                    <div className="space-y-4 mb-8 flex-1">
                      <div className="flex items-center gap-4 p-4 bg-[#f3e4ca]/40 rounded-2xl border border-[#dcc7a5]">
                        <Calendar className="w-4 h-4 text-[#b98c52]" />
                        <span className="text-[10px] font-black text-[#8b6435] uppercase tracking-widest">{event.event_date}</span>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-[#f3e4ca]/40 rounded-2xl border border-[#dcc7a5]">
                        <Clock className="w-4 h-4 text-[#b98c52]" />
                        <span className="text-[10px] font-black text-[#8b6435] uppercase tracking-widest">{event.start_time?.slice(0, 5)} - {event.end_time?.slice(0, 5)}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-[#f3e4ca]/40 rounded-2xl border border-[#dcc7a5]">
                        <div className="flex items-center gap-4">
                          <Users className="w-4 h-4 text-[#b98c52]" />
                          <span className="text-[10px] font-black text-[#8b6435] uppercase tracking-widest">{event.current_participants} / {event.max_participants} Participantes</span>
                        </div>
                        <button 
                          onClick={() => handleOpenParticipants(event)}
                          className="px-3 py-1 bg-[#b98c52] text-white text-[8px] font-black uppercase tracking-widest rounded-lg hover:bg-[#8b6435] transition-all"
                        >
                          Ver Lista
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => handleCancelEvent(event)}
                        className="flex-1 py-4 bg-amber-500/10 text-amber-600 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-amber-500 hover:text-white transition-all border border-amber-500/20 flex items-center justify-center gap-2"
                      >
                        <PartyPopper className="w-3.5 h-3.5" /> Cancelar
                      </button>
                      <button
                        onClick={() => handleOpenModal(event)}
                        className="flex-1 py-4 bg-zinc-800 text-zinc-400 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:text-white hover:bg-zinc-700 transition-all border border-zinc-700 flex items-center justify-center gap-2"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Editar
                      </button>
                      <button onClick={() => handleDeleteEvent(event)} className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-xl">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {events.length === 0 && (
              <div className="col-span-full py-40 text-center bg-zinc-900/20 rounded-[4rem] border border-dashed border-zinc-800">
                <PartyPopper className="w-20 h-20 text-zinc-800 mx-auto mb-8" />
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Sin Eventos</h3>
                <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mt-2">Aún no has programado experiencias especiales para esta sede.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <EventModal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitEvent}
        creating={creating}
        initialData={selectedEvent}
      />
      <ParticipantsModal 
        isOpen={participantsModalOpen}
        onClose={handleCloseParticipants}
        eventId={getEventId(eventForParticipants)}
        eventName={eventForParticipants?.name}
      />
    </div>
  );
};

export default AdminEventsPage;

