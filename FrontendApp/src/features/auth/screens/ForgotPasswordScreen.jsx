import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, CheckCircle2, ShieldQuestion } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZE, FONTS, SHADOWS } from '../../../shared/constants/theme';
import { authService } from '../../../shared/api/axiosClient';
import useNotificationStore from '../../../shared/stores/useNotificationStore';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const showNotification = useNotificationStore((s) => s.show);

  const handleSubmit = async () => {
    if (!email.trim()) {
      showNotification('Ingresa tu correo electrónico.', 'error');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.forgotPassword({ email: email.trim() });
      setIsSent(true);
      showNotification(response.data?.message || 'Revisa tu bandeja de entrada.', 'success');
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al solicitar recuperación.';
      showNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
        <View style={styles.card}>
          {!isSent ? (
            <>
              <View style={styles.iconWrapper}>
                <ShieldQuestion size={40} color={COLORS.secondary} strokeWidth={2} />
              </View>

              <Text style={styles.title}>
                Recuperar <Text style={styles.titleAccent}>Acceso</Text>
              </Text>
              <Text style={styles.subtitle}>
                Te enviaremos el código de restauración a tu correo.
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Correo Electrónico</Text>
                <TextInput
                  style={styles.input}
                  placeholder="admin@buenprovecho.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={COLORS.surface} />
                ) : (
                  <Text style={styles.submitButtonText}>Enviar Instrucciones</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <View style={[styles.iconWrapper, styles.successIconWrapper]}>
                <CheckCircle2 size={56} color={COLORS.surface} strokeWidth={2} />
              </View>

              <Text style={styles.title}>¡Despachado!</Text>
              <Text style={styles.successText}>
                Revisa tu bandeja de entrada en:
              </Text>
              <Text style={styles.successEmail}>{email}</Text>

              <View style={styles.spamNotice}>
                <Text style={styles.spamNoticeText}>
                  No olvides revisar la carpeta de SPAM
                </Text>
              </View>
            </>
          )}

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <ArrowLeft size={18} color={COLORS.primaryDark} strokeWidth={2.5} />
              <Text style={styles.backButtonText}>Volver al Inicio</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderWidth: 4,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    padding: SPACING.lg,
    ...SHADOWS.xl,
  },
  iconWrapper: {
    width: 80,
    height: 80,
    backgroundColor: COLORS.background,
    borderWidth: 4,
    borderColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    alignSelf: 'center',
  },
  successIconWrapper: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.secondary,
    width: 96,
    height: 96,
  },
  title: {
    fontSize: FONT_SIZE.huge,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: -1,
    marginBottom: SPACING.sm,
  },
  titleAccent: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: FONTS.bold,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xl,
    lineHeight: 18,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    ...SHADOWS.sm,
  },
  submitButton: {
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 10,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.surface,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  successText: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  successEmail: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.primary,
    marginBottom: SPACING.lg,
  },
  spamNotice: {
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderStyle: 'dashed',
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  spamNoticeText: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: FONTS.bold,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 2,
    textAlign: 'center',
  },
  footer: {
    borderTopWidth: 4,
    borderTopColor: COLORS.secondary,
    paddingTop: SPACING.lg,
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  backButtonText: {
    fontSize: 11,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});

export default ForgotPasswordScreen;
