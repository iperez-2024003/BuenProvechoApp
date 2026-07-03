import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, SHADOWS, FONTS } from '../../constants/theme';

const Button = ({
  title,
  onPress,
  loading,
  variant = 'primary',
  style,
  ...props
}) => {
  const isSecondary = variant === 'secondary';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isSecondary ? styles.buttonSecondary : styles.buttonPrimary,
        loading && styles.buttonDisabled,
        style,
      ]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={isSecondary ? COLORS.primary : COLORS.surface}
        />
      ) : (
        <Text
          style={[
            styles.text,
            isSecondary ? styles.textSecondary : styles.textPrimary,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: COLORS.secondary,
    ...SHADOWS.md,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: COLORS.surface,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  text: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    fontFamily: FONTS.black,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  textPrimary: {
    color: COLORS.secondary,
  },
  textSecondary: {
    color: COLORS.secondary,
  },
});

export default Button;
