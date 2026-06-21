import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import { orderService } from '../../../shared/api/axiosClient';

const STATUS_LABELS = {
  pending: { label: 'Pendiente ⏳', bg: COLORS.warning, color: COLORS.secondary },
  preparing: { label: 'Preparando 🍳', bg: COLORS.info, color: '#ffffff' },
  ready: { label: 'Listo! 🛎️', bg: COLORS.success, color: '#ffffff' },
  served: { label: 'Servido ✅', bg: '#6b5e4e', color: '#ffffff' },
  paid: { label: 'Pagado/Entregado ✅', bg: '#6b5e4e', color: '#ffffff' },
  cancelled: { label: 'Cancelado ❌', bg: COLORS.error, color: '#ffffff' },
};

const ORDER_TYPES = {
  dine_in: 'Salón 🍽️',
  takeout: 'Llevar 📦',
  delivery: 'Delivery 🚚',
};

const OrdersScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'

  const fetchOrders = useCallback(async (userId) => {
    try {
      const response = await orderService.getByUser(userId);
      // Backend might wrap data in data.data or return directly
      const ordersList = response.data?.data || response.data || [];
      setOrders(Array.isArray(ordersList) ? ordersList : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'No se pudieron cargar tus pedidos.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadUserAndFetch = useCallback(async () => {
    try {
      const userDataJson = await AsyncStorage.getItem('userData');
      if (userDataJson) {
        const currentUser = JSON.parse(userDataJson);
        setUser(currentUser);
        fetchOrders(currentUser.id || currentUser._id);
      } else {
        setUser(null);
        setOrders([]);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error loading user data in OrdersScreen:', error);
      setLoading(false);
    }
  }, [fetchOrders]);

  useEffect(() => {
    // Initial fetch
    loadUserAndFetch();

    // Re-fetch when the screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserAndFetch();
    });

    return unsubscribe;
  }, [navigation, loadUserAndFetch]);

  const onRefresh = () => {
    setRefreshing(true);
    if (user) {
      fetchOrders(user.id || user._id);
    } else {
      loadUserAndFetch();
    }
  };

  const activeOrders = orders.filter((o) =>
    ['pending', 'preparing', 'ready'].includes(o.status)
  );

  const pastOrders = orders.filter((o) =>
    ['served', 'paid', 'cancelled'].includes(o.status)
  );

  const displayedOrders = activeTab === 'active' ? activeOrders : pastOrders;

  const renderOrderItem = ({ item }) => {
    const statusInfo = STATUS_LABELS[item.status] || {
      label: item.status?.toUpperCase() || 'DESCONOCIDO',
      bg: COLORS.secondary,
      color: COLORS.surface,
    };

    const formattedDate = item.createdAt
      ? new Date(item.createdAt).toLocaleDateString('es-GT', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        })
      : 'Fecha reciente';

    return (
      <View style={styles.orderCard}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderNumber}>
              #{item.order_number?.split('-').pop() || item.id?.substring(18) || '0000'}
            </Text>
            <Text style={styles.restaurantName}>
              {item.restaurant?.name || item.restaurant_name || `Sede #${item.restaurant_id?.substring(18) || item.restaurant_id}`}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Text style={[styles.statusBadgeText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>
        </View>

        {/* Card Middle */}
        <View style={styles.cardMiddle}>
          <Text style={styles.itemSummary}>
            {item.items?.map((it) => `${it.quantity}x ${it.name || 'Platillo'}`).join(', ') ||
              'Detalles del pedido'}
          </Text>
          <Text style={styles.orderDate}>📅 {formattedDate}</Text>
        </View>

        {/* Card Footer */}
        <View style={styles.cardFooter}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeBadgeText}>
              {ORDER_TYPES[item.order_type] || item.order_type || 'Pedido'}
            </Text>
          </View>
          <Text style={styles.orderTotal}>Q{Number(item.total).toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando Pedidos...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.lockIcon}>🔒</Text>
        <Text style={styles.lockTitle}>Acceso Restringido</Text>
        <Text style={styles.lockSubtitle}>
          Debes iniciar sesión para ver y dar seguimiento a tus pedidos.
        </Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            })
          }
        >
          <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Screen Title */}
      <View style={styles.header}>
        <Text style={styles.title}>Mis Pedidos</Text>
        <Text style={styles.subtitle}>Sigue tus delicias en tiempo real</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'active' && styles.tabButtonActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text
            style={[styles.tabButtonText, activeTab === 'active' && styles.tabButtonTextActive]}
          >
            Activos ({activeOrders.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'history' && styles.tabButtonActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text
            style={[styles.tabButtonText, activeTab === 'history' && styles.tabButtonTextActive]}
          >
            Historial ({pastOrders.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={displayedOrders}
        keyExtractor={(item) => item.id || item._id}
        renderItem={renderOrderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🍳</Text>
            <Text style={styles.emptyTitle}>Sin Pedidos</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'active'
                ? 'No tienes ningún pedido preparándose en este momento.'
                : 'Tu historial de pedidos está vacío.'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 4,
    borderColor: COLORS.secondary,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: SPACING.xxs,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: COLORS.textLight,
    marginTop: SPACING.md,
  },
  lockIcon: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },
  lockTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  lockSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  loginButton: {
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    color: COLORS.surface,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.xs,
  },
  tabButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 10,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  tabButtonActive: {
    backgroundColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  tabButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  tabButtonTextActive: {
    color: COLORS.surface,
  },
  listContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  orderCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 3,
    borderColor: COLORS.secondary,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 2,
    borderColor: `${COLORS.secondary}15`,
    paddingBottom: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  orderNumber: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  restaurantName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
    marginTop: SPACING.xxs,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  cardMiddle: {
    marginBottom: SPACING.sm,
    gap: SPACING.xxs,
  },
  itemSummary: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  orderDate: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textMuted,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 2,
    borderColor: `${COLORS.secondary}15`,
  },
  typeBadge: {
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    borderRadius: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  orderTotal: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  emptyContainer: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
});

export default OrdersScreen;
