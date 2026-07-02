import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Mail, Phone, Calendar, Loader2, MessageSquare, ShieldCheck, Check } from 'lucide-react';
import { getEventParticipants, updateParticipantStatus } from '../../../shared/api/events';
import { showError } from '../../../shared/utils/toast';
import { translateStatus } from '../../../shared/utils/i18n';

export const ParticipantsModal = ({ isOpen, onClose, eventId, eventName }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadParticipants = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const response = await getEventParticipants(eventId);
      setParticipants(response.data?.participants || []);
    } catch (error) {
      showError('No se pudo cargar la lista de participantes');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePayment = async (participantId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
      await updateParticipantStatus(participantId, newStatus);
      await loadParticipants();
    } catch (error) {
      showError('Error al actualizar el estado de pago');
    }
  };

  useEffect(() => {
    if (isOpen && eventId) {
      loadParticipants();
    }
  }, [isOpen, eventId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#f7f1e7]/90 backdrop-blur-xl flex justify-center items-center z-[60] p-4 font-outfit">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white/90 rounded-[2.5rem] md:rounded-[3.5rem] border border-[#dcc7a5]/70 shadow-[0_30px_100px_rgba(110,80,45,0.14)] w-full max-w-3xl overflow-hidden max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-8 md:px-10 py-8 border-b border-[#dcc7a5]/70 bg-[#fffaf3] flex justify-between items-center shrink-0">
          <div>
            <span className="text-[10px] font-black text-[#b98c52] uppercase tracking-[0.4em] mb-2 block">Control de Asistencia</span>
            <h2 className="text-2xl font-black text-zinc-900 tracking-tighter uppercase leading-none">
              Participantes: <span className="text-[#8b6435]">{eventName}</span>
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-4 rounded-2xl bg-[#fffaf3] text-zinc-500 hover:text-zinc-900 transition-all border border-[#dcc7a5]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 text-[#b98c52] animate-spin" />
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Cargando lista...</p>
            </div>
          ) : participants.length === 0 ? (
            <div className="py-20 text-center">
              <Users className="w-16 h-16 text-[#dcc7a5] mx-auto mb-6 opacity-50" />
              <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Aún no hay inscritos en este evento</p>
            </div>
          ) : (
            <div className="space-y-4">
              {participants.map((p, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={p._id}
                  className="p-6 bg-white rounded-3xl border border-[#dcc7a5]/30 hover:border-[#b98c52]/50 transition-all shadow-sm group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 rounded-2xl bg-[#f3e4ca] flex items-center justify-center text-[#b98c52] font-black text-xl border border-[#dcc7a5]/50 group-hover:bg-[#b98c52] group-hover:text-white transition-all">
                        {p.participantName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-base font-black text-zinc-900 uppercase tracking-tight">{p.participantName}</h4>
                        <div className="flex flex-wrap gap-4 mt-2">
                          <span className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 lowercase tracking-normal">
                            <Mail className="w-3 h-3 text-[#b98c52]" /> {p.participantEmail}
                          </span>
                          {p.participantPhone && (
                            <span className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 tracking-normal">
                              <Phone className="w-3 h-3 text-[#b98c52]" /> {p.participantPhone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right hidden md:block">
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Estado Pago</p>
                        <button 
                          onClick={() => handleTogglePayment(p._id, p.paymentStatus)}
                          className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all flex items-center gap-2 ${
                            p.paymentStatus === 'paid' 
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500 hover:text-white' 
                              : 'bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500 hover:text-white'
                          }`}
                        >
                          {p.paymentStatus === 'paid' ? <Check className="w-3 h-3" /> : null}
                          {p.paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                        </button>
                      </div>
                      
                      <div className="w-px h-10 bg-[#dcc7a5]/30 hidden md:block mx-2" />

                      <div className="text-right">
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Registro</p>
                        <p className="text-[10px] font-bold text-zinc-900">{new Date(p.registrationDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  
                  {p.specialNotes && (
                    <div className="mt-4 p-4 bg-[#fffaf3] rounded-2xl border border-[#dcc7a5]/30 flex gap-3">
                      <MessageSquare className="w-3 h-3 text-[#b98c52] shrink-0 mt-0.5" />
                      <p className="text-[10px] font-medium text-[#8b6435] leading-relaxed italic">"{p.specialNotes}"</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-[#dcc7a5]/70 bg-[#fffaf3] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
             <ShieldCheck className="w-5 h-5 text-emerald-500" />
             <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Base de datos verificada</span>
          </div>
          <p className="text-[10px] font-black text-[#b98c52] uppercase tracking-[0.2em] bg-white px-6 py-3 rounded-2xl border border-[#dcc7a5]">
            Total: {participants.length} Inscritos
          </p>
        </div>
      </motion.div>
    </div>
  );
};
