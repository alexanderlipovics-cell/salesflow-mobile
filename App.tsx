import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppTheme } from './src/theme';
import { SubscriptionProvider } from './src/context/SubscriptionContext';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * Root App Component
 * 
 * Struktur:
 * - SubscriptionProvider: Verwaltet Abo-Status und Lead-Limits
 * - NavigationContainer: React Navigation Root mit Dark Theme
 * - AppNavigator: Zentrale Stack-Navigation (alle Screens)
 */
export default function App() {
  return (
    <SubscriptionProvider>
      <NavigationContainer theme={AppTheme}>
        <AppNavigator />
      </NavigationContainer>
    </SubscriptionProvider>
  );
}
