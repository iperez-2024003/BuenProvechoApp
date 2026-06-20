import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import Input from '../../../shared/components/common/Input';
import Button from '../../../shared/components/common/Button';

// Mock de hook de autenticación o placeholder para conectar la API en el futuro
// según la lógica del hook de login web
const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const login = async (email, password) => {
    setIsLoading(true);
    // Simulación de llamada API
    return new Promise((resolve) => {
      setTimeout(() => {
        setIsLoading(false);
        if (email === 'admin@buenprovecho.com' && password === '123456') {
          resolve({ success: true });
        } else if (email !== 'admin@buenprovecho.com') {
          resolve({ success: false, code: 'USER_NOT_FOUND', error: 'Usuario no encontrado' });
        } else {
          resolve({ success: false, code: 'INVALID_PASSWORD', error: 'Contraseña incorrecta' });
        }
      }, 1500);
    });
  };
  return { login, isLoading };
};

const LoginScreen = ({ navigation }) => {
  const { login, isLoading } = useAuth();
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

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      Alert.alert('Éxito', '¡Bienvenido de nuevo al panel gastronómico!');
      // Aquí redirigimos al flujo principal (Dashboard/Home)
    } else {
      if (result.code === 'USER_NOT_FOUND') {
        setError('email', { type: 'manual', message: result.error });
      } else if (result.code === 'INVALID_PASSWORD') {
        setError('password', { type: 'manual', message: result.error });
      } else {
        Alert.alert('Error', result.error || 'Ocurrió un error inesperado');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>
              Acceso <Text style={styles.brandText}>VIP</Text>
            </Text>
            <Text style={styles.subtitle}>Panel de Control Gastronómico</Text>
          </View>

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
              <Input
                label="Usuario / Email"
                placeholder="admin@buenprovecho.com"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                autoCapitalize="none"
                keyboardType="email-address"
                error={errors.email?.message}
              />
            )}
            name="email"
          />

          <Controller
            control={control}
            rules={{ required: 'Ingresa tu contraseña' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Contraseña"
                placeholder="••••••••"
                secureTextEntry
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.password?.message}
              />
            )}
            name="password"
          />

          <Button
            title="Entrar al Sistema"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            style={styles.button}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Nuevo Restaurante?</Text>
            <Button
              title="Registrar Cuenta"
              variant="secondary"
              onPress={() => navigation.navigate('Register')}
              style={styles.registerButton}
            />
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
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  formContainer: {
    width: '100%',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    // Efecto neo-brutalista similar al de la web (sombra dura)
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  brandText: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: COLORS.textLight,
    marginTop: SPACING.xs,
  },
  button: {
    marginTop: SPACING.md,
  },
  footer: {
    marginTop: SPACING.xl,
    paddingTop: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  footerText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: COLORS.textLight,
  },
  registerButton: {
    marginTop: SPACING.xs,
  },
});

export default LoginScreen;
