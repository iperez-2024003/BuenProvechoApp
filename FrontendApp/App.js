import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts, Outfit_700Bold, Outfit_900Black } from '@expo-google-fonts/outfit';
import { View, ActivityIndicator } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import NotificationToast from './src/shared/components/common/NotificationToast';
import { COLORS } from './src/shared/constants/theme';

export default function App() {
  let [fontsLoaded] = useFonts({
    Outfit_700Bold,
    Outfit_900Black,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppNavigator />
      <NotificationToast />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
