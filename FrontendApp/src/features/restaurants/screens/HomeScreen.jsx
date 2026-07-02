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

    const renderLoading = () => (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Sincronizando Sedes...</Text>
        </View>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyTitle}>Sin Resultados</Text>
            <Text style={styles.emptyText}>No hay sedes que coincidan con tu búsqueda.</Text>
        </View>
    );

    const renderRestaurantCard = (restaurant, index) => (
        <View key={restaurant.id || index} style={styles.card}>
            <View style={styles.cardImageContainer}>
                <Image
                    source={{ uri: getImageUrl(restaurant.cover_image_url || restaurant.logo_url) }}
                    style={styles.cardImage}
                    resizeMode="cover"
                />
                <View style={styles.cardImageOverlay} />
                <View style={styles.verificationBadge}>
                    <Text style={[
                        styles.verificationBadgeText,
                        { backgroundColor: restaurant.is_verified ? COLORS.success : COLORS.warning }
                    ]}>
                        {restaurant.is_verified ? 'Verificada' : 'Pendiente'}
                    </Text>
                </View>
            </View>

            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={styles.restaurantName} numberOfLines={1}>
                        {restaurant.name}
                    </Text>
                    <Text style={styles.priceRange}>{restaurant.price_range}</Text>
                </View>

                <View style={styles.badgesContainer}>
                    <Text style={styles.categoryBadge}>
                        {CATEGORY_LABELS[restaurant.category] || 'Otro'}
                    </Text>
                    {restaurant.cuisine_type && (
                        <Text style={styles.cuisineBadge}>{restaurant.cuisine_type}</Text>
                    )}
                </View>

                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>📍</Text>
                        <Text style={styles.infoText} numberOfLines={1}>
                            {restaurant.address}
                        </Text>
                    </View>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoIcon}>🕐</Text>
                        <Text style={styles.infoText}>
                            {restaurant.opening_time?.slice(0, 5)} - {restaurant.closing_time?.slice(0, 5)}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardActions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.secondaryButton]}
                        onPress={() => navigation.navigate('RestaurantDetail', { id: restaurant.id })}
                    >
                        <Text style={styles.secondaryButtonText}>Dashboard</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.primaryButton]}
                        onPress={() => navigation.navigate('RestaurantMenu', { id: restaurant.id })}
                    >
                        <Text style={styles.primaryButtonText}>Menú →</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

};