import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View } from 'react-native';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import CanteensScreen from '../screens/CanteensScreen';
import FoodMenuScreen from '../screens/FoodMenuScreen';
import CartScreen from '../screens/CartScreen';
import OrdersScreen from '../screens/OrdersScreen';

// Import components
import BottomNavigation from '../components/BottomNavigation';

// Import types
import { FoodItem, CartItem } from '../constants/mockData';

const Tab = createBottomTabNavigator();

const AppNavigator: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Home');
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: FoodItem, quantity: number = 1) => {
    const existingItem = cart.find(cartItem => cartItem.foodItem.id === item.id);
    if (existingItem) {
      setCart(cart.map(cartItem =>
        cartItem.foodItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + quantity }
          : cartItem
      ));
    } else {
      setCart([...cart, { id: Date.now().toString(), foodItem: item, quantity }]);
    }
  };

  const updateCartItem = (id: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter(item => item.id !== id));
    } else {
      setCart(cart.map(item =>
        item.id === id ? { ...item, quantity } : item
      ));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <NavigationContainer>
      <Tab.Navigator
        tabBar={() => (
          <BottomNavigation
            activeTab={activeTab}
            onTabPress={setActiveTab}
            cartItemCount={cartItemCount}
          />
        )}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen name="Home">
          {() => <HomeScreen addToCart={addToCart} />}
        </Tab.Screen>
        <Tab.Screen name="Canteens">
          {() => <CanteensScreen />}
        </Tab.Screen>
        <Tab.Screen name="FoodMenu">
          {() => <FoodMenuScreen addToCart={addToCart} />}
        </Tab.Screen>
        <Tab.Screen name="Cart">
          {() => <CartScreen cart={cart} updateCartItem={updateCartItem} clearCart={clearCart} />}
        </Tab.Screen>
        <Tab.Screen name="Orders">
          {() => <OrdersScreen />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;