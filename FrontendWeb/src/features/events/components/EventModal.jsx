import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Save, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign, 
  Image as ImageIcon, 
  Sparkles,
  Loader2,
  FileText,
  Rocket
} from 'lucide-react';
import { translateEventType } from '../../../shared/utils/i18n';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';

const EVENT_TYPES = [
  'tasting',
  'cooking_class',
  'wine_pairing',
  'theme_dinner',
  'festival',
  'promotion',
  'live_music',
  'other',
];

export const EventModal = ({ isOpen, onClose, onSubmit, creating, initialData = null }) => {
  const [form, setForm] = useState({
    name: '',
    description: '',
    event_type: 'theme_dinner',
    event_date: '',
    start_time: '19:00',
    end_time: '22:00',
    max_participants: 20,
    price_per_person: 0,
    image_url: '',
  });
  const [imagePreview, setImagePreview] = useState('');
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        description: initialData.description || '',
        event_type: initialData.event_type || 'theme_dinner',
        event_date: initialData.event_date || '',
        start_time: initialData.start_time?.slice(0, 5) || '19:00',
        end_time: initialData.end_time?.slice(0, 5) || '22:00',
        max_participants: initialData.max_participants || 20,
        price_per_person: initialData.price_per_person || 0,
        image_url: initialData.image_url || initialData.imageUrl || '',
      });
      setImagePreview(initialData.image_url || initialData.imageUrl || '');
      setImageFile(null);
    } else {
      setForm({
        name: '',
        description: '',
        event_type: 'theme_dinner',
        event_date: '',
        start_time: '19:00',
        end_time: '22:00',
        max_participants: 20,
        price_per_person: 0,
        image_url: '',
      });
      setImagePreview('');
      setImageFile(null);
    }
  }, [initialData, isOpen]);

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleBannerChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageFile(file);

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result?.toString() || '';
      setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...form };
    
    if (imageFile && imagePreview) {
      submitData.image_url = imagePreview;
    }
    
    onSubmit(submitData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-ink/60 backdrop-blur-md flex justify-center items-center z-50 p-4 font-outfit overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#fefcf8] rounded-[2rem] border border-primary-200 shadow-gold w-full max-w-4xl overflow-hidden my-auto max-h-[92vh] flex flex-col relative"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-primary-600"></div>

        <div className="px-8 md:px-12 py-8 border-b border-primary-100 bg-white/50 flex justify-between items-center relative z-10">
          <div>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-2 block">Programación de Experiencias</span>
            <h2 className="text-3xl md:text-4xl font-black text-ink tracking-tighter uppercase leading-none">
              {initialData ? 'Editar Evento' : 'Nueva Experiencia'}
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 rounded-2xl bg-primary-100 text-primary-600 hover:bg-primary-500 hover:text-white transition-all shadow-sm"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-8 md:p-12 space-y-8 overflow-y-auto flex-1 scrollbar-hide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="lg:col-span-2">
              <Input 
                label="Nombre del Evento" 
                icon={FileText}
                value={form.name} 
                onChange={(e) => updateForm('name', e.target.value)} 
                placeholder="Ej. Gala de Vinos Reserva" 
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-ink/80 ml-1">Categoría</label>
              <div className="relative group">
                <Sparkles className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-brown group-focus-within:text-primary-500 transition-colors" />
                <select 
                  value={form.event_type} 
                  onChange={(e) => updateForm('event_type', e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#fffdf9] border border-[#dcc7a5] text-ink text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none"
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type} value={type}>{translateEventType(type)}</option>
                  ))}
                </select>
              </div>
            </div>

            <Input 
              label="Fecha del Evento" 
              type="date" 
              icon={Calendar}
              value={form.event_date} 
              onChange={(e) => updateForm('event_date', e.target.value)} 
              required
            />

            <Input 
              label="Hora de Inicio" 
              type="time" 
              icon={Clock}
              value={form.start_time} 
              onChange={(e) => updateForm('start_time', e.target.value)} 
            />

            <Input 
              label="Hora de Finalización" 
              type="time" 
              icon={Clock}
              value={form.end_time} 
              onChange={(e) => updateForm('end_time', e.target.value)} 
            />

            <Input 
              label="Capacidad (Pax)" 
              type="number" 
              icon={Users}
              value={form.max_participants} 
              onChange={(e) => updateForm('max_participants', e.target.value)} 
              min={1}
            />

            <Input 
              label="Precio por Persona (Q)" 
              type="number" 
              icon={DollarSign}
              value={form.price_per_person} 
              onChange={(e) => updateForm('price_per_person', e.target.value)} 
              min={0}
            />

            <div className="lg:col-span-2 space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-ink/80 ml-1">Banner del Evento</label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-primary-200 bg-white/50 px-6 py-10 text-center transition-all hover:border-primary-500 hover:bg-white group">
                <input type="file" accept="image/*" className="hidden" onChange={handleBannerChange} />
                <ImageIcon size={32} className="text-primary-300 group-hover:text-primary-500 transition-colors mb-3" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary-600 group-hover:text-primary-700">Subir imagen promocional</span>
                <span className="mt-2 text-[9px] font-bold uppercase tracking-widest text-muted-brown">Relación recomendada 16:9</span>
              </label>
              {imagePreview && (
                <div className="overflow-hidden rounded-[2.5rem] border border-primary-200 bg-white shadow-sm mt-4">
                  <img src={imagePreview} alt="Vista previa" className="h-52 w-full object-cover" />
                </div>
              )}
            </div>

            <div className="lg:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-ink/80 ml-1 mb-2 block">Descripción Detallada</label>
              <textarea 
                value={form.description} 
                onChange={(e) => updateForm('description', e.target.value)} 
                placeholder="Describe la experiencia para tus clientes..." 
                className="w-full px-6 py-4 rounded-2xl bg-[#fffdf9] border border-[#dcc7a5] text-ink text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all min-h-[120px] resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-6 pt-10 border-t border-primary-100">
            <button
              type="button"
              onClick={onClose}
              className="text-[10px] font-black text-muted-brown hover:text-ink uppercase tracking-[0.2em] transition-colors"
            >
              Cancelar
            </button>
            <Button 
              type="submit" 
              isLoading={creating}
              className="w-full md:w-auto px-8 md:px-12 py-5 rounded-3xl shadow-gold"
            >
              <Rocket className="w-4 h-4 mr-2" /> 
              {initialData ? 'Guardar Cambios' : 'Publicar Experiencia'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
