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
import { authService } from '../../../shared/api/axiosClient';

// Hook de registro de usuario conectado al backend real
const useRegister = () => {
  const [isLoading, setIsLoading] = useState(false);
  const registerUser = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        name: data.name,
        surname: data.surname,
        username: data.username,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: 'CLIENT_ROLE',
      };
      const response = await authService.register(payload);
      setIsLoading(false);
      return { success: true, message: response.data.message };
    } catch (error) {
      setIsLoading(false);
      return {
        success: false,
        error: error.response?.data?.message || 'Error al registrar la cuenta',
      };
    }
  };
  return { registerUser, isLoading };
};

const RegisterScreen = ({ navigation }) => {
  const { registerUser, isLoading } = useRegister();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      surname: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    const result = await registerUser(data);
    if (result.success) {
      Alert.alert(
        '¡Registro Exitoso!',
        'Cuenta creada. Por favor, verifica tu correo antes de iniciar sesión.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } else {
      Alert.alert('Error', result.error || 'No se pudo completar el registro');
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
              Nueva <Text style={styles.brandText}>Identidad</Text>
            </Text>
            <Text style={styles.subtitle}>Únete a la elite de la gestión</Text>
          </View>

          <View style={styles.row}>
            <View style={styles.flexItem}>
              <Controller
                control={control}
                rules={{ required: 'Requerido' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Nombre"
                    placeholder="Juan"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={errors.name?.message}
                  />
                )}
                name="name"
              />
            </View>
            <View style={styles.spacingHorizontal} />
            <View style={styles.flexItem}>
              <Controller
                control={control}
                rules={{ required: 'Requerido' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Apellido"
                    placeholder="Pérez"
                    value={value}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    error={errors.surname?.message}
                  />
                )}
                name="surname"
              />
            </View>
          </View>

          <Controller
            control={control}
            rules={{ required: 'Requerido' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Usuario"
                placeholder="juanperez"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                autoCapitalize="none"
                error={errors.username?.message}
              />
            )}
            name="username"
          />

          <Controller
            control={control}
            rules={{
              required: 'Requerido',
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: 'Correo inválido',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="juan@buenprovecho.com"
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
            rules={{
              required: 'Requerido',
              pattern: {
                value: /^\d{8,15}$/,
                message: '8 a 15 dígitos numéricos',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Teléfono"
                placeholder="55512345"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                keyboardType="phone-pad"
                error={errors.phone?.message}
              />
            )}
            name="phone"
          />

          <Controller
            control={control}
            rules={{
              required: 'Requerido',
              minLength: {
                value: 8,
                message: 'Mínimo 8 caracteres',
              },
            }}
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

          <Controller
            control={control}
            rules={{
              required: 'Requerido',
              validate: (value) =>
                value === password || 'Las contraseñas no coinciden',
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Confirmar"
                placeholder="••••••••"
                secureTextEntry
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.confirmPassword?.message}
              />
            )}
            name="confirmPassword"
          />

          <Button
            title="Crear Cuenta"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            style={styles.button}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
            <Button
              title="Iniciar Sesión"
              variant="secondary"
              onPress={() => navigation.navigate('Login')}
              style={styles.loginButton}
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
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  formContainer: {
    width: '100%',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    // Neo-brutalismo consistente con Login
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    marginVertical: SPACING.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
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
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  flexItem: {
    flex: 1,
  },
  spacingHorizontal: {
    width: SPACING.md,
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
  loginButton: {
    marginTop: SPACING.xs,
  },
});

export default RegisterScreen;
