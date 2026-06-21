import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../../shared/constants/theme';
import StarRating from '../../../shared/components/common/StarRating';

const ClientHistoryScreen = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [orderFilter, setOrderFilter] = useState('all');
  const [reservationFilter, setReservationFilter] = useState('all');
  const [reviewModal, setReviewModal] = useState({ open: false, order: null });
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewedOrders, setReviewedOrders] = useState([]);

  // Mock data - replace with API calls
  const orders = [
    { id: 1, order_number: 'ORD-001', status: 'paid', total: 150, createdAt: new Date() },
    { id: 2, order_number: 'ORD-002', status: 'served', total: 85, createdAt: new Date() },
    { id: 3, order_number: 'ORD-003', status: 'pending', total: 200, createdAt: new Date() },
  ];

  const reservations = [
    {
      id: 1,
      restaurant: { name: 'BuenProvecho Club' },
      status: 'confirmed',
      reservation_date: '2024-06-25',
      reservation_time: '19:00:00',
      party_size: 4,
    },
    {
      id: 2,
      restaurant: { name: 'Restaurante Premium' },
      status: 'completed',
      reservation_date: '2024-06-20',
      reservation_time: '20:00:00',
      party_size: 2,
    },
  ];

  const completedOrders = orders.filter((order) => ['served', 'paid'].includes(order.status));

  const filteredOrders =
    orderFilter === 'all' ? orders : orders.filter((order) => order.status === orderFilter);

  const filteredReservations =
    reservationFilter === 'all'
      ? reservations
      : reservations.filter((reservation) => reservation.status === reservationFilter);

  const statusClass = {
    pending: { bg: COLORS.primaryLight, text: COLORS.warning, border: COLORS.secondary },
    preparing: { bg: COLORS.primaryLight, text: COLORS.warning, border: COLORS.secondary },
    ready: { bg: COLORS.primaryLight, text: COLORS.success, border: COLORS.secondary },
    served: { bg: COLORS.secondary, text: COLORS.surface, border: COLORS.primary },
    paid: { bg: COLORS.success, text: COLORS.surface, border: COLORS.secondary },
    confirmed: { bg: COLORS.info, text: COLORS.surface, border: COLORS.secondary },
    completed: { bg: COLORS.secondary, text: COLORS.surface, border: COLORS.primary },
    cancelled: { bg: COLORS.textMuted, text: COLORS.textLight, border: COLORS.secondary },
  };

  const translateStatus = (status) => {
    const translations = {
      pending: 'Pendiente',
      preparing: 'Preparando',
      ready: 'Listo',
      served: 'Servido',
      paid: 'Pagado',
      confirmed: 'Confirmada',
      completed: 'Completada',
      cancelled: 'Cancelada',
    };
    return translations[status] || status;
  };

  const submitReview = () => {
    setReviewedOrders((prev) => [...prev, reviewModal.order.id]);
    setReviewModal({ open: false, order: null });
    setRating(5);
    setComment('');
  };

  const renderFilterButton = (key, active, label, onPress) => (
    <TouchableOpacity
      key={key}
      onPress={onPress}
      style={[
        styles.filterButton,
        active && styles.filterButtonActive,
      ]}
    >
      <Text style={[styles.filterButtonText, active && styles.filterButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderStar = (index) => (
    <TouchableOpacity
      key={index}
      onPress={() => setRating(index + 1)}
      style={styles.starButton}
    >
      <Text style={[styles.starText, rating >= index + 1 && styles.starTextActive]}>
        ★
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
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
              Pedidos
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'reservations' && styles.tabActive]}
            onPress={() => setActiveTab('reservations')}
          >
            <Text style={[styles.tabText, activeTab === 'reservations' && styles.tabTextActive]}>
              Reservas
            </Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'orders' ? (
          <>
            {/* Orders Filters */}
            <View style={styles.filtersContainer}>
              {['all', 'pending', 'served', 'paid', 'cancelled'].map((status) =>
                renderFilterButton(
                  status,
                  orderFilter === status,
                  status === 'all' ? 'Todos' : translateStatus(status),
                  () => setOrderFilter(status)
                )
              )}
            </View>

            {/* Orders List */}
            <View style={styles.section}>
              {filteredOrders.map((order) => (
                <View key={order.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.cardLabel}>Orden de Servicio</Text>
                      <Text style={styles.cardTitle}>#{order.order_number.split('-').pop()}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusClass[order.status]?.bg, borderColor: statusClass[order.status]?.border },
                      ]}
                    >
                      <Text style={[styles.statusText, { color: statusClass[order.status]?.text }]}>
                        {translateStatus(order.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={styles.cardFooterLeft}>
                      <Text style={styles.totalText}>Q{order.total}</Text>
                      <TouchableOpacity style={styles.ticketButton}>
                        <Text style={styles.ticketButtonText}>📄 Ver Ticket</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.dateText}>
                      {new Date(order.createdAt).toLocaleDateString('es-GT')}
                    </Text>
                  </View>
                </View>
              ))}
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
                {completedOrders.map((order) => (
                  <View key={order.id} style={styles.reviewCard}>
                    <View style={styles.reviewCardHeader}>
                      <View style={styles.reviewBadge}>
                        <Text style={styles.reviewBadgeText}>Finalizado</Text>
                      </View>
                      <Text style={styles.reviewStar}>★</Text>
                    </View>
                    <Text style={styles.reviewOrderNumber}>#{order.order_number.split('-').pop()}</Text>
                    <Text style={styles.reviewTotal}>Q{order.total}</Text>
                    <TouchableOpacity
                      style={[
                        styles.reviewButton,
                        reviewedOrders.includes(order.id) && styles.reviewButtonDisabled,
                      ]}
                      onPress={() => !reviewedOrders.includes(order.id) && setReviewModal({ open: true, order })}
                      disabled={reviewedOrders.includes(order.id)}
                    >
                      <Text style={styles.reviewButtonText}>
                        {reviewedOrders.includes(order.id) ? 'Opinión Registrada' : '💬 Dejar Reseña'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
                {completedOrders.length === 0 && (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No hay pedidos pendientes de calificación</Text>
                  </View>
                )}
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Reservations Filters */}
            <View style={styles.filtersContainer}>
              {['all', 'confirmed', 'completed', 'cancelled'].map((status) =>
                renderFilterButton(
                  status,
                  reservationFilter === status,
                  status === 'all' ? 'Todos' : translateStatus(status),
                  () => setReservationFilter(status)
                )
              )}
            </View>

            {/* Reservations List */}
            <View style={styles.section}>
              {filteredReservations.map((reservation) => (
                <View key={reservation.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.cardLabel}>Sede Gourmet</Text>
                      <Text style={styles.cardTitle}>{reservation.restaurant.name}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: statusClass[reservation.status]?.bg,
                          borderColor: statusClass[reservation.status]?.border,
                        },
                      ]}
                    >
                      <Text style={[styles.statusText, { color: statusClass[reservation.status]?.text }]}>
                        {translateStatus(reservation.status)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={styles.reservationInfo}>
                      <Text style={styles.reservationInfoText}>
                        ⚡ {reservation.reservation_date} | {reservation.reservation_time?.slice(0, 5)}
                      </Text>
                    </View>
                    <View style={styles.partySizeBadge}>
                      <Text style={styles.partySizeText}>{reservation.party_size} Comensales</Text>
                    </View>
                  </View>
                </View>
              ))}
              {filteredReservations.length === 0 && (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>📅</Text>
                  <Text style={styles.emptyTitle}>Sin reservas futuras</Text>
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
  header: {
    backgroundColor: COLORS.primary,
    padding: SPACING.xl,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.secondary,
    ...SHADOWS.lg,
  },
  headerBadge: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    marginBottom: SPACING.sm,
    alignSelf: 'flex-start',
  },
  headerTitle: {
    fontSize: FONT_SIZE.huge,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    lineHeight: 40,
    marginBottom: SPACING.sm,
  },
  headerTitleAccent: {
    color: COLORS.surface,
  },
  headerSubtitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.background,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.secondary,
  },
  tab: {
    flex: 1,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
  },
  tabTextActive: {
    color: COLORS.primary,
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: SPACING.lg,
    gap: SPACING.sm,
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 8,
  },
  filterButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  filterButtonText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  filterButtonTextActive: {
    color: COLORS.surface,
  },
  section: {
    padding: SPACING.lg,
  },
  sectionHeader: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  sectionSubtitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
    color: COLORS.textLight,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  cardTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: `${COLORS.secondary}10`,
  },
  cardFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  totalText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  ticketButton: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  ticketButtonText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  reservationInfo: {
    flex: 1,
  },
  reservationInfoText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  partySizeBadge: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  partySizeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    padding: SPACING.xxl,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderStyle: 'dashed',
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  emptyText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
    color: COLORS.textLight,
    textAlign: 'center',
  },
  reviewsGrid: {
    gap: SPACING.md,
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    padding: SPACING.lg,
    ...SHADOWS.md,
  },
  reviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  reviewBadge: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.xs,
    borderRadius: 4,
  },
  reviewBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  reviewStar: {
    fontSize: 16,
    color: COLORS.primary,
  },
  reviewOrderNumber: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  reviewTotal: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  reviewButton: {
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    ...SHADOWS.sm,
  },
  reviewButtonDisabled: {
    backgroundColor: COLORS.textMuted,
    borderColor: COLORS.secondary,
  },
  reviewButtonText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.surface,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: SPACING.xl,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.lg,
  },
  modalClose: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
  },
  modalCloseText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  modalHeader: {
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
  modalBadge: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
    marginBottom: SPACING.sm,
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  modalSubtitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
    color: COLORS.textLight,
    textAlign: 'center',
  },
  modalBody: {
    marginBottom: SPACING.lg,
    gap: SPACING.lg,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.sm,
  },
  starButton: {
    padding: SPACING.xs,
  },
  starText: {
    fontSize: 32,
    color: COLORS.textMuted,
  },
  starTextActive: {
    color: COLORS.primary,
  },
  commentContainer: {
    gap: SPACING.xs,
  },
  commentLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.textLight,
    textTransform: 'uppercase',
  },
  commentInput: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
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
    borderColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: 12,
  },
  modalCancelButtonText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  modalSubmitButton: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    ...SHADOWS.sm,
  },
  modalSubmitButtonText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.surface,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
});

export default ClientHistoryScreen;
