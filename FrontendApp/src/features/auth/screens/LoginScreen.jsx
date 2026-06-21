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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useForm, Controller } from 'react-hook-form';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../../shared/constants/theme';
import Input from '../../../shared/components/common/Input';
import Button from '../../../shared/components/common/Button';
import { authService } from '../../../shared/api/axiosClient';

// Hook de autenticación conectado a la API real
const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      const { token, userDetails } = response.data;
      
      // Guardar token en AsyncStorage
      await AsyncStorage.setItem('authToken', token);
      
      // Validar estrictamente antes de guardar userData
      const dataToSave = userDetails || response.data.user || response.data.userData || response.data;
      if (dataToSave) {
        await AsyncStorage.setItem('userData', JSON.stringify(dataToSave));
      }
      
      return { success: true, user: dataToSave };
    } catch (error) {
      setIsLoading(false);
      if (error.response) {
        const { status, data } = error.response;
        if (status === 401) {
          return { success: false, code: 'INVALID_CREDENTIALS', error: data.message || 'Credenciales inválidas' };
        } else if (status === 404) {
          return { success: false, code: 'USER_NOT_FOUND', error: data.message || 'Usuario no encontrado' };
        }
      }
      return { success: false, error: error.message || 'Error al conectar con el servidor' };
    } finally {
      setIsLoading(false);
    }
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
      // Navegar a MainTabs usando reset para limpiar el stack
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    } else {
      if (result.code === 'USER_NOT_FOUND' || result.code === 'INVALID_CREDENTIALS') {
        setError('email', { type: 'manual', message: result.error });
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
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.premium,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.huge,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: -2,
  },
  brandText: {
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
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
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
    alignItems: 'center',
    gap: SPACING.sm,
  },
  footerText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '800',
    textTransform: 'uppercase',
    color: COLORS.textLight,
  },
  registerButton: {
    marginTop: SPACING.xs,
  },
});

export default LoginScreen;
