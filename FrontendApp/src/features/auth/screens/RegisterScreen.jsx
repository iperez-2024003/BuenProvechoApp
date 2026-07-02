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