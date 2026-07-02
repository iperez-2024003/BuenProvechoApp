import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTableStore } from '../store/useTableStore';
import { useRestaurantStore } from '../store/useRestaurantStore';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { TableModal } from './TableModal';
import { InteractiveTableMap } from './InteractiveTableMap';
import { showSuccess, showError } from '../../../shared/utils/toast';
import { ActionButton } from '../../../shared/components/ui/ActionButton';
import { PlusCircle, Trash2, Edit3, Loader2, ChevronLeft, LayoutGrid, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TablesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const canManage = role === 'SUPER_ADMIN_ROLE' || role === 'RESTAURANT_ADMIN_ROLE';
  
  const { tables, loading, getTables, updateStatus, deleteTable } = useTableStore();
  const { restaurants, getRestaurants } = useRestaurantStore();
  
  const [modalOpen, setModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('map'); // 'cards' o 'map'
  const [selectedTable, setSelectedTable] = useState(null);

  const restaurant = restaurants.find(r => r.id === id);

  useEffect(() => {
    if (id) {
      getTables(id);
      if (restaurants.length === 0) getRestaurants();
    }
  }, [id, getTables, getRestaurants, restaurants.length]);

  const getStatusConfig = (status) => {
    switch (status) {
      case 'available': return { color: 'emerald', label: 'Disponible' };
      case 'occupied': return { color: 'rose', label: 'Ocupada' };
      case 'reserved': return { color: 'amber', label: 'Reservada' };
      case 'cleaning': return { color: 'sky', label: 'Limpieza' };
      default: return { color: 'zinc', label: status };
    }
  };

  const handleStatusChange = async (tableId, newStatus) => {
    const result = await updateStatus(tableId, newStatus, id);
    if (result.success) showSuccess('Estado actualizado');
    else showError(result.error);
  };

  const handleDelete = async (tableId, number) => {
    if (!window.confirm(`¿Eliminar mesa ${number} permanentemente?`)) return;
    const result = await deleteTable(tableId, id);
    if (result.success) showSuccess('Mesa eliminada');
    else showError(result.error);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white/40 p-8 rounded-[2rem] border border-[#dcc7a5]/10 shadow-sm">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="p-3 bg-white rounded-2xl border border-[#dcc7a5]/20 text-zinc-600 hover:text-[#b98c52] transition-all hover:shadow-md active:scale-95"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-[#b98c52] uppercase tracking-[0.3em] mb-1">{restaurant?.name || 'Sede'}</span>
            <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase leading-none">Gestión de Aforo</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Selector de Vista Estilo Apple */}
          <div className="bg-zinc-100 p-1 rounded-2xl flex items-center border border-zinc-200">
             <button 
                onClick={() => setViewMode('map')}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'map' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
             >
                Mapa Interactivo
             </button>
             <button 
                onClick={() => setViewMode('cards')}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'cards' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-400 hover:text-zinc-600'}`}
             >
                Vista de Lista
             </button>
          </div>

          {canManage && (
            <ActionButton 
              label="Nueva Mesa" 
              icon={PlusCircle} 
              color="bronze" 
              onClick={() => { setSelectedTable(null); setModalOpen(true); }} 
            />
          )}
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-6">
            <Loader2 className="w-12 h-12 text-[#b98c52] animate-spin" />
            <p className="text-zinc-600 font-black uppercase tracking-[0.3em] text-[10px]">Sincronizando Plano...</p>
          </div>
        ) : tables.length === 0 ? (
          <div className="text-center py-32 bg-white/90 rounded-[4rem] border border-dashed border-[#dcc7a5]">
            <LayoutGrid className="w-20 h-20 text-zinc-800 mx-auto mb-8" />
            <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">Salón Vacío</h3>
            <p className="text-zinc-600 text-xs font-bold uppercase tracking-widest mt-2">Agrega mesas para empezar a gestionar tu aforo.</p>
          </div>
        ) : viewMode === 'map' ? (
           <InteractiveTableMap 
              tables={tables} 
              onTableClick={(table) => { setSelectedTable(table); setModalOpen(true); }}
           />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            <AnimatePresence>
              {tables.map((table, index) => {
                const config = getStatusConfig(table.status);
                return (
                  <motion.div
                    key={table.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative group"
                  >
                    <div className="bg-white/80 backdrop-blur-3xl rounded-[2.5rem] p-8 border border-[#dcc7a5]/10 hover:border-[#b98c52]/30 transition-all shadow-md flex flex-col items-center text-center">
                      <div className={`absolute top-6 right-6 w-3 h-3 rounded-full bg-${config.color}-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]`} />
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 border-2 border-dashed border-${config.color}-500/30 bg-${config.color}-500/5 transition-colors group-hover:scale-105 duration-500`}>
                        <span className="text-4xl">🍽️</span>
                      </div>
                      <h3 className="text-2xl font-black text-zinc-900 mb-1 uppercase tracking-tight">Mesa {table.table_number}</h3>
                      <div className="flex items-center gap-2 mb-6">
                         <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Cap: {table.capacity}</span>
                         <span className="w-1 h-1 rounded-full bg-zinc-800" />
                         <span className={`text-[9px] font-black uppercase tracking-widest text-${config.color}-400`}>{config.label}</span>
                      </div>
                      <div className="space-y-3 w-full">
                        <select
                          className="w-full bg-white/90 border border-[#dcc7a5] text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl text-zinc-600 focus:border-[#b98c52] outline-none transition-all cursor-pointer"
                          value={table.status}
                          onChange={(e) => handleStatusChange(table.id, e.target.value)}
                        >
                          <option value="available">Disponible</option>
                          <option value="occupied">Ocupada</option>
                          <option value="reserved">Reservada</option>
                          <option value="cleaning">Limpieza</option>
                        </select>
                        <div className="grid grid-cols-2 gap-2">
                           {canManage && (
                             <>
                               <button
                                 onClick={() => { setSelectedTable(table); setModalOpen(true); }}
                                 className="py-3 rounded-xl bg-white/90 text-zinc-600 text-[9px] font-black uppercase tracking-widest border border-[#dcc7a5] hover:text-zinc-900 transition-all flex items-center justify-center gap-2"
                               >
                                 <Edit3 className="w-3.5 h-3.5" /> Editar
                               </button>
                               <button
                                 onClick={() => handleDelete(table.id, table.table_number)}
                                 className="py-3 rounded-xl bg-red-600/10 text-red-500 text-[9px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                               >
                                 <Trash2 className="w-3.5 h-3.5" /> Borrar
                               </button>
                             </>
                           )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <TableModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedTable(null); }}
        table={selectedTable}
        restaurantId={id}
      />
    </div>
  );
};

export default TablesPage;
