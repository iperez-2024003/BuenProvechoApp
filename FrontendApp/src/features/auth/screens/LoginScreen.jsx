import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
  TouchableOpacity,
  Animated,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useForm, Controller } from 'react-hook-form';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import Button from '../../../shared/components/common/Button';
import { authService } from '../../../shared/api/axiosClient';


const uploadImages = [
  require('../../../../assets/img/Restaurante1.webp'),
  require('../../../../assets/img/Restaurante2.webp'),
  require('../../../../assets/img/Restaurante3.webp'),
];

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