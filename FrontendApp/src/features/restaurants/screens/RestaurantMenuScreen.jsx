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
    Modal
} from 'react-native';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../../shared/constants/theme';
import { restaurantService, menuService } from '../../../shared/api/axiosClient';
import useCartStore from '../../orders/store/useCartStore';
import { CartModal } from '../../orders/components/CartModal';
import ReservationModal from '../../reservations/components/ReservationModal';

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

            const resRest = await restaurantService.getById(id);
            setRestaurant(resRest.data.data || resRest.data);

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
                console.error('Error fetching menu items:', itemsError);
                setItems([]);
            }
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
                price: item.price,
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
                <Text style={styles.errorIcon}>⚡</Text>
                <Text style={styles.errorTitle}>Error</Text>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        );
    }

    if (!restaurant) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚡</Text>
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
                            uri: restaurant.cover_image_url || 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80',
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
                                <Text style={styles.heroBadgeText}>⭐ {restaurant.rating || '4.9'}</Text>
                            </View>
                            <View style={[styles.heroBadgeItem, styles.heroBadgeItemDark]}>
                                <Text style={styles.heroBadgeTextDark}>📍 {restaurant.category}</Text>
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
                        <Text style={styles.reservationButtonText}>Reservar Mesa ✨</Text>
                    </TouchableOpacity>
                </View>

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
                            <Text style={styles.emptyIcon}>🍽️</Text>
                            <Text style={styles.emptyTitle}>Carta en Preparación</Text>
                            <Text style={styles.emptyText}>Nuestros chefs están diseñando nuevos sabores.</Text>
                        </View>
                    ) : (
                        categoryItems.map((item, index) => (
                            <View key={item.id} style={styles.menuItemCard}>
                                <View style={styles.itemImageContainer}>
                                    {item.image_url ? (
                                        <Image source={{ uri: item.image_url }} style={styles.itemImage} resizeMode="cover" />
                                    ) : (
                                        <View style={styles.itemImagePlaceholder}>
                                            <Text style={styles.itemImagePlaceholderText}>Sin Imagen</Text>
                                        </View>
                                    )}
                                    <View style={styles.itemBadges}>
                                        {item.is_vegetarian && (
                                            <View style={styles.veggieBadge}>
                                                <Text style={styles.veggieBadgeText}>Veggie</Text>
                                            </View>
                                        )}
                                        {!item.is_available && (
                                            <View style={styles.outOfStockBadge}>
                                                <Text style={styles.outOfStockBadgeText}>Agotado</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <View style={styles.itemContent}>
                                    <Text style={styles.itemName} numberOfLines={2}>
                                        {item.name}
                                    </Text>
                                    <Text style={styles.itemDescription} numberOfLines={2}>
                                        {item.description || 'Una experiencia culinaria inigualable.'}
                                    </Text>

                                    {item.is_available && (
                                        <View style={styles.itemActions}>
                                            <TextInput
                                                style={styles.notesInput}
                                                placeholder="Notas especiales..."
                                                value={itemNotes[item.id] || ''}
                                                onChangeText={(text) => setItemNotes((prev) => ({ ...prev, [item.id]: text }))}
                                                placeholderTextColor={COLORS.textMuted}
                                            />

                                            <View style={styles.itemFooter}>
                                                <View style={styles.priceContainer}>
                                                    <Text style={styles.priceLabel}>Precio Unitario</Text>
                                                    <Text style={styles.price}>
                                                        <Text style={styles.priceCurrency}>Q</Text>
                                                        {item.price}
                                                    </Text>
                                                </View>

                                                <View style={styles.quantityContainer}>
                                                    <View style={styles.quantityControls}>
                                                        <TouchableOpacity
                                                            style={styles.quantityButton}
                                                            onPress={() => handleQuantityChange(item.id, -1)}
                                                        >
                                                            <Text style={styles.quantityButtonText}>-</Text>
                                                        </TouchableOpacity>
                                                        <Text style={styles.quantityText}>{itemQuantities[item.id] || 1}</Text>
                                                        <TouchableOpacity
                                                            style={styles.quantityButton}
                                                            onPress={() => handleQuantityChange(item.id, 1)}
                                                        >
                                                            <Text style={styles.quantityButtonText}>+</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                    <TouchableOpacity
                                                        style={styles.addToCartButton}
                                                        onPress={() => handleAddToCart(item)}
                                                    >
                                                        <Text style={styles.addToCartButtonText}>🛒</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))
                    )}
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
        </View>
    );
};

onst styles = StyleSheet.create({
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
    errorIcon: {
        fontSize: 64,
        marginBottom: SPACING.md,
    },
    errorTitle: {
        fontSize: FONT_SIZE.huge,
        fontWeight: '900',
        color: COLORS.surface,
        textTransform: 'uppercase',
        marginBottom: SPACING.sm,
    },
    errorText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '500',
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
    emptyIcon: {
        fontSize: 64,
        marginBottom: SPACING.md,
    },
    emptyTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '900',
        color: COLORS.secondary,
        textTransform: 'uppercase',
        marginBottom: SPACING.sm,
    },
    emptyText: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '500',
        color: COLORS.textLight,
        textAlign: 'center',
    },
    menuItemCard: {
        backgroundColor: COLORS.surface,
        borderWidth: 2,
        borderColor: COLORS.secondary,
        borderRadius: 12,
        marginBottom: SPACING.md,
        overflow: 'hidden',
        ...SHADOWS.md,
    },
    itemImageContainer: {
        height: 160,
        position: 'relative',
    },
    itemImage: {
        width: '100%',
        height: '100%',
    },
    itemImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.primaryLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    itemImagePlaceholderText: {
        fontSize: FONT_SIZE.xs,
        fontWeight: '800',
        color: COLORS.primary,
        textTransform: 'uppercase',
    },
    itemBadges: {
        position: 'absolute',
        top: SPACING.sm,
        right: SPACING.sm,
        gap: SPACING.xs,
    },
    veggieBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.xs,
        paddingVertical: SPACING.xs,
        borderWidth: 2,
        borderColor: COLORS.secondary,
    },
    veggieBadgeText: {
        fontSize: 9,
        fontWeight: '800',
        color: COLORS.surface,
        textTransform: 'uppercase',
    },
    outOfStockBadge: {
        backgroundColor: COLORS.error,
        paddingHorizontal: SPACING.xs,
        paddingVertical: SPACING.xs,
        borderWidth: 2,
        borderColor: COLORS.secondary,
    },
    outOfStockBadgeText: {
        fontSize: 9,
        fontWeight: '800',
        color: COLORS.surface,
        textTransform: 'uppercase',
    },
});