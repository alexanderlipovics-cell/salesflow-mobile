import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Navigation
import MainTabs from './MainTabs';
import OnboardingNavigator from './OnboardingNavigator';

// Auth Screens
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';

// App Screens
import ObjectionHandlerScreen from '../screens/ObjectionHandlerScreen';
import FollowUpScreen from '../screens/FollowUpScreen';
import ColdCallScreen from '../screens/ColdCallScreen';
import ClosingScreen from '../screens/ClosingScreen';
import AutopilotScreen from '../screens/AutopilotScreen';
import ProfileScreen from '../screens/ProfileScreen';
import PaywallScreen from '../screens/PaywallScreen';
import LeadDetailScreen from '../screens/LeadDetailScreen';
import MagicScriptScreen from '../screens/MagicScriptScreen';
import ScreenshotImportScreen from '../screens/ScreenshotImportScreen';
import CreateLeadScreen from '../screens/CreateLeadScreen';

// Services & Constants
import { supabase } from '../services/supabase';
import { checkOnboardingComplete } from '../services/onboarding';
import { COLORS } from '../constants/colors';

const Stack = createNativeStackNavigator();

// Auth-Status Typen
type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

/**
 * AppNavigator - Zentrale Navigation mit Auth-Flow
 * 
 * Auth-Status:
 * - 'loading': Session wird geprüft
 * - 'unauthenticated': Login/Signup Stack
 * - 'authenticated': App Stack (Onboarding/MainTabs/Screens)
 */
export default function AppNavigator() {
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Auth-Status prüfen und Session-Listener einrichten
  useEffect(() => {
    checkAuthStatus();
    
    // Listener für Auth-Änderungen (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        if (session) {
          // User ist eingeloggt
          await checkOnboardingStatus();
          setAuthStatus('authenticated');
        } else {
          // User ist ausgeloggt
          setAuthStatus('unauthenticated');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Session beim App-Start prüfen
  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Eingeloggt - Onboarding-Status prüfen
        await checkOnboardingStatus();
        setAuthStatus('authenticated');
      } else {
        // Nicht eingeloggt
        setAuthStatus('unauthenticated');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthStatus('unauthenticated');
    }
  };

  // Onboarding-Status prüfen
  const checkOnboardingStatus = async () => {
    try {
      const completed = await checkOnboardingComplete();
      setHasCompletedOnboarding(completed);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setHasCompletedOnboarding(false);
    }
  };

  // Callback für erfolgreichen Login/Signup
  const handleAuthSuccess = useCallback(() => {
    checkAuthStatus();
  }, []);

  // Loading Screen
  if (authStatus === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Lade...</Text>
      </View>
    );
  }

  // Nicht eingeloggt → Auth Stack
  if (authStatus === 'unauthenticated') {
    return (
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: COLORS.background },
        }}
      >
        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} onLoginSuccess={handleAuthSuccess} />}
        </Stack.Screen>
        <Stack.Screen name="Signup">
          {(props) => <SignupScreen {...props} onSignupSuccess={handleAuthSuccess} />}
        </Stack.Screen>
      </Stack.Navigator>
    );
  }

  // Eingeloggt → App Stack
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
      }}
    >
      {/* Onboarding Flow (nur wenn nicht abgeschlossen) */}
      {!hasCompletedOnboarding && (
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingNavigator} 
        />
      )}

      {/* Main Tabs (Home, Chat, Scripts, Leads, Tools) */}
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs} 
      />

      {/* Tool Screens (von ToolsScreen aus navigiert) */}
      <Stack.Screen 
        name="ObjectionHandler" 
        component={ObjectionHandlerScreen} 
      />
      <Stack.Screen 
        name="FollowUp" 
        component={FollowUpScreen} 
      />
      <Stack.Screen 
        name="ColdCall" 
        component={ColdCallScreen} 
      />
      <Stack.Screen 
        name="Closing" 
        component={ClosingScreen} 
      />
      <Stack.Screen 
        name="Autopilot" 
        component={AutopilotScreen} 
      />

      {/* Profile */}
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
      />

      {/* Lead Management */}
      <Stack.Screen 
        name="LeadDetailScreen" 
        component={LeadDetailScreen} 
      />
      <Stack.Screen 
        name="CreateLead" 
        component={CreateLeadScreen} 
      />

      {/* Modals */}
      <Stack.Screen 
        name="MagicScriptScreen" 
        component={MagicScriptScreen} 
        options={{ presentation: 'modal' }} 
      />
      <Stack.Screen 
        name="Paywall" 
        component={PaywallScreen}
        options={{ presentation: 'modal' }}
      />

      {/* Utility Screens */}
      <Stack.Screen 
        name="ScreenshotImport" 
        component={ScreenshotImportScreen} 
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textMuted,
  },
});
