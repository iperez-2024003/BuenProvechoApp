import { motion } from 'framer-motion';
import { UserCheck, Edit2, Check, X, Trash2, Loader2 } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';

export const ManagersTable = ({ managers, loading, restaurants, editingId, editingRestaurant, setEditingId, setEditingRestaurant, handleUpdateManagerRestaurant, handleDeleteManager }) => {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (managers.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-brown font-medium">No hay gerentes registrados aún</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-primary-100 shadow-premium">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-primary-50 border-b border-primary-100">
              <th className="px-6 py-6 text-left text-[10px] font-black uppercase text-ink/80 tracking-widest">Nombre</th>
              <th className="px-6 py-6 text-left text-[10px] font-black uppercase text-ink/80 tracking-widest">Credenciales</th>
              <th className="px-6 py-6 text-left text-[10px] font-black uppercase text-ink/80 tracking-widest">Sede Asignada</th>
              <th className="px-6 py-6 text-center text-[10px] font-black uppercase text-ink/80 tracking-widest">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary-100">
            {managers.map((manager) => (
              <motion.tr key={manager.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-primary-50/50 transition-colors group">
                <td className="px-6 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 font-black border border-primary-200">
                      {manager.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-ink">{manager.name} {manager.surname}</p>
                      <p className="text-[10px] text-muted-brown font-black uppercase tracking-widest">ID: {manager.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6">
                  <p className="text-xs font-bold text-ink">{manager.email}</p>
                  <p className="text-[10px] text-muted-brown font-black uppercase tracking-widest">{manager.phone}</p>
                </td>
                <td className="px-6 py-6">
                  {editingId === manager.id ? (
                    <select
                      value={editingRestaurant || manager.restaurant_id}
                      onChange={(e) => setEditingRestaurant(e.target.value)}
                      className="w-full px-3 py-2 text-[10px] font-black uppercase tracking-widest border border-primary-200 rounded-lg bg-white text-ink outline-none focus:border-primary-500 transition-all"
                    >
                      <option value="">Seleccionar...</option>
                      {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                  ) : (
                    <Badge variant="primary" className="px-3 py-1">{manager.restaurantName}</Badge>
                  )}
                </td>
                <td className="px-6 py-6">
                  <div className="flex items-center justify-center gap-2">
                    {editingId === manager.id ? (
                      <>
                        <button
                          onClick={() => handleUpdateManagerRestaurant(manager.id, editingRestaurant || manager.restaurant_id)}
                          className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all border border-emerald-100"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setEditingRestaurant(null); }}
                          className="p-2 bg-ink/5 text-ink rounded-xl hover:bg-ink hover:text-white transition-all border border-ink/10"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { setEditingId(manager.id); setEditingRestaurant(manager.restaurant_id); }}
                          className="p-2 bg-primary-100 text-primary-600 rounded-xl hover:bg-primary-500 hover:text-white transition-all border border-primary-200 shadow-sm"
                          title="Cambiar sede"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteManager(manager.id, manager.name)}
                          className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all border border-red-100 shadow-sm"
                          title="Eliminar usuario"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
