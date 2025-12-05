export const COLORS = {
  // NEXUS Dark Theme
  background: '#020617',
  surface: '#0f172a',
  card: '#1e293b',
  
  // Brand Colors
  primary: '#06b6d4',      // Cyan
  secondary: '#8b5cf6',    // Purple
  accent: '#a3e635',       // Lime
  
  // Status
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  
  // Text
  text: '#ffffff',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  
  // Borders
  border: '#334155',
  borderLight: '#475569',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
};

// Navigation Theme
import { DarkTheme } from '@react-navigation/native';
export const AppTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.text,
    border: COLORS.border,
    primary: COLORS.primary,
    notification: COLORS.error,
  },
};
