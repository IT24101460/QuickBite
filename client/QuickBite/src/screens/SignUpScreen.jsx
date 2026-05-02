import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image, ImageBackground, Dimensions,
} from 'react-native';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { getImageUrl } from '../utils/imageUtils';

const ORANGE = '#FF6B35';
const { width } = Dimensions.get('window');

const FormField = ({ label, k, form, set, loading, ...props }) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput style={styles.input} placeholderTextColor="#aaa" value={form[k]} onChangeText={set(k)} editable={!loading} {...props} />
  </View>
);

export default function SignUpScreen({ navigation }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', uniId: '', phoneNumber: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { branding } = useBranding();
  const logoSource = branding?.logoUrl ? { uri: getImageUrl(branding.logoUrl) } : require('../assets/my-logo.png');

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
      const res = await API.post('/users', { firstName, lastName, email, uniId, phoneNumber: Number(phoneNumber), password });
      if (res.data.token) {
        await login(res.data.token, res.data.user || res.data);
      } else {
        Alert.alert('Registered!', 'Please login.', [{ text: 'OK', onPress: () => navigation.navigate('Login') }]);
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.error || err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1000&q=80' }}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        <View style={styles.hero}>

          <Image
            source={logoSource}
            style={{ width: 100, height: 100, resizeMode: 'contain' }} />

          <Text style={styles.appName}>{branding?.appName || 'QuickBite'}</Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create Account</Text>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <FormField label="First Name" k="firstName" form={form} set={set} loading={loading} placeholder="John" />
            </View>
            <View style={{ flex: 1 }}>
              <FormField label="Last Name" k="lastName" form={form} set={set} loading={loading} placeholder="Doe" />
            </View>
          </View>
          <FormField label="Email" k="email" form={form} set={set} loading={loading} placeholder="student@sliit.lk" keyboardType="email-address" autoCapitalize="none" />
          <FormField label="Student ID" k="uniId" form={form} set={set} loading={loading} placeholder="IT/IT/2024/001" />
          <FormField label="Phone Number" k="phoneNumber" form={form} set={set} loading={loading} placeholder="0712345678" keyboardType="phone-pad" />
          <FormField label="Password" k="password" form={form} set={set} loading={loading} placeholder="••••••••" secureTextEntry />
          <FormField label="Confirm Password" k="confirmPassword" form={form} set={set} loading={loading} placeholder="••••••••" secureTextEntry />

          <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.linkText}>Already have an account? <Text style={{ color: ORANGE, fontWeight: 'bold' }}>Login</Text></Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>© {new Date().getFullYear()} QuickBite. All rights reserved.</Text>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 100,
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 24,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: ORANGE,
  },
  scroll: { flexGrow: 1, backgroundColor: 'transparent' },
  hero: { alignItems: 'center', paddingTop: 100, paddingBottom: 40 },
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
  link: { alignItems: 'center', marginBottom: 15 },
  linkText: { color: '#888', fontSize: 14 },
  footerText: { textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 10 },
});
