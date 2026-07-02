import { useState } from 'react';
import { useUsersStore } from '../store/useUsersStore';
import { toast } from 'react-hot-toast';

export const useManagers = () => {
  const { managers, loading, fetchManagers, createManager, updateManagerRestaurant, deleteManager } = useUsersStore();
  const [editingId, setEditingId] = useState(null);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [formData, setFormData] = useState({
    name: '', surname: '', username: '', email: '', password: '', phone: '', role: 'RESTAURANT_ADMIN_ROLE', restaurant_id: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.restaurant_id) return toast.error('Selecciona una sede asignada');

    const result = await createManager({
      name: formData.name.trim(),
      surname: formData.surname.trim(),
      username: formData.username.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phone: formData.phone.trim(),
      role: formData.role,
      restaurant_id: formData.restaurant_id,
    });

    if (result.success) {
      toast.success('¡Gerente creado exitosamente!');
      setFormData({ name: '', surname: '', username: '', email: '', password: '', phone: '', role: 'RESTAURANT_ADMIN_ROLE', restaurant_id: '' });
    } else {
      toast.error(result.error);
    }
  };

  const handleUpdateManagerRestaurant = async (managerId, newRestaurantId) => {
    if (!newRestaurantId) {
      toast.error('Selecciona una sede');
      return;
    }

    const result = await updateManagerRestaurant(managerId, newRestaurantId);
    if (result.success) {
      toast.success('Sede actualizada exitosamente');
      setEditingId(null);
    } else {
      toast.error(result.error);
    }
  };

  const handleDeleteManager = async (managerId, name) => {
    if (!window.confirm(`¿Seguro que deseas eliminar a ${name}? Esta acción es permanente.`)) return;

    const result = await deleteManager(managerId);
    if (result.success) {
      toast.success('Gerente eliminado exitosamente');
    } else {
      toast.error(result.error);
    }
  };

  return {
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
  };
};
