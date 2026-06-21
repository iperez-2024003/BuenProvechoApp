import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import { restaurantService, reservationService } from '../../../shared/api/axiosClient';

const TIME_OPTIONS = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30',
];

const ReservationModal = ({ visible, onClose, restaurant }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    reservation_date: '',
    reservation_time: '19:00',
    party_size: 2,
    special_requests: '',
  });

  const [restaurantTables, setRestaurantTables] = useState([]);
  const [occupiedTableIds, setOccupiedTableIds] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [successData, setSuccessData] = useState(null);

  // Pre-fill user data and today's date when modal is opened
  useEffect(() => {
    if (visible) {
      const todayStr = new Date().toISOString().split('T')[0];
      setForm((prev) => ({ ...prev, reservation_date: todayStr }));
      loadUserData();
    }
  }, [visible]);

  const loadUserData = async () => {
    try {
      const userDataJson = await AsyncStorage.getItem('userData');
      if (userDataJson) {
        const currentUser = JSON.parse(userDataJson);
        setUser(currentUser);
        setForm((prev) => ({
          ...prev,
          customer_name: currentUser.name || currentUser.username || '',
          customer_phone: currentUser.phone || '',
          customer_email: currentUser.email || '',
        }));
      }
    } catch (error) {
      console.error('Error loading user data in ReservationModal:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleVerifyAvailability = async () => {
    if (!form.customer_name.trim() || !form.customer_phone.trim() || !form.reservation_date.trim()) {
      Alert.alert('Campos Faltantes', 'Por favor completa tu nombre, teléfono y la fecha de reserva.');
      return;
    }

    // Format date validation
    if (!form.reservation_date.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert('Fecha Inválida', 'La fecha debe tener el formato AAAA-MM-DD.');
      return;
    }

    setLoading(true);
    try {
      let timeValue = form.reservation_time;
      if (timeValue.match(/^([01]\d|2[0-3]):([0-5]\d)$/)) {
        timeValue = `${timeValue}:00`;
      }

      const checkParams = {
        restaurant_id: restaurant.id || restaurant._id,
        reservation_date: form.reservation_date,
        reservation_time: timeValue,
        party_size: form.party_size,
      };

      const [availRes, tablesRes] = await Promise.all([
        reservationService.checkAvailability(checkParams),
        restaurantService.getTables(restaurant.id || restaurant._id),
      ]);

      const occupied = availRes.data?.data?.occupied_tables || [];
      const allTables = tablesRes.data?.data || tablesRes.data || [];

      setOccupiedTableIds(occupied);
      setRestaurantTables(allTables);
      setSelectedTable(null);
      setStep(2);
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Error al verificar disponibilidad';
      Alert.alert('Error de Disponibilidad', errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = () => {
    if (step === 2) {
      if (!selectedTable) {
        Alert.alert('Mesa Requerida', 'Por favor selecciona una mesa libre.');
        return;
      }
      setStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      let timeValue = form.reservation_time;
      if (timeValue.match(/^([01]\d|2[0-3]):([0-5]\d)$/)) {
        timeValue = `${timeValue}:00`;
      }

      const reservationData = {
        restaurant_id: restaurant.id || restaurant._id,
        user_id: user?.id || user?._id || null,
        customer_name: form.customer_name.trim(),
        customer_phone: form.customer_phone.trim(),
        customer_email: form.customer_email.trim() || undefined,
        reservation_date: form.reservation_date,
        reservation_time: timeValue,
        party_size: Number(form.party_size),
        special_requests: form.special_requests.trim() || undefined,
        table_id: selectedTable.id || selectedTable._id,
      };

      const result = await reservationService.create(reservationData);
      setSuccessData(result.data?.data || result.data || result);
      setStep(4); // Success step
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || 'Error al crear la reserva';
      Alert.alert('Error de Reserva', errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSuccessData(null);
    setSelectedTable(null);
    setForm({
      customer_name: user?.name || user?.username || '',
      customer_phone: user?.phone || '',
      customer_email: user?.email || '',
      reservation_date: new Date().toISOString().split('T')[0],
      reservation_time: '19:00',
      party_size: 2,
      special_requests: '',
    });
    onClose();
  };

  const getTableStatus = (table) => {
    const tableId = table.id || table._id;
    if (occupiedTableIds.includes(tableId)) return 'occupied';
    if (table.capacity < form.party_size) return 'insufficient';
    return 'available';
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Información de Reserva</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Nombre Completo</Text>
        <TextInput
          style={styles.input}
          value={form.customer_name}
          onChangeText={(text) => handleInputChange('customer_name', text)}
          placeholder="Tu nombre completo"
          placeholderTextColor={COLORS.textMuted}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Teléfono de Contacto</Text>
        <TextInput
          style={styles.input}
          value={form.customer_phone}
          onChangeText={(text) => handleInputChange('customer_phone', text)}
          placeholder="+502 5555-5555"
          keyboardType="phone-pad"
          placeholderTextColor={COLORS.textMuted}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email (Opcional)</Text>
        <TextInput
          style={styles.input}
          value={form.customer_email}
          onChangeText={(text) => handleInputChange('customer_email', text)}
          placeholder="ejemplo@correo.com"
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor={COLORS.textMuted}
        />
      </View>

      <View style={styles.rowInputs}>
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>Fecha (AAAA-MM-DD)</Text>
          <TextInput
            style={styles.input}
            value={form.reservation_date}
            onChangeText={(text) => handleInputChange('reservation_date', text)}
            placeholder="AAAA-MM-DD"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        <View style={[styles.formGroup, { width: 120, marginLeft: SPACING.sm }]}>
          <Text style={styles.label}>Hora</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeOptionsScroll}>
            <View style={styles.timeSelectorWrapper}>
              {TIME_OPTIONS.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeBadge,
                    form.reservation_time === time && styles.timeBadgeActive,
                  ]}
                  onPress={() => handleInputChange('reservation_time', time)}
                >
                  <Text
                    style={[
                      styles.timeBadgeText,
                      form.reservation_time === time && styles.timeBadgeTextActive,
                    ]}
                  >
                    {time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Número de Personas</Text>
        <View style={styles.partySizeContainer}>
          {[2, 4, 6, 8, 10].map((size) => (
            <TouchableOpacity
              key={size}
              style={[
                styles.partySizeButton,
                form.party_size === size && styles.partySizeButtonActive,
              ]}
              onPress={() => handleInputChange('party_size', size)}
            >
              <Text
                style={[
                  styles.partySizeButtonText,
                  form.party_size === size && styles.partySizeButtonTextActive,
                ]}
              >
                {size}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Notas para Cocina / Ocasión (Opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.special_requests}
          onChangeText={(text) => handleInputChange('special_requests', text)}
          placeholder="Ej: Aniversario, mesa cerca a ventana, alergias..."
          placeholderTextColor={COLORS.textMuted}
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderStep2 = () => {
    // Group tables by location/zone
    const grouped = restaurantTables.reduce((acc, t) => {
      const loc = t.location || 'Salón Principal';
      if (!acc[loc]) acc[loc] = [];
      acc[loc].push(t);
      return acc;
    }, {});

    return (
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>Selecciona tu Mesa</Text>
        <Text style={styles.stepSubtitle}>
          Mesas para {form.party_size} personas el {form.reservation_date} a las {form.reservation_time}
        </Text>

        {restaurantTables.length === 0 ? (
          <View style={styles.noTablesCard}>
            <Text style={styles.noTablesText}>⚠️ No hay mesas configuradas en esta sede.</Text>
          </View>
        ) : (
          Object.keys(grouped).map((zone) => (
            <View key={zone} style={styles.zoneSection}>
              <Text style={styles.zoneTitle}>📍 {zone.toUpperCase()}</Text>
              <View style={styles.tablesGrid}>
                {grouped[zone].map((table) => {
                  const status = getTableStatus(table);
                  const isSelected = selectedTable?.id === table.id || selectedTable?._id === table._id;
                  
                  let cardStyle = styles.tableCardAvailable;
                  let textStyle = styles.tableTextAvailable;
                  let statusText = 'Disponible 🟢';

                  if (status === 'occupied') {
                    cardStyle = styles.tableCardOccupied;
                    textStyle = styles.tableTextOccupied;
                    statusText = 'Ocupada 🔴';
                  } else if (status === 'insufficient') {
                    cardStyle = styles.tableCardInsufficient;
                    textStyle = styles.tableTextInsufficient;
                    statusText = 'Capacidad 🟡';
                  }

                  if (isSelected) {
                    cardStyle = styles.tableCardSelected;
                    textStyle = styles.tableTextSelected;
                  }

                  return (
                    <TouchableOpacity
                      key={table.id || table._id}
                      style={[styles.tableCardBase, cardStyle]}
                      onPress={() => status === 'available' && setSelectedTable(table)}
                      disabled={status !== 'available'}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.tableCardNum, textStyle]}>
                        MESA #{table.table_number || table.number}
                      </Text>
                      <Text style={[styles.tableCardCap, textStyle]}>
                        Cap: {table.capacity} pers
                      </Text>
                      <Text style={[styles.tableCardStatus, textStyle]}>
                        {statusText}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </View>
    );
  };

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Confirmar Reservación</Text>
      
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Resumen de la Experiencia</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Cliente</Text>
          <Text style={styles.summaryValue}>{form.customer_name}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Contacto</Text>
          <Text style={styles.summaryValue}>{form.customer_phone}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Fecha</Text>
          <Text style={styles.summaryValue}>{form.reservation_date}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Hora</Text>
          <Text style={styles.summaryValue}>{form.reservation_time}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Comensales</Text>
          <Text style={styles.summaryValue}>{form.party_size} personas</Text>
        </View>

        {selectedTable && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Mesa Reservada</Text>
            <Text style={styles.summaryValue}>
              Mesa #{selectedTable.table_number || selectedTable.number} ({selectedTable.location || 'Interior'})
            </Text>
          </View>
        )}

        {form.special_requests.trim() ? (
          <View style={[styles.summaryRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <Text style={styles.summaryLabel}>Solicitudes</Text>
            <Text style={styles.summaryValue}>{form.special_requests}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIconWrapper}>
        <Text style={styles.successIcon}>📅</Text>
      </View>
      <Text style={styles.successTitle}>¡Reserva Registrada!</Text>
      <Text style={styles.successSubtitle}>
        Tu mesa ha sido reservada con éxito. Puedes verificar el estado en cualquier momento.
      </Text>

      <View style={styles.receiptCard}>
        <Text style={styles.receiptLabel}>Detalles del Ticket</Text>
        
        <View style={styles.receiptRow}>
          <Text style={styles.receiptRowLabel}>Código Reserva</Text>
          <Text style={styles.receiptRowVal}>
            #{successData?.reservation_number?.split('-').pop() || 'RES-0001'}
          </Text>
        </View>

        <View style={styles.receiptRow}>
          <Text style={styles.receiptRowLabel}>Mesa</Text>
          <Text style={styles.receiptRowVal}>
            Mesa #{selectedTable?.table_number || selectedTable?.number} ({selectedTable?.location || 'Interior'})
          </Text>
        </View>

        <View style={styles.receiptRow}>
          <Text style={styles.receiptRowLabel}>Fecha y Hora</Text>
          <Text style={styles.receiptRowVal}>
            {form.reservation_date} @ {form.reservation_time}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.doneButton} onPress={handleClose}>
        <Text style={styles.doneButtonText}>Volver al Menú</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Reservar Mesa</Text>
            {step < 4 && (
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Progress Steps Indicators (Only steps 1 to 3) */}
          {step < 4 && (
            <View style={styles.progressContainer}>
              {[1, 2, 3].map((stepNumber) => (
                <View key={stepNumber} style={styles.stepIndicatorContainer}>
                  <View
                    style={[
                      styles.stepIndicator,
                      step >= stepNumber && styles.stepIndicatorActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepIndicatorText,
                        step >= stepNumber && styles.stepIndicatorTextActive,
                      ]}
                    >
                      {stepNumber}
                    </Text>
                  </View>
                  {stepNumber < 3 && <View style={styles.stepConnector} />}
                </View>
              ))}
            </View>
          )}

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </ScrollView>

          {/* Footer Actions (Only steps 1 to 3) */}
          {step < 4 && (
            <View style={styles.modalFooter}>
              {step > 1 && (
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handlePreviousStep}
                  disabled={loading}
                >
                  <Text style={styles.secondaryButtonText}>Atrás</Text>
                </TouchableOpacity>
              )}
              
              {step === 1 ? (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleVerifyAvailability}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.surface} size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Verificar Disponibilidad →</Text>
                  )}
                </TouchableOpacity>
              ) : step === 2 ? (
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleNextStep}
                  disabled={loading}
                >
                  <Text style={styles.primaryButtonText}>Siguiente</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.primaryButton, loading && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.surface} size="small" />
                  ) : (
                    <Text style={styles.primaryButtonText}>Confirmar Reserva</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(28, 23, 18, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '92%',
    borderWidth: 4,
    borderColor: COLORS.secondary,
    borderBottomWidth: 0,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 4,
    borderColor: COLORS.secondary,
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: -1,
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
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 2,
    borderColor: COLORS.border,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicatorActive: {
    backgroundColor: COLORS.secondary,
  },
  stepIndicatorText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '950',
    color: COLORS.secondary,
  },
  stepIndicatorTextActive: {
    color: COLORS.surface,
  },
  stepConnector: {
    width: 50,
    height: 3,
    backgroundColor: COLORS.secondary,
    marginHorizontal: SPACING.xs,
  },
  modalBody: {
    flex: 1,
    padding: SPACING.md,
  },
  stepContent: {
    paddingBottom: SPACING.xl,
  },
  stepTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  stepSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textLight,
    marginBottom: SPACING.md,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 10,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  rowInputs: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timeOptionsScroll: {
    height: 48,
  },
  timeSelectorWrapper: {
    flexDirection: 'row',
    gap: SPACING.xxs,
  },
  timeBadge: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.xs,
  },
  timeBadgeActive: {
    backgroundColor: COLORS.primary,
  },
  timeBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  timeBadgeTextActive: {
    color: COLORS.secondary,
  },
  partySizeContainer: {
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  partySizeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  partySizeButtonActive: {
    backgroundColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  partySizeButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  partySizeButtonTextActive: {
    color: COLORS.surface,
  },
  noTablesCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  noTablesText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.textLight,
  },
  zoneSection: {
    marginBottom: SPACING.lg,
  },
  zoneTitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '950',
    color: COLORS.primaryDark,
    marginBottom: SPACING.sm,
    letterSpacing: 1,
  },
  tablesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  tableCardBase: {
    width: '47%',
    padding: SPACING.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    gap: SPACING.xxs,
  },
  tableCardAvailable: {
    backgroundColor: '#bbf7d0', // green
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  tableTextAvailable: {
    color: COLORS.secondary,
  },
  tableCardOccupied: {
    backgroundColor: '#fecaca', // red
    opacity: 0.6,
  },
  tableTextOccupied: {
    color: '#991b1b',
  },
  tableCardInsufficient: {
    backgroundColor: '#fef08a', // yellow
    opacity: 0.65,
  },
  tableTextInsufficient: {
    color: '#854d0e',
  },
  tableCardSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.secondary,
    borderWidth: 3,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  tableTextSelected: {
    color: COLORS.secondary,
    fontWeight: '950',
  },
  tableCardNum: {
    fontSize: 12,
    fontWeight: '900',
  },
  tableCardCap: {
    fontSize: 10,
    fontWeight: '700',
  },
  tableCardStatus: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: SPACING.xs,
  },
  summaryCard: {
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
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: '950',
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: SPACING.sm,
    letterSpacing: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderColor: `${COLORS.secondary}10`,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 4,
    borderColor: COLORS.secondary,
  },
  secondaryButton: {
    width: '30%',
    backgroundColor: COLORS.background,
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
  secondaryButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  primaryButton: {
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
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.surface,
    textTransform: 'uppercase',
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
  doneButton: {
    width: '100%',
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  doneButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.surface,
    textTransform: 'uppercase',
  },
});

export default ReservationModal;
