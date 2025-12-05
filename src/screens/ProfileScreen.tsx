import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../services/supabase';
import { signOut, getCurrentUser } from '../services/auth';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/colors';

export default function ProfileScreen({ navigation }: any) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Abmelden',
      'Möchtest du dich wirklich abmelden?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Abmelden',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await signOut();
              // Der Auth-State-Listener in AppNavigator 
              // wird automatisch den Wechsel zum Login-Screen triggern
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Fehler', 'Abmeldung fehlgeschlagen');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    { 
      label: 'Einstellungen', 
      icon: 'settings-outline' as const, 
      onPress: () => Alert.alert('Info', 'Einstellungen kommen bald!') 
    },
    { 
      label: 'Abonnement', 
      icon: 'card-outline' as const, 
      onPress: () => navigation.navigate('Paywall') 
    },
    { 
      label: 'Hilfe & Support', 
      icon: 'help-circle-outline' as const, 
      onPress: () => Alert.alert('Support', 'Schreibe uns an support@salesflow.ai') 
    },
    { 
      label: 'Abmelden', 
      icon: 'log-out-outline' as const, 
      onPress: handleLogout,
      isDestructive: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profil</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileIconContainer}>
            <Ionicons name="person-circle" size={80} color={COLORS.primary} />
          </View>
          <Text style={styles.profileName}>
            {user?.user_metadata?.name || 'Benutzer'}
          </Text>
          <Text style={styles.profileEmail}>
            {user?.email || 'Keine E-Mail'}
          </Text>
          <View style={styles.statusBadge}>
            <Ionicons name="checkmark-circle" size={14} color={COLORS.success} />
            <Text style={styles.statusText}>Aktiv</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={item.onPress}
              activeOpacity={0.7}
              disabled={loading}
            >
              <View style={[
                styles.menuItem,
                item.isDestructive && styles.menuItemDestructive
              ]}>
                <Ionicons 
                  name={item.icon} 
                  size={22} 
                  color={item.isDestructive ? COLORS.error : COLORS.textMuted} 
                  style={styles.menuIcon}
                />
                <Text style={[
                  styles.menuLabel,
                  item.isDestructive && styles.menuLabelDestructive
                ]}>
                  {item.label}
                </Text>
                {loading && item.isDestructive ? (
                  <ActivityIndicator size="small" color={COLORS.error} />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appInfoText}>Sales Flow AI v1.0.0</Text>
          <Text style={styles.appInfoText}>© 2024 Sales Flow</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  profileCard: {
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xl,
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  profileIconContainer: {
    marginBottom: SPACING.md,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
  },
  menuContainer: {
    marginBottom: SPACING.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuItemDestructive: {
    borderColor: COLORS.error + '30',
    backgroundColor: COLORS.error + '10',
  },
  menuIcon: {
    marginRight: SPACING.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  menuLabelDestructive: {
    color: COLORS.error,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  appInfoText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
});
