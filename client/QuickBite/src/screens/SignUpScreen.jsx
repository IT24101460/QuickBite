import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const ORANGE = '#FF6B35';

export default function SignUpScreen({ navigation }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', uniId: '', phoneNumber: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    const { firstName, lastName, email, uniId, phoneNumber, password, confirmPassword } = form;
    if (!firstName || !lastName || !email || !uniId || !phoneNumber || !password) {
      return Alert.alert('Error', 'Please fill in all fields');
    }
    if (password !== confirmPassword) return Alert.alert('Error', 'Passwords do not match');
    if (password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');

    setLoading(true);
    try {
      const res = await API.post('/users/signup', { firstName, lastName, email, uniId, phoneNumber: Number(phoneNumber), password });
      if (res.data.token) {
        await login(res.data.token, res.data.user || res.data);
      } else {
        Alert.alert('Registered!', 'Please login.', [{ text: 'OK', onPress: () => navigation.navigate('Login') }]);
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const Field = ({ label, k, ...props }) => (
    <View style={{ marginBottom: 14 }}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} placeholderTextColor="#aaa" value={form[k]} onChangeText={set(k)} editable={!loading} {...props} />
    </View>
  );

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <Text style={styles.logo}>🍔</Text>
          <Text style={styles.appName}>QuickBite</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create Account</Text>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Field label="First Name" k="firstName" placeholder="John" />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Last Name" k="lastName" placeholder="Doe" />
            </View>
          </View>
          <Field label="Email" k="email" placeholder="student@sliit.lk" keyboardType="email-address" autoCapitalize="none" />
          <Field label="Student ID" k="uniId" placeholder="IT/IT/2024/001" />
          <Field label="Phone Number" k="phoneNumber" placeholder="0712345678" keyboardType="phone-pad" />
          <Field label="Password" k="password" placeholder="••••••••" secureTextEntry />
          <Field label="Confirm Password" k="confirmPassword" placeholder="••••••••" secureTextEntry />

          <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Already have an account? <Text style={{ color: ORANGE, fontWeight: 'bold' }}>Login</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: ORANGE },
  hero: { alignItems: 'center', paddingTop: 50, paddingBottom: 24 },
  logo: { fontSize: 48 },
  appName: { fontSize: 30, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },
  card: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, flex: 1 },
  cardTitle: { fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 20 },
  row: { flexDirection: 'row' },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },
  input: {
    borderWidth: 1.5, borderColor: '#e8e8e8', borderRadius: 12, padding: 12,
    fontSize: 14, color: '#222', backgroundColor: '#fafafa',
  },
  btn: {
    backgroundColor: ORANGE, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 8, marginBottom: 18,
    shadowColor: ORANGE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { alignItems: 'center' },
  linkText: { color: '#888', fontSize: 14 },
});
