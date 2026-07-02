import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../shared/constants/theme';
import ClientDashboardScreen from '../features/client/screens/ClientDashboardScreen';
import EventsScreen from '../features/events/screens/EventsScreen';
import OrdersScreen from '../features/orders/screens/OrdersScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const HomeIcon = ({ focused }) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ fontSize: 24 }}>{focused ? '🏠' : '🏠'}</Text>
  </View>
);

const EventsIcon = ({ focused }) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ fontSize: 24 }}>{focused ? '🎉' : '🎉'}</Text>
  </View>
);

const OrdersIcon = ({ focused }) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ fontSize: 24 }}>{focused ? '📦' : '📦'}</Text>
  </View>
);

const ProfileIcon = ({ focused }) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ fontSize: 24 }}>{focused ? '👤' : '👤'}</Text>
  </View>
);