import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import StarRating from '../../../shared/components/common/StarRating';
import { orderService, reservationService, restaurantService } from '../../../shared/api/axiosClient';

const STATUS_CLASSES = {
  pending: { bg: '#fffaf3', text: COLORS.warning, border: COLORS.secondary },
  preparing: { bg: '#fffaf3', text: COLORS.info, border: COLORS.secondary },
  ready: { bg: '#fffaf3', text: COLORS.success, border: COLORS.secondary },
  served: { bg: COLORS.secondary, text: COLORS.surface, border: COLORS.primary },
  paid: { bg: COLORS.success, text: COLORS.surface, border: COLORS.secondary },
  confirmed: { bg: COLORS.info, text: COLORS.surface, border: COLORS.secondary },
  completed: { bg: COLORS.secondary, text: COLORS.surface, border: COLORS.primary },
  cancelled: { bg: COLORS.textMuted, text: COLORS.textLight, border: COLORS.secondary },
};

const STATUS_TRANSLATIONS = {
  pending: 'Pendiente',
  preparing: 'Preparando',
  ready: 'Listo',
  served: 'Servido',
  paid: 'Pagado',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

const ClientHistoryScreen = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [activeTab, setActiveTab] = useState('orders');
  const [orderFilter, setOrderFilter] = useState('all');
  const [reservationFilter, setReservationFilter] = useState('all');
  
  const [reviewModal, setReviewModal] = useState({ open: false, order: null });
  const [ticketOrder, setTicketOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewedOrders, setReviewedOrders] = useState([]);

  const fetchData = useCallback(async (userId) => {
    try {
      const [ordersRes, reservationsRes] = await Promise.all([
        orderService.getByUser(userId),
        reservationService.getByUser(userId),
      ]);
      
      setOrders(ordersRes.data?.data || ordersRes.data || []);
      setReservations(reservationsRes.data?.data || reservationsRes.data || []);
    } catch (error) {
      console.error('Error fetching history data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadUserAndData = useCallback(async () => {
    try {
      const userDataJson = await AsyncStorage.getItem('userData');
      if (userDataJson) {
        const currentUser = JSON.parse(userDataJson);
        setUser(currentUser);
        fetchData(currentUser.id || currentUser._id);
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading user in ClientHistoryScreen:', error);
      setLoading(false);
    }
  }, [fetchData]);

  useEffect(() => {
    loadUserAndData();
  }, [loadUserAndData]);

  const onRefresh = () => {
    setRefreshing(true);
    if (user) {
      fetchData(user.id || user._id);
    } else {
      loadUserAndData();
    }
  };

  const completedOrders = orders.filter((order) => ['served', 'paid'].includes(order.status));

  const filteredOrders = orderFilter === 'all' 
    ? orders 
    : orders.filter((order) => order.status === orderFilter);

  const filteredReservations = reservationFilter === 'all'
    ? reservations
    : reservations.filter((res) => res.status === reservationFilter);

  const handleDownloadTicket = (orderId) => {
    const order = orders.find((item) => (item.id || item._id) === orderId);
    if (!order) {
      Alert.alert('Ticket', 'No se encontró la orden seleccionada.');
      return;
    }
    setTicketOrder(order);
  };

  const submitReview = async () => {
    if (!reviewModal.order) return;
    setLoading(true);
    try {
      const reviewPayload = {
        restaurant_id: reviewModal.order.restaurant_id,
        user_id: user.id || user._id,
        customer_name: user.name || user.username || 'Cliente VIP',
        rating,
        comment: comment.trim(),
      };
      
      await restaurantService.createReview(reviewPayload);
      Alert.alert('Éxito', '¡Gracias por compartir tu opinión gourmet!');
      setReviewedOrders((prev) => [...prev, reviewModal.order.id || reviewModal.order._id]);
      setReviewModal({ open: false, order: null });
      setRating(5);
      setComment('');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Error al enviar la reseña';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const renderFilterButton = (statusKey, currentFilter, label, onPress) => {
    const active = currentFilter === statusKey;
    return (
      <TouchableOpacity
        key={statusKey}
        onPress={onPress}
        style={[styles.filterButton, active && styles.filterButtonActive]}
      >
        <Text style={[styles.filterButtonText, active && styles.filterButtonTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando Bitácora...</Text>
      </View>
    );
  }