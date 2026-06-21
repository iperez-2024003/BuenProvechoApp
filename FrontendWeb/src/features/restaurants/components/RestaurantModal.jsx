import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSaveRestaurant } from '../hooks/useSaveRestaurant';
import { useRestaurantStore } from '../store/useRestaurantStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, MapPin, Phone, Mail, Globe, Clock, 
  Users, DollarSign, Image as ImageIcon, Wifi, 
  Car, Trees, Accessibility, Dog, X, Save, 
  Info, CalendarDays, Utensils, Sparkles, Loader2 
} from 'lucide-react';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';

const CATEGORIES = [
  { value: 'casual', label: 'Casual' },
  { value: 'fine_dining', label: 'Fine Dining' },
  { value: 'fast_food', label: 'Fast Food' },
  { value: 'cafe', label: 'Café' },
  { value: 'bakery', label: 'Panadería' },
  { value: 'bar', label: 'Bar' },
  { value: 'food_truck', label: 'Food Truck' },
  { value: 'buffet', label: 'Buffet' },
  { value: 'gourmet', label: 'Gourmet' },
  { value: 'other', label: 'Otro' },
];

const DAYS = [
  { value: 'monday', label: 'Lun' }, { value: 'tuesday', label: 'Mar' },
  { value: 'wednesday', label: 'Mié' }, { value: 'thursday', label: 'Jue' },
  { value: 'friday', label: 'Vie' }, { value: 'saturday', label: 'Sáb' },
  { value: 'sunday', label: 'Dom' },
];

