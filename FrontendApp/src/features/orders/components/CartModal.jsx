import React, { useState, useEffect, useMemo } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { COLORS, SPACING, FONT_SIZE, FONTS, SHADOWS } from '../../../shared/constants/theme';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../../profile/store/useAuthStore';
import useNotificationStore from '../../../shared/stores/useNotificationStore';

const ORDER_TYPE_OPTIONS = [
  { id: 'dine_in', label: 'Salon' },
  { id: 'takeout', label: 'Llevar' },
  { id: 'delivery', label: 'Delivery' },
];

const DELIVERY_FEE = 15.00;

export const CartModal = ({ visible, onClose, restaurantId }) => {
  const cart = useCartStore(state => state.cart);
  const removeFromCart = useCartStore(state => state.removeFromCart);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const clearCart = useCartStore(state => state.clearCart);
  const createOrder = useCartStore(state => state.createOrder);
  const loading = useCartStore(state => state.loading);

  const { user, points, addPoints } = useAuthStore();
  const showNotification = useNotificationStore((s) => s.show);
  const [notes, setNotes] = useState('');
  const [orderType, setOrderType] = useState('takeout');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => total + Number(item.price) * item.quantity, 0);
  }, [cart]);

  const deliveryFee = useMemo(() => {
    return orderType === 'delivery' ? DELIVERY_FEE : 0;
  }, [orderType]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal + deliveryFee - couponDiscount);
  }, [subtotal, deliveryFee, couponDiscount]);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      showNotification('No puedes realizar un pedido sin agregar platillos antes.', 'error');
      return;
    }

    if (!user) {
      Alert.alert(
        'Acceso Requerido',
        'Debes iniciar sesion para realizar un pedido.',
        [{ text: 'Entendido', onPress: onClose }]
      );
      return;
    }

    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      showNotification('Por favor ingresa la direccion de entrega.', 'error');
      return;
    }

    try {
      const orderData = {
        restaurant_id: restaurantId,
        user_id: user.id || user._id,
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

      const pointsEarned = 5 + cart.reduce((sum, item) => sum + item.quantity, 0);
      await addPoints(pointsEarned);
    } catch (error) {
      const backendMessage = error.response?.data?.message || error.message || 'No se pudo crear la orden. Intenta de nuevo.';
      const isStockIssue = /inventario insuficiente|platillo no disponible/i.test(backendMessage);

      showNotification(
        isStockIssue
          ? 'Ya no hay stock suficiente para uno de los platillos seleccionados.'
          : backendMessage,
        'error'
      );
    }
  };

  const handleDownloadTicket = async () => {
    if (!orderSuccess) return;
    try {
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
            <div class="row"><span>No. Orden</span><span>#${(orderSuccess.order_number || orderSuccess.id || 'N/A').toString().split('-').pop()}</span></div>
            <div class="row"><span>Estado</span><span>Confirmado</span></div>
            <div class="row"><span>Fecha</span><span>${new Date().toLocaleDateString('es-GT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></div>
          </div>
          <div class="items">
            <h3>Platillos</h3>
            ${(orderSuccess.items || cart).map(item => `
              <div class="item">
                <span class="name">${item.name || item.MenuItem?.name || 'Platillo'}</span>
                <span class="qty">x${item.quantity}</span>
                <span class="price">Q${Number(item.price || item.unit_price).toFixed(2)}</span>
              </div>
            `).join('')}
          </div>
          <div class="total-row">
            <span>Total</span>
            <span>Q${Number(orderSuccess.total || cart.reduce((t, i) => t + Number(i.price) * i.quantity, 0)).toFixed(2)}</span>
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

  const handleApplyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      showNotification('Ingresa un codigo de cupon.', 'error');
      return;
    }
    if (couponDiscount > 0) {
      showNotification('Ya tienes un descuento activo.', 'info');
      return;
    }
    if (/^BP-VIP-\d{4}$/.test(code)) {
      setCouponDiscount(10);
      showNotification('Descuento de Q10.00 aplicado a tu orden.', 'success');
      setCouponCode('');
    } else {
      showNotification('El codigo ingresado no es valido.', 'error');
    }
  };

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (text) {
      setCouponCode(text.trim().toUpperCase());
      showNotification('Codigo pegado desde el portapapeles.', 'success');
    } else {
      showNotification('No hay texto en el portapapeles.', 'info');
    }
  };

  const handleClose = () => {
    setOrderSuccess(null);
    setNotes('');
    setDeliveryAddress('');
    setOrderType('takeout');
    setCouponCode('');
    setCouponDiscount(0);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>
              {orderSuccess ? '!Buen ' : 'Tu '}
              <Text style={styles.headerTitleAccent}>
                {orderSuccess ? 'Provecho!' : 'Canasta'}
              </Text>
            </Text>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <Ionicons name="close" size={20} color={COLORS.secondary} />
            </TouchableOpacity>
          </View>

          {orderSuccess ? (
            /* --- PANTALLA DE EXITO --- */
            <ScrollView contentContainerStyle={styles.successContainer}>
              <View style={styles.successIconWrapper}>
                <Ionicons name="checkmark-circle" size={60} color={COLORS.secondary} />
              </View>
              <Text style={styles.successTitle}>!Orden Confirmada!</Text>
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

                <View style={[styles.receiptRow, styles.receiptTotalRow]}>
                  <Text style={styles.receiptTotalLabel}>Puntos VIP</Text>
                  <Text style={styles.receiptTotalVal}>{(points || 0) + 5 + cart.reduce((sum, item) => sum + item.quantity, 0)}</Text>
                </View>
              </View>

              <View style={styles.successActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.downloadButton]}
                  onPress={handleDownloadTicket}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Ionicons name="receipt-outline" size={16} color={COLORS.secondary} />
                    <Text style={styles.downloadButtonText}>Descargar Ticket PDF</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionButton, styles.backButton]} onPress={handleClose}>
                  <Text style={styles.backButtonText}>Seguir Comprando</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : cart.length === 0 ? (
            /* --- CARRITO VACIO --- */
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={72} color={COLORS.secondary} />
              <Text style={styles.emptyText}>Tu canasta esta vacia</Text>
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
                      <Ionicons name="close" size={16} color={COLORS.error} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cartItemBody}>
                    <View style={styles.qtyControls}>
                      <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                      >
                        <Text style={styles.qtyButtonText}>-</Text>
                      </TouchableOpacity>
                      <View style={styles.qtyValueBadge}>
                        <Text style={styles.qtyValueText}>{item.quantity}</Text>
                      </View>
                      <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                      >
                        <Text style={styles.qtyButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.unitPriceText}>Q{Number(item.price).toFixed(2)} c/u</Text>
                    <Text style={styles.itemSubtotalText}>
                      Q{(Number(item.price) * item.quantity).toFixed(2)}
                    </Text>
                  </View>

                  {item.notes ? (
                    <View style={styles.itemNotesCard}>
                      <Text style={styles.itemNotesText}>{item.notes}</Text>
                    </View>
                  ) : null}
                </View>
              ))}

              {/* Modalidad Selector */}
              <Text style={styles.sectionTitle}>Modalidad de Orden</Text>
              <View style={styles.typeSelectorRow}>
                {ORDER_TYPE_OPTIONS.map((opt) => {
                  let iconName = 'fast-food-outline';
                  if (opt.id === 'dine_in') iconName = 'restaurant-outline';
                  else if (opt.id === 'takeout') iconName = 'bag-handle-outline';
                  else if (opt.id === 'delivery') iconName = 'bicycle-outline';

                  return (
                    <TouchableOpacity
                      key={opt.id}
                      style={[
                        styles.typeOptionButton,
                        orderType === opt.id && styles.typeOptionActive,
                      ]}
                      onPress={() => setOrderType(opt.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name={iconName}
                        size={18}
                        color={orderType === opt.id ? COLORS.surface : COLORS.secondary}
                      />
                      <Text
                        style={[
                          styles.typeOptionText,
                          orderType === opt.id && styles.typeOptionTextActive,
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Direccion Delivery */}
              {orderType === 'delivery' && (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Direccion de Entrega</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Calle, avenida, numero de casa, zona..."
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

              {/* Cupon VIP */}
              <View style={styles.couponContainer}>
                <Text style={styles.inputLabel}>?Tienes un cupon VIP?</Text>
                <View style={styles.couponRow}>
                  <TextInput
                    style={styles.couponInput}
                    placeholder="BP-VIP-XXXX"
                    placeholderTextColor={COLORS.textMuted}
                    value={couponCode}
                    onChangeText={setCouponCode}
                    autoCapitalize="characters"
                  />
                  <TouchableOpacity style={styles.couponButtonPaste} onPress={handlePaste} activeOpacity={0.8}>
                    <Ionicons name="clipboard-outline" size={16} color={COLORS.secondary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.couponButton} onPress={handleApplyCoupon} activeOpacity={0.8}>
                    <Text style={styles.couponButtonText}>Aplicar</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Desglose Financiero */}
              <View style={styles.pricingSection}>
                <View style={styles.pricingRow}>
                  <Text style={styles.pricingLabel}>Subtotal</Text>
                  <Text style={styles.pricingValue}>Q{subtotal.toFixed(2)}</Text>
                </View>
                {orderType === 'delivery' && (
                  <View style={styles.pricingRow}>
                    <Text style={styles.pricingLabel}>Costo de Envio</Text>
                    <Text style={styles.pricingValue}>+ Q{DELIVERY_FEE.toFixed(2)}</Text>
                  </View>
                )}
                {couponDiscount > 0 && (
                  <View style={[styles.pricingRow]}>
                    <Text style={styles.pricingLabel}>Descuento VIP</Text>
                    <Text style={styles.pricingDiscountValue}>- Q{couponDiscount.toFixed(2)}</Text>
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
                  <Ionicons name="trash-outline" size={16} color={COLORS.secondary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.checkoutButton, loading && styles.checkoutButtonDisabled]}
                  onPress={handleCheckout}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={COLORS.surface} />
                  ) : (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={styles.checkoutButtonText}>Confirmar Orden</Text>
                      <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
                    </View>
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
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderWidth: 2,
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
    fontFamily: FONTS.black,
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
  scrollBody: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    fontFamily: FONTS.black,
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
    ...SHADOWS.md,
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
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  removeItemButton: {
    padding: SPACING.xs,
  },
  cartItemBody: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qtyButton: {
    width: 32,
    height: 32,
    backgroundColor: COLORS.secondary,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  qtyButtonText: {
    fontSize: 18,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.surface,
    lineHeight: 20,
  },
  qtyValueBadge: {
    minWidth: 32,
    height: 32,
    backgroundColor: COLORS.surface,
    borderRadius: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.secondary,
    paddingHorizontal: SPACING.sm,
  },
  qtyValueText: {
    fontSize: 14,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
  },
  unitPriceText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: COLORS.textLight,
  },
  itemSubtotalText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    fontFamily: FONTS.black,
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
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    gap: 4,
    ...SHADOWS.md,
  },
  typeOptionActive: {
    backgroundColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  typeOptionText: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: FONTS.black,
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
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  textInput: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
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
    fontFamily: FONTS.black,
    color: COLORS.textLight,
    textTransform: 'uppercase',
  },
  pricingValue: {
    fontSize: 13,
    fontWeight: '900',
    fontFamily: FONTS.black,
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
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  pricingTotalValue: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.primaryDark,
  },
  pricingDiscountValue: {
    fontSize: 13,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.error,
  },
  couponContainer: {
    marginTop: SPACING.md,
    gap: SPACING.xs,
  },
  couponRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  couponButtonPaste: {
    width: 44,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  couponInput: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  couponButton: {
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    paddingHorizontal: SPACING.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
  },
  couponButtonText: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.surface,
    textTransform: 'uppercase',
  },
  footerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xl,
  },
  clearButton: {
    width: '15%',
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.md,
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
    ...SHADOWS.md,
  },
  checkoutButtonDisabled: {
    opacity: 0.6,
  },
  checkoutButtonText: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.surface,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    gap: SPACING.sm,
  },
  emptyText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    fontFamily: FONTS.black,
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
  successTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    fontFamily: FONTS.black,
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
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    padding: SPACING.md,
    ...SHADOWS.md,
    marginBottom: SPACING.xl,
  },
  receiptLabel: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: FONTS.black,
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
    fontFamily: FONTS.black,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  receiptRowVal: {
    fontSize: 12,
    fontWeight: '900',
    fontFamily: FONTS.black,
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
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  receiptTotalVal: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    fontFamily: FONTS.black,
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
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    ...SHADOWS.md,
  },
  downloadButtonText: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  backButton: {
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    ...SHADOWS.md,
  },
  backButtonText: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.surface,
    textTransform: 'uppercase',
  },
});

export default CartModal;
