import { useRestaurantStore } from '../store/useRestaurantStore';
import { showSuccess, showError } from '../../../shared/utils/toast';

/**
 * Hook que abstrae la lógica de crear o editar un restaurante.
 * Si se pasa un `id`, actualiza. Si no, crea uno nuevo.
 */
export const useSaveRestaurant = () => {
  const { createRestaurant, updateRestaurant } = useRestaurantStore();

  const saveRestaurant = async (data, id = null) => {
    const result = id
      ? await updateRestaurant(id, data)
      : await createRestaurant(data);

    if (result.success) {
      showSuccess(result.message || (id ? 'Restaurante actualizado' : 'Restaurante creado exitosamente'));
    } else {
      showError(result.error || 'Ocurrió un error inesperado');
    }

    return result;
  };

  return { saveRestaurant };
};
