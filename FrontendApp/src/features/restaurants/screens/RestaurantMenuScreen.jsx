import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Sparkles } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZE, SHADOWS, FONTS } from '../../../shared/constants/theme';
import axiosClient, { restaurantService, menuService, eventService, authService } from '../../../shared/api/axiosClient';
import API_CONFIG from '../../../shared/api/config';
import useAuthStore from '../../profile/store/useAuthStore';
import useCartStore from '../../orders/store/useCartStore';
import useNotificationStore from '../../../shared/stores/useNotificationStore';
import { CartModal } from '../../orders/components/CartModal';
import ReservationModal from '../../reservations/components/ReservationModal';
import { getFallbackRestaurant, getFallbackEvent } from '../../../shared/constants/fallbackImages';

const RestaurantMenuScreen = ({ route }) => {
  const { id } = route.params;
  const [restaurant, setRestaurant] = useState(null);
  const [menus, setMenus] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemQuantities, setItemQuantities] = useState({});
  const [itemNotes, setItemNotes] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [reservationOpen, setReservationOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewProfiles, setReviewProfiles] = useState({});
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  const { user } = useAuthStore();
  const showNotification = useNotificationStore((s) => s.show);

  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartItemCount } = useCartStore();

  useEffect(() => {
    if (!id) {
      setError('ID de restaurante no proporcionado');
      setLoading(false);
      return;
    }
    fetchRestaurantData();
  }, [id]);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch restaurant data
      const resRest = await restaurantService.getById(id);
      setRestaurant(resRest.data.data || resRest.data);
      
      // Fetch menus and items independently to avoid cascading errors
      try {
        const resMenus = await menuService.getAll(id);
        setMenus(resMenus.data.data || resMenus.data || []);
      } catch (menuError) {
        console.error('Error fetching menus:', menuError);
        setMenus([]);
      }
      
      try {
        const resItems = await menuService.getAllItems({ restaurant_id: id });
        setItems(resItems.data.data || resItems.data || []);
      } catch (itemsError) {
        if (itemsError.response?.status === 404 || itemsError.response?.status === 500) {
          setItems([]);
        } else {
          console.error('Error fetching menu items:', itemsError);
          setItems([]);
        }
      }

      setEventsLoading(true);
      try {
        const eventsUrl = `${API_CONFIG.REPORT_URL.replace('/stats', '')}/events`;
        const resEvents = await axiosClient.get(eventsUrl, {
          params: { restaurant_id: id, restaurante: id, restaurantId: id },
        });
        const raw = resEvents.data?.data || resEvents.data || resEvents;
        const eventList = (() => {
          if (Array.isArray(raw)) return raw;
          if (raw?.eventos && Array.isArray(raw.eventos)) return raw.eventos;
          if (raw?.data && Array.isArray(raw.data)) return raw.data;
          if (raw?.events && Array.isArray(raw.events)) return raw.events;
          if (raw?.results && Array.isArray(raw.results)) return raw.results;
          if (raw?.items && Array.isArray(raw.items)) return raw.items;
          if (raw?.list && Array.isArray(raw.list)) return raw.list;
          if (raw?.records && Array.isArray(raw.records)) return raw.records;
          return [];
        })();
        const normalized = eventList.map((e) => ({
          id: e.id || e._id || e.ID || Math.random().toString(),
          name: e.name || e.titulo || e.nombre || e.title || 'Evento Especial',
          description: e.description || e.descripcion || e.desc || '',
          date: e.eventDate || e.date || e.fecha || e.fecha_evento || null,
          image_url: e.imageUrl || e.image_url || e.imagen || e.foto || e.image || '',
          discount: e.discount || e.descuento || e.discount_percent || null,
          is_promo: e.eventType === 'promotion' || e.is_promo || e.es_promo || e.promo || !!e.descuento,
          type: e.eventType || e.type || (!!e.descuento ? 'promotion' : 'event'),
        }));
        setEvents(normalized);
      } catch (eventsError) {
        setEvents([]);
      } finally {
        setEventsLoading(false);
      }

      // Fetch reviews + humanize names (batch before render)
      let rawReviews = [];
      try {
        const resReviews = await restaurantService.getRestaurantReviews(id);
        rawReviews = Array.isArray(resReviews.data) ? resReviews.data : (resReviews.data?.data || resReviews.data?.reviews || []);
      } catch (reviewsError) {
        if (reviewsError.response?.status !== 404) {
          console.error('Error fetching reviews:', reviewsError);
        }
        rawReviews = [];
      }

      // Fetch all user profiles in parallel before setting reviews state
      const uniqueIds = [...new Set(rawReviews.map((r) => r.user_id).filter(Boolean))];
      const profileMap = {};
      await Promise.all(
        uniqueIds.map(async (uid) => {
          try {
            const res = await authService.getProfileById(uid);
            const profile = res.data?.data || res.data;
            profileMap[uid] = profile?.name || 'Comensal';
          } catch (e) {
            profileMap[uid] = 'Comensal';
          }
        })
      );

      setReviews(rawReviews);
      setReviewProfiles(profileMap);
    } catch (error) {
      console.error('Error fetching restaurant data:', error);
      setError('No se pudo cargar la información del restaurante');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (itemId, delta) => {
    setItemQuantities((prev) => ({
      ...prev,
      [itemId]: Math.max(1, (prev[itemId] || 1) + delta),
    }));
  };

  const handleAddToCart = (item) => {
    const quantity = itemQuantities[item.id] || 1;
    const notes = itemNotes[item.id] || '';

    addToCart(
      {
        menuItemId: item.id,
        name: item.name,
        price: Number(item.price),
        quantity,
        notes,
      },
      id
    );

    setItemQuantities((prev) => ({ ...prev, [item.id]: 1 }));
    setItemNotes((prev) => ({ ...prev, [item.id]: '' }));
  };

  const categoryItems = items.filter((item) => {
    const matchesCategory = activeCategory ? item.menu_id === activeCategory : true;
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Preparando Experiencia...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>No Disponible</Text>
        <Text style={styles.errorText}>Este restaurante no se encuentra activo.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={{
              uri: restaurant.cover_image_url || getFallbackRestaurant(restaurant.id || restaurant._id),
            }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <View style={styles.logoContainer}>
              <Image
                source={{ uri: restaurant.logo_url }}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.heroBadge}>Experiencia Exclusiva</Text>
            <Text style={styles.heroTitle}>{restaurant.name}</Text>
            <View style={styles.heroBadges}>
              <View style={styles.heroBadgeItem}>
                <Text style={styles.heroBadgeText}>{restaurant.rating || '4.9'}</Text>
              </View>
              <View style={[styles.heroBadgeItem, styles.heroBadgeItemDark]}>
                <Text style={styles.heroBadgeTextDark}>{restaurant.category}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Reservation Banner */}
        <View style={styles.reservationBanner}>
          <Text style={styles.reservationBadge}>Reservas Exclusivas</Text>
          <Text style={styles.reservationTitle}>
            Asegura tu <Text style={styles.reservationTitleAccent}>Experiencia</Text>
          </Text>
          <TouchableOpacity style={styles.reservationButton} onPress={() => setReservationOpen(true)}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 6}}>
              <Text style={styles.reservationButtonText}>Reservar Mesa</Text>
              <Sparkles size={14} color={COLORS.surface} strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Events Section */}
        {events.length > 0 && (
          <View style={styles.eventsSection}>
            <View style={styles.eventsHeader}>
              <Text style={styles.eventsTitle}>Eventos del Restaurante</Text>
              <Text style={styles.eventsCount}>{events.length} evento{events.length > 1 ? 's' : ''}</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.eventsScroll}
            >
              {events.map((event) => (
                <View key={event.id} style={styles.eventCard}>
                  <Image
                    source={{
                      uri: event.image_url
                        ? event.image_url.startsWith('data:')
                          ? event.image_url
                          : `data:image/png;base64,${event.image_url}`
                        : getFallbackEvent(event.id),
                    }}
                    style={styles.eventImage}
                    resizeMode="cover"
                  />
                  <View style={styles.eventOverlay} />
                  {event.discount && (
                    <View style={styles.eventDiscountBadge}>
                      <Text style={styles.eventDiscountText}>-{event.discount}%</Text>
                    </View>
                  )}
                  <View style={styles.eventContent}>
                    {event.is_promo && (
                      <Text style={styles.eventPromoLabel}>Promoción</Text>
                    )}
                    <Text style={styles.eventName} numberOfLines={1}>{event.name}</Text>
                    <Text style={styles.eventDescription} numberOfLines={2}>
                      {event.description || 'Experiencia exclusiva con los mejores sabores.'}
                    </Text>
                    <View style={styles.eventFooter}>
                      <Text style={styles.eventDate}>
                        {event.date ? new Date(event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'Próximamente'}
                      </Text>
                      <TouchableOpacity
                        style={styles.eventButton}
                        onPress={() => {
                          if (!user?.id) {
                            showNotification('Debes iniciar sesión para inscribirte en eventos.', 'error');
                            return;
                          }
                          showNotification(event.description || '¡Inscríbete para disfrutar de esta experiencia exclusiva!', 'info');
                          const baseUrl = `${API_CONFIG.REPORT_URL.replace('/stats', '')}`;
                          const participantName = user?.name || user?.username || 'Cliente';
                          (async () => {
                            try {
                              await axiosClient.post(`${baseUrl}/events/${event.id}/register`, {
                                participant_name: participantName,
                                participant_email: user?.email || '',
                                participant_phone: user?.phone || '00000000',
                              });
                              showNotification('Tu participacion ha sido confirmada.', 'success');
                            } catch (err) {
                              const status = err?.response?.status;
                              if (status === 401) {
                                showNotification('Tu sesión ha expirado. Inicia sesión de nuevo.', 'error');
                                return;
                              }
                              if (status === 409) {
                                showNotification('Este correo o usuario ya estan registrados en este evento.', 'info');
                                return;
                              }
                              if (status === 400) return;
                              const msg = err?.response?.data?.message || '';
                              showNotification(msg || 'No se pudo completar la inscripcion.', 'error');
                            }
                          })();
                        }}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.eventButtonText}>Inscribirme</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Search & Categories */}
        <View style={styles.searchSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            <TouchableOpacity
              style={[styles.categoryButton, !activeCategory && styles.categoryButtonActive]}
              onPress={() => setActiveCategory(null)}
            >
              <Text style={[styles.categoryButtonText, !activeCategory && styles.categoryButtonTextActive]}>
                Ver Todo
              </Text>
            </TouchableOpacity>
            {menus.map((menu) => (
              <TouchableOpacity
                key={menu.id}
                style={[styles.categoryButton, activeCategory === menu.id && styles.categoryButtonActive]}
                onPress={() => setActiveCategory(menu.id)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    activeCategory === menu.id && styles.categoryButtonTextActive,
                  ]}
                >
                  {menu.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Busca tu platillo..."
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        {/* Menu Items Grid */}
        <View style={styles.menuSection}>
          {categoryItems.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="restaurant-outline" size={72} color={COLORS.secondary} />
              <Text style={styles.emptyTitle}>Carta en Preparación</Text>
              <Text style={styles.emptyText}>Nuestros chefs están diseñando nuevos sabores.</Text>
            </View>
          ) : (
            <View style={styles.menuGrid}>
              {categoryItems.map((item) => (
                <View key={item.id} style={styles.menuItemCard}>
                  <Image
                    source={{ uri: item.image_url || 'https://via.placeholder.com/300' }}
                    style={styles.menuItemImage}
                    resizeMode="cover"
                  />
                  <View style={styles.menuItemBadgeRow}>
                    {item.is_vegetarian && (
                      <View style={styles.veggieBadgeMini}>
                        <Text style={styles.veggieBadgeMiniText}>Veggie</Text>
                      </View>
                    )}
                    {!item.is_available && (
                      <View style={styles.outOfStockBadgeMini}>
                        <Text style={styles.outOfStockBadgeMiniText}>Agotado</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.menuItemContent}>
                    <Text style={styles.menuItemName} numberOfLines={1}>{item.name}</Text>
                    <TextInput
                      style={styles.notesInput}
                      placeholder="Notas especiales..."
                       placeholderTextColor={COLORS.textMuted}
                      value={itemNotes[item.id] || ''}
                      onChangeText={(text) => setItemNotes((prev) => ({ ...prev, [item.id]: text }))}
                    />
                    <View style={styles.priceRow}>
                      <Text style={styles.menuItemPrice}>Q{Number(item.price).toFixed(2)}</Text>
                    </View>
                    {item.is_available ? (
                      <View style={styles.menuItemActions}>
                        <View style={styles.quantityControls}>
                          <TouchableOpacity
                            style={styles.qtyButton}
                            onPress={() => handleQuantityChange(item.id, -1)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.qtyButtonText}>−</Text>
                          </TouchableOpacity>
                          <Text style={styles.qtyValue}>{itemQuantities[item.id] || 1}</Text>
                          <TouchableOpacity
                            style={styles.qtyButton}
                            onPress={() => handleQuantityChange(item.id, 1)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.qtyButtonText}>+</Text>
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity
                          style={styles.addToCartBtn}
                          onPress={() => handleAddToCart(item)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="cart-outline" size={18} color={COLORS.surface} />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <Text style={styles.outOfStockLabel}>Agotado</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Reviews Section — "Ecos de Paladares" */}
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.reviewsTitle}>Ecos de Paladares</Text>
            <Text style={styles.reviewsCount}>{reviews.length} reseña{reviews.length !== 1 ? 's' : ''}</Text>
          </View>

          {reviews.length > 0 && (
            <View style={styles.ratingSummary}>
              <Text style={styles.ratingAverage}>
                {reviews.length > 0 ? (reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length).toFixed(1) : '0.0'}
              </Text>
              <View style={styles.ratingStarsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Text key={star} style={[styles.starIcon, star <= Math.round(reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length) && styles.starIconActive]}>★</Text>
                ))}
              </View>
              <Text style={styles.ratingTotal}>Basado en {reviews.length} reseña{reviews.length !== 1 ? 's' : ''}</Text>
            </View>
          )}

          {reviews.length > 0 ? (
            reviews.map((review) => {
              return (
              <View key={review.id || review._id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewAvatar}>
                    <Text style={styles.reviewAvatarText}>
                      {(review.user_id && review.user_id === user?.id
                        ? (user?.name || user?.username || 'T')[0]
                        : review.user_id
                          ? '#'
                          : 'A').toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.reviewUserInfo}>
                    <Text style={styles.reviewUserName}>
                      {review.user_id && review.user_id === user?.id
                        ? (user?.name || user?.username || 'Tú')
                        : review.user_id
                          ? (reviewProfiles[review.user_id] || 'Comensal')
                          : 'Comensal'}</Text>
                    <View style={styles.reviewStarsRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Text key={star} style={[styles.reviewStar, star <= (review.rating || 0) && styles.reviewStarActive]}>★</Text>
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>
                    {review.created_at ? new Date(review.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                  </Text>
                </View>
                {review.comment ? (
                  <Text style={styles.reviewComment}>“{review.comment}”</Text>
                ) : null}
              </View>
            );
          })
        ) : (
            <View style={styles.noReviews}>
              <Text style={styles.noReviewsText}>Aún no hay reseñas para este restaurante.</Text>
            </View>
          )}

          <TouchableOpacity style={styles.addReviewButton} onPress={() => setReviewModalVisible(true)}>
            <Text style={styles.addReviewButtonText}>+ Nueva Reseña</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Cart Button */}
      {getCartItemCount() > 0 && (
        <TouchableOpacity style={styles.cartButton} onPress={() => setCartOpen(true)}>
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{getCartItemCount()}</Text>
          </View>
          <Text style={styles.cartButtonText}>Ver Carrito</Text>
        </TouchableOpacity>
      )}

      {/* Cart Modal */}
      <CartModal
        visible={cartOpen}
        onClose={() => setCartOpen(false)}
        restaurantId={id}
      />

      {/* Reservation Modal */}
      <ReservationModal
        visible={reservationOpen}
        onClose={() => setReservationOpen(false)}
        restaurant={restaurant}
      />

      {/* Review Modal */}
      <Modal visible={reviewModalVisible} transparent animationType="slide" onRequestClose={() => setReviewModalVisible(false)}>
        <View style={styles.reviewModalOverlay}>
          <View style={styles.reviewModalContent}>
            <Text style={styles.reviewModalTitle}>Escribe tu Reseña</Text>

            <View style={styles.reviewModalStars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                  <Text style={[styles.reviewModalStar, star <= reviewRating && styles.reviewModalStarActive]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reviewModalInput}
              placeholder="Comparte tu experiencia..."
              value={reviewComment}
              onChangeText={setReviewComment}
              multiline
              numberOfLines={4}
              placeholderTextColor={COLORS.textMuted}
            />

            <View style={styles.reviewModalButtons}>
              <TouchableOpacity
                style={styles.reviewModalCancel}
                onPress={() => { setReviewModalVisible(false); setReviewRating(0); setReviewComment(''); }}
              >
                <Text style={styles.reviewModalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.reviewModalSubmit, !reviewRating && styles.reviewModalSubmitDisabled]}
                disabled={!reviewRating}
                onPress={async () => {
                  if (!user?.id) {
                    showNotification('Debes iniciar sesión para escribir una reseña.', 'error');
                    return;
                  }
                  try {
                    await restaurantService.createReview({
                      restaurant_id: id,
                      user_id: user.id,
                      rating: reviewRating,
                      comment: reviewComment,
                    });
                    showNotification('Tu reseña ha sido publicada.', 'success');
                    setReviewModalVisible(false);
                    setReviewRating(0);
                    setReviewComment('');
                    const resReviews = await restaurantService.getRestaurantReviews(id);
                    const fresh = Array.isArray(resReviews.data) ? resReviews.data : (resReviews.data?.data || resReviews.data?.reviews || []);
                    setReviews(fresh);
                  } catch (e) {
                    showNotification('No se pudo publicar tu reseña.', 'error');
                  }
                }}
              >
                <Text style={styles.reviewModalSubmitText}>Publicar</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.secondary,
  },
  errorTitle: {
    fontSize: FONT_SIZE.huge,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.surface,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  errorText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    fontFamily: FONTS.bold,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  heroSection: {
    height: 400,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(28, 23, 18, 0.4)',
  },
  heroContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: SPACING.lg,
  },
  logoContainer: {
    width: 120,
    height: 120,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    padding: SPACING.xs,
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  heroBadge: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  heroTitle: {
    fontSize: FONT_SIZE.huge,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.surface,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  heroBadges: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  heroBadgeItem: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...SHADOWS.sm,
  },
  heroBadgeItemDark: {
    backgroundColor: COLORS.secondary,
  },
  heroBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  heroBadgeTextDark: {
    color: COLORS.surface,
  },
  reservationBanner: {
    margin: SPACING.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    ...SHADOWS.lg,
  },
  reservationBadge: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    fontFamily: FONTS.bold,
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
  reservationTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },
  reservationTitleAccent: {
    color: COLORS.surface,
  },
  reservationButton: {
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    alignSelf: 'flex-start',
    ...SHADOWS.sm,
  },
  reservationButtonText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    color: COLORS.surface,
    textTransform: 'uppercase',
  },
  searchSection: {
    backgroundColor: COLORS.background,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.secondary,
    paddingVertical: SPACING.md,
    ...SHADOWS.sm,
  },
  categoriesScroll: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  categoryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 8,
    marginRight: SPACING.sm,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  categoryButtonText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  categoryButtonTextActive: {
    color: COLORS.surface,
  },
  searchContainer: {
    paddingHorizontal: SPACING.lg,
  },
  searchInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.secondary,
    ...SHADOWS.sm,
  },
  menuSection: {
    padding: SPACING.lg,
  },
  emptyContainer: {
    padding: SPACING.xxl,
    backgroundColor: `${COLORS.secondary}20`,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderStyle: 'dashed',
    borderRadius: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    fontFamily: FONTS.bold,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  eventsSection: {
    paddingVertical: SPACING.sm,
    paddingLeft: SPACING.lg,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  eventsTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  eventsCount: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    color: COLORS.textMuted,
  },
  eventsScroll: {
    gap: SPACING.sm,
    paddingRight: SPACING.lg,
  },
  eventCard: {
    width: 220,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  eventOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '75%',
    backgroundColor: 'rgba(28, 23, 18, 0.7)',
  },
  eventContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.sm,
  },
  eventName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.surface,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: COLORS.primaryLight,
    marginBottom: SPACING.sm,
  },
  eventButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
  },
  eventDescription: {
    fontSize: 9,
    fontWeight: '600',
    fontFamily: FONTS.bold,
    color: COLORS.primaryLight,
    marginBottom: 4,
    lineHeight: 13,
  },
  eventFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eventPromoLabel: {
    fontSize: 8,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 1,
  },
  eventDiscountBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    zIndex: 10,
  },
  eventDiscountText: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.surface,
  },
  eventButtonText: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItemCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    ...SHADOWS.md,
  },
  menuItemImage: {
    width: '100%',
    height: 150,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.secondary,
  },
  menuItemBadgeRow: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: SPACING.sm,
    paddingTop: SPACING.xs,
  },
  veggieBadgeMini: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 0,
  },
  veggieBadgeMiniText: {
    fontSize: 8,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.surface,
    textTransform: 'uppercase',
  },
  outOfStockBadgeMini: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 0,
  },
  outOfStockBadgeMiniText: {
    fontSize: 8,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.surface,
    textTransform: 'uppercase',
  },
  menuItemContent: {
    padding: SPACING.sm,
  },
  menuItemName: {
    fontSize: 13,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: COLORS.secondary,
    borderRadius: 0,
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 10,
    color: COLORS.secondary,
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.xs,
    minHeight: 26,
  },
  priceRow: {
    marginBottom: SPACING.xs,
  },
  menuItemPrice: {
    fontSize: 15,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
  },
  menuItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 0,
  },
  qtyButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  qtyButtonText: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    lineHeight: 18,
  },
  qtyValue: {
    width: 28,
    height: 28,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 13,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.surface,
    lineHeight: 28,
  },
  addToCartBtn: {
    width: 40,
    height: 32,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 0,
  },
  outOfStockLabel: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.error,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 4,
  },
  cartButton: {
    position: 'absolute',
    bottom: SPACING.lg,
    left: SPACING.lg,
    right: SPACING.lg,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.lg,
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.primary,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
  },
  cartButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    color: COLORS.surface,
    textTransform: 'uppercase',
  },
  cartModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  cartContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  cartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  cartTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  cartCloseText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
  },
  cartItems: {
    flex: 1,
    marginBottom: SPACING.lg,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  cartItemLeft: {
    flex: 1,
  },
  cartItemRight: {
    alignItems: 'flex-end',
  },
  cartItemName: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  cartItemNotes: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '500',
    fontFamily: FONTS.bold,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  cartItemDetails: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    fontFamily: FONTS.bold,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  cartRemoveButton: {
    width: 24,
    height: 24,
    backgroundColor: COLORS.error,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartRemoveButtonText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: COLORS.surface,
  },
  cartFooter: {
    gap: SPACING.sm,
  },
  cartTotal: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  checkoutButton: {
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    ...SHADOWS.sm,
  },
  checkoutButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    color: COLORS.surface,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  reviewsSection: {
    padding: SPACING.lg,
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  reviewsTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  reviewsCount: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    color: COLORS.textMuted,
  },
  ratingSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  ratingAverage: {
    fontSize: 36,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    marginRight: SPACING.md,
  },
  ratingStarsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  starIcon: {
    fontSize: 18,
    color: COLORS.textMuted,
  },
  starIconActive: {
    color: COLORS.primary,
  },
  ratingTotal: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: COLORS.textMuted,
    marginLeft: SPACING.sm,
  },
  reviewCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  reviewAvatar: {
    width: 40,
    height: 40,
    borderRadius: 0,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  reviewAvatarText: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.surface,
  },
  reviewUserInfo: {
    flex: 1,
  },
  reviewUserName: {
    fontSize: 12,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  reviewStarsRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  reviewStar: {
    fontSize: 14,
    color: COLORS.textMuted,
  },
  reviewStarActive: {
    color: COLORS.primary,
  },
  reviewDate: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: COLORS.textMuted,
  },
  reviewComment: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: FONTS.bold,
    color: COLORS.text,
    fontStyle: 'italic',
    lineHeight: 20,
    paddingLeft: 4,
  },
  noReviews: {
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderStyle: 'dashed',
    borderRadius: 12,
    marginBottom: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  noReviewsText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  addReviewButton: {
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  addReviewButtonText: {
    fontSize: 13,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.surface,
    textTransform: 'uppercase',
  },
  reviewModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewModalContent: {
    width: '85%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    ...SHADOWS.md,
  },
  reviewModalTitle: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  reviewModalStars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  reviewModalStar: {
    fontSize: 36,
    color: COLORS.textMuted,
  },
  reviewModalStarActive: {
    color: COLORS.primary,
  },
  reviewModalInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 0,
    padding: SPACING.md,
    fontSize: 13,
    color: COLORS.secondary,
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: SPACING.lg,
  },
  reviewModalButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  reviewModalCancel: {
    flex: 1,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 0,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  reviewModalCancelText: {
    fontSize: 13,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  reviewModalSubmit: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    borderRadius: 0,
    paddingVertical: SPACING.md,
    alignItems: 'center',
  },
  reviewModalSubmitDisabled: {
    opacity: 0.4,
  },
  reviewModalSubmitText: {
    fontSize: 13,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.surface,
    textTransform: 'uppercase',
  },
});

export default RestaurantMenuScreen;
