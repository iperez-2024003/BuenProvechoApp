import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../shared/constants/theme';
import HomeScreen from '../features/restaurants/screens/HomeScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopWidth: 2,
          borderTopColor: COLORS.border,
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
        component={HomeScreen}
        options={{
          tabBarLabel: 'Sedes',
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24 }}>{focused ? '🏠' : '🏠'}</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={() => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.textLight }}>
              Pedidos (Próximamente)
            </Text>
          </View>
        )}
        options={{
          tabBarLabel: 'Pedidos',
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24 }}>{focused ? '📦' : '📦'}</Text>
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={() => (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.textLight }}>
              Perfil (Próximamente)
            </Text>
          </View>
        )}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 24 }}>{focused ? '👤' : '👤'}</Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabNavigator;
