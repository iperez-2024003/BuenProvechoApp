import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';

const OrdersScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pedidos</Text>
      <Text style={styles.subtitle}>Próximamente...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.textLight,
  },
});

export default OrdersScreen;
