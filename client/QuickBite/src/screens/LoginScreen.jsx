import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import API from '../services/api';

export default function LoginScreen({ navigation }) {

  // ✅ 1. STATE (already have)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // ✅ 2. PUT handleLogin HERE
const handleLogin = async () => {
  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  try {
    const res = await API.post('/users/login', {
      email,
      password,
    });

    alert("Login Success ✅");

    // 🔥 NAVIGATE HERE
    navigation.navigate("Home");

  } catch (err) {
    alert("Login Failed ❌");
  }
};

  // ✅ 3. RETURN UI
  return (
    <View style={styles.container}>
      <Text style={styles.title}>QuickBite Login</Text>

      <TextInput
        placeholder="Email"
        style={styles.input}
        onChangeText={setEmail}
      />

      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
        onChangeText={setPassword}
      />

      {/* ✅ 4. USE handleLogin HERE */}
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    borderRadius: 5,
  },
});