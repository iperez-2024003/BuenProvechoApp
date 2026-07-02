import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';

const RestaurantDetailScreen = ({ route }) => {
    const { id } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Dashboard del Restaurante</Text>
            <Text style={styles.subtitle}>ID: {id}</Text>
            <Text style={styles.placeholder}>Próximamente...</Text>
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
        fontSize: FONT_SIZE.md,
        fontWeight: '600',
        color: COLORS.textLight,
        marginBottom: SPACING.lg,
    },
    placeholder: {
        fontSize: FONT_SIZE.sm,
        fontWeight: '500',
        color: COLORS.textMuted,
    },
});

export default RestaurantDetailScreen;