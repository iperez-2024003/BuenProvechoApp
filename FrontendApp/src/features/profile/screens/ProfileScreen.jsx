import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import {
  X,
  CheckCircle2,
  Tag as TagIcon,
  XCircle,
  Gift,
  Ticket,
  Copy,
  RefreshCw,
  CheckCircle2 as CheckCircleFilled,
} from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, FONTS, SHADOWS } from '../../../shared/constants/theme';
import useAuthStore from '../store/useAuthStore';
import { pointsService, couponsService } from '../../../shared/api/axiosClient';
import useNotificationStore from '../../../shared/stores/useNotificationStore';

const POINTS_STATUS_CONFIG = {
  earned: { label: 'Ganado', icon: CheckCircle2, color: COLORS.success },
  redeemed: { label: 'Canjeado', icon: TagIcon, color: COLORS.warning },
  expired: { label: 'Expirado', icon: XCircle, color: COLORS.error },
};

const ProfileScreen = ({ navigation }) => {
  const { user, points, logout, updateProfile, changePassword, deleteAccount, isLoading, redeemPoints } = useAuthStore();
  const showNotification = useNotificationStore((s) => s.show);

  const [activeSection, setActiveSection] = useState('profile');

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Password Modal States
  const [passModalVisible, setPassModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Redeem Modal States
  const [redeemModalVisible, setRedeemModalVisible] = useState(false);

  // Points History States
  const [pointsHistory, setPointsHistory] = useState([]);
  const [pointsLoading, setPointsLoading] = useState(false);
  const [pointsError, setPointsError] = useState(null);

  // Coupons States
  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponsError, setCouponsError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const REWARDS = [
    { id: 1, label: 'Descuento Q10', cost: 10 },
    { id: 2, label: 'Descuento Q20', cost: 30 },
    { id: 3, label: 'Descuento Q40', cost: 60 },
  ];

  useEffect(() => {
    if (activeSection === 'points') {
      fetchPointsHistory();
    } else if (activeSection === 'coupons') {
      fetchCoupons();
    }
  }, [activeSection]);

  const fetchPointsHistory = async () => {
    setPointsLoading(true);
    setPointsError(null);
    try {
      const response = await pointsService.getHistory();
      if (response.error) {
        setPointsHistory([]);
        setPointsError('Servicio no disponible temporalmente');
        return;
      }
      const raw = response.data?.history || response.data?.data || response.data || [];
      const list = Array.isArray(raw) ? raw : [];
      const normalized = list.map((entry) => ({
        id: entry.id || entry._id || Math.random().toString(),
        amount: entry.amount || entry.puntos || entry.points || 0,
        type: entry.type || entry.status || entry.tipo || 'earned',
        description: entry.description || entry.descripcion || entry.reason || '',
        date: entry.date || entry.created_at || entry.fecha || null,
      }));
      setPointsHistory(normalized);
    } catch (error) {
      setPointsHistory([]);
      setPointsError('Servicio no disponible temporalmente');
    } finally {
      setPointsLoading(false);
    }
  };

  const fetchCoupons = async () => {
    setCouponsLoading(true);
    setCouponsError(null);
    try {
      const response = await couponsService.getActive();
      if (response.error) {
        setCoupons([]);
        setCouponsError('Servicio no disponible temporalmente');
        return;
      }
      const raw = response.data?.coupons || response.data?.data || response.data || [];
      const list = Array.isArray(raw) ? raw : [];
      const normalized = list.map((c) => ({
        id: c.id || c._id || Math.random().toString(),
        code: c.code || c.codigo || '',
        prize_name: c.prize_name || c.name || c.premio || c.titulo || 'Premio Especial',
        expiration_date: c.expiration_date || c.expires_at || c.fecha_expiracion || c.fecha_vencimiento || null,
        status: c.status || 'active',
      }));
      setCoupons(normalized);
    } catch (error) {
      setCoupons([]);
      setCouponsError('Servicio no disponible temporalmente');
    } finally {
      setCouponsLoading(false);
    }
  };

  const handleCopyCoupon = async (code, id) => {
    try {
      await Clipboard.setStringAsync(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      // Clipboard not available
    }
  };

  const handleRedeem = async (reward) => {
    if (points < reward.cost) {
      showNotification(`Te faltan ${reward.cost - points} pts para canjear "${reward.label}".`, 'error');
      return;
    }
    const result = await redeemPoints(reward.cost, reward.label);
    if (result.success && result.coupon) {
      const { code, expiration_date } = result.coupon;
      const expiryStr = expiration_date ? `\nVence: ${new Date(expiration_date).toLocaleDateString('es-ES')}` : '';
      showNotification(`Tu codigo: ${code}${expiryStr}`, 'success');
      setRedeemModalVisible(false);
    } else {
      showNotification(result.error || 'No se pudo canjear la recompensa.', 'error');
    }
  };

  const handleUpdateProfile = async () => {
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      showNotification('Por favor ingresa un nombre válido (solo letras).', 'error');
      return;
    }

    if (/[0-9]/.test(trimmedName)) {
      showNotification('El nombre no debe contener números.', 'error');
      return;
    }

    if (trimmedPhone && !/^\+?[\d\s\-\(\)]{7,}$/.test(trimmedPhone)) {
      showNotification('El formato del teléfono no es válido.', 'error');
      return;
    }

    try {
      const result = await updateProfile({
        name: trimmedName,
        phone: trimmedPhone,
      });
      if (result.success) {
        showNotification('Perfil actualizado correctamente.', 'success');
        setIsEditing(false);
      } else {
        showNotification(result.error || 'No se pudo actualizar.', 'error');
      }
    } catch (error) {
      showNotification('Ocurrió un error inesperado.', 'error');
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      showNotification('Todos los campos de contraseña son obligatorios.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showNotification('Las nuevas contraseñas no coinciden.', 'error');
      return;
    }

    try {
      const result = await changePassword(currentPassword, newPassword, confirmPassword);
      if (result.success) {
        showNotification('Contraseña modificada correctamente.', 'success');
        setPassModalVisible(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        showNotification(result.error || 'No se pudo modificar la contraseña.', 'error');
      }
    } catch (error) {
      showNotification('Ocurrió un error inesperado.', 'error');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir del panel?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar Sesión',
        style: 'destructive',
        onPress: async () => {
          await logout();
          navigation.reset({
            index: 0,
            routes: [{ name: 'Auth' }],
          });
        },
      },
    ]);
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Eliminar Cuenta',
      '¿Estás seguro de que deseas eliminar tu cuenta? Esta acción es irreversible.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await deleteAccount();
              if (result.success) {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Auth' }],
                });
              } else {
                showNotification(result.error || 'No se pudo eliminar la cuenta.', 'error');
              }
            } catch (error) {
              showNotification('Ocurrió un error inesperado al eliminar la cuenta.', 'error');
            }
          },
        },
      ]
    );
  };

  const getInitials = () => {
    const rawName = user?.name || user?.username || 'U';
    return rawName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const renderTabButton = (key, label) => {
    const active = activeSection === key;
    return (
      <TouchableOpacity
        key={key}
        style={[styles.tabButton, active && styles.tabButtonActive]}
        onPress={() => setActiveSection(key)}
        activeOpacity={0.7}
      >
        <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderPointsHistory = () => {
    if (pointsLoading) {
      return (
        <View style={styles.sectionLoader}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
    }

    if (pointsError) {
      return (
        <View style={styles.emptyBox}>
          <XCircle size={40} color={COLORS.error} strokeWidth={2} />
          <Text style={styles.emptyTitle}>Información no disponible</Text>
          <Text style={styles.emptySubtitle}>{pointsError}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchPointsHistory} activeOpacity={0.7}>
            <RefreshCw size={14} color={COLORS.secondary} strokeWidth={2.5} />
            <Text style={styles.retryBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (pointsHistory.length === 0) {
      return (
        <View style={styles.emptyBox}>
          <Gift size={48} color={COLORS.secondary} strokeWidth={2} />
          <Text style={styles.emptyTitle}>Sin historial aún</Text>
          <Text style={styles.emptySubtitle}>
            Tus puntos aparecerán aquí cuando realices tu primera compra o canje.
          </Text>
        </View>
      );
    }

    return pointsHistory.map((item) => {
      const config = POINTS_STATUS_CONFIG[item.type] || POINTS_STATUS_CONFIG.earned;
      const Icon = config.icon;
      const sign = item.type === 'earned' ? '+' : '-';
      return (
        <View key={item.id} style={styles.pointsCard}>
          <View style={styles.pointsCardLeft}>
            <View style={[styles.pointsIconBox, { borderColor: config.color }]}>
              <Icon size={20} color={config.color} strokeWidth={2.5} />
            </View>
            <View style={styles.pointsCardInfo}>
              <Text style={styles.pointsCardDesc}>
                {item.description || `Puntos ${config.label}`}
              </Text>
              <View style={styles.pointsCardMeta}>
                <View style={[styles.pointsStatusBadge, { backgroundColor: `${config.color}20` }]}>
                  <Text style={[styles.pointsStatusText, { color: config.color }]}>{config.label}</Text>
                </View>
                {item.date && (
                  <Text style={styles.pointsCardDate}>
                    {new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </Text>
                )}
              </View>
            </View>
          </View>
          <Text style={[styles.pointsAmount, { color: config.color }]}>
            {sign}{item.amount}
          </Text>
        </View>
      );
    });
  };

  const renderCoupons = () => {
    if (couponsLoading) {
      return (
        <View style={styles.sectionLoader}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      );
    }

    if (couponsError) {
      return (
        <View style={styles.emptyBox}>
          <XCircle size={40} color={COLORS.error} strokeWidth={2} />
          <Text style={styles.emptyTitle}>Información no disponible</Text>
          <Text style={styles.emptySubtitle}>{couponsError}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchCoupons} activeOpacity={0.7}>
            <RefreshCw size={14} color={COLORS.secondary} strokeWidth={2.5} />
            <Text style={styles.retryBtnText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (coupons.length === 0) {
      return (
        <View style={styles.emptyBox}>
          <Ticket size={48} color={COLORS.secondary} strokeWidth={2} />
          <Text style={styles.emptyTitle}>Sin cupones activos</Text>
          <Text style={styles.emptySubtitle}>
            Los cupones que obtengas aparecerán aquí. Sigue acumulando puntos para canjear recompensas.
          </Text>
        </View>
      );
    }

    return coupons.map((item) => {
      const isCopied = copiedId === item.id;
      return (
        <View key={item.id} style={styles.couponCard}>
          <View style={styles.couponHeader}>
            <View style={styles.couponIconBox}>
              <Ticket size={22} color={COLORS.surface} strokeWidth={2.5} />
            </View>
            <View style={styles.couponHeaderInfo}>
              <Text style={styles.couponTitle}>{item.prize_name}</Text>
              {item.expiration_date && (
                <Text style={styles.couponExpiry}>
                  Vence: {new Date(item.expiration_date).toLocaleDateString('es-ES', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.codeRow}>
            <Text style={styles.codeLabel}>CÓDIGO</Text>
            <Text style={styles.codeValue}>{item.code}</Text>
          </View>

          <TouchableOpacity
            style={[styles.copyBtn, isCopied && styles.copyBtnSuccess]}
            onPress={() => handleCopyCoupon(item.code, item.id)}
            activeOpacity={0.8}
          >
            {isCopied ? (
              <>
                <CheckCircleFilled size={16} color={COLORS.surface} strokeWidth={2.5} />
                <Text style={styles.copyBtnText}>Copiado</Text>
              </>
            ) : (
              <>
                <Copy size={16} color={COLORS.surface} strokeWidth={2.5} />
                <Text style={styles.copyBtnText}>Copiar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      {/* Header Profile */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{getInitials()}</Text>
        </View>
        <Text style={styles.profileName}>{user?.name || user?.username || 'Comensal VIP'}</Text>
        <Text style={styles.profileEmail}>{user?.email || 'sin@correo.com'}</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* VIP Points section */}
        <View style={styles.vipCard}>
          <View style={styles.vipRow}>
            <View>
              <Text style={styles.vipBadge}>MIEMBRO GOURMET</Text>
              <Text style={styles.vipPoints}>Pasaporte BuenProvecho</Text>
            </View>
            <View style={styles.pointsNumberWrapper}>
              <Text style={styles.pointsNum}>{points || 0}</Text>
              <Text style={styles.pointsLabel}>Pts</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.redeemButton}
            onPress={() => setRedeemModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="pricetag-outline" size={16} color={COLORS.secondary} />
            <Text style={styles.redeemButtonText}>Canjear Recompensas</Text>
          </TouchableOpacity>
        </View>

        {/* Internal Tabs */}
        <View style={styles.tabsRow}>
          {renderTabButton('profile', 'Mi Perfil')}
          {renderTabButton('points', 'Puntos')}
          {renderTabButton('coupons', 'Cupones')}
        </View>

        {/* Profile Section */}
        {activeSection === 'profile' && (
          <>
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Datos del Perfil</Text>
                {!isEditing ? (
                  <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                    <Text style={styles.editButtonText}>Editar</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {isEditing ? (
                <View style={styles.editForm}>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Nombre Completo</Text>
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder="Tu nombre completo"
                    />
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Teléfono</Text>
                    <TextInput
                      style={styles.input}
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="Número telefónico"
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.formActions}>
                    <TouchableOpacity
                      style={[styles.formBtn, styles.cancelBtn]}
                      onPress={() => {
                        setName(user?.name || user?.username || '');
                        setPhone(user?.phone || '');
                        setIsEditing(false);
                      }}
                    >
                      <Text style={styles.cancelBtnText}>Cancelar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.formBtn, styles.saveBtn]}
                      onPress={handleUpdateProfile}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <ActivityIndicator size="small" color={COLORS.surface} />
                      ) : (
                        <Text style={styles.saveBtnText}>Guardar</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.infoFields}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Nombre</Text>
                    <Text style={styles.infoVal}>{user?.name || user?.username || 'N/A'}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Teléfono</Text>
                    <Text style={styles.infoVal}>{user?.phone || 'Sin número registrado'}</Text>
                  </View>
                  <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                    <Text style={styles.infoLabel}>Rol de Cuenta</Text>
                    <Text style={styles.infoVal}>Cliente Final</Text>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.optionsSection}>
              <TouchableOpacity
                style={styles.premiumOption}
                onPress={() => {
                  if (navigation) {
                    navigation.navigate('ClientHistory');
                  }
                }}
                activeOpacity={0.7}
              >
                <Ionicons name="receipt-outline" size={20} color={COLORS.secondary} style={styles.premiumOptionIcon} />
                <Text style={styles.premiumOptionText}>Ver Mi Historial de Pedidos</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.secondary} style={styles.premiumOptionArrow} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.premiumOption}
                onPress={() => setPassModalVisible(true)}
                activeOpacity={0.7}
              >
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.secondary} style={styles.premiumOptionIcon} />
                <Text style={styles.premiumOptionText}>Cambiar Contraseña</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.secondary} style={styles.premiumOptionArrow} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.premiumOption, styles.premiumOptionDanger]}
                onPress={handleLogout}
                activeOpacity={0.7}
              >
                <Ionicons name="log-out-outline" size={20} color={COLORS.error} style={styles.premiumOptionIcon} />
                <Text style={[styles.premiumOptionText, styles.premiumOptionTextDanger]}>Cerrar Sesión</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.error} style={styles.premiumOptionArrow} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.premiumOption, styles.premiumOptionDelete]}
                onPress={handleDeleteAccount}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={20} color={COLORS.error} style={styles.premiumOptionIcon} />
                <Text style={[styles.premiumOptionText, styles.premiumOptionTextDelete]}>Eliminar Cuenta</Text>
                <Ionicons name="chevron-forward" size={20} color={COLORS.error} style={styles.premiumOptionArrow} />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Points Section */}
        {activeSection === 'points' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Historial de Puntos</Text>
            {renderPointsHistory()}
          </View>
        )}

        {/* Coupons Section */}
        {activeSection === 'coupons' && (
          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Mis Cupones</Text>
            {renderCoupons()}
          </View>
        )}
      </ScrollView>

      {/* Redeem Modal */}
      <Modal visible={redeemModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.redeemModalContent}>
            <View style={styles.redeemModalHeader}>
              <Text style={styles.redeemModalTitle}>Recompensas VIP</Text>
              <TouchableOpacity onPress={() => setRedeemModalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.redeemModalSubtitle}>
              Tienes {points || 0} pts disponibles
            </Text>
            <View style={styles.redeemList}>
              {REWARDS.map((reward) => {
                const enough = (points || 0) >= reward.cost;
                return (
                  <TouchableOpacity
                    key={reward.id}
                    style={[styles.rewardCard, !enough && styles.rewardCardDisabled]}
                    onPress={() => enough && handleRedeem(reward)}
                    activeOpacity={0.7}
                    disabled={!enough}
                  >
                    <View style={styles.rewardInfo}>
                      <Text style={[styles.rewardLabel, !enough && styles.rewardLabelDisabled]}>
                        {reward.label}
                      </Text>
                      <Text style={[styles.rewardCost, !enough && styles.rewardCostDisabled]}>
                        {reward.cost} pts
                      </Text>
                    </View>
                    <Ionicons
                      name={enough ? 'chevron-forward' : 'lock-closed-outline'}
                      size={18}
                      color={enough ? COLORS.secondary : COLORS.textMuted}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Password Change Modal */}
      <Modal visible={passModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seguridad</Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setPassModalVisible(false)}
              >
                <X size={16} color={COLORS.secondary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <Text style={styles.modalSubtitle}>Modifica tu clave de acceso</Text>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Contraseña Actual</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Nueva Contraseña</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Confirmar Contraseña</Text>
                <TextInput
                  style={styles.input}
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  placeholderTextColor={COLORS.textMuted}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalCancelBtn]}
                onPress={() => setPassModalVisible(false)}
              >
                <Text style={styles.modalCancelBtnText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalSaveBtn]}
                onPress={handleChangePassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={COLORS.surface} />
                ) : (
                  <Text style={styles.modalSaveBtnText}>Modificar</Text>
                )}
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
  header: {
    backgroundColor: COLORS.secondary,
    paddingTop: 60,
    paddingBottom: SPACING.xl,
    alignItems: 'center',
    borderBottomWidth: 4,
    borderColor: COLORS.secondary,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    borderWidth: 3,
    borderColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
    ...SHADOWS.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '950',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
  },
  profileName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.surface,
    textTransform: 'uppercase',
    letterSpacing: -0.5,
  },
  profileEmail: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.primaryLight,
    fontWeight: '600',
    marginTop: SPACING.xxs,
  },
  scrollView: {
    flex: 1,
    padding: SPACING.md,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tabButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  tabButtonActive: {
    backgroundColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  tabButtonText: {
    fontSize: 9,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tabButtonTextActive: {
    color: COLORS.surface,
  },
  vipCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 3,
    borderColor: COLORS.secondary,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
    marginTop: SPACING.xs,
  },
  vipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vipBadge: {
    fontSize: 10,
    fontWeight: '950',
    fontFamily: FONTS.black,
    color: COLORS.primaryDark,
    letterSpacing: 1,
  },
  vipPoints: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginTop: SPACING.xxs,
  },
  pointsNumberWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
  },
  pointsNum: {
    fontSize: 24,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.surface,
  },
  pointsLabel: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.primary,
    marginLeft: SPACING.xxs,
    textTransform: 'uppercase',
  },
  sectionCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 3,
    borderColor: COLORS.secondary,
    borderRadius: 16,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },
  editButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    borderRadius: 8,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  editButtonText: {
    fontSize: 10,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  infoFields: {
    gap: SPACING.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.xs,
    borderBottomWidth: 1,
    borderColor: `${COLORS.secondary}10`,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  infoVal: {
    fontSize: 13,
    fontWeight: '850',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
  },
  editForm: {
    gap: SPACING.sm,
  },
  formGroup: {
    marginBottom: SPACING.xs,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
  },
  formActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  formBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
  },
  cancelBtn: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.secondary,
  },
  cancelBtnText: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  saveBtn: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  saveBtnText: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.surface,
    textTransform: 'uppercase',
  },
  optionsSection: {
    gap: SPACING.sm,
    marginBottom: SPACING.xxl,
  },
  premiumOption: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.md,
  },
  premiumOptionIcon: {
    width: 28,
    textAlign: 'center',
  },
  premiumOptionText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginLeft: SPACING.sm,
  },
  premiumOptionArrow: {
    marginLeft: SPACING.sm,
  },
  premiumOptionDanger: {
    borderColor: COLORS.error,
  },
  premiumOptionTextDanger: {
    color: COLORS.error,
  },
  premiumOptionDelete: {
    borderColor: COLORS.error,
    marginTop: SPACING.xs,
  },
  premiumOptionTextDelete: {
    color: COLORS.error,
  },
  // Points History Styles
  sectionLoader: {
    paddingVertical: SPACING.xxl,
    alignItems: 'center',
  },
  emptyBox: {
    paddingVertical: SPACING.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: SPACING.md,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm,
  },
  retryBtnText: {
    fontSize: 9,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pointsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 10,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  pointsCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: SPACING.sm,
  },
  pointsIconBox: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    marginRight: SPACING.sm,
  },
  pointsCardInfo: {
    flex: 1,
  },
  pointsCardDesc: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xxs,
  },
  pointsCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  pointsStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pointsStatusText: {
    fontSize: 8,
    fontWeight: '900',
    fontFamily: FONTS.black,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pointsCardDate: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: COLORS.textMuted,
  },
  pointsAmount: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    fontFamily: FONTS.black,
  },
  // Coupons Styles
  couponCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 10,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  couponIconBox: {
    width: 44,
    height: 44,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  couponHeaderInfo: {
    flex: 1,
  },
  couponTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xxs,
  },
  couponExpiry: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: COLORS.textLight,
  },
  codeRow: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderStyle: 'dashed',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 8,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: SPACING.xs,
  },
  codeValue: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    letterSpacing: 3,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    ...SHADOWS.sm,
  },
  copyBtnSuccess: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  copyBtnText: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.surface,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 23, 18, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '65%',
    borderWidth: 4,
    borderColor: COLORS.secondary,
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderColor: COLORS.secondary,
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    flex: 1,
    padding: SPACING.md,
  },
  modalSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 4,
    borderColor: COLORS.secondary,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  modalCancelBtn: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.secondary,
  },
  modalCancelBtnText: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  modalSaveBtn: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
    ...SHADOWS.md,
  },
  modalSaveBtnText: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.surface,
    textTransform: 'uppercase',
  },
  redeemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.md,
  },
  redeemButtonText: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  redeemModalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    margin: SPACING.md,
    padding: SPACING.md,
    ...SHADOWS.md,
  },
  redeemModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  redeemModalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  redeemModalSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: COLORS.textLight,
    marginBottom: SPACING.md,
  },
  redeemList: {
    gap: SPACING.sm,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    padding: SPACING.md,
    ...SHADOWS.md,
  },
  rewardCardDisabled: {
    borderColor: COLORS.textMuted,
    shadowOpacity: 0,
    elevation: 0,
    opacity: 0.6,
  },
  rewardInfo: {
    gap: SPACING.xxs,
  },
  rewardLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  rewardLabelDisabled: {
    color: COLORS.textMuted,
  },
  rewardCost: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: COLORS.textLight,
  },
  rewardCostDisabled: {
    color: COLORS.textMuted,
  },
});

export default ProfileScreen;
