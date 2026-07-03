import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { CheckCircle2, AlertCircle, Mail } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZE, FONTS, SHADOWS } from '../../../shared/constants/theme';
import { authService } from '../../../shared/api/axiosClient';

const VerifyEmailScreen = ({ route, navigation }) => {
  const { token } = route.params || {};
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('Sincronizando identidad con el servidor...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('El enlace de seguridad es inválido o ha expirado.');
      return;
    }

    const verify = async () => {
      try {
        const response = await authService.verifyEmail({ token });
        setStatus('success');
        setMessage(response.data?.message || 'Tu identidad ha sido confirmada exitosamente.');
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.message || 'No se pudo completar el protocolo de seguridad.');
      }
    };

    verify();
  }, [token]);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {status === 'loading' && (
          <View style={styles.statusContainer}>
            <View style={styles.loadingIconWrapper}>
              <View style={styles.spinner} />
              <View style={styles.mailIconOverlay}>
                <Mail size={32} color={COLORS.primary} strokeWidth={2} />
              </View>
            </View>
            <Text style={styles.loadingText}>{message}</Text>
          </View>
        )}

        {status === 'success' && (
          <View style={styles.statusContainer}>
            <View style={[styles.statusIconWrapper, styles.successIconWrapper]}>
              <CheckCircle2 size={48} color={COLORS.surface} strokeWidth={2} />
            </View>
            <Text style={styles.statusTitle}>Acceso Autorizado</Text>
            <Text style={styles.statusMessage}>{message}</Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>Ingresar al Sistema</Text>
            </TouchableOpacity>
          </View>
        )}

        {status === 'error' && (
          <View style={styles.statusContainer}>
            <View style={[styles.statusIconWrapper, styles.errorIconWrapper]}>
              <AlertCircle size={48} color={COLORS.surface} strokeWidth={2} />
            </View>
            <Text style={styles.statusTitle}>Falla de Seguridad</Text>
            <Text style={styles.statusMessage}>{message}</Text>
            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Volver al Portal</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderWidth: 4,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    padding: SPACING.xl,
    ...SHADOWS.xl,
  },
  statusContainer: {
    alignItems: 'center',
  },
  loadingIconWrapper: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    position: 'relative',
  },
  spinner: {
    width: 80,
    height: 80,
    borderWidth: 4,
    borderColor: `${COLORS.primary}25`,
    borderTopColor: COLORS.primary,
    borderRadius: 40,
  },
  mailIconOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  statusIconWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
  },
  successIconWrapper: {
    backgroundColor: COLORS.success,
  },
  errorIconWrapper: {
    backgroundColor: COLORS.error,
  },
  statusTitle: {
    fontSize: FONT_SIZE.huge,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: -1,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  statusMessage: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: SPACING.xl,
  },
  actionButton: {
    width: '100%',
    backgroundColor: COLORS.secondary,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 10,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.md,
  },
  actionButtonText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.surface,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  secondaryButton: {
    backgroundColor: COLORS.background,
    borderColor: COLORS.secondary,
  },
  secondaryButtonText: {
    color: COLORS.secondary,
  },
});

export default VerifyEmailScreen;
