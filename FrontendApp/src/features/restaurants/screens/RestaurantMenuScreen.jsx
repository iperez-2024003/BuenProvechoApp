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
};