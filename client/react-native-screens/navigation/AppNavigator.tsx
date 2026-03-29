// SLIIT Eats - App Navigator
// Copy this file to: src/navigation/AppNavigator.tsx

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import Screens
import HomeScreen from '../screens/HomeScreen';
import CanteensScreen from '../screens/CanteensScreen';
import FoodMenuScreen from '../screens/FoodMenuScreen';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen';

import { COLORS, SIZES, SHADOWS } from '../constants/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Custom Tab Bar Component
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === index;
          const isCart = route.name === 'Cart';

          const iconMap: Record<string, { active: string; inactive: string }> = {
            Home: { active: 'home', inactive: 'home-outline' },
            Canteens: { active: 'restaurant', inactive: 'restaurant-outline' },
            Cart: { active: 'cart', inactive: 'cart-outline' },
            Orders: { active: 'receipt', inactive: 'receipt-outline' },
            Profile: { active: 'person', inactive: 'person-outline' },
          };

          const icon = iconMap[route.name] || { active: 'help-circle', inactive: 'help-circle-outline' };

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          if (isCart) {
            return (
              <TouchableOpacity
                key={route.key}
                onPress={onPress}
                style={styles.cartTabItem}
              >
                <View style={styles.cartButton}>
                  <Ionicons
                    name={isFocused ? icon.active : icon.inactive as any}
                    size={24}
                    color={COLORS.white}
                  />
                  {/* Cart badge - replace 2 with actual cart count */}
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>2</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tabItem}
            >
              <Ionicons
                name={isFocused ? icon.active : icon.inactive as any}
                size={24}
                color={isFocused ? COLORS.primary : COLORS.textSecondary}
              />
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                {label}
              </Text>
              {isFocused && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// Tab Navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Canteens" component={CanteensScreen} />
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      {/* Add Profile screen when ready */}
      {/* <Tab.Screen name="Profile" component={ProfileScreen} /> */}
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="MainTabs" component={TabNavigator} />
        <Stack.Screen name="FoodMenu" component={FoodMenuScreen} />
        {/* Add other stack screens as needed */}
        {/* <Stack.Screen name="FoodDetail" component={FoodDetailScreen} /> */}
        {/* <Stack.Screen name="Checkout" component={CheckoutScreen} /> */}
        {/* <Stack.Screen name="OrderDetail" component={OrderDetailScreen} /> */}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: SIZES.md,
    paddingBottom: SIZES.md,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusXl,
    paddingVertical: SIZES.sm,
    paddingHorizontal: SIZES.sm,
    ...SHADOWS.large,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xs,
    paddingHorizontal: SIZES.sm,
    flex: 1,
  },
  cartTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -SIZES.xl,
    flex: 1,
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
  tabLabel: {
    fontSize: SIZES.fontXs,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  tabLabelActive: {
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

export default AppNavigator;
