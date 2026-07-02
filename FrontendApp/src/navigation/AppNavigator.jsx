import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStack from './AuthStack';
import MainTabNavigator from './MainTabNavigator';
import RestaurantDetailScreen from '../features/restaurants/screens/RestaurantDetailScreen';
import RestaurantMenuScreen from '../features/restaurants/screens/RestaurantMenuScreen';
import ClientHistoryScreen from '../features/client/screens/ClientHistoryScreen';