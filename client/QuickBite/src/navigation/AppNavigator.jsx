import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { Text, View, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';

import { useAuth } from '../context/AuthContext';

// Auth screens
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';

// Main user screens
import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MyReviewsScreen from '../screens/MyReviewsScreen';

// Stack screens
import FoodDetailScreen from '../screens/FoodDetailScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import OrderDetailScreen from '../screens/OrderDetailScreen';
import FeedbackScreen from '../screens/FeedbackScreen';
import CanteenListScreen from '../screens/CanteenListScreen';
import CanteenDetailScreen from '../screens/CanteenDetailScreen';
import CustomOrderScreen from '../screens/CustomOrderScreen';
import ImagePreviewScreen from '../screens/ImagePreviewScreen';
import AddCardScreen from '../screens/AddCardScreen';
import OTPScreen from '../screens/OTPScreen';
import PaymentOptionsScreen from '../screens/PaymentOptionsScreen';
import CakeOrderScreen from '../screens/CakeOrderScreen';
import { BrandingProvider } from '../context/BrandingContext';

// Admin screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminCanteensScreen from '../screens/admin/AdminCanteensScreen';
import AdminFoodItemsScreen from '../screens/admin/AdminFoodItemsScreen';
import AdminOrdersScreen from '../screens/admin/AdminOrdersScreen';
import AdminPromotionsScreen from '../screens/admin/AdminPromotionsScreen';
import AdminOwnersScreen from '../screens/admin/AdminOwnersScreen';
import AdminFeedbackScreen from '../screens/admin/AdminFeedbackScreen';
import AdminBrandingScreen from '../screens/admin/AdminBrandingScreen';

// Owner screens
import OwnerDashboardScreen from '../screens/owner/OwnerDashboardScreen';
import OwnerSettingsScreen from '../screens/owner/OwnerSettingsScreen';
import OwnerMenuScreen from '../screens/owner/OwnerMenuScreen';
import OwnerLiveOrdersScreen from '../screens/owner/OwnerLiveOrdersScreen';
import OwnerPromotionsScreen from '../screens/owner/OwnerPromotionsScreen';
import OwnerFeedbacksScreen from '../screens/owner/OwnerFeedbacksScreen';
import OwnerSupportScreen from '../screens/owner/OwnerSupportScreen';

import SidebarMenu from '../components/SidebarMenu';
import OrderStatusNotifier from '../components/OrderStatusNotifier';

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const GlobalStack = createNativeStackNavigator();

const ORANGE = '#FF6B35';

// The Generic User Flow (Drawer wraps the Home stack so you can pull it out anytime)
function UserDrawerFlow() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <SidebarMenu {...props} />}
      screenOptions={{
        drawerPosition: 'left',
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          borderRightWidth: 1,
          borderRightColor: '#e0e0e0',
          shadowColor: '#000',
          shadowOffset: { width: 2, height: 0 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }
      }}
    >
      <Drawer.Screen name="HomeContainer">
        {() => (
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Cart" component={CartScreen} />
            <Stack.Screen name="Orders" component={OrdersScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="MyReviews" component={MyReviewsScreen} />
            <Stack.Screen name="FoodDetail" component={FoodDetailScreen} />
            <Stack.Screen name="Checkout" component={CheckoutScreen} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
            <Stack.Screen name="Feedback" component={FeedbackScreen} />
            <Stack.Screen name="CanteenList" component={CanteenListScreen} />
            <Stack.Screen name="CanteenDetail" component={CanteenDetailScreen} />
            <Stack.Screen name="CustomOrder" component={CustomOrderScreen} />
            <Stack.Screen name="AddCard" component={AddCardScreen} />
            <Stack.Screen name="PaymentOptions" component={PaymentOptionsScreen} />
            <Stack.Screen name="OTPVerification" component={OTPScreen} />
            <Stack.Screen name="CakeOrder" component={CakeOrderScreen} />
            <Stack.Screen name="ImagePreview" component={ImagePreviewScreen} />
          </Stack.Navigator>
        )}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}

// Admin Flow
function AdminFlow() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
      <Stack.Screen name="AdminCanteens" component={AdminCanteensScreen} />
      <Stack.Screen name="AdminFoodItems" component={AdminFoodItemsScreen} />
      <Stack.Screen name="AdminOrders" component={AdminOrdersScreen} />
      <Stack.Screen name="AdminPromotions" component={AdminPromotionsScreen} />
      <Stack.Screen name="AdminOwners" component={AdminOwnersScreen} />
      <Stack.Screen name="AdminFeedback" component={AdminFeedbackScreen} />
      <Stack.Screen name="AdminBranding" component={AdminBrandingScreen} />
    </Stack.Navigator>
  );
}

// Owner Flow
function OwnerFlow() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="OwnerDashboard" component={OwnerDashboardScreen} />
      <Stack.Screen name="ManageMenu" component={OwnerMenuScreen} />
      <Stack.Screen name="LiveOrders" component={OwnerLiveOrdersScreen} />
      <Stack.Screen name="ManagePromotions" component={OwnerPromotionsScreen} />
      <Stack.Screen name="ManageFeedbacks" component={OwnerFeedbacksScreen} />
      <Stack.Screen name="ContactAdmin" component={OwnerSupportScreen} />
      <Stack.Screen name="OwnerSettings" component={OwnerSettingsScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color={ORANGE} />
      </View>
    );
  }

  return (
    <BrandingProvider>
      <NavigationContainer>
        <OrderStatusNotifier />
        <GlobalStack.Navigator screenOptions={{ headerShown: false }}>
          {user?.role === 'admin' ? (
            <GlobalStack.Screen name="Admin" component={AdminFlow} />
          ) : user?.role === 'owner' ? (
            <GlobalStack.Screen name="Owner" component={OwnerFlow} />
          ) : user ? (
            <GlobalStack.Screen name="User" component={UserDrawerFlow} />
          ) : (
            <>
              <GlobalStack.Screen name="Login" component={LoginScreen} />
              <GlobalStack.Screen name="SignUp" component={SignUpScreen} />
            </>
          )}
        </GlobalStack.Navigator>
      </NavigationContainer>
    </BrandingProvider>
  );
}
