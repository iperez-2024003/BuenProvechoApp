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

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 4,
          borderTopColor: COLORS.secondary,
          height: 70,
          paddingBottom: SPACING.sm,
          paddingTop: SPACING.sm,
        },
        tabBarLabelStyle: {
          fontSize: FONT_SIZE.xs,
          fontWeight: '700',
          textTransform: 'uppercase',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={ClientDashboardScreen}
        options={{
          tabBarLabel: 'Sedes',
          tabBarIcon: HomeIcon,
        }}
      />
      <Tab.Screen
        name="Events"
        component={EventsScreen}
        options={{
          tabBarLabel: 'Eventos',
          tabBarIcon: EventsIcon,
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Pedidos',
          tabBarIcon: OrdersIcon,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ProfileIcon,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;