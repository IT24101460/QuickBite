// Professional Admin Theme Design System
export const COLORS = {
  // Primary Orange Palette
  primary: '#FF6B35',
  primaryDark: '#E55A2B',
  primaryLight: '#FF8A5F',
  primaryUltraLight: '#FFF5F0',
  
  // Secondary Colors
  secondary: '#2C3E50',
  accent: '#E67E22',
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
  info: '#3498DB',
  
  // Neutral Colors
  background: '#F8F9FB',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F7FA',
  border: '#E1E8ED',
  borderLight: '#F0F3F7',
  
  // Text Colors
  textPrimary: '#2C3E50',
  textSecondary: '#7F8C8D',
  textTertiary: '#BDC3C7',
  textWhite: '#FFFFFF',
  textInverse: '#FFFFFF',
  
  // Status Colors
  status: {
    pending: '#F39C12',
    confirmed: '#3498DB',
    preparing: '#9B59B6',
    ready: '#27AE60',
    completed: '#7F8C8D',
    cancelled: '#E74C3C',
  }
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  h2: {
    fontSize: 22,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  h4: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textPrimary,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textTertiary,
  },
  button: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textWhite,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
};

export const BORDER_RADIUS = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  round: 50,
};

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
};

export const SIZES = {
  buttonHeight: 48,
  inputHeight: 48,
  iconSize: 24,
  avatarSize: 40,
};
