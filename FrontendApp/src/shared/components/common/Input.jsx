import React from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';
import { COLORS, SPACING, FONT_SIZE, SHADOWS, FONTS } from '../../constants/theme';

const Input = ({ label, error, ...props }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.errorInput]}
        placeholderTextColor={COLORS.textLight}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    width: '100%',
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '900',
    fontFamily: FONTS.black,
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    ...SHADOWS.sm,
  },
  errorInput: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
    fontWeight: '800',
    fontFamily: FONTS.bold,
    textTransform: 'uppercase',
  },
});

export default Input;
