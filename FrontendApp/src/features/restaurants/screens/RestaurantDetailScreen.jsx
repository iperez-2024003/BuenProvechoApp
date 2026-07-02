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

export default RestaurantDetailScreen;