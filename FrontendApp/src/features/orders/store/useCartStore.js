import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { orderService } from '../../../shared/api/axiosClient';


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