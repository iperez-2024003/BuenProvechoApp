import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStack from './AuthStack';
import MainTabNavigator from './MainTabNavigator';
import RestaurantDetailScreen from '../features/restaurants/screens/RestaurantDetailScreen';
import RestaurantMenuScreen from '../features/restaurants/screens/RestaurantMenuScreen';
import ClientHistoryScreen from '../features/client/screens/ClientHistoryScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Auth" component={AuthStack} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen 
          name="RestaurantDetail" 
          component={RestaurantDetailScreen}
          options={{ headerShown: true, title: 'Dashboard' }}
        />
        <Stack.Screen 
          name="RestaurantMenu" 
          component={RestaurantMenuScreen}
          options={{ headerShown: true, title: 'Menú' }}
        />
        <Stack.Screen 
          name="ClientHistory" 
          component={ClientHistoryScreen}
          options={{ headerShown: true, title: 'Mi Historial' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;