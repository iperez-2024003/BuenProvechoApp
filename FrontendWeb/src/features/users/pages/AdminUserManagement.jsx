import { useEffect } from 'react';
import { useRestaurantStore } from '../../restaurants/store/useRestaurantStore';
import { UserCheck } from 'lucide-react';
import { Badge } from '../../../shared/components/ui/Badge';
import { ManagerForm } from '../components/ManagerForm';
import { ManagersTable } from '../components/ManagersTable';
import { useManagers } from '../hooks/useManagers';

export const AdminUserManagement = () => {
  const { restaurants, getRestaurants } = useRestaurantStore();
  const {
    managers,
    loading,
    editingId,
    editingRestaurant,
    formData,
    setEditingId,
    setEditingRestaurant,
    handleChange,
    handleSubmit,
    handleUpdateManagerRestaurant,
    handleDeleteManager,
  } = useManagers();

  useEffect(() => {
    getRestaurants();
  }, [getRestaurants]);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Badge variant="primary" className="mb-2">Control de Accesos</Badge>
          <h1 className="text-4xl md:text-5xl font-black text-ink tracking-tighter uppercase leading-none">
            Gestión de <span className="text-primary-500">Usuarios</span>
          </h1>
          <p className="text-muted-brown font-medium mt-2">Administración global de gerencias y jerarquías operativas.</p>
        </div>
      </div>

      <ManagerForm
        formData={formData}
        restaurants={restaurants}
        loading={loading}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />

      {/* Tabla de Gerentes Existentes */}
      <div className="mt-16">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-10 h-10 bg-[#fffaf3] text-[#1c1712] rounded-none flex items-center justify-center border-2 border-[#1c1712] shadow-[3px_3px_0px_#b98c52]">
            <UserCheck size={20} />
          </div>
          <h2 className="text-2xl font-black text-[#1c1712] uppercase tracking-tight">Gerentes Asignados</h2>
        </div>

        <ManagersTable
          managers={managers}
          loading={loading}
          restaurants={restaurants}
          editingId={editingId}
          editingRestaurant={editingRestaurant}
          setEditingId={setEditingId}
          setEditingRestaurant={setEditingRestaurant}
          handleUpdateManagerRestaurant={handleUpdateManagerRestaurant}
          handleDeleteManager={handleDeleteManager}
        />
      </div>
    </div>
  );
};

export default AdminUserManagement;
