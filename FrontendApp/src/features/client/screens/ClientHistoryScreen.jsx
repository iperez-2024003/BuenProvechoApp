import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import StarRating from '../../../shared/components/common/StarRating';
import { orderService, reservationService, restaurantService } from '../../../shared/api/axiosClient';

const STATUS_CLASSES = {
  pending: { bg: '#fffaf3', text: COLORS.warning, border: COLORS.secondary },
  preparing: { bg: '#fffaf3', text: COLORS.info, border: COLORS.secondary },
  ready: { bg: '#fffaf3', text: COLORS.success, border: COLORS.secondary },
  served: { bg: COLORS.secondary, text: COLORS.surface, border: COLORS.primary },
  paid: { bg: COLORS.success, text: COLORS.surface, border: COLORS.secondary },
  confirmed: { bg: COLORS.info, text: COLORS.surface, border: COLORS.secondary },
  completed: { bg: COLORS.secondary, text: COLORS.surface, border: COLORS.primary },
  cancelled: { bg: COLORS.textMuted, text: COLORS.textLight, border: COLORS.secondary },
};

const STATUS_TRANSLATIONS = {
  pending: 'Pendiente',
  preparing: 'Preparando',
  ready: 'Listo',
  served: 'Servido',
  paid: 'Pagado',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
};