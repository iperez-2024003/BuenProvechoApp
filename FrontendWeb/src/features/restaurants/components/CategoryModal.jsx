import { useState, useEffect } from 'react';
import { useMenuStore } from '../store/useMenuStore';
import { showSuccess, showError } from '../../../shared/utils/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FolderPlus,
  Type,
  X,
  Zap
} from 'lucide-react';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';

export const CategoryModal = ({ isOpen, onClose, restaurantId }) => {
  const { createCategory, loading } = useMenuStore();
  const [name, setName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showError('El nombre de la categoría es obligatorio');
      return;
    }

    const result = await createCategory({
      name: name.trim(),
      restaurant_id: restaurantId
    });

    if (result.success) {
      showSuccess('Categoría creada');
      onClose();
    } else {
      showError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-md overflow-y-auto font-outfit">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#fffdf8] rounded-[2rem] border border-[#dcc7a5]/70 shadow-[0_30px_80px_rgba(33,24,14,0.18)] w-full max-w-md relative my-auto max-h-[92vh] flex flex-col overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#b98c52] via-[#dcc7a5] to-[#8b6435]" />

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
              <FolderPlus className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase tracking-[0.35em]">Gestión de Menú</span>
            </div>

            <h2 className="text-3xl md:text-[2.75rem] font-black text-ink tracking-tighter uppercase leading-[0.9]">
              Nueva <span className="text-[#b98c52]">Categoría</span>
            </h2>

            <p className="mt-3 text-[11px] md:text-xs font-medium text-zinc-500 leading-relaxed max-w-[28rem]">
              Ordena tu carta con categorías limpias para entradas, bebidas, fondos o especialidades.
            </p>
          </div>

          <div className="absolute bottom-[-18px] right-8 w-24 h-24 rounded-full bg-[#fffaf3] border border-[#ead8bd] shadow-[0_10px_30px_rgba(33,24,14,0.08)] flex items-center justify-center">
            <Type className="w-8 h-8 text-[#b98c52]" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-8 md:px-10 py-8 space-y-7 overflow-y-auto flex-1 scrollbar-hide">
          <Input
            label="Nombre de la Categoría"
            icon={Type}
            placeholder="ej: Entradas, Bebidas..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
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
              disabled={!name.trim()}
              className="flex-1 py-4 rounded-2xl shadow-[0_18px_30px_rgba(185,140,82,0.18)] bg-gradient-to-r from-[#d7b77f] to-[#b98c52] text-sm"
            >
              <Zap className="w-4 h-4 mr-2" />
              Crear Categoría
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
