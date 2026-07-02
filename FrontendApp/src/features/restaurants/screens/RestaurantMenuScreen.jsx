import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    TextInput,
    ActivityIndicator,
    Modal
} from 'react-native';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../../shared/constants/theme';
import { restaurantService, menuService } from '../../../shared/api/axiosClient';
import useCartStore from '../../orders/store/useCartStore';
import { CartModal } from '../../orders/components/CartModal';
import ReservationModal from '../../reservations/components/ReservationModal';

const RestaurantMenuScreen = ({ route }) => {
    const { id } = route.params;
    const [restaurant, setRestaurant] = useState(null);
    const [menus, setMenus] = useState([]);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeCategory, setActiveCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [itemQuantities, setItemQuantities] = useState({});
    const [itemNotes, setItemNotes] = useState({});
    const [cartOpen, setCartOpen] = useState(false);
    const [reservationOpen, setReservationOpen] = useState(false);

    const { cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartItemCount } = useCartStore();

    useEffect(() => {
        if (!id) {
            setError('ID de restaurante no proporcionado');
            setLoading(false);
            return;
        }
        fetchRestaurantData();
    }, [id]);

    const fetchRestaurantData = async () => {
        try {
            setLoading(true);
            setError(null);

            const resRest = await restaurantService.getById(id);
            setRestaurant(resRest.data.data || resRest.data);

            try {
                const resMenus = await menuService.getAll(id);
                setMenus(resMenus.data.data || resMenus.data || []);
            } catch (menuError) {
                console.error('Error fetching menus:', menuError);
                setMenus([]);
            }

            try {
                const resItems = await menuService.getAllItems({ restaurant_id: id });
                setItems(resItems.data.data || resItems.data || []);
            } catch (itemsError) {
                console.error('Error fetching menu items:', itemsError);
                setItems([]);
            }
        } catch (error) {
            console.error('Error fetching restaurant data:', error);
            setError('No se pudo cargar la información del restaurante');
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = (itemId, delta) => {
        setItemQuantities((prev) => ({
            ...prev,
            [itemId]: Math.max(1, (prev[itemId] || 1) + delta),
        }));
    };

    const handleAddToCart = (item) => {
        const quantity = itemQuantities[item.id] || 1;
        const notes = itemNotes[item.id] || '';

        addToCart(
            {
                menuItemId: item.id,
                name: item.name,
                price: item.price,
                quantity,
                notes,
            },
            id
        );

        setItemQuantities((prev) => ({ ...prev, [item.id]: 1 }));
        setItemNotes((prev) => ({ ...prev, [item.id]: '' }));
    };

    const categoryItems = items.filter((item) => {
        const matchesCategory = activeCategory ? item.menu_id === activeCategory : true;
        const matchesSearch =
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

};