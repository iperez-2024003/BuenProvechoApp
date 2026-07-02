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