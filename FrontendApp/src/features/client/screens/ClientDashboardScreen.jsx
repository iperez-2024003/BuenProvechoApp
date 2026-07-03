import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZE, SHADOWS, FONTS } from '../../../shared/constants/theme';
import { restaurantService } from '../../../shared/api/axiosClient';
import useAuthStore from '../../profile/store/useAuthStore';
import useNotificationStore from '../../../shared/stores/useNotificationStore';
import { UtensilsCrossed, MapPin, Star, Sparkles, Gem, Hand } from 'lucide-react-native';

const getVipLevelInfo = (pts = 0) => {
  if (pts >= 300) {
    return { level: 'Miembro Platino', color: '#ec4899', progress: 100, next: 'Maximo nivel' };
  } else if (pts >= 150) {
    return { level: 'Miembro Oro', color: COLORS.primaryDark, progress: ((pts - 150) / 150) * 100, next: `${300 - pts} pts para Platino` };
  } else {
    return { level: 'Miembro Gourmet', color: COLORS.secondary, progress: (pts / 150) * 100, next: `${150 - pts} pts para Oro` };
  }
};

const ClientDashboardScreen = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);
  const points = useAuthStore((state) => state.points);
  const showNotification = useNotificationStore((s) => s.show);

  useEffect(() => {
    fetchRestaurants();
    loadUser();

    const unsubscribe = navigation.addListener('focus', () => {
      loadUser();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const uniqueCats = [...new Set(restaurants.map((r) => r.category))].filter(Boolean);
    setCategories(uniqueCats);
  }, [restaurants]);

  const loadUser = async () => {
    try {
      const userDataJson = await AsyncStorage.getItem('userData');
      if (userDataJson) {
        setUser(JSON.parse(userDataJson));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user in ClientDashboard:', error);
    }
  };

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

  const handleRestaurantPress = useCallback((restaurant) => {
    const id = restaurant.id || restaurant._id;
    if (id) {
      navigation.navigate('RestaurantMenu', { id });
    }
  }, [navigation]);

  const handleFeaturedPress = useCallback((restaurant) => {
    const id = restaurant.id || restaurant._id;
    if (id) {
      navigation.navigate('RestaurantMenu', { id });
    }
  }, [navigation]);

  const handleCategoryPress = useCallback((category) => {
    setActiveCategory(category);
  }, []);

  const handleExplorePress = useCallback(() => {
    showNotification('Selecciona una sede de la lista abajo para ver su menú gourmet.', 'info');
  }, []);

  const handleEventsPress = useCallback(() => {
    showNotification('Los eventos y promociones se muestran dentro de cada restaurante al entrar a su menú.', 'info');
  }, []);

  const handleHistoryPress = useCallback(() => {
    navigation.navigate('ClientHistory');
  }, [navigation]);

  const quickActions = useMemo(() => [
    { id: 1, label: 'Explora', action: 'Ver menú', onPress: handleExplorePress },
    { id: 2, label: 'Eventos', action: 'Ver ofertas', onPress: handleEventsPress },
    { id: 3, label: 'Beneficios', action: 'Mi historial', onPress: handleHistoryPress },
  ], [handleExplorePress, handleEventsPress, handleHistoryPress]);

  const renderQuickAction = useCallback((action) => (
    <TouchableOpacity
      key={action.id}
      style={styles.quickActionCard}
      onPress={action.onPress}
      activeOpacity={0.8}
    >
      {action.id === 1 && <UtensilsCrossed size={24} color={COLORS.secondary} strokeWidth={2.5} style={{marginRight: SPACING.md}} />}
      {action.id === 2 && <Sparkles size={24} color={COLORS.secondary} strokeWidth={2.5} style={{marginRight: SPACING.md}} />}
      {action.id === 3 && <Gem size={24} color={COLORS.secondary} strokeWidth={2.5} style={{marginRight: SPACING.md}} />}
      <View>
        <Text style={styles.quickActionLabel}>{action.label}</Text>
        <Text style={styles.quickActionText}>{action.action}</Text>
      </View>
    </TouchableOpacity>
  ), []);

  const vipInfo = getVipLevelInfo(points || 0);

  const renderRestaurantCard = useCallback(({ item }) => (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() => handleRestaurantPress(item)}
      activeOpacity={0.8}
    >
      <Image
        source={{
          uri: item.cover_image_url || item.logo_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80',
        }}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <View style={styles.cardGradient} />
      <View style={styles.cardContent}>
        <Text style={styles.cardCategory}>{item.category || 'Casual'}</Text>
        <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.cardFooter}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <MapPin size={12} color={COLORS.primaryLight} strokeWidth={2.5} />
            <Text style={styles.cardAddress}> {item.address || 'Ubicación Exclusiva'}</Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Star size={14} color={COLORS.primary} strokeWidth={2.5} />
            <Text style={styles.cardRating}> {item.rating || '4.5'}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  ), [handleRestaurantPress]);

  const renderHeader = useCallback(() => (
    <View>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoText}>BUEN</Text>
          <Text style={[styles.logoText, styles.logoAccent]}>PROVECHO</Text>
        </View>
        <Text style={styles.headerBadge}>Dashboard Premium</Text>
        <Text style={styles.headerTitle}>
          Tu pase <Text style={styles.headerTitleAccent}>VIP</Text> al sabor
        </Text>
        {user && (
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={styles.welcomeText}>¡Hola, {user.name || user.username}!</Text>
            <Hand size={16} color={COLORS.secondary} strokeWidth={2.5} style={{marginLeft: 4}} />
          </View>
        )}
      </View>

      <View style={styles.vipCard}>
        <Text style={styles.vipLabel}>Nivel Comensal</Text>
        <Text style={[styles.vipLevel, { color: vipInfo.color }]}>{vipInfo.level}</Text>

        <View style={styles.pointsContainer}>
          <Text style={styles.pointsText}>{points || 0}</Text>
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsBadgeText}>Puntos</Text>
          </View>
        </View>

        <View style={styles.progressRow}>
          <Text style={styles.progressNextLabel}>{vipInfo.next}</Text>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${vipInfo.progress}%`, backgroundColor: vipInfo.color }]} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Atajos Premium</Text>
        <View style={styles.quickActionsContainer}>
          {quickActions.map(renderQuickAction)}
        </View>
      </View>

      {featuredRestaurants.length > 0 && (
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
                key={restaurant.id || restaurant._id || index}
                style={styles.featuredCard}
                onPress={() => handleFeaturedPress(restaurant)}
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
      )}

      <View style={styles.categoriesContainer}>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            activeCategory === 'Todos' && styles.categoryButtonActive,
          ]}
          onPress={() => handleCategoryPress('Todos')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.categoryButtonText,
              activeCategory === 'Todos' && styles.categoryButtonTextActive,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              activeCategory === category && styles.categoryButtonActive,
            ]}
            onPress={() => handleCategoryPress(category)}
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
        ))}
      </View>
    </View>
  ), [user, vipInfo, featuredRestaurants, activeCategory, categories, quickActions, renderQuickAction, handleCategoryPress, handleFeaturedPress]);

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
      <FlatList
        data={filteredRestaurants}
        renderItem={renderRestaurantCard}
        keyExtractor={(item) => (item.id || item._id).toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <UtensilsCrossed size={64} color={COLORS.secondary} strokeWidth={2} />
            <Text style={styles.emptyTitle}>Sin Resultados</Text>
            <Text style={styles.emptyText}>No hay sedes en esta categoría.</Text>
          </View>
        }
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flatListContent: {
    paddingBottom: SPACING.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    fontFamily: FONTS.black,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: COLORS.textLight,
    marginTop: SPACING.md,
  },
  header: {
    padding: SPACING.xl,
    paddingTop: 50,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 4,
    borderColor: COLORS.secondary,
  },
  logoContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  logoText: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  logoAccent: {
    color: COLORS.primary,
  },
  headerBadge: {
    fontSize: 9,
    fontWeight: '950',
    fontFamily: FONTS.black,
    color: COLORS.primaryDark,
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
    color: COLORS.primaryDark,
  },
  welcomeText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginTop: SPACING.sm,
  },
  vipCard: {
    margin: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 3,
    borderColor: COLORS.secondary,
    borderRadius: 16,
    ...SHADOWS.lg,
  },
  vipLabel: {
    fontSize: 10,
    fontWeight: '950',
    fontFamily: FONTS.black,
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  vipLevel: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    fontFamily: FONTS.black,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  pointsText: {
    fontSize: 48,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
  },
  pointsBadge: {
    marginLeft: SPACING.sm,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
  },
  pointsBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.surface,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  progressNextLabel: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    color: COLORS.textLight,
    textTransform: 'uppercase',
  },
  progressBar: {
    height: 10,
    backgroundColor: `${COLORS.secondary}15`,
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
  },
  progressFill: {
    height: '100%',
  },
  section: {
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    fontFamily: FONTS.black,
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
    borderRadius: 14,
    ...SHADOWS.md,
  },
  quickActionLabel: {
    fontSize: 9,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  quickActionText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  horizontalScroll: {
    marginBottom: SPACING.md,
  },
  horizontalContent: {
    paddingHorizontal: SPACING.xs,
    gap: SPACING.md,
  },
  featuredCard: {
    width: 200,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 14,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  featuredImage: {
    width: '100%',
    height: 100,
  },
  featuredContent: {
    padding: SPACING.sm,
  },
  featuredCategory: {
    fontSize: 9,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xxs,
  },
  featuredName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  categoryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm - 2,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 10,
    ...SHADOWS.sm,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  categoryButtonText: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  categoryButtonTextActive: {
    color: COLORS.surface,
  },
  restaurantCard: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    position: 'relative',
    ...SHADOWS.md,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '65%',
    backgroundColor: 'rgba(28, 23, 18, 0.7)',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.md,
  },
  cardCategory: {
    fontSize: 9,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xxs,
  },
  cardName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.surface,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardAddress: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    color: COLORS.primaryLight,
    textTransform: 'uppercase',
  },
  cardRating: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.primary,
  },
  emptyContainer: {
    padding: SPACING.xxl,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderStyle: 'dashed',
    borderRadius: 16,
    alignItems: 'center',
    marginHorizontal: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  emptyText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});

export default ClientDashboardScreen;
