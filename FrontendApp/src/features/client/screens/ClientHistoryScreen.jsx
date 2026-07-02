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