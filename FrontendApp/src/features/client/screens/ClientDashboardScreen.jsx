import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../../shared/constants/theme';
import { restaurantService } from '../../../shared/api/axiosClient';

const ClientDashboardScreen = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    const uniqueCats = [...new Set(restaurants.map((r) => r.category))].filter(Boolean);
    setCategories(uniqueCats);
  }, [restaurants]);

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

  const filteredRestaurants = activeCategory === 'Todos'
    ? restaurants
    : restaurants.filter((r) => r.category === activeCategory);

  const featuredRestaurants = restaurants.slice(0, 4);

  const quickActions = [
    { id: 1, label: 'Explora', action: 'Ver menú', icon: '🍽️', onPress: () => {} },
    { id: 2, label: 'Eventos', action: 'Ver ofertas', icon: '🎉', onPress: () => {} },
    { id: 3, label: 'Beneficios', action: 'Mi historial', icon: '💎', onPress: () => {} },
  ];

  const renderQuickAction = (action) => (
    <TouchableOpacity
      key={action.id}
      style={styles.quickActionCard}
      onPress={action.onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.quickActionIcon}>{action.icon}</Text>
      <View>
        <Text style={styles.quickActionLabel}>{action.label}</Text>
        <Text style={styles.quickActionText}>{action.action}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryButton = (category) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryButton,
        activeCategory === category && styles.categoryButtonActive,
      ]}
      onPress={() => setActiveCategory(category)}
      activeOpacity={0.8}
    >
      <Text
        style={[
          styles.categoryButtonText,
          activeCategory === category && styles.categoryButtonTextActive,
        ]}
      >
        {category}
      </Text>
    </TouchableOpacity>
  );

  const renderRestaurantCard = (restaurant, index) => (
    <TouchableOpacity
      key={restaurant.id || index}
      style={styles.restaurantCard}
      onPress={() => {
        if (restaurant.id) {
          navigation.navigate('RestaurantMenu', { id: restaurant.id });
        } else {
          console.warn('Restaurant ID is undefined, cannot navigate');
        }
      }}
      activeOpacity={0.8}
    >
      <View style={styles.cardImageContainer}>
        <Image
          source={{
            uri: restaurant.cover_image_url || restaurant.logo_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80',
          }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={styles.cardImageOverlay} />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{restaurant.category || 'Casual'}</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.restaurantName} numberOfLines={1}>
          {restaurant.name}
        </Text>
        <View style={styles.cardInfo}>
          <Text style={styles.cardInfoText}>📍 {restaurant.address || 'Ubicación Exclusiva'}</Text>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.ratingText}>⭐ {restaurant.rating || '4.5'}</Text>
          <Text style={styles.viewMenuText}>Ver Menú →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando Experiencia...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header Premium */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>BUEN</Text>
            <Text style={[styles.logoText, styles.logoAccent]}>PROVECHO</Text>
          </View>
          <Text style={styles.headerBadge}>Dashboard Premium</Text>
          <Text style={styles.headerTitle}>
            Tu pase <Text style={styles.headerTitleAccent}>VIP</Text> al sabor
          </Text>
          <Text style={styles.headerSubtitle}>
            Gestiona tus puntos, explora las mejores sedes y reserva con un solo toque.
          </Text>
        </View>

        {/* VIP Points Card */}
        <View style={styles.vipCard}>
          <Text style={styles.vipLabel}>Nivel Comensal</Text>
          <Text style={styles.vipLevel}>Miembro Gourmet</Text>
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsText}>0</Text>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsBadgeText}>Puntos</Text>
            </View>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '0%' }]} />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atajos Premium</Text>
          <View style={styles.quickActionsContainer}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Featured Restaurants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sedes Destacadas</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
            contentContainerStyle={styles.horizontalContent}
          >
            {featuredRestaurants.map((restaurant, index) => (
              <TouchableOpacity
                key={restaurant.id || index}
                style={styles.featuredCard}
                onPress={() => navigation.navigate('RestaurantMenu', { id: restaurant.id })}
                activeOpacity={0.8}
              >
                <Image
                  source={{
                    uri: restaurant.cover_image_url || restaurant.logo_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80',
                  }}
                  style={styles.featuredImage}
                  resizeMode="cover"
                />
                <View style={styles.featuredContent}>
                  <Text style={styles.featuredCategory}>{restaurant.category || 'Casual'}</Text>
                  <Text style={styles.featuredName} numberOfLines={1}>
                    {restaurant.name}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          {renderCategoryButton('Todos')}
          {categories.map(renderCategoryButton)}
        </View>

        {/* Restaurants Grid */}
        <View style={styles.section}>
          {filteredRestaurants.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🍽️</Text>
              <Text style={styles.emptyTitle}>Sin Resultados</Text>
              <Text style={styles.emptyText}>No hay sedes en esta categoría.</Text>
            </View>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  loadingText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: COLORS.textLight,
    marginTop: SPACING.md,
  },
  header: {
    padding: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.secondary,
    ...SHADOWS.md,
  },
  logoContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  logoText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  logoAccent: {
    color: COLORS.primary,
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
  vipCard: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    ...SHADOWS.lg,
  },
  vipLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  vipLevel: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  pointsText: {
    fontSize: 48,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  pointsBadge: {
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  pointsBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.surface,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressBar: {
    height: 3,
    backgroundColor: `${COLORS.secondary}10`,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },
  quickActionsContainer: {
    gap: SPACING.sm,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    ...SHADOWS.sm,
  },
  quickActionIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },
  quickActionLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  quickActionText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  horizontalScroll: {
    marginBottom: SPACING.md,
  },
  horizontalContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  featuredCard: {
    width: 200,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  featuredImage: {
    width: '100%',
    height: 100,
  },
  featuredContent: {
    padding: SPACING.sm,
  },
  featuredCategory: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  featuredName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  categoryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 8,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.secondary,
    ...SHADOWS.sm,
  },
  categoryButtonText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  categoryButtonTextActive: {
    color: COLORS.surface,
  },
  restaurantCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    marginBottom: SPACING.md,
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
    backgroundColor: 'rgba(28, 23, 18, 0.3)',
  },
  categoryBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  categoryBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.surface,
    textTransform: 'uppercase',
  },
  cardContent: {
    padding: SPACING.md,
  },
  restaurantName: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  cardInfo: {
    marginBottom: SPACING.sm,
  },
  cardInfoText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: `${COLORS.secondary}10`,
  },
  ratingText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  viewMenuText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    padding: SPACING.xxl,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default ClientDashboardScreen;
