import { DarkTheme } from '@react-navigation/native';

export const COLORS = {
  background: '#0a0a0a',
  card: '#171717',
  text: '#ffffff',
  textSecondary: '#9CA3AF',
  border: '#262626',
  primary: '#10B981',
  secondary: '#3B82F6',
  accent: '#F59E0B',
  error: '#EF4444',
};

export const AppTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: COLORS.background, card: COLORS.card, text: COLORS.text, border: COLORS.border, primary: COLORS.primary, notification: COLORS.error },
};

