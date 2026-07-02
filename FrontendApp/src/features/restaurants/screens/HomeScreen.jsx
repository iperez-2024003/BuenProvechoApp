import React, { useState, useEffect, useMemo } from 'react';
import {
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TextInput,
    Image, 
    TouchableOpacity, 
    ActivityIndicator, 
    Dimensions,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZE, SHADOWS } from '../../../shared/constants/theme';
import { restaurantService } from '../../../shared/api/axiosClient';

const { width } = Dimensions.get('window');

const CATEGORY_LABELS = {
    casual: 'Casual', fine_dining: 'Fine Dining', fast_food: 'Rápida',
    cafe: 'Café', bakery: 'Panadería', bar: 'Bar', food_truck: 'Truck',
    buffet: 'Buffet', family_style: 'Familiar', gourmet: 'Gourmet', other: 'Otro',
};

const HomeScreen = ({ navigation }) => {
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
};