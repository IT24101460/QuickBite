import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar, LogBox } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import AppNavigator from './src/navigation/AppNavigator';

LogBox.ignoreLogs(['Reanimated 2']);

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B35" />
      <AuthProvider>
        <CartProvider>
          <AppNavigator />
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}