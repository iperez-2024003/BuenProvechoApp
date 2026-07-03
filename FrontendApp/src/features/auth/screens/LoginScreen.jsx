import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TouchableOpacity,
  Animated,
  TextInput,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { COLORS, SPACING, FONT_SIZE, FONTS, SHADOWS } from '../../../shared/constants/theme';
import Button from '../../../shared/components/common/Button';
import useAuthStore from '../../profile/store/useAuthStore';
import useNotificationStore from '../../../shared/stores/useNotificationStore';
import { isUnverifiedAccount } from '../../../shared/utils/apiErrors';

const uploadImages = [
  require('../../../../assets/img/Restaurante1.webp'),
  require('../../../../assets/img/Restaurante2.webp'),
  require('../../../../assets/img/Restaurante3.webp'),
];

const LoginScreen = ({ navigation }) => {
  const { login, isLoading } = useAuthStore();
  const showNotification = useNotificationStore((s) => s.show);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    const timer = setInterval(() => {
      // Fade out current image
      Animated.timing(fadeAnim, {
        toValue: 0.15,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        // Change image
        setCurrentImageIndex((prev) => (prev + 1) % uploadImages.length);
        // Fade in new image
        Animated.timing(fadeAnim, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      });
    }, 6000);

    return () => clearInterval(timer);
  }, [fadeAnim]);

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      showNotification('Inicio de sesión exitoso', 'success');
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } else if (result.originalError && isUnverifiedAccount(result.originalError)) {
      showNotification(
        'Cuenta no verificada. Por favor, revisa tu bandeja de entrada o carpeta de spam para verificar tu cuenta',
        'info'
      );
    } else if (result.code === 'USER_NOT_FOUND' || result.code === 'INVALID_PASSWORD') {
      setError('email', { type: 'manual', message: 'Usuario o contraseña incorrectos' });
    } else {
      showNotification(result.error || 'Servicio temporalmente no disponible, intenta más tarde', 'error');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Background Image Carousel */}
      <View style={styles.carouselContainer}>
        <Animated.Image
          source={uploadImages[currentImageIndex]}
          style={[styles.carouselImage, { opacity: fadeAnim }]}
        />
        <View style={styles.overlay} />
      </View>

      {/* Geometric Decoration */}
      <View style={styles.geometricDecoration} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <View style={styles.header}>
            <Image
              source={require('../../../../assets/img/LogoBuenProvecho.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>
              Acceso <Text style={styles.brandText}>VIP</Text>
            </Text>
            <Text style={styles.subtitle}>Panel de Control Gastronómico</Text>
          </View>

          {/* Email/Username Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Usuario / Email</Text>
            <Controller
              control={control}
              rules={{
                required: 'Ingresa tu usuario o correo',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: 'Formato de correo inválido',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  style={[styles.input, errors.email && styles.errorInput]}
                  placeholder="admin@buenprovecho.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              )}
              name="email"
            />
            {errors.email?.message && (
              <Text style={styles.errorText}>{errors.email.message}</Text>
            )}
          </View>

          {/* Password Input with custom Eye Toggle */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <Controller
              control={control}
              rules={{ required: 'Ingresa tu contraseña' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={[styles.passwordWrapper, errors.password && styles.errorInput]}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="••••••••"
                    placeholderTextColor={COLORS.textMuted}
                    secureTextEntry={!showPassword}
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.eyeButtonText}>
                      {showPassword ? 'Ocultar' : 'Ver'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              name="password"
            />
            {errors.password?.message && (
              <Text style={styles.errorText}>{errors.password.message}</Text>
            )}
          </View>

          {/* Forgot Password Link */}
          <TouchableOpacity
            style={styles.forgotPasswordLink}
            onPress={() => navigation.navigate('ForgotPassword')}
            activeOpacity={0.7}
          >
            <Text style={styles.forgotPasswordText}>¿Olvidaste tu acceso?</Text>
          </TouchableOpacity>

          <Button
            title="Entrar al Sistema"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            style={styles.button}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Nuevo Restaurante?</Text>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
            >
              <Text style={styles.registerButtonText}>Registrar Cuenta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  carouselContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -2,
    backgroundColor: COLORS.secondary,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.background,
    opacity: 0.88, // Blend with page background
  },
  geometricDecoration: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    backgroundColor: COLORS.primary,
    opacity: 0.08,
    borderWidth: 4,
    borderColor: COLORS.secondary,
    transform: [{ rotate: '15deg' }],
    zIndex: -1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.md,
    justifyContent: 'center',
  },
  formContainer: {
    width: '100%',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 16,
    borderWidth: 4,
    borderColor: COLORS.secondary,
    ...SHADOWS.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  logo: {
    width: 140,
    height: 100,
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  brandText: {
    color: COLORS.primaryDark,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: FONTS.black,
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: COLORS.textLight,
    marginTop: SPACING.xxs,
  },
  inputContainer: {
    marginBottom: SPACING.md,
    width: '100%',
  },
  label: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    ...SHADOWS.md,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    paddingRight: SPACING.sm,
    ...SHADOWS.md,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
  },
  eyeButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    backgroundColor: COLORS.secondary,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  eyeButtonText: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.background,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  errorInput: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
  },
  forgotPasswordText: {
    fontSize: 9,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.primaryDark,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  button: {
    marginTop: SPACING.xs,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    ...SHADOWS.md,
  },
  footer: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  footerText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    fontFamily: FONTS.black,
    textTransform: 'uppercase',
    color: COLORS.textLight,
  },
  registerButton: {
    marginTop: SPACING.xxs,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    ...SHADOWS.md,
  },
  registerButtonText: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: FONTS.black,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: COLORS.secondary,
  },
});

export default LoginScreen;
