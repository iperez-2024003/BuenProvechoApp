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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../../shared/constants/theme';
import { restaurantService } from '../../../shared/api/axiosClient';

const ClientDashboardScreen = ({ navigation }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [categories, setCategories] = useState([]);
  const [user, setUser] = useState(null);

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

  const quickActions = [
    { id: 1, label: 'Explora', action: 'Ver menú', icon: '🍽️', onPress: () => {
      Alert.alert('Explorar', 'Selecciona una sede de la lista abajo para ver su menú gourmet.');
    } },
    { id: 2, label: 'Eventos', action: 'Ver ofertas', icon: '🎉', onPress: () => navigation.navigate('Events') },
    { id: 3, label: 'Beneficios', action: 'Mi historial', icon: '💎', onPress: () => navigation.navigate('ClientHistory') },
  ];

  // Helper for VIP Level calculation
  const getVipLevelInfo = (pts = 0) => {
    if (pts >= 300) {
      return { level: 'Miembro Platino 👑', color: '#ec4899', progress: 100, next: 'Máximo nivel' };
    } else if (pts >= 150) {
      return { level: 'Miembro Oro 🌟', color: COLORS.primaryDark, progress: ((pts - 150) / 150) * 100, next: `${300 - pts} pts para Platino` };
    } else {
      return { level: 'Miembro Gourmet 💎', color: COLORS.secondary, progress: (pts / 150) * 100, next: `${150 - pts} pts para Oro` };
    }
  };

  const vipInfo = getVipLevelInfo(user?.points || 0);

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
        if (restaurant.id || restaurant._id) {
          navigation.navigate('RestaurantMenu', { id: restaurant.id || restaurant._id });
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
          {user && (
            <Text style={styles.welcomeText}>¡Hola, {user.name || user.username}! 👋</Text>
          )}
        </View>

        {/* VIP Points Card */}
        <View style={styles.vipCard}>
          <Text style={styles.vipLabel}>Nivel Comensal</Text>
          <Text style={[styles.vipLevel, { color: vipInfo.color }]}>{vipInfo.level}</Text>
          
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsText}>{user?.points || 0}</Text>
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

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atajos Premium</Text>
          <View style={styles.quickActionsContainer}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>