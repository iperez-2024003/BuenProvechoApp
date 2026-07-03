import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRestaurantStore } from '../store/useRestaurantStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { RestaurantModal } from './RestaurantModal';
import { showSuccess, showError } from '../../../shared/utils/toast';
import { getImageUrl } from '../../../shared/utils/getImageUrl';
import { getFallbackRestaurant } from '../../../shared/utils/getFallbackImage';
import { 
  PlusCircle, Search, MapPin, Phone, Clock, 
  Utensils, Trash2, Edit3, CheckCircle2, Loader2, Sparkles, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';

const CATEGORY_LABELS = {
  casual: 'Casual', fine_dining: 'Fine Dining', fast_food: 'Rápida',
  cafe: 'Café', bakery: 'Panadería', bar: 'Bar', food_truck: 'Truck',
  buffet: 'Buffet', family_style: 'Familiar', gourmet: 'Gourmet', other: 'Otro',
};

const RestaurantsPage = () => {
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const { restaurants, loading, getRestaurants, deleteRestaurant, verifyRestaurant } = useRestaurantStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { getRestaurants(); }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return restaurants;
    return restaurants.filter(r => 
      r.name?.toLowerCase().includes(q) || 
      r.address?.toLowerCase().includes(q) || 
      r.cuisine_type?.toLowerCase().includes(q)
    );
  }, [restaurants, search]);

  const handleEdit = (restaurant) => { setSelectedRestaurant(restaurant); setModalOpen(true); };
  const handleNew = () => { setSelectedRestaurant(null); setModalOpen(true); };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`¿Seguro que deseas eliminar "${name}"?`)) return;
    setDeletingId(id);
    const result = await deleteRestaurant(id);
    setDeletingId(null);
    if (result.success) showSuccess('Restaurante eliminado');
    else showError(result.error);
  };

  const handleVerify = async (id, name) => {
    const result = await verifyRestaurant(id);
    if (result.success) showSuccess(`"${name}" verificado`);
    else showError(result.error);
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Badge variant="primary" className="mb-2">Red de Negocios</Badge>
          <h1 className="text-4xl md:text-5xl font-black text-ink tracking-tighter uppercase leading-none">
            Gestión de <span className="text-primary-500">Sedes</span>
          </h1>
          <p className="text-muted-brown font-medium mt-2">Supervisa y controla todos los establecimientos activos.</p>
        </div>
        {role === 'SUPER_ADMIN_ROLE' && (
          <Button onClick={handleNew} className="px-8">
            <PlusCircle size={18} className="mr-2" /> Nueva Sede
          </Button>
        )}
      </div>

      {/* Buscador */}
      <div className="relative group max-w-2xl">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary-400 group-focus-within:text-primary-600 transition-colors" size={20} />
        <input
          type="text"
          placeholder="Buscar por nombre, dirección o especialidad..."
          className="w-full pl-14 pr-6 py-4 bg-white border border-primary-200 rounded-2xl text-ink font-bold focus:ring-4 focus:ring-primary-500/5 focus:border-primary-500 transition-all outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-brown">Sincronizando Sedes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <Card className="text-center py-20 border-dashed">
            <Utensils className="w-16 h-16 text-primary-100 mx-auto mb-4" />
            <h3 className="text-xl font-black text-ink uppercase tracking-tight">Sin Resultados</h3>
            <p className="text-muted-brown text-sm font-medium">No hay sedes que coincidan con tu búsqueda.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {filtered.map((r, i) => (
                <motion.div key={r.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="overflow-hidden p-0 group border-primary-100 hover:border-primary-400">
                    <div className="h-40 relative">
                      <img 
                        src={getImageUrl(r.cover_image_url) || getImageUrl(r.logo_url) || getFallbackRestaurant(r.id || r._id)} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        alt={r.name}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent opacity-40" />
                      <div className="absolute top-4 right-4">
                        <Badge variant={r.is_verified ? 'success' : 'warning'}>
                          {r.is_verified ? 'Verificada' : 'Pendiente'}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl font-black text-ink uppercase tracking-tight truncate flex-1 mr-2">{r.name}</h2>
                        <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-2 py-1 rounded-md">{r.price_range}</span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-6">
                        <Badge variant="primary" className="bg-primary-100 text-primary-700 border-none">{CATEGORY_LABELS[r.category]}</Badge>
                        {r.cuisine_type && <Badge variant="secondary" className="opacity-70">{r.cuisine_type}</Badge>}
                      </div>

                      <div className="space-y-3 mb-8">
                        <div className="flex items-center gap-3 text-[11px] text-muted-brown font-bold uppercase tracking-widest">
                          <MapPin size={14} className="text-primary-500" /> <span className="truncate">{r.address}</span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-muted-brown font-bold uppercase tracking-widest">
                          <Clock size={14} className="text-primary-500" /> {r.opening_time?.slice(0, 5)} - {r.closing_time?.slice(0, 5)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-primary-50">
                        <Button variant="ghost" onClick={() => navigate(`/dashboard/restaurants/${r.id}`)} className="text-[9px] py-2">
                          Dashboard
                        </Button>
                        <Button onClick={() => navigate(`/dashboard/restaurants/${r.id}/menu`)} className="text-[9px] py-2">
                          Menú <ChevronRight size={14} />
                        </Button>
                      </div>

                      <div className="flex gap-2 mt-3">
                        <Button variant="ghost" className="flex-1 py-2 text-muted-brown" onClick={() => handleEdit(r)}>
                          <Edit3 size={14} />
                        </Button>
                        {!r.is_verified && (
                          <Button variant="primary" className="flex-[2] py-2 bg-emerald-500 border-emerald-500 hover:bg-emerald-600" onClick={() => handleVerify(r.id, r.name)}>
                            Verificar
                          </Button>
                        )}
                        <Button variant="danger" className="flex-1 py-2" onClick={() => handleDelete(r.id, r.name)} disabled={deletingId === r.id}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <RestaurantModal
        isOpen={modalOpen} onClose={() => { setModalOpen(false); setSelectedRestaurant(null); }}
        restaurant={selectedRestaurant}
      />
    </div>
  );
};

export default RestaurantsPage;