export const RestaurantModal = ({ isOpen, onClose, restaurant = null }) => {
  const { saveRestaurant } = useSaveRestaurant();
  const loading = useRestaurantStore((s) => s.loading);
  const user = useAuthStore((s) => s.user);
  const currentAdminId = user?.id || user?.Id || '';
  const [activeTab, setActiveTab] = useState('general');

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm();
  const [selectedDays, setSelectedDays] = useState(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('general');
      if (restaurant) {
        reset({ ...restaurant, 
          opening_time: restaurant.opening_time?.slice(0, 5),
          closing_time: restaurant.closing_time?.slice(0, 5)
        });
        setSelectedDays(restaurant.operating_days || []);
      } else {
        reset({
          category: 'casual', price_range: '$', capacity: 50,
          opening_time: '08:00', closing_time: '22:00',
          accepts_reservations: true, accepts_takeout: true, admin_id: currentAdminId,
        });
        setSelectedDays(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
      }
    }
  }, [isOpen, restaurant, reset, currentAdminId]);

  const toggleDay = (day) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const onSubmit = async (data) => {
    if (!currentAdminId) {
      return;
    }

    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'logo' && data[key]?.[0]) {
        formData.append('logo', data[key][0]);
        return;
      }

      if (key === 'opening_time' || key === 'closing_time') {
        const normalizedTime = data[key] && data[key].length === 5 ? `${data[key]}:00` : data[key];
        if (normalizedTime) formData.append(key, normalizedTime);
        return;
      }

      if (key !== 'logo' && data[key] !== undefined && data[key] !== null) {
        formData.append(key, data[key]);
      }
    });

    if (!formData.has('admin_id')) {
      formData.append('admin_id', currentAdminId);
    }
    formData.append('operating_days', JSON.stringify(selectedDays));
    const result = await saveRestaurant(formData, restaurant?.id);
    if (result.success) onClose();
  };

  if (!isOpen) return null;

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
        activeTab === id ? 'bg-primary-500 text-white shadow-gold' : 'text-muted-brown hover:bg-primary-100'
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-ink/40 backdrop-blur-md flex justify-center items-center z-[100] p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-primary-50 rounded-[2rem] border border-primary-200 shadow-premium w-full max-w-3xl overflow-hidden max-h-[92vh] flex flex-col relative"
      >
        {/* Header */}
        <div className="px-8 py-6 bg-white border-b border-primary-100 flex justify-between items-center">
          <div>
            <Badge variant="primary" className="mb-1">Configuración de Sede</Badge>
            <h2 className="text-2xl font-black text-ink tracking-tighter uppercase">
              {restaurant ? 'Editar Restaurante' : 'Nuevo Restaurante'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-primary-100 rounded-xl transition-colors text-muted-brown">
            <X size={24} />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="px-8 py-4 bg-white/50 border-b border-primary-100 flex gap-2 overflow-x-auto scrollbar-hide">
          <TabButton id="general" label="General" icon={Info} />
          <TabButton id="location" label="Ubicación" icon={MapPin} />
          <TabButton id="schedule" label="Horarios" icon={Clock} />
          <TabButton id="services" label="Servicios" icon={Sparkles} />
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-8 overflow-y-auto flex-1 scrollbar-hide">
          <div className="min-h-[320px]">
            <AnimatePresence mode="wait">
              {activeTab === 'general' && (
                <motion.div key="general" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                  <Input label="Nombre del Restaurante" icon={Building2} {...register('name', { required: 'El nombre del restaurante es obligatorio' })} error={errors.name?.message} />
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-ink/80 tracking-widest ml-1">Logo del Restaurante</label>
                    <div className="w-full h-32 rounded-xl border-2 border-dashed border-primary-200 bg-white/50 flex items-center justify-center overflow-hidden group relative transition-all hover:border-primary-500">
                      {watch('logo')?.[0] ? (
                        <div className="text-center text-ink text-[10px] font-black uppercase tracking-widest">
                          <ImageIcon size={28} className="mx-auto mb-2 text-primary-500" />
                          {watch('logo')[0].name}
                        </div>
                      ) : (
                        <div className="text-center text-muted-brown text-[10px] font-black uppercase tracking-widest group-hover:text-primary-500 transition-colors">
                          <ImageIcon size={32} className="mx-auto mb-2" />
                          Seleccionar Logo
                        </div>
                      )}
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" {...register('logo')} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-ink/80 tracking-widest ml-1">Categoría</label>
                      <select className="w-full h-11 px-4 rounded-xl border border-[#dcc7a5] bg-[#fffdf9] text-ink text-sm font-bold outline-none focus:ring-2 focus:ring-[#d7b77f]/20 focus:border-[#b98c52] transition-all" {...register('category')}>
                        {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                      </select>
                    </div>
                    <Input label="Tipo de Cocina" icon={Utensils} {...register('cuisine_type')} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase text-ink/80 tracking-widest ml-1">Descripción</label>
                    <textarea rows={3} className="w-full px-4 py-3 rounded-xl border border-[#dcc7a5] bg-[#fffdf9] text-ink text-sm font-medium outline-none focus:ring-2 focus:ring-[#d7b77f]/20 focus:border-[#b98c52] transition-all resize-none" {...register('description')} />
                  </div>
                </motion.div>
              )}

              {activeTab === 'location' && (
                <motion.div key="location" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-6">
                  <Input label="Dirección Física" icon={MapPin} {...register('address', { required: true })} />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Teléfono" icon={Phone} {...register('phone', { required: true })} />
                    <Input label="Email" icon={Mail} {...register('email')} />
                  </div>
                  <Input label="Sitio Web" icon={Globe} {...register('website_url')} />
                </motion.div>
              )}

              {activeTab === 'schedule' && (
                <motion.div key="schedule" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-8">
                  <div className="grid grid-cols-3 gap-4">
                    <Input label="Apertura" type="time" {...register('opening_time')} />
                    <Input label="Cierre" type="time" {...register('closing_time')} />
                    <Input label="Capacidad" type="number" icon={Users} {...register('capacity')} />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-ink/80 tracking-widest ml-1">Días de Operación</label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS.map(d => (
                        <button key={d.value} type="button" onClick={() => toggleDay(d.value)}
                          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all border ${
                            selectedDays.includes(d.value) ? 'bg-primary-500 border-primary-500 text-white' : 'bg-white border-primary-200 text-muted-brown'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-ink/80 tracking-widest ml-1">Rango de Precio</label>
                      <select className="w-full h-11 px-4 rounded-xl border border-[#dcc7a5] bg-[#fffdf9] text-ink text-sm font-bold outline-none focus:ring-2 focus:ring-[#d7b77f]/20 focus:border-[#b98c52] transition-all" {...register('price_range')}>
                        <option value="$">$ Económico</option>
                        <option value="$$">$$ Medio</option>
                        <option value="$$$">$$$ Premium</option>
                        <option value="$$$$">$$$$ Luxury</option>
                      </select>
                    </div>
                    <Input label="Ticket Promedio" type="number" icon={DollarSign} {...register('average_price')} />
                  </div>
                </motion.div>
              )}

              {activeTab === 'services' && (
                <motion.div key="services" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'accepts_reservations', label: 'Reservas', icon: CalendarDays },
                    { name: 'accepts_takeout', label: 'Para Llevar', icon: Utensils },
                    { name: 'accepts_delivery', label: 'Delivery', icon: Globe },
                    { name: 'parking_available', label: 'Parqueo', icon: Car },
                    { name: 'wifi_available', label: 'WiFi', icon: Wifi },
                    { name: 'outdoor_seating', label: 'Terraza', icon: Trees },
                    { name: 'pet_friendly', label: 'Pet Friendly', icon: Dog },
                    { name: 'wheelchair_accessible', label: 'Accesible', icon: Accessibility },
                  ].map(s => (
                    <label key={s.name} className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-primary-100 hover:border-primary-500 transition-all cursor-pointer group">
                      <input type="checkbox" className="w-5 h-5 accent-primary-500 rounded-lg" {...register(s.name)} />
                      <div className="flex items-center gap-2">
                        <s.icon size={16} className="text-primary-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-brown group-hover:text-ink">{s.label}</span>
                      </div>
                    </label>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="mt-10 pt-6 border-t border-primary-100 flex justify-between items-center">
            <button type="button" onClick={onClose} className="text-[10px] font-black uppercase text-muted-brown hover:text-ink tracking-widest transition-colors">
              Descartar Cambios
            </button>
            <Button type="submit" isLoading={loading} className="w-full md:w-auto px-6 md:px-10">
              <Save size={18} className="mr-2" />
              {restaurant ? 'Guardar Cambios' : 'Crear Sede'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
