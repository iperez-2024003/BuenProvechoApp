import { useEffect } from 'react';
import { useUsersStore } from '../store/useUsersStore';

export const useVipClients = () => {
  const { vipClients, loading, fetchVipClients } = useUsersStore();

  useEffect(() => {
    fetchVipClients();
  }, [fetchVipClients]);

  return {
    clients: vipClients,
    loading,
  };
};
