// SLIIT Eats - Theme Constants
// Copy this file to: src/constants/theme.ts

export const COLORS = {
  // Primary - Vibrant Orange
  primary: '#FF6B35',
  primaryLight: '#FF8C5A',
  primaryDark: '#E55A2B',
  
  // Secondary - Warm Amber
  secondary: '#FFB347',
  secondaryLight: '#FFC875',
  secondaryDark: '#E5982E',
  
  // Accent - Deep Orange
  accent: '#FF4500',
  
  // Neutrals
  white: '#FFFFFF',
  background: '#FFF9F5',
  card: '#FFFFFF',
  surface: '#FFF5EE',
  
  // Text
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  textOnPrimary: '#FFFFFF',
  
  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Borders & Dividers
  border: '#F3E8E2',
  divider: '#F5F5F5',
  
  // Shadows
  shadow: 'rgba(255, 107, 53, 0.15)',
}

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  // For custom fonts, replace with your font family names:
  // regular: 'Poppins-Regular',
  // medium: 'Poppins-Medium',
  // bold: 'Poppins-Bold',
}

export const SIZES = {
  // Spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  
  // Border Radius
  radiusSm: 8,
  radiusMd: 12,
  radiusLg: 16,
  radiusXl: 24,
  radiusFull: 9999,
  
  // Font Sizes
  fontXs: 10,
  fontSm: 12,
  fontMd: 14,
  fontLg: 16,
  fontXl: 18,
  font2xl: 20,
  font3xl: 24,
  font4xl: 28,
  font5xl: 32,
  
  // Icon Sizes
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  iconXl: 32,
}

export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
}
