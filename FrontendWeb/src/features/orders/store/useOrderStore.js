import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { pedidosApi as api } from '../../../shared/api/axios';
import { showSuccess, showError } from '../../../shared/utils/toast';

export const useOrderStore = create(
  persist(
    (set, get) => ({
      // Estado para el Cliente (Carrito)
      cart: [], // items: [{ menuItemId, quantity, price, name, notes }]
      restaurantId: null,
      
      // Estado para los Pedidos (Kanban)
      orders: [],
      loading: false,

      // --- Acciones del Carrito ---
      addToCart: (item, resId) => {
        const { cart, restaurantId } = get();
        
        // Si agrega de otro restaurante, vaciar el carrito actual
        if (restaurantId && restaurantId !== resId) {
          set({ cart: [{ ...item }], restaurantId: resId });
          showSuccess('Carrito reiniciado para nuevo restaurante');
          return;
        }

        const existingItem = cart.find((i) => i.menuItemId === item.menuItemId);
        if (existingItem) {
          const newCart = cart.map((i) =>
            i.menuItemId === item.menuItemId
              ? { ...i, quantity: i.quantity + item.quantity }
              : i
          );
          set({ cart: newCart, restaurantId: resId });
        } else {
          set({ cart: [...cart, item], restaurantId: resId });
        }
        showSuccess('Producto agregado al carrito');
      },

      removeFromCart: (menuItemId) => {
        const newCart = get().cart.filter((i) => i.menuItemId !== menuItemId);
        set({ 
          cart: newCart,
          // Si se queda vacío el carrito, limpiamos el restaurantId
          restaurantId: newCart.length === 0 ? null : get().restaurantId 
        });
      },

      clearCart: () => set({ cart: [], restaurantId: null }),

      getCartTotal: () => {
        return get().cart.reduce((total, item) => total + (item.price * item.quantity), 0);
      },

      // --- Acciones de API (Órdenes) ---
      createOrder: async (orderData) => {
        set({ loading: true });
        try {
          const res = await api.post('/orders', orderData);
          get().clearCart();
          showSuccess('Pedido creado exitosamente');
          set({ loading: false });
          return res.data.data;
        } catch (error) {
          set({ loading: false });
          showError(error.response?.data?.message || 'Error al crear el pedido');
          throw error;
        }
      },

      fetchRestaurantOrders: async (resId) => {
        set({ loading: true });
        try {
          // Asumiendo que el endpoint GET /orders permite filtrar por restaurante (o trae los del admin logueado)
          const res = await api.get(`/orders?restaurant_id=${resId}`);
          const orderData = res.data.data;
          set({ 
            orders: Array.isArray(orderData) ? orderData : (orderData?.orders || []), 
            loading: false 
          });
        } catch (error) {
          set({ loading: false });
          console.error('Error fetching orders:', error);
        }
      },

      fetchUserActiveOrders: async (userId) => {
        set({ loading: true });
        try {
          const res = await api.get(`/orders?user_id=${userId}`);
          const allOrders = res.data.data;
          // Filtrar las que no están finalizadas ni canceladas
          const active = allOrders.filter(o => !['paid', 'cancelled'].includes(o.status));
          set({ activeOrders: active, loading: false });
        } catch (error) {
          set({ loading: false });
          console.error('Error fetching active orders:', error);
        }
      },
      updateOrderStatus: async (orderId, status) => {
        try {
          await api.patch(`/orders/${orderId}/status`, { status });
          // Actualizar estado local (ambas listas)
          const updateFn = o => o.id === orderId ? { ...o, status } : o;
          set({ 
            orders: get().orders.map(updateFn),
            activeOrders: (get().activeOrders || []).map(updateFn)
          });
          showSuccess(`Pedido marcado como: ${status}`);
        } catch (error) {
          showError(error.response?.data?.message || 'Error al actualizar pedido');
        }
      }
    }),
    {
      name: 'order-storage', // persiste el carrito en localStorage
      partialize: (state) => ({ cart: state.cart, restaurantId: state.restaurantId }),
    }
  )
);
