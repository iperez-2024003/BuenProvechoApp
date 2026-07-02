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

const LoginScreen = ({ navigation }) => {
  const { login, isLoading } = useAuth();
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
      Alert.alert('Éxito', '¡Bienvenido de nuevo al panel gastronómico!');
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