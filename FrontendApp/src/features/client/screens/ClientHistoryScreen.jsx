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

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header Premium */}
        <View style={styles.header}>
          <Text style={styles.headerBadge}>Pasaporte Gastronómico</Text>
          <Text style={styles.headerTitle}>
            Tu <Text style={styles.headerTitleAccent}>Bitácora</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            Revive tus mejores momentos y gestiona tus experiencias pasadas en la red más exclusiva.
          </Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'orders' && styles.tabActive]}
            onPress={() => setActiveTab('orders')}
          >
            <Text style={[styles.tabText, activeTab === 'orders' && styles.tabTextActive]}>
              Pedidos ({orders.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reservations' && styles.tabActive]}
            onPress={() => setActiveTab('reservations')}
          >
            <Text style={[styles.tabText, activeTab === 'reservations' && styles.tabTextActive]}>
              Reservas ({reservations.length})
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'orders' ? (
          <>
            {/* Orders Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScrollContainer}>
              {['all', 'pending', 'preparing', 'ready', 'served', 'paid', 'cancelled'].map((status) =>
                renderFilterButton(
                  status,
                  orderFilter === status,
                  status === 'all' ? 'Todos' : STATUS_TRANSLATIONS[status] || status,
                  () => setOrderFilter(status)
                )
              )}
            </ScrollView>

            {/* Orders List */}
            <View style={styles.section}>
              {filteredOrders.map((order) => {
                const orderId = order.id || order._id;
                const statusClass = STATUS_CLASSES[order.status] || { bg: COLORS.background, text: COLORS.secondary, border: COLORS.secondary };
                return (
                  <View key={orderId} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View>
                        <Text style={styles.cardLabel}>Orden de Servicio</Text>
                        <Text style={styles.cardTitle}>#{order.order_number?.split('-').pop() || '0000'}</Text>
                        <Text style={styles.cardSub}>
                          {order.restaurant?.name || order.restaurant_name || `Sede #${order.restaurant_id}`}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: statusClass.bg, borderColor: statusClass.border },
                        ]}
                      >
                        <Text style={[styles.statusText, { color: statusClass.text }]}>
                          {STATUS_TRANSLATIONS[order.status] || order.status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardFooter}>
                      <View style={styles.cardFooterLeft}>
                        <Text style={styles.totalText}>Q{Number(order.total).toFixed(2)}</Text>
                        <TouchableOpacity style={styles.ticketButton} onPress={() => handleDownloadTicket(orderId)}>
                          <Text style={styles.ticketButtonText}>📄 Ver Ticket</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.dateText}>
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-GT') : 'Reciente'}
                      </Text>
                    </View>
                  </View>
                );
              })}
              {filteredOrders.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>📦</Text>
                  <Text style={styles.emptyTitle}>Sin órdenes registradas</Text>
                </View>
              )}
            </View>

            {/* Reviews Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Califica tu Experiencia</Text>
                <Text style={styles.sectionSubtitle}>Comparte tu paladar con la comunidad gourmet.</Text>
              </View>

              <View style={styles.reviewsGrid}>
                {completedOrders.map((order) => {
                  const orderId = order.id || order._id;
                  const isReviewed = reviewedOrders.includes(orderId);
                  return (
                    <View key={orderId} style={styles.reviewCard}>
                      <View style={styles.reviewCardHeader}>
                        <View style={styles.reviewBadge}>
                          <Text style={styles.reviewBadgeText}>Finalizado</Text>
                        </View>
                        <Text style={styles.reviewStar}>★</Text>
                      </View>
                      <Text style={styles.reviewOrderNumber}>#{order.order_number?.split('-').pop()}</Text>
                      <Text style={styles.reviewTotal}>Q{Number(order.total).toFixed(2)}</Text>
                      <TouchableOpacity
                        style={[
                          styles.reviewButton,
                          isReviewed && styles.reviewButtonDisabled,
                        ]}
                        onPress={() => !isReviewed && setReviewModal({ open: true, order })}
                        disabled={isReviewed}
                      >
                        <Text style={styles.reviewButtonText}>
                          {isReviewed ? 'Opinión Registrada' : '💬 Dejar Reseña'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
                {completedOrders.length === 0 && (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No hay pedidos completados para calificar</Text>
                  </View>
                )}
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Reservations Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScrollContainer}>
              {['all', 'confirmed', 'completed', 'cancelled'].map((status) =>
                renderFilterButton(
                  status,
                  reservationFilter === status,
                  status === 'all' ? 'Todos' : STATUS_TRANSLATIONS[status] || status,
                  () => setReservationFilter(status)
                )
              )}
            </ScrollView>

            {/* Reservations List */}
            <View style={styles.section}>
              {filteredReservations.map((res) => {
                const resId = res.id || res._id;
                const statusClass = STATUS_CLASSES[res.status] || { bg: COLORS.background, text: COLORS.secondary, border: COLORS.secondary };
                return (
                  <View key={resId} style={styles.card}>
                    <View style={styles.cardHeader}>
                      <View>
                        <Text style={styles.cardLabel}>Sede Gourmet</Text>
                        <Text style={styles.cardTitle}>{res.restaurant?.name || res.restaurant_name || 'Sede Premium'}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: statusClass.bg,
                            borderColor: statusClass.border,
                          },
                        ]}
                      >
                        <Text style={[styles.statusText, { color: statusClass.text }]}>
                          {STATUS_TRANSLATIONS[res.status] || res.status}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.cardFooter}>
                      <View style={styles.reservationInfo}>
                        <Text style={styles.reservationInfoText}>
                          ⚡ {res.reservation_date} | {res.reservation_time?.slice(0, 5)}
                        </Text>
                      </View>
                      <View style={styles.partySizeBadge}>
                        <Text style={styles.partySizeText}>{res.party_size} Comensales</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
              {filteredReservations.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>📅</Text>
                  <Text style={styles.emptyTitle}>Sin reservas registradas</Text>
                </View>
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Review Modal */}
      <Modal visible={reviewModal.open} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setReviewModal({ open: false, order: null })}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            <View style={styles.modalHeader}>
              <Text style={styles.modalBadge}>Club Gourmet</Text>
              <Text style={styles.modalTitle}>Calificar Sabor</Text>
              <Text style={styles.modalSubtitle}>Tu opinión es la brújula de nuestra excelencia.</Text>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.starsContainer}>
                <StarRating value={rating} onChange={setRating} size={40} />
              </View>

              <View style={styles.commentContainer}>
                <Text style={styles.commentLabel}>Tu Comentario</Text>
                <TextInput
                  style={styles.commentInput}
                  value={comment}
                  onChangeText={setComment}
                  placeholder="Describe los matices de tu platillo..."
                  placeholderTextColor={COLORS.textMuted}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setReviewModal({ open: false, order: null })}
              >
                <Text style={styles.modalCancelButtonText}>Omitir</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitButton} onPress={submitReview}>
                <Text style={styles.modalSubmitButtonText}>Enviar Reseña ✨</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Ticket Modal */}
      <Modal visible={!!ticketOrder} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalClose}
              onPress={() => setTicketOrder(null)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            <View style={styles.modalHeader}>
              <Text style={styles.modalBadge}>Comprobante</Text>
              <Text style={styles.modalTitle}>Ticket del Pedido</Text>
              <Text style={styles.modalSubtitle}>
                #{ticketOrder?.order_number?.split('-').pop() || '0000'} · {ticketOrder?.restaurant?.name || ticketOrder?.restaurant_name || 'Sede Premium'}
              </Text>
            </View>

            <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={{ gap: SPACING.sm, paddingBottom: SPACING.sm }}>
              <View style={styles.ticketSummaryRow}>
                <Text style={styles.ticketSummaryLabel}>Estado</Text>
                <Text style={styles.ticketSummaryValue}>{STATUS_TRANSLATIONS[ticketOrder?.status] || ticketOrder?.status}</Text>
              </View>
              <View style={styles.ticketSummaryRow}>
                <Text style={styles.ticketSummaryLabel}>Fecha</Text>
                <Text style={styles.ticketSummaryValue}>{ticketOrder?.createdAt ? new Date(ticketOrder.createdAt).toLocaleDateString('es-GT') : 'Reciente'}</Text>
              </View>

              <View style={styles.ticketItemsBox}>
                {(ticketOrder?.items || []).map((item, index) => (
                  <View key={item.id || `${item.menu_item_id}-${index}`} style={styles.ticketItemRow}>
                    <Text style={styles.ticketItemName}>{item.MenuItem?.name || item.name || 'Platillo'}</Text>
                    <Text style={styles.ticketItemQty}>x{item.quantity}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.ticketSummaryRow}>
                <Text style={styles.ticketSummaryLabel}>Total</Text>
                <Text style={styles.ticketSummaryTotal}>Q{Number(ticketOrder?.total || 0).toFixed(2)}</Text>
              </View>
            </ScrollView>

            <TouchableOpacity style={styles.modalSubmitButton} onPress={() => setTicketOrder(null)}>
              <Text style={styles.modalSubmitButtonText}>Cerrar Ticket</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    paddingTop: 50,
    borderBottomWidth: 4,
    borderColor: COLORS.secondary,
  },
  headerBadge: {
    fontSize: 9,
    fontWeight: '950',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    marginBottom: SPACING.xs,
    alignSelf: 'flex-start',
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  headerTitleAccent: {
    color: COLORS.surface,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.secondary,
    marginTop: SPACING.xxs,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderBottomWidth: 3,
    borderColor: COLORS.secondary,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: `${COLORS.primary}20`,
  },
  tabText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: COLORS.secondary,
  },
  filtersScrollContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  filterButtonText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  filterButtonTextActive: {
    color: COLORS.surface,
  },
  section: {
    padding: SPACING.md,
  },
  sectionHeader: {
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  cardLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xxs,
  },
  cardTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  cardSub: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textLight,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderWidth: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderColor: `${COLORS.secondary}10`,
  },
  cardFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  totalText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  ticketButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: 6,
  },
  ticketButtonText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textMuted,
  },
  reservationInfo: {
    flex: 1,
  },
  reservationInfoText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  partySizeBadge: {
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: 6,
  },
  partySizeText: {
    fontSize: 10,
    fontWeight: '850',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    padding: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: SPACING.xs,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  emptyText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textLight,
    textAlign: 'center',
    paddingVertical: SPACING.xs,
  },
  reviewsGrid: {
    gap: SPACING.sm,
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    padding: SPACING.md,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  reviewBadge: {
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xxs,
    borderRadius: 4,
  },
  reviewBadgeText: {
    fontSize: 8,
    fontWeight: '850',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  reviewStar: {
    fontSize: 18,
    color: COLORS.primaryDark,
  },
  reviewOrderNumber: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  reviewTotal: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: SPACING.sm,
  },
  reviewButton: {
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  reviewButtonDisabled: {
    backgroundColor: COLORS.textMuted,
    borderColor: COLORS.textMuted,
    elevation: 0,
    shadowOpacity: 0,
  },
  reviewButtonText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.surface,
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 23, 18, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    padding: SPACING.md,
    width: '100%',
    borderWidth: 4,
    borderColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  modalClose: {
    alignSelf: 'flex-end',
    padding: SPACING.xs,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  modalHeader: {
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  modalBadge: {
    fontSize: 9,
    fontWeight: '950',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    borderRadius: 6,
    marginBottom: SPACING.xs,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  modalSubtitle: {
    fontSize: 11,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  modalBody: {
    marginBottom: SPACING.md,
    gap: SPACING.md,
  },
  starsContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  commentContainer: {
    gap: SPACING.xs,
  },
  commentLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  commentInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textLight,
    textTransform: 'uppercase',
  },
  modalSubmitButton: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  modalSubmitButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.surface,
    textTransform: 'uppercase',
  },
  ticketSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  ticketSummaryLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.textLight,
    textTransform: 'uppercase',
  },
  ticketSummaryValue: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  ticketSummaryTotal: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  ticketItemsBox: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  ticketItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketItemName: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.secondary,
    paddingRight: SPACING.sm,
  },
  ticketItemQty: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
});

export default ClientHistoryScreen;