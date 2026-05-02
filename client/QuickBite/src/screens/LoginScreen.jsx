import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView, Platform, Image, ImageBackground, Dimensions,
} from 'react-native';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { getImageUrl } from '../utils/imageUtils';

const ORANGE = '#FF6B35';
const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [loginMode, setLoginMode] = useState('user'); // 'user', 'owner', 'admin'
  const { login } = useAuth();
  const { branding } = useBranding();
  const logoSource = branding?.logoUrl ? { uri: getImageUrl(branding.logoUrl) } : require('../assets/my-logo.png');

  const handleLogin = async () => {
    if (!email.trim()) return Alert.alert('Error', 'Please enter your email');
    if (!password.trim()) return Alert.alert('Error', 'Please enter your password');
    setLoading(true);
    try {
      const res = await API.post('/users/login', { email: email.trim(), password: password.trim() });
      if (res.data.token) {

        const dbUser = res.data.user || res.data;
        const actualRole = dbUser.role || (dbUser.isAdmin ? 'admin' : 'student'); // Evaluate true rank

        // Compare against active tab requested
        if (loginMode === 'owner' && actualRole !== 'owner') {
          return Alert.alert('Access Denied', 'This account is not registered as a Canteen Owner. Please use the Student login tab!');
        }
        if (loginMode === 'admin' && actualRole !== 'admin' && !dbUser.isAdmin) {
          return Alert.alert('Access Denied', 'This account does not have Admin privileges.');
        }
        if (loginMode === 'user' && (actualRole === 'owner' || actualRole === 'admin')) {
          return Alert.alert('Switch Portals', `Our records indicate you are a(n) ${actualRole}. Please use the correct login tab below.`);
        }

        await login(res.data.token, dbUser);
      }
    } catch (err) {
      Alert.alert('Login Error', err.response?.data?.message || 'Login failed. Please try again.');
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
          <Image source={logoSource} style={{ width: 100, height: 100, resizeMode: 'contain' }} />
          <Text style={styles.appName}>{branding?.appName || 'QuickBite'}</Text>
          <Text style={styles.tagline}>SLIIT Canteen Pre-Order System</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {loginMode === 'admin' ? 'Admin Portal' :
              loginMode === 'owner' ? 'Canteen Owner Login' :
                'Welcome Back'}
          </Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="student@sliit.lk"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <Text style={styles.label}>Password</Text>
          <View style={styles.pwRow}>
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="••••••••"
              placeholderTextColor="#aaa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPw}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
              <Text style={styles.eye}>{showPw ? '👁' : '👁️‍🗨️'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Login</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.linkText}>Don't have an account? <Text style={{ color: ORANGE, fontWeight: 'bold' }}>Sign Up</Text></Text>
          </TouchableOpacity>

          <View style={styles.modeSwitcherRow}>
            <TouchableOpacity onPress={() => setLoginMode('user')} style={[styles.modeBtn, loginMode === 'user' && styles.modeBtnActive]}>
              <Text style={[styles.modeBtnText, loginMode === 'user' && styles.modeBtnTextActive]}>Student</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLoginMode('owner')} style={[styles.modeBtn, loginMode === 'owner' && styles.modeBtnActive]}>
              <Text style={[styles.modeBtnText, loginMode === 'owner' && styles.modeBtnTextActive]}>Owner</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setLoginMode('admin')} style={[styles.modeBtn, loginMode === 'admin' && styles.modeBtnActive]}>
              <Text style={[styles.modeBtnText, loginMode === 'admin' && styles.modeBtnTextActive]}>Admin</Text>
            </TouchableOpacity>
          </View>


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
  logo: { fontSize: 64 },
  appName: { fontSize: 38, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  card: {
    backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 28, flex: 1, minHeight: 420,
  },
  cardTitle: { fontSize: 26, fontWeight: 'bold', color: '#222', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: {
    borderWidth: 1.5, borderColor: '#e8e8e8', borderRadius: 12, padding: 13,
    fontSize: 15, color: '#222', backgroundColor: '#fafafa', marginBottom: 16,
  },
  pwRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  eyeBtn: { padding: 12, marginLeft: 4 },
  eye: { fontSize: 20 },
  btn: {
    backgroundColor: ORANGE, borderRadius: 12, paddingVertical: 15,
    alignItems: 'center', marginTop: 8, marginBottom: 20,
    shadowColor: ORANGE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  link: { alignItems: 'center', marginTop: 4, marginBottom: 25 },
  linkText: { color: '#888', fontSize: 14 },
  modeSwitcherRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 'auto', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 15, paddingBottom: 15 },
  modeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginHorizontal: 4 },
  modeBtnActive: { backgroundColor: '#FF6B3522' },
  modeBtnText: { color: '#888', fontSize: 12, fontWeight: '600' },
  modeBtnTextActive: { color: ORANGE, fontWeight: 'bold' },
  footerText: { textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 10 },
});
