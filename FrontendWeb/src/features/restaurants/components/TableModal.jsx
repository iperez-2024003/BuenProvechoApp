import { useState, useEffect } from 'react';
import { useTableStore } from '../store/useTableStore';
import { showSuccess, showError } from '../../../shared/utils/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  Layers, 
  X, 
  Save, 
  Hash,
  Sparkles
} from 'lucide-react';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';

export const TableModal = ({ isOpen, onClose, table = null, restaurantId }) => {
  const { createTable, updateTable, loading } = useTableStore();
  
  const [formData, setFormData] = useState({
    table_number: '',
    capacity: 2,
    location: 'interior',
    floor: 1,
  });

  useEffect(() => {
    if (table) {
      setFormData({
        table_number: table.table_number,
        capacity: table.capacity,
        location: table.location,
        floor: table.floor,
      });
    } else {
      setFormData({
        table_number: '',
        capacity: 2,
        location: 'interior',
        floor: 1,
      });
    }
  }, [table, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      restaurant_id: restaurantId,
      table_number: parseInt(formData.table_number),
      capacity: parseInt(formData.capacity),
      floor: parseInt(formData.floor),
    };

    const result = table 
      ? await updateTable(table.id, data)
      : await createTable(data);

    if (result.success) {
      showSuccess(table ? 'Mesa actualizada exitosamente' : 'Mesa registrada en el sistema');
      onClose();
    } else {
      showError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#fffdf8] rounded-[2rem] border border-[#dcc7a5]/70 shadow-[0_30px_80px_rgba(33,24,14,0.18)] w-full max-w-lg relative my-auto max-h-[92vh] flex flex-col overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#b98c52] via-[#dcc7a5] to-[#8b6435]" />

        {/* Header */}
        <div className="relative px-8 md:px-10 pt-10 pb-8 bg-[linear-gradient(180deg,#fffdf8_0%,#fcf7ee_100%)] border-b border-[#ead8bd]/70">
          <div className="absolute top-6 right-6">
            <button 
              onClick={onClose} 
              className="w-10 h-10 rounded-2xl bg-white/90 text-[#8b6435] hover:bg-[#b98c52] hover:text-white transition-all shadow-[0_10px_24px_rgba(185,140,82,0.16)] border border-[#ead8bd] flex items-center justify-center"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          <div className="max-w-[80%]">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f3e4ca] text-[#8b6435] border border-[#dcc7a5] mb-4">
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase tracking-[0.35em]">Gestión de Aforo</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-ink tracking-tighter uppercase leading-[0.9]">
              {table ? 'Editar Mesa' : 'Nueva Mesa'}
            </h2>

            <p className="mt-3 text-[11px] md:text-xs font-medium text-zinc-500 leading-relaxed max-w-[28rem]">
              Ajusta la distribución del salón con una ficha clara, limpia y lista para operación.
            </p>
          </div>

          <div className="absolute bottom-[-18px] right-8 w-24 h-24 rounded-full bg-[#fffaf3] border border-[#ead8bd] shadow-[0_10px_30px_rgba(33,24,14,0.08)] flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-[#b98c52]" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 md:px-10 py-8 space-y-7 overflow-y-auto flex-1 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Nº de Mesa"
              type="number"
              icon={Hash}
              placeholder="Ejem: 1, 2, 3..."
              value={formData.table_number}
              onChange={(e) => handleChange('table_number', e.target.value)}
              required
            />
            <Input
              label="Capacidad"
              type="number"
              icon={Users}
              min="1"
              value={formData.capacity}
              onChange={(e) => handleChange('capacity', e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-ink/80 ml-1">Ubicación en Salón</label>
            <div className="relative group">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-brown group-focus-within:text-primary-500 transition-colors" />
              <select
                name="location"
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#fffdf9] border border-[#dcc7a5] text-ink text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              >
                <option value="interior">Interior Principal</option>
                <option value="terrace">Terraza / Exterior</option>
                <option value="window">Frente a Ventana</option>
                <option value="vip">Zona VIP</option>
                <option value="private">Salón Privado</option>
                <option value="bar">Área de Bar</option>
              </select>
            </div>
          </div>

          <Input
            label="Piso / Nivel"
            type="number"
            icon={Layers}
            value={formData.floor}
            onChange={(e) => handleChange('floor', e.target.value)}
          />

          <div className="flex flex-col sm:flex-row gap-4 pt-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 py-4 rounded-2xl border border-[#ead8bd] bg-white/90 hover:bg-[#fff8ee] text-sm"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              isLoading={loading}
              className="flex-1 py-4 rounded-2xl shadow-[0_18px_30px_rgba(185,140,82,0.18)] bg-gradient-to-r from-[#d7b77f] to-[#b98c52] text-sm"
            >
              <Save className="w-4 h-4 mr-2" />
              {table ? 'Actualizar' : 'Registrar Mesa'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
