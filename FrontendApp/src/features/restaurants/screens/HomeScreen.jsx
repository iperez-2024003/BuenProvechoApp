import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../../shared/constants/theme';
import { restaurantService } from '../../../shared/api/axiosClient';

const { width } = Dimensions.get('window');

const CATEGORY_LABELS = {
    casual: 'Casual', fine_dining: 'Fine Dining', fast_food: 'Rápida',
    cafe: 'Café', bakery: 'Panadería', bar: 'Bar', food_truck: 'Truck',
    buffet: 'Buffet', family_style: 'Familiar', gourmet: 'Gourmet', other: 'Otro',
};

const HomeScreen = ({ navigation }) => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const fetchRestaurants = async () => {
        try {
            setLoading(true);
            const response = await restaurantService.getAll();
            setRestaurants(response.data.data || response.data || []);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
            setRestaurants([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredRestaurants = useMemo(() => {
        const q = search.toLowerCase();
        if (!q) return restaurants;
        return restaurants.filter(
            (r) =>
                r.name?.toLowerCase().includes(q) ||
                r.address?.toLowerCase().includes(q) ||
                r.cuisine_type?.toLowerCase().includes(q)
        );
    }, [restaurants, search]);

    const getImageUrl = (url) => {
        if (!url) return 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80';
        return url;
    };

};