import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react-native';
import { COLORS, SPACING, FONT_SIZE, FONTS, SHADOWS } from '../../constants/theme';
import useNotificationStore from '../../stores/useNotificationStore';

const CONFIG = {
  success: { icon: CheckCircle2, color: COLORS.success, strip: COLORS.success },
  error: { icon: XCircle, color: COLORS.error, strip: COLORS.error },
  info: { icon: Info, color: COLORS.info, strip: COLORS.info },
};

const AUTO_DISMISS_MS = 3500;

const NotificationToast = () => {
  const { visible, message, type, hide } = useNotificationStore();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-120)).current;

  useEffect(() => {
    if (visible) {
      opacity.setValue(0);
      translateY.setValue(-120);

      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
          Animated.timing(translateY, { toValue: -120, duration: 250, useNativeDriver: true }),
        ]).start(() => hide());
      }, AUTO_DISMISS_MS);

      return () => clearTimeout(timer);
    }
  }, [visible, message, type]);

  if (!visible) return null;

  const cfg = CONFIG[type] || CONFIG.info;
  const Icon = cfg.icon;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        { opacity, transform: [{ translateY }] },
      ]}
    >
      <View style={[styles.strip, { backgroundColor: cfg.strip }]} />
      <Icon size={20} color={cfg.color} strokeWidth={2.5} />
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity onPress={hide} activeOpacity={0.7} style={styles.closeBtn}>
        <X size={16} color={COLORS.textLight} strokeWidth={2.5} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 60,
    left: SPACING.md,
    right: SPACING.md,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingVertical: SPACING.md,
    paddingRight: SPACING.md,
    paddingLeft: SPACING.sm,
    gap: SPACING.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.lg,
    elevation: 10,
  },
  strip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  message: {
    flex: 1,
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    fontFamily: FONTS.bold,
    color: COLORS.secondary,
    lineHeight: 17,
  },
  closeBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});

export default NotificationToast;
