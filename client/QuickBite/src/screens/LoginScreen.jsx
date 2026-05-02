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
  const [loginMode, setLoginMode] = useState('user');
  const [showSellerPanel, setShowSellerPanel] = useState(false);
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
        const actualRole = dbUser.role || (dbUser.isAdmin ? 'admin' : 'user');

        if (loginMode === 'owner' && actualRole !== 'owner') {
          return Alert.alert('Access Denied', 'This account is not registered as a seller account.');
        }
        if (loginMode === 'admin' && actualRole !== 'admin' && !dbUser.isAdmin) {
          return Alert.alert('Access Denied', 'This account does not have Admin privileges.');
        }
        if (loginMode === 'user' && (actualRole === 'owner' || actualRole === 'admin')) {
          return Alert.alert('Use the right entrance', actualRole === 'owner'
            ? 'Seller accounts sign in from Start selling with us.'
            : 'Admin accounts sign in from Admin access.');
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
          <Text style={styles.tagline}>Order ahead from your favourite cafes</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {loginMode === 'admin' ? 'Admin Access' : loginMode === 'owner' ? 'Seller Sign In' : 'Welcome Back'}
          </Text>
          <Text style={styles.cardSub}>
            {loginMode === 'owner'
              ? 'Use the seller account provided by the platform admin.'
              : loginMode === 'admin'
                ? 'Restricted access for platform administrators.'
                : 'Sign in to browse menus, place orders, and track pickups.'}
          </Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder={loginMode === 'owner' ? 'owner@cafe.com' : loginMode === 'admin' ? 'admin@email.com' : 'you@email.com'}
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
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{loginMode === 'owner' ? 'Seller Login' : loginMode === 'admin' ? 'Admin Login' : 'Login'}</Text>}
          </TouchableOpacity>

          {loginMode === 'user' ? (
            <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.linkText}>Don't have an account? <Text style={{ color: ORANGE, fontWeight: 'bold' }}>Sign Up</Text></Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.link} onPress={() => { setLoginMode('user'); setShowSellerPanel(false); }}>
              <Text style={styles.linkText}>Back to user login</Text>
            </TouchableOpacity>
          )}

          {loginMode === 'user' && (
            <View style={styles.sellerBox}>
              <TouchableOpacity
                style={styles.sellerHeader}
                onPress={() => setShowSellerPanel(prev => !prev)}
                activeOpacity={0.85}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.sellerTitle}>Start selling with us</Text>
                  <Text style={styles.sellerText}>Manage your cafe menu, live orders, and promotions.</Text>
                </View>
                <Text style={styles.sellerArrow}>{showSellerPanel ? '−' : '+'}</Text>
              </TouchableOpacity>

              {showSellerPanel && (
                <View style={styles.sellerPanel}>
                  <Text style={styles.sellerPanelText}>
                    Seller accounts are created by the platform admin after approval. If you already have an approved seller account, sign in here.
                  </Text>
                  <TouchableOpacity style={styles.sellerLoginBtn} onPress={() => setLoginMode('owner')}>
                    <Text style={styles.sellerLoginText}>Seller sign in</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {loginMode === 'user' && (
            <TouchableOpacity style={styles.adminLink} onPress={() => setLoginMode('admin')}>
              <Text style={styles.adminLinkText}>Admin access</Text>
            </TouchableOpacity>
          )}

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
  cardTitle: { fontSize: 26, fontWeight: 'bold', color: '#222', marginBottom: 6 },
  cardSub: { fontSize: 13, color: '#777', lineHeight: 18, marginBottom: 22 },
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
  sellerBox: { borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 16, marginTop: 4 },
  sellerHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF7F2', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#FFE0D2' },
  sellerTitle: { fontSize: 15, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  sellerText: { fontSize: 12, color: '#777', lineHeight: 16 },
  sellerArrow: { fontSize: 24, color: ORANGE, fontWeight: 'bold', marginLeft: 12 },
  sellerPanel: { padding: 14 },
  sellerPanelText: { fontSize: 12, color: '#666', lineHeight: 18, marginBottom: 12 },
  sellerLoginBtn: { alignSelf: 'flex-start', backgroundColor: ORANGE, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9 },
  sellerLoginText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  adminLink: { alignItems: 'center', marginTop: 16 },
  adminLinkText: { fontSize: 12, color: '#999', fontWeight: '600' },
  footerText: { textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 10 },
});
