import { useState, useEffect } from 'react';
import { useMenuStore } from '../store/useMenuStore';
import { showSuccess, showError } from '../../../shared/utils/toast';
import { getImageUrl } from '../../../shared/utils/getImageUrl';
import { motion } from 'framer-motion';
import { 
  Utensils, DollarSign, Package, Tag, FileText, 
  Image as ImageIcon, X, Save, Loader2, Sparkles, Zap 
} from 'lucide-react';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';

export const MenuItemModal = ({ isOpen, onClose, item = null, restaurantId }) => {
  const { menus, getMenus, createMenuItem, updateMenuItem, loading } = useMenuStore();
  
  const [formData, setFormData] = useState({
    name: '', description: '', price: '',
    menu_id: '', stock_quantity: 10, image: null,
  });

  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (isOpen && restaurantId) getMenus(restaurantId);
  }, [isOpen, restaurantId, getMenus]);

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '', description: item.description || '',
        price: item.price || '', menu_id: item.menu_id || '',
        stock_quantity: item.stock_quantity ?? 10, image: null,
      });
      setPreview(getImageUrl(item.image_url));
    } else {
      setFormData({
        name: '', description: '', price: '',
        menu_id: '', stock_quantity: 10, image: null,
      });
      setPreview(null);
    }
  }, [item, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.menu_id) return showError('Selecciona una categoría');

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key === 'image' && formData[key]) data.append('image', formData[key]);
      else if (key !== 'image') data.append(key, formData[key]);
    });
    data.append('restaurant_id', restaurantId);

    const result = item ? await updateMenuItem(item.id, data) : await createMenuItem(data);
    if (result.success) {
      showSuccess(result.message);
      onClose();
    } else showError(result.error);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-ink/40 backdrop-blur-md overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-primary-50 rounded-[2rem] border border-primary-200 shadow-premium w-full max-w-2xl overflow-hidden max-h-[92vh] flex flex-col relative"
      >
        {/* Header */}
        <div className="px-8 py-6 bg-white border-b border-primary-100 flex justify-between items-center">
          <div>
            <Badge variant="primary" className="mb-1">Catálogo de Sabores</Badge>
            <h2 className="text-2xl font-black text-ink tracking-tighter uppercase">
              {item ? 'Editar Platillo' : 'Nuevo Platillo'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-primary-100 rounded-xl transition-colors text-muted-brown">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto flex-1 scrollbar-hide">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Columna Izquierda: Imagen */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase text-muted-brown tracking-widest ml-1">Imagen del Plato</label>
              <div className="aspect-square bg-white rounded-[2rem] border-2 border-dashed border-primary-200 flex items-center justify-center overflow-hidden group relative transition-all hover:border-primary-500">
                {preview ? (
                  <img src={preview} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <Utensils size={40} className="text-primary-200 group-hover:text-primary-500 transition-colors" />
                )}
                <label className="absolute inset-0 bg-ink/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-white text-[10px] font-black uppercase tracking-widest gap-2">
                  <ImageIcon size={24} className="text-primary-400" />
                  Cambiar Imagen
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>
            </div>

            {/* Columna Derecha: Info */}
            <div className="space-y-6">
              <Input label="Nombre del Plato" name="name" value={formData.name} onChange={handleChange} required />
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Precio (Q)" name="price" type="number" step="0.01" value={formData.price} onChange={handleChange} required />
                <Input label="Stock" name="stock_quantity" type="number" value={formData.stock_quantity} onChange={handleChange} required />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-muted-brown tracking-widest ml-1">Categoría</label>
                <select 
                  name="menu_id" value={formData.menu_id} onChange={handleChange} required
                  className="w-full h-11 px-4 rounded-xl border border-primary-200 bg-white text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                >
                  <option value="">Seleccionar...</option>
                  {menus.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-muted-brown tracking-widest ml-1">Descripción Detallada</label>
            <textarea 
              name="description" rows={3} value={formData.description} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-primary-200 bg-white text-sm font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none resize-none"
              placeholder="Ingredientes, preparación, alérgenos..."
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-6 border-t border-primary-100 flex justify-between items-center">
            <button type="button" onClick={onClose} className="text-[10px] font-black uppercase text-muted-brown hover:text-ink tracking-widest transition-colors">
              Cancelar
            </button>
            <Button type="submit" isLoading={loading} className="w-full md:w-auto px-6 md:px-10">
              <Sparkles size={18} className="mr-2" />
              {item ? 'Guardar Cambios' : 'Publicar en Menú'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
