import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { orderService } from '../../../shared/api/axiosClient';

const useCartStore = create((set, get) => ({
    cart: [],
    restaurantId: null,
    loading: false,
    error: null,

    createOrder: async (orderData) => {
        set({ loading: true, error: null });
        try {
            const response = await orderService.create(orderData);
            get().clearCart();
            set({ loading: false });
            return response.data;
        } catch (error) {
            const errMsg = error.response?.data?.message || error.message || 'Error al crear la orden';
            set({ loading: false, error: errMsg });
            throw error;
        }
    },

    addToCart: (item, restaurantId) => {
        const currentCart = get().cart;
        const currentRestaurantId = get().restaurantId;

        // If adding from different restaurant, clear cart first
        if (currentRestaurantId && currentRestaurantId !== restaurantId) {
            set({ cart: [item], restaurantId });
            saveCartToStorage([item], restaurantId);
            return;
        }

        // Check if item already exists in cart
        const existingItemIndex = currentCart.findIndex(
            (cartItem) => cartItem.menuItemId === item.menuItemId
        );

        let newCart;
        if (existingItemIndex >= 0) {
            // Update quantity if item exists
            newCart = currentCart.map((cartItem, index) =>
                index === existingItemIndex
                    ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
                    : cartItem
            );
        } else {
            // Add new item
            newCart = [...currentCart, item];
        }

        set({ cart: newCart, restaurantId });
        saveCartToStorage(newCart, restaurantId);
    },

    removeFromCart: (menuItemId) => {
        const currentCart = get().cart;
        const newCart = currentCart.filter((item) => item.menuItemId !== menuItemId);
        set({ cart: newCart });
        saveCartToStorage(newCart, get().restaurantId);
    },

    updateQuantity: (menuItemId, quantity) => {
        const currentCart = get().cart;
        if (quantity <= 0) {
            get().removeFromCart(menuItemId);
            return;
        }
        const newCart = currentCart.map((item) =>
            item.menuItemId === menuItemId ? { ...item, quantity } : item
        );
        set({ cart: newCart });
        saveCartToStorage(newCart, get().restaurantId);
    },

    clearCart: () => {
        set({ cart: [], restaurantId: null });
        saveCartToStorage([], null);
    },

    getCartTotal: () => {
        const cart = get().cart;
        return cart.reduce((total, item) => total + item.price * item.quantity, 0);
    },

    getCartItemCount: () => {
        const cart = get().cart;
        return cart.reduce((count, item) => count + item.quantity, 0);
    },
}));

// Helper functions for AsyncStorage
const saveCartToStorage = async (cart, restaurantId) => {
    try {
        if (AsyncStorage && typeof AsyncStorage.setItem === 'function') {
            await AsyncStorage.setItem('cart', JSON.stringify(cart));
            await AsyncStorage.setItem('restaurantId', restaurantId || '');
        }
    } catch (error) {
        console.error('Error saving cart to AsyncStorage:', error);
    }
};

const loadCartFromStorage = async () => {
    try {
        if (AsyncStorage && typeof AsyncStorage.getItem === 'function') {
            const cartJson = await AsyncStorage.getItem('cart');
            const restaurantId = await AsyncStorage.getItem('restaurantId');
            if (cartJson) {
                return {
                    cart: JSON.parse(cartJson),
                    restaurantId: restaurantId || null,
                };
            }
        }
    } catch (error) {
        console.error('Error loading cart from AsyncStorage:', error);
    }
    return { cart: [], restaurantId: null };
};

// Load cart on app start
loadCartFromStorage().then(({ cart, restaurantId }) => {
    useCartStore.setState({ cart, restaurantId });
});

export default useCartStore;