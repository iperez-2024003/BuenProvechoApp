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
  casual: 'Casual',
  fine_dining: 'Fine Dining',
  fast_food: 'Rápida',
  cafe: 'Café',
  bakery: 'Panadería',
  bar: 'Bar',
  food_truck: 'Truck',
  buffet: 'Buffet',
  family_style: 'Familiar',
  gourmet: 'Gourmet',
  other: 'Otro',
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

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerBadge}>Red de Negocios</Text>
          <Text style={styles.headerTitle}>
            Gestión de <Text style={styles.headerTitleAccent}>Sedes</Text>
          </Text>
          <Text style={styles.headerSubtitle}>Supervisa y controla todos los establecimientos activos.</Text>
        </View>

        {/* Buscador */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, dirección o especialidad..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Lista de Restaurantes */}
        <View style={styles.listContainer}>
          {loading ? (
            renderLoading()
          ) : filteredRestaurants.length === 0 ? (
            renderEmpty()
          ) : (
            filteredRestaurants.map((restaurant, index) => renderRestaurantCard(restaurant, index))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
    padding: SPACING.lg,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  headerBadge: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZE.huge,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: -1,
    lineHeight: 38,
  },
  headerTitleAccent: {
    color: COLORS.primary,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 16,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.xl,
    ...SHADOWS.sm,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    paddingVertical: SPACING.md,
  },
  listContainer: {
    minHeight: 400,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: COLORS.textLight,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    color: COLORS.textLight,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 16,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  cardImageContainer: {
    height: 160,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 37, 48, 0.3)',
  },
  verificationBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
  verificationBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    textTransform: 'uppercase',
  },
  cardContent: {
    padding: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  restaurantName: {
    flex: 1,
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    marginRight: SPACING.sm,
  },
  priceRange: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    color: COLORS.primary,
    backgroundColor: `${COLORS.primary}15`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  categoryBadge: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.primary,
    backgroundColor: `${COLORS.primary}20`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  cuisineBadge: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.textLight,
    backgroundColor: `${COLORS.border}50`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  infoContainer: {
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  infoIcon: {
    fontSize: 14,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  secondaryButtonText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
  },
  primaryButtonText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.surface,
    textTransform: 'uppercase',
  },
});

export default HomeScreen;
