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