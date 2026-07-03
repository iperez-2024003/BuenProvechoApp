import { create } from 'zustand';

const useNotificationStore = create((set) => ({
  visible: false,
  message: '',
  type: 'info',
  show: (message, type = 'info') => {
    set({ visible: true, message, type });
  },
  hide: () => {
    set({ visible: false, message: '', type: 'info' });
  },
}));

export default useNotificationStore;
