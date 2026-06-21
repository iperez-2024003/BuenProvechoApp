import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import useCartStore from '../store/useCartStore';

const ORDER_TYPE_OPTIONS = [
  { id: 'dine_in', label: 'Salón 🍽️' },
  { id: 'takeout', label: 'Llevar 📦' },
  { id: 'delivery', label: 'Delivery 🚚' },
];

const DELIVERY_FEE = 15.00;

export const CartModal = ({ visible, onClose, restaurantId }) => {
  const {
    cart,
    removeFromCart,
    getCartTotal,
    clearCart,
    createOrder,
    loading,
  } = useCartStore();

  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState('');
  const [orderType, setOrderType] = useState('takeout');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Load user data on open/mount
  useEffect(() => {
    if (visible) {
      loadUserData();
    }
  }, [visible]);

  const loadUserData = async () => {
    try {
      const userDataJson = await AsyncStorage.getItem('userData');
      if (userDataJson) {
        setUser(JSON.parse(userDataJson));
      }
    } catch (error) {
      console.error('Error loading user data in CartModal:', error);
    }
  };

  const subtotal = getCartTotal();
  const deliveryFee = orderType === 'delivery' ? DELIVERY_FEE : 0;
  const grandTotal = subtotal + deliveryFee;

  const handleCheckout = async () => {
    if (!user) {
      Alert.alert(
        'Acceso Requerido',
        'Debes iniciar sesión para realizar un pedido.',
        [{ text: 'Entendido', onPress: onClose }]
      );
      return;
    }

    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      Alert.alert('Dirección Requerida', 'Por favor ingresa la dirección de entrega.');
      return;
    }

    try {
      const orderData = {
        restaurant_id: restaurantId,
        user_id: user.id || user._id, // Support different backend ID schemas
        customer_name: user.name || user.username || 'Cliente VIP',
        order_type: orderType,
        delivery_address: orderType === 'delivery' ? deliveryAddress : '',
        delivery_fee: orderType === 'delivery' ? DELIVERY_FEE : 0,
        notes: notes.trim(),
        items: cart.map((item) => ({
          menu_item_id: item.menuItemId,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes || '',
        })),
      };

      const result = await createOrder(orderData);
      setOrderSuccess(result.data || result);
    } catch (error) {
      const backendMessage = error.response?.data?.message || error.message || 'No se pudo crear la orden. Intenta de nuevo.';
      const isStockIssue = /inventario insuficiente|platillo no disponible/i.test(backendMessage);

      Alert.alert(
        isStockIssue ? 'Sin stock' : 'Error',
        isStockIssue
          ? 'Ya no hay stock suficiente para uno de los platillos seleccionados. Revisa tu carrito y vuelve a intentarlo.'
          : backendMessage
      );
    }
  };

  const handleClose = () => {
    setOrderSuccess(null);
    setNotes('');
    setDeliveryAddress('');
    setOrderType('takeout');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {orderSuccess ? '¡Buen ' : 'Tu '}
              <Text style={styles.headerTitleAccent}>
                {orderSuccess ? 'Provecho!' : 'Canasta'}
              </Text>
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {orderSuccess ? (
            /* --- PANTALLA DE ÉXITO --- */
            <ScrollView contentContainerStyle={styles.successContainer}>
              <View style={styles.successIconWrapper}>
                <Text style={styles.successIcon}>✅</Text>
              </View>
              <Text style={styles.successTitle}>¡Orden Confirmada!</Text>
              <Text style={styles.successSubtitle}>
                Tu pedido ha sido enviado directamente a la cocina.
              </Text>

              <View style={styles.receiptCard}>
                <Text style={styles.receiptLabel}>Resumen de Orden</Text>
                
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptRowLabel}>No. Orden</Text>
                  <Text style={styles.receiptRowVal}>
                    #{orderSuccess.order_number?.split('-').pop() || orderSuccess.id || 'N/A'}
                  </Text>
                </View>

                <View style={[styles.receiptRow, styles.receiptTotalRow]}>
                  <Text style={styles.receiptTotalLabel}>Total Pagado</Text>
                  <Text style={styles.receiptTotalVal}>Q{orderSuccess.total?.toFixed(2) || grandTotal.toFixed(2)}</Text>
                </View>
              </View>

              <View style={styles.successActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.downloadButton]}
                  onPress={() =>
                    Alert.alert('Ticket', 'El ticket digital de tu compra ha sido guardado en tu historial.')
                  }
                >
                  <Text style={styles.downloadButtonText}>📋 Ver Ticket Digital</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, styles.backButton]} onPress={handleClose}>
                  <Text style={styles.backButtonText}>Seguir Comprando</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : cart.length === 0 ? (
            /* --- CARRITO VACÍO --- */
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🛍️</Text>
              <Text style={styles.emptyText}>Tu canasta está vacía</Text>
              <Text style={styles.emptySubtext}>Agrega deliciosos platillos para comenzar.</Text>
            </View>
          ) : (
            /* --- LISTA DE PRODUCTOS Y FORMULARIO --- */
            <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
              {/* Productos */}
              <Text style={styles.sectionTitle}>Platillos</Text>
              {cart.map((item) => (
                <View key={item.menuItemId} style={styles.cartItemCard}>
                  <View style={styles.cartItemHeader}>
                    <Text style={styles.cartItemName}>{item.name}</Text>
                    <TouchableOpacity
                      style={styles.removeItemButton}
                      onPress={() => removeFromCart(item.menuItemId)}
                    >
                      <Text style={styles.removeItemText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cartItemBody}>
                    <View style={styles.qtyBadge}>
                      <Text style={styles.qtyText}>CANT: {item.quantity}</Text>
                    </View>
                    <Text style={styles.unitPriceText}>Q{item.price.toFixed(2)} c/u</Text>
                    <Text style={styles.itemSubtotalText}>
                      Q{(item.price * item.quantity).toFixed(2)}
                    </Text>
                  </View>

                  {item.notes ? (
                    <View style={styles.itemNotesCard}>
                      <Text style={styles.itemNotesText}>📝 {item.notes}</Text>
                    </View>
                  ) : null}
                </View>
              ))}

              {/* Modalidad Selector */}
              <Text style={styles.sectionTitle}>Modalidad de Orden</Text>
              <View style={styles.typeSelectorRow}>
                {ORDER_TYPE_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.id}
                    style={[
                      styles.typeOptionButton,
                      orderType === opt.id && styles.typeOptionActive,
                    ]}
                    onPress={() => setOrderType(opt.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.typeOptionText,
                        orderType === opt.id && styles.typeOptionTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Dirección Delivery */}
              {orderType === 'delivery' && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Dirección de Entrega</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Calle, avenida, número de casa, zona..."
                    placeholderTextColor={COLORS.textMuted}
                    value={deliveryAddress}
                    onChangeText={setDeliveryAddress}
                    multiline
                  />
                </View>
              )}

              {/* Notas Cocina */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Instrucciones Especiales</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej: sin cebolla, salsa extra..."
                  placeholderTextColor={COLORS.textMuted}
                  value={notes}
                  onChangeText={setNotes}
                />
              </View>

              {/* Desglose Financiero */}
              <View style={styles.pricingSection}>
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Subtotal</Text>
                  <Text style={styles.pricingValue}>Q{subtotal.toFixed(2)}</Text>
                </View>
                {orderType === 'delivery' && (
                  <View style={styles.pricingRow}>
                    <Text style={styles.pricingLabel}>Costo de Envío</Text>
                    <Text style={styles.pricingValue}>+ Q{DELIVERY_FEE.toFixed(2)}</Text>
                  </View>
                )}
                <View style={[styles.pricingRow, styles.pricingTotalRow]}>
                  <Text style={styles.pricingTotalLabel}>Total a Pagar</Text>
                  <Text style={styles.pricingTotalValue}>Q{grandTotal.toFixed(2)}</Text>
                </View>
              </View>

              {/* Botones Acciones */}
              <View style={styles.footerActions}>
                <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
                  <Text style={styles.clearButtonText}>Vaciar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.checkoutButton, loading && styles.checkoutButtonDisabled]}
                  onPress={handleCheckout}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={COLORS.surface} />
                  ) : (
                    <Text style={styles.checkoutButtonText}>Confirmar Orden →</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(28, 23, 18, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '90%',
    width: '100%',
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 4,
    borderColor: COLORS.secondary,
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderColor: COLORS.secondary,
  },
  headerTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  headerTitleAccent: {
    color: COLORS.primaryDark,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  scrollBody: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  cartItemCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  cartItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  cartItemName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  removeItemButton: {
    padding: SPACING.xs,
  },
  removeItemText: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.error,
  },
  cartItemBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyBadge: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: 4,
  },
  qtyText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.surface,
  },
  unitPriceText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  itemSubtotalText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  itemNotesCard: {
    marginTop: SPACING.xs,
    padding: SPACING.xs,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
  },
  itemNotesText: {
    fontSize: 11,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  typeOptionButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 10,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  typeOptionActive: {
    backgroundColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  typeOptionText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  typeOptionTextActive: {
    color: COLORS.surface,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
  },
  pricingSection: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 4,
    borderColor: COLORS.secondary,
    gap: SPACING.xs,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricingLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textLight,
    textTransform: 'uppercase',
  },
  pricingValue: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  pricingTotalRow: {
    paddingTop: SPACING.sm,
    borderTopWidth: 2,
    borderColor: `${COLORS.secondary}20`,
    marginTop: SPACING.xs,
  },
  pricingTotalLabel: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  pricingTotalValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  footerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xl,
  },
  clearButton: {
    width: '30%',
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  clearButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textLight,
    textTransform: 'uppercase',
  },
  checkoutButton: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  checkoutButtonDisabled: {
    opacity: 0.6,
  },
  checkoutButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.surface,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 72,
    marginBottom: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xxs,
  },
  emptySubtext: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  successContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  successIconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.surface,
    borderWidth: 4,
    borderColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  successIcon: {
    fontSize: 40,
  },
  successTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: SPACING.xxs,
  },
  successSubtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  receiptCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderWidth: 3,
    borderColor: COLORS.secondary,
    borderRadius: 16,
    padding: SPACING.md,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
    marginBottom: SPACING.xl,
  },
  receiptLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: 1,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderColor: `${COLORS.secondary}10`,
  },
  receiptRowLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  receiptRowVal: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  receiptTotalRow: {
    borderBottomWidth: 0,
    paddingTop: SPACING.md,
    marginTop: SPACING.xs,
  },
  receiptTotalLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  receiptTotalVal: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.primaryDark,
  },
  successActions: {
    width: '100%',
    gap: SPACING.sm,
  },
  actionButton: {
    width: '100%',
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  downloadButton: {
    backgroundColor: COLORS.background,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  downloadButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  backButton: {
    backgroundColor: COLORS.secondary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  backButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.surface,
    textTransform: 'uppercase',
  },
});

export default CartModal;
