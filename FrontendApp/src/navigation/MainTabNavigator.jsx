import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZE, FONTS } from '../shared/constants/theme';
import ClientDashboardScreen from '../features/client/screens/ClientDashboardScreen';
import ClientHistoryScreen from '../features/client/screens/ClientHistoryScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import EventsScreen from '../features/events/screens/EventsScreen';
const Tab = createBottomTabNavigator();

const HomeIcon = ({ focused }) => (
  <Ionicons name={focused ? 'business' : 'business-outline'} size={22} color={COLORS.secondary} />
);

const OrdersIcon = ({ focused }) => (
  <Ionicons name={focused ? 'receipt' : 'receipt-outline'} size={22} color={COLORS.secondary} />
);

const EventsIcon = ({ focused }) => (
  <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={22} color={COLORS.secondary} />
);

const ProfileIcon = ({ focused }) => (
  <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={COLORS.secondary} />
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
          fontFamily: FONTS.bold,
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
        name="Orders"
        component={ClientHistoryScreen}
        options={{
          tabBarLabel: 'Pedidos',
          tabBarIcon: OrdersIcon,
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
