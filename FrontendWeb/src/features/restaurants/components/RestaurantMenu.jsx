import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMenuStore } from '../store/useMenuStore';
import { useRestaurantStore } from '../store/useRestaurantStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { MenuItemModal } from './MenuItemModal';
import { CategoryModal } from './CategoryModal';
import { showSuccess, showError } from '../../../shared/utils/toast';
import { getImageUrl } from '../../../shared/utils/getImageUrl';
import { MenuFlipCard } from '../../../shared/components/ui/MenuFlipCard';
import { ActionButton } from '../../../shared/components/ui/ActionButton';
import { 
  PlusCircle, 
  FolderPlus, 
  UtensilsCrossed, 
  ChevronLeft, 
  Loader2, 
  Settings, 
  Trash2,
  Sparkles,
  LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const RestaurantMenu = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const canManage = role === 'SUPER_ADMIN_ROLE' || role === 'RESTAURANT_ADMIN_ROLE';
  
  const { items, menus, loading, getMenus, getMenuItems, deleteMenuItem } = useMenuStore();
  const { restaurants, getRestaurants } = useRestaurantStore();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);

  const restaurant = restaurants.find(r => r.id === id);

  useEffect(() => {
    if (id) {
      getMenus(id);
      getMenuItems(id);
      if (restaurants.length === 0) getRestaurants();
    }
  }, [id, getMenus, getMenuItems, getRestaurants, restaurants.length]);

  const handleDelete = async (itemId, name) => {
    if (!window.confirm(`¿Seguro que deseas eliminar "${name}"? Esta acción es permanente.`)) return;
    const result = await deleteMenuItem(itemId, id);
    if (result.success) showSuccess('Platillo eliminado');
    else showError(result.error);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const handleNew = () => {
    setSelectedItem(null);
    setModalOpen(true);
  };

  const handleNewCategory = () => {
    setCategoryModalOpen(true);
  };

  const filteredItems = activeCategory 
    ? items.filter(item => item.menu_id === activeCategory)
    : items;

  return (
    <div className="space-y-12 font-outfit animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="w-14 h-14 bg-[#fffaf3]/60 rounded-2xl border border-[#dcc7a5] text-[#b98c52] hover:text-[#a97d45] hover:border-[#d7b77f] transition-all flex items-center justify-center shadow-xl group"
          >
            <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <div className="flex flex-col">
             <span className="text-[10px] font-black text-[#b98c52] uppercase tracking-[0.4em] mb-1">{restaurant?.name || 'Gestión Maestro'}</span>
             <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">Menú <span className="text-zinc-600 italic">Digital</span></h1>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {canManage && (
            <>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNewCategory}
                className="px-8 py-4 bg-[#fffaf3]/60 text-[#b98c52] rounded-2xl text-[10px] font-black uppercase tracking-widest border border-[#dcc7a5] hover:bg-[#d7b77f] hover:text-white transition-all flex items-center gap-3"
              >
                <FolderPlus className="w-4 h-4 text-[#b98c52]" /> Categoría
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNew}
                className="px-8 py-4 bg-gradient-to-r from-[#d7b77f] to-[#b98c52] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:to-[#a97d45] transition-all shadow-2xl shadow-[rgba(185,140,82,0.06)] flex items-center gap-3 border border-[#d7b77f]/30"
              >
                <PlusCircle className="w-4 h-4" /> Añadir Platillo
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Categorías (Filtros) */}
      <div className="flex items-center gap-4 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-zinc-800">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 flex items-center gap-2 border whitespace-nowrap ${
            !activeCategory 
              ? 'bg-gradient-to-r from-primary-400 to-primary-600 text-white border-primary-500 shadow-gold' 
              : 'bg-white/50 border-primary-200 text-muted-brown hover:text-ink hover:bg-primary-100'
          }`}
        >
          <LayoutGrid className="w-3 h-3" /> Catálogo Completo
        </button>
        {menus.map((m) => (
          <button
            key={m.id}
            onClick={() => setActiveCategory(m.id)}
            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all duration-500 border ${
              activeCategory === m.id 
                ? 'bg-gradient-to-r from-primary-400 to-primary-600 text-white border-primary-500 shadow-gold' 
                : 'bg-white/50 border-primary-200 text-muted-brown hover:text-ink hover:bg-primary-100'
            }`}
          >
            {m.name}
          </button>
        ))}
      </div>

      {/* Grid de Platillos */}
      <div className="min-h-[300px] md:min-h-[500px]">
        {loading ? (
          <div className="h-[300px] md:h-[400px] flex flex-col items-center justify-center gap-6">
            <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-[#b98c52] animate-spin" />
            <p className="text-zinc-600 font-black uppercase tracking-[0.4em] text-[10px]">Sincronizando Inventario...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-40 bg-zinc-900/10 rounded-[4rem] border border-dashed border-zinc-800/50"
          >
            <Sparkles className="w-16 h-16 text-zinc-800 mb-8" />
            <h3 className="text-xl font-black text-white uppercase tracking-widest">Cocina en Preparación</h3>
            <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-[0.2em] mt-3">No hay ítems registrados bajo esta categoría.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-12">
            <AnimatePresence>
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group"
                >
                  <MenuFlipCard 
                    title={item.name}
                    category={menus.find(m => m.id === item.menu_id)?.name || 'Especialidad'}
                    price={`Q${item.price}`}
                    time="15-20 Min"
                    servings="1 Persona"
                    image={getImageUrl(item.image_url) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                  />
                  
                  {canManage && (
                    <div className="absolute top-4 right-4 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 translate-x-4 group-hover:translate-x-0">
                      <button
                        onClick={() => handleEdit(item)}
                        className="w-12 h-12 bg-zinc-950/90 backdrop-blur-xl text-white rounded-2xl shadow-2xl hover:bg-[#b98c52] hover:text-white transition-all border border-zinc-800 flex items-center justify-center"
                        title="Configurar Platillo"
                      >
                        <Settings className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.name)}
                        className="w-12 h-12 bg-rose-600/10 backdrop-blur-xl text-rose-500 rounded-2xl shadow-2xl hover:bg-rose-600 hover:text-white transition-all border border-rose-500/20 flex items-center justify-center"
                        title="Eliminar del Menú"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <MenuItemModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedItem(null); }}
        item={selectedItem}
        restaurantId={id}
      />

      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => setCategoryModalOpen(false)}
        restaurantId={id}
      />
    </div>
  );
};

export default RestaurantMenu;
