import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../../shared/constants/theme';

const ReservationModal = ({ visible, onClose, restaurant }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    reservation_date: '',
    reservation_time: '19:00',
    party_size: 2,
    special_requests: '',
  });
  const [selectedTable, setSelectedTable] = useState(null);

  const handleInputChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!form.customer_name || !form.customer_phone || !form.reservation_date) {
        alert('Completa nombre, teléfono y fecha');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!selectedTable) {
        alert('Selecciona una mesa');
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
    // API call to create reservation
    setTimeout(() => {
      setLoading(false);
      alert('¡Reservación solicitada con éxito!');
      onClose();
      setStep(1);
      setForm({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        reservation_date: '',
        reservation_time: '19:00',
        party_size: 2,
        special_requests: '',
      });
      setSelectedTable(null);
    }, 1500);
  };

  // Mock tables data
  const tables = [
    { id: 1, table_number: 1, location: 'Terraza', capacity: 4, status: 'available' },
    { id: 2, table_number: 2, location: 'Terraza', capacity: 4, status: 'available' },
    { id: 3, table_number: 3, location: 'Interior', capacity: 2, status: 'available' },
    { id: 4, table_number: 4, location: 'Interior', capacity: 6, status: 'occupied' },
    { id: 5, table_number: 5, location: 'VIP', capacity: 8, status: 'available' },
    { id: 6, table_number: 6, location: 'VIP', capacity: 10, status: 'available' },
  ];

  const availableTables = tables.filter(
    (table) => table.status === 'available' && table.capacity >= form.party_size
  );

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Información de Reserva</Text>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Nombre Completo</Text>
        <TextInput
          style={styles.input}
          value={form.customer_name}
          onChangeText={(text) => handleInputChange('customer_name', text)}
          placeholder="Tu nombre"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Teléfono</Text>
        <TextInput
          style={styles.input}
          value={form.customer_phone}
          onChangeText={(text) => handleInputChange('customer_phone', text)}
          placeholder="+502 1234-5678"
          keyboardType="phone-pad"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Email (Opcional)</Text>
        <TextInput
          style={styles.input}
          value={form.customer_email}
          onChangeText={(text) => handleInputChange('customer_email', text)}
          placeholder="tu@email.com"
          keyboardType="email-address"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Fecha</Text>
        <TextInput
          style={styles.input}
          value={form.reservation_date}
          onChangeText={(text) => handleInputChange('reservation_date', text)}
          placeholder="YYYY-MM-DD"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Hora</Text>
        <TextInput
          style={styles.input}
          value={form.reservation_time}
          onChangeText={(text) => handleInputChange('reservation_time', text)}
          placeholder="19:00"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Número de Personas</Text>
        <View style={styles.partySizeContainer}>
          {[2, 4, 6, 8].map((size) => (
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
        <Text style={styles.label}>Solicitudes Especiales (Opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={form.special_requests}
          onChangeText={(text) => handleInputChange('special_requests', text)}
          placeholder="Alguna preferencia especial..."
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Selecciona tu Mesa</Text>
      <Text style={styles.stepSubtitle}>
        Mesas disponibles para {form.party_size} personas
      </Text>
      <ScrollView style={styles.tablesContainer}>
        {availableTables.map((table) => (
          <TouchableOpacity
            key={table.id}
            style={[
              styles.tableCard,
              selectedTable?.id === table.id && styles.tableCardSelected,
            ]}
            onPress={() => setSelectedTable(table)}
          >
            <View style={styles.tableHeader}>
              <Text style={styles.tableNumber}>Mesa #{table.table_number}</Text>
              <View style={styles.locationBadge}>
                <Text style={styles.locationBadgeText}>{table.location}</Text>
              </View>
            </View>
            <Text style={styles.tableCapacity}>Capacidad: {table.capacity} personas</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Confirmar Reservación</Text>
      <View style={styles.summaryCard}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Nombre:</Text>
          <Text style={styles.summaryValue}>{form.customer_name}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Teléfono:</Text>
          <Text style={styles.summaryValue}>{form.customer_phone}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Fecha:</Text>
          <Text style={styles.summaryValue}>{form.reservation_date}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Hora:</Text>
          <Text style={styles.summaryValue}>{form.reservation_time}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Personas:</Text>
          <Text style={styles.summaryValue}>{form.party_size}</Text>
        </View>
        {selectedTable && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Mesa:</Text>
            <Text style={styles.summaryValue}>
              #{selectedTable.table_number} ({selectedTable.location})
            </Text>
          </View>
        )}
        {form.special_requests && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Notas:</Text>
            <Text style={styles.summaryValue}>{form.special_requests}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Reservar Mesa</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Progress Steps */}
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

          <ScrollView style={styles.modalBody}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
          </ScrollView>

          <View style={styles.modalFooter}>
            {step > 1 && (
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handlePreviousStep}
              >
                <Text style={styles.secondaryButtonText}>Atrás</Text>
              </TouchableOpacity>
            )}
            {step < 3 ? (
              <TouchableOpacity style={styles.primaryButton} onPress={handleNextStep}>
                <Text style={styles.primaryButtonText}>Siguiente</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.primaryButton, loading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.surface} />
                ) : (
                  <Text style={styles.primaryButtonText}>Confirmar</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    borderWidth: 2,
    borderColor: COLORS.secondary,
    ...SHADOWS.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIndicatorActive: {
    backgroundColor: COLORS.secondary,
  },
  stepIndicatorText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  stepIndicatorTextActive: {
    color: COLORS.surface,
  },
  stepConnector: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.xs,
  },
  modalBody: {
    flex: 1,
    padding: SPACING.lg,
  },
  stepContent: {
    paddingBottom: SPACING.lg,
  },
  stepTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.md,
  },
  stepSubtitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
  },
  formGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.secondary,
    ...SHADOWS.sm,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  partySizeContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  partySizeButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 8,
    alignItems: 'center',
  },
  partySizeButtonActive: {
    backgroundColor: COLORS.secondary,
  },
  partySizeButtonText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  partySizeButtonTextActive: {
    color: COLORS.surface,
  },
  tablesContainer: {
    maxHeight: 300,
  },
  tableCard: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  tableCardSelected: {
    backgroundColor: COLORS.secondary,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  tableNumber: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    color: COLORS.secondary,
  },
  tableNumberSelected: {
    color: COLORS.surface,
  },
  locationBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 6,
  },
  locationBadgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    color: COLORS.surface,
    textTransform: 'uppercase',
  },
  tableCapacity: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textLight,
  },
  tableCapacitySelected: {
    color: COLORS.surface,
  },
  summaryCard: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    padding: SPACING.lg,
    ...SHADOWS.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.textLight,
  },
  summaryValue: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.secondary,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.lg,
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '800',
    color: COLORS.surface,
    textTransform: 'uppercase',
  },
});

export default ReservationModal;
