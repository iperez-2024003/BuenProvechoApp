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