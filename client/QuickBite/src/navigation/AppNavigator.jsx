import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from '../screens/LoginScreen';

// temporary Home screen
import { View, Text } from 'react-native';

const HomeScreen = () => (
  <View style={{flex:1,justifyContent:'center',alignItems:'center'}}>
    <Text>Welcome to QuickBite 🍔</Text>
  </View>
);

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}