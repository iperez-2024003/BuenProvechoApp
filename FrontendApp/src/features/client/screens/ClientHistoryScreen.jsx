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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { COLORS, SPACING, FONT_SIZE, FONTS, SHADOWS } from '../../../shared/constants/theme';
import StarRating from '../../../shared/components/common/StarRating';
import { orderService, reservationService, restaurantService } from '../../../shared/api/axiosClient';
import useNotificationStore from '../../../shared/stores/useNotificationStore';

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
  const showNotification = useNotificationStore((s) => s.show);

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
      showNotification('No se encontro la orden seleccionada.', 'error');
      return;
    }
    setTicketOrder(order);
  };

  const handleDownloadPdf = async () => {
    if (!ticketOrder) return;
    try {
      const items = ticketOrder.items || [];
      const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; background: #fff; padding: 24px; }
            .header { text-align: center; border-bottom: 4px double #000; padding-bottom: 16px; margin-bottom: 20px; }
            .header h1 { font-size: 24px; text-transform: uppercase; letter-spacing: 2px; }
            .header p { font-size: 12px; color: #555; margin-top: 4px; }
            .order-info { margin-bottom: 20px; }
            .order-info .row { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; border-bottom: 1px dashed #ccc; }
            .items { margin-bottom: 20px; }
            .items h3 { font-size: 14px; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 8px; }
            .item { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; border-bottom: 1px dashed #eee; }
            .item .name { flex: 1; }
            .item .qty { margin: 0 12px; color: #666; }
            .item .price { font-weight: bold; }
            .total-row { display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; border-top: 3px solid #000; padding-top: 12px; margin-top: 8px; }
            .footer { text-align: center; margin-top: 32px; font-size: 11px; color: #888; border-top: 2px solid #000; padding-top: 16px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Buen Provecho</h1>
            <p>Comprobante de Pedido</p>
          </div>
          <div class="order-info">
            <div class="row"><span>No. Orden</span><span>#${(ticketOrder.order_number || ticketOrder.id || 'N/A').toString().split('-').pop()}</span></div>
            <div class="row"><span>Estado</span><span>${ticketOrder.status || 'Confirmado'}</span></div>
            <div class="row"><span>Restaurante</span><span>${ticketOrder.restaurant?.name || ticketOrder.restaurant_name || 'Sede Premium'}</span></div>
            <div class="row"><span>Fecha</span><span>${ticketOrder.createdAt ? new Date(ticketOrder.createdAt).toLocaleDateString('es-GT', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Reciente'}</span></div>
          </div>
          <div class="items">
            <h3>Platillos</h3>
            ${items.map(item => `
              <div class="item">
                <span class="name">${item.MenuItem?.name || item.name || 'Platillo'}</span>
                <span class="qty">x${item.quantity}</span>
                <span class="price">Q${Number(item.price || item.unit_price).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          <div class="total-row">
            <span>Total</span>
            <span>Q${Number(ticketOrder.total || 0).toFixed(2)}</span>
          </div>
          <div class="footer">
            <p>Gracias por tu preferencia</p>
            <p>Buen Provecho - Red de Sabores</p>
          </div>
        </body>
      </html>`;
      const { uri } = await Print.printToFileAsync({ html });
      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (isSharingAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartir Ticket',
          UTI: 'com.adobe.pdf',
        });
      } else {
        showNotification(`PDF guardado en: ${uri}`, 'success');
      }
    } catch (error) {
      showNotification('No se pudo generar el ticket PDF.', 'error');
    }
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
      showNotification('¡Gracias por compartir tu opinion gourmet!', 'success');
      setReviewedOrders((prev) => [...prev, reviewModal.order.id || reviewModal.order._id]);
      setReviewModal({ open: false, order: null });
      setRating(5);
      setComment('');
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Error al enviar la resena';
      showNotification(msg, 'error');
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
        <Text style={styles.loadingText}>Cargando Bitacora...</Text>
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
          <Text style={styles.headerBadge}>Pasaporte Gastronomico</Text>
          <Text style={styles.headerTitle}>
            Tu <Text style={styles.headerTitleAccent}>Bitacora</Text>
          </Text>
          <Text style={styles.headerSubtitle}>
            Revive tus mejores momentos y gestiona tus experiencias pasadas en la red mas exclusiva.
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
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                            <Ionicons name="receipt-outline" size={14} color={COLORS.secondary} />
                            <Text style={styles.ticketButtonText}>Ver Ticket</Text>
                          </View>
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
                  <Ionicons name="cube-outline" size={40} color={COLORS.secondary} />
                  <Text style={styles.emptyTitle}>Sin ordenes registradas</Text>
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
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                          <Ionicons name="chatbubble-ellipses-outline" size={14} color="#FFFFFF" />
                          <Text style={styles.reviewButtonText}>
                            {isReviewed ? 'Opinion Registrada' : 'Dejar Resena'}
                          </Text>
                        </View>
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
                          {res.reservation_date} | {res.reservation_time?.slice(0, 5)}
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
                  <Ionicons name="calendar-outline" size={40} color={COLORS.secondary} />
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
              <Ionicons name="close" size={20} color={COLORS.secondary} />
            </TouchableOpacity>

            <View style={styles.modalHeader}>
              <Text style={styles.modalBadge}>Club Gourmet</Text>
              <Text style={styles.modalTitle}>Calificar Sabor</Text>
              <Text style={styles.modalSubtitle}>Tu opinion es la brujula de nuestra excelencia.</Text>
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={styles.modalSubmitButtonText}>Enviar Resena</Text>
                  <Ionicons name="paper-plane-outline" size={14} color="#FFFFFF" />
                </View>
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
              <Ionicons name="close" size={20} color={COLORS.secondary} />
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

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setTicketOrder(null)}
              >
                <Text style={styles.modalCancelButtonText}>Cerrar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSubmitButton} onPress={handleDownloadPdf}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="receipt-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.modalSubmitButtonText}>Descargar PDF</Text>
                </View>
              </TouchableOpacity>
            </View>
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
    fontFamily: FONTS.black,
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
    fontFamily: FONTS.black,
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
    fontFamily: FONTS.black,
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
    fontFamily: FONTS.bold,
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
    fontFamily: FONTS.black,
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
    borderRadius: 12,
  },
  filterButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  filterButtonText: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: FONTS.black,
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
    fontFamily: FONTS.black,
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
    ...SHADOWS.md,
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
    fontFamily: FONTS.black,
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xxs,
  },
  cardTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
  },
  cardSub: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: FONTS.bold,
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
    fontFamily: FONTS.black,
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
    fontFamily: FONTS.black,
    color: COLORS.secondary,
  },
  ticketButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: 6,
  },
  ticketButtonText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    color: COLORS.textMuted,
  },
  reservationInfo: {
    flex: 1,
  },
  reservationInfoText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: FONTS.bold,
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
    fontFamily: FONTS.black,
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
    gap: SPACING.sm,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  emptyText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: FONTS.bold,
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
    ...SHADOWS.md,
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
    fontFamily: FONTS.black,
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
    fontFamily: FONTS.black,
    color: COLORS.secondary,
  },
  reviewTotal: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    color: COLORS.primaryDark,
    marginBottom: SPACING.sm,
  },
  reviewButton: {
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    alignItems: 'center',
    ...SHADOWS.md,
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
    fontFamily: FONTS.black,
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
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    width: '100%',
    borderWidth: 2,
    borderColor: COLORS.secondary,
    ...SHADOWS.md,
  },
  modalClose: {
    alignSelf: 'flex-end',
    padding: SPACING.xs,
  },
  modalHeader: {
    marginBottom: SPACING.md,
    alignItems: 'center',
  },
  modalBadge: {
    fontSize: 9,
    fontWeight: '950',
    fontFamily: FONTS.black,
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
    fontFamily: FONTS.black,
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
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  commentInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
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
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
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
    ...SHADOWS.md,
  },
  modalSubmitButtonText: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: FONTS.black,
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
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  ticketSummaryLabel: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.textLight,
    textTransform: 'uppercase',
  },
  ticketSummaryValue: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  ticketSummaryTotal: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.primaryDark,
  },
  ticketItemsBox: {
    backgroundColor: COLORS.surface,
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
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
    paddingRight: SPACING.sm,
  },
  ticketItemQty: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.primaryDark,
  },
});

export default ClientHistoryScreen;
