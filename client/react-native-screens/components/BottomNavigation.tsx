// SLIIT Eats - Bottom Navigation Component
// Copy this file to: src/components/BottomNavigation.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const { width } = Dimensions.get('window');

interface BottomNavigationProps {
  currentRoute: string;
  navigation: any;
}

interface NavItem {
  name: string;
  route: string;
  icon: string;
  iconActive: string;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Home', route: 'Home', icon: 'home-outline', iconActive: 'home' },
  { name: 'Canteens', route: 'Canteens', icon: 'restaurant-outline', iconActive: 'restaurant' },
  { name: 'Cart', route: 'Cart', icon: 'cart-outline', iconActive: 'cart' },
  { name: 'Orders', route: 'Orders', icon: 'receipt-outline', iconActive: 'receipt' },
  { name: 'Profile', route: 'Profile', icon: 'person-outline', iconActive: 'person' },
];

const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentRoute, navigation }) => {
  const cartItemCount = 2; // Replace with actual cart count from state/context

  return (
    <View style={styles.container}>
      <View style={styles.navigation}>
        {NAV_ITEMS.map((item) => {
          const isActive = currentRoute === item.route;
          const isCart = item.route === 'Cart';

          return (
            <TouchableOpacity
              key={item.route}
              style={[styles.navItem, isCart && styles.cartItem]}
              onPress={() => navigation.navigate(item.route)}
            >
              {isCart ? (
                <View style={styles.cartButton}>
                  <Ionicons
                    name={isActive ? item.iconActive : item.icon as any}
                    size={24}
                    color={COLORS.white}
                  />
                  {cartItemCount > 0 && (
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>{cartItemCount}</Text>
                    </View>
                  )}
                </View>
              ) : (
                <>
                  <Ionicons
                    name={isActive ? item.iconActive : item.icon as any}
                    size={24}
                    color={isActive ? COLORS.primary : COLORS.textSecondary}
                  />
                  <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                    {item.name}
                  </Text>
                  {isActive && <View style={styles.activeIndicator} />}
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SIZES.md,
    paddingBottom: SIZES.md,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusXl,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.sm,
    ...SHADOWS.large,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xs,
    paddingHorizontal: SIZES.sm,
    minWidth: (width - SIZES.md * 2 - SIZES.sm * 2) / 5,
  },
  cartItem: {
    marginTop: -SIZES.xl,
  },
  cartButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  cartBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  navLabel: {
    fontSize: SIZES.fontXs,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  navLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
});

export default BottomNavigation;
