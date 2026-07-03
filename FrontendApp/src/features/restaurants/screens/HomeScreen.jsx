import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  ImageBackground,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZE, SHADOWS, FONTS } from '../../../shared/constants/theme';
import { UtensilsCrossed, MapPin, Clock, Star, Search, ChevronRight } from 'lucide-react-native';
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
    if (!url) return 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800';
    return url;
  };

  const renderStars = (rating = 4.5) => {
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.3;
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < full) {
        stars.push(<Star key={i} size={12} color={COLORS.primary} fill={COLORS.primary} strokeWidth={1.5} />);
      } else if (i === full && hasHalf) {
        stars.push(<Star key={i} size={12} color={COLORS.primary} fill={COLORS.primary} strokeWidth={1.5} opacity={0.5} />);
      } else {
        stars.push(<Star key={i} size={12} color={COLORS.textMuted} strokeWidth={1.5} />);
      }
    }
    return stars;
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.loadingText}>Sincronizando Sedes...</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <UtensilsCrossed size={64} color={COLORS.secondary} strokeWidth={2} />
      <Text style={styles.emptyTitle}>Sin Resultados</Text>
      <Text style={styles.emptyText}>No hay sedes que coincidan con tu búsqueda.</Text>
    </View>
  );

  const renderRestaurantCard = (restaurant, index) => {
    const rating = restaurant.rating || (4.0 + Math.random() * 1.0);
    return (
    <View key={restaurant.id || index} style={styles.card}>
      <View style={styles.cardImageContainer}>
        <ImageBackground
          source={{ uri: getImageUrl(restaurant.cover_image_url || restaurant.logo_url) }}
          style={styles.cardImage}
          resizeMode="cover"
        >
          <View style={styles.cardGradientTop} />
          <View style={styles.verificationBadge}>
            <View style={[
              styles.verificationDot,
              { backgroundColor: restaurant.is_verified ? COLORS.success : COLORS.warning }
            ]} />
            <Text style={styles.verificationBadgeText}>
              {restaurant.is_verified ? 'Verificada' : 'Pendiente'}
            </Text>
          </View>
          <View style={styles.cardGradientBottom} />
          <View style={styles.cardImageContent}>
            <Text style={styles.cardRating}>
              {renderStars(rating)}
              <Text style={styles.cardRatingText}> {rating.toFixed(1)}</Text>
            </Text>
            <Text style={styles.cardName} numberOfLines={2}>
              {restaurant.name}
            </Text>
            <View style={styles.cardTags}>
              <Text style={styles.cardTag}>
                {CATEGORY_LABELS[restaurant.category] || 'Gourmet'}
              </Text>
              {restaurant.cuisine_type && (
                <Text style={styles.cardTag}>{restaurant.cuisine_type}</Text>
              )}
              {restaurant.price_range && (
                <Text style={styles.cardTag}>{restaurant.price_range}</Text>
              )}
            </View>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardInfoRow}>
          <MapPin size={13} color={COLORS.textLight} strokeWidth={2.5} />
          <Text style={styles.cardInfoText} numberOfLines={1}>
            {restaurant.address}
          </Text>
        </View>
        <View style={styles.cardInfoRow}>
          <Clock size={13} color={COLORS.textLight} strokeWidth={2.5} />
          <Text style={styles.cardInfoText}>
            {restaurant.opening_time?.slice(0, 5)} - {restaurant.closing_time?.slice(0, 5)}
          </Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.cardActionBtn}
          onPress={() => navigation.navigate('RestaurantDetail', { id: restaurant.id || restaurant._id })}
          activeOpacity={0.7}
        >
          <Text style={styles.cardActionBtnText}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.cardActionBtn, styles.cardActionBtnPrimary]}
          onPress={() => navigation.navigate('RestaurantMenu', { id: restaurant.id || restaurant._id })}
          activeOpacity={0.7}
        >
          <Text style={styles.cardActionBtnTextPrimary}>Ver Menú</Text>
          <ChevronRight size={14} color={COLORS.surface} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
    </View>
    );
  };

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
          <Search size={20} color={COLORS.textMuted} strokeWidth={2.5} style={{marginRight: SPACING.sm}} />
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
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: FONT_SIZE.huge,
    fontWeight: '900',
    fontFamily: FONTS.black,
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
    fontFamily: FONTS.bold,
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
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    fontFamily: FONTS.bold,
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
    fontFamily: FONTS.black,
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
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.text,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    fontFamily: FONTS.bold,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    marginBottom: SPACING.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.md,
    elevation: 5,
  },
  cardImageContainer: {
    height: 220,
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  cardGradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(28, 23, 18, 0.3)',
  },
  cardGradientBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(28, 23, 18, 0.65)',
  },
  cardImageContent: {
    padding: SPACING.md,
    zIndex: 2,
  },
  cardRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  cardRatingText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginLeft: 4,
  },
  cardName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.surface,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
    marginBottom: SPACING.xs,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
  },
  cardTag: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    color: COLORS.surface,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    overflow: 'hidden',
  },
  verificationBadge: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(28, 23, 18, 0.5)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 20,
    zIndex: 3,
  },
  verificationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  verificationBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    color: COLORS.surface,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardBody: {
    padding: SPACING.md,
    paddingBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  cardInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  cardInfoText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  cardActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.md,
  },
  cardActionBtn: {
    flex: 1,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    flexDirection: 'row',
    gap: 4,
  },
  cardActionBtnPrimary: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  cardActionBtnText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardActionBtnTextPrimary: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    color: COLORS.surface,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});

export default HomeScreen;
