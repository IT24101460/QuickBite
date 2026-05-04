import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, ScrollView, KeyboardAvoidingView,
  Platform, Image, Dimensions, Animated,
} from 'react-native';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { getImageUrl } from '../utils/imageUtils';

const ORANGE = '#FF6B35';
const { width, height } = Dimensions.get('window');

// Food images for animated background tiles
const FOOD_ITEMS = [
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80',
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&q=80',
  'https://images.unsplash.com/photo-1553621042-f6e147245754?w=200&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80',
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&q=80',
  'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&q=80',
  'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=200&q=80',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=200&q=80',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&q=80',
  'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=200&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&q=80',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&q=80',
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=200&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&q=80',
  'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=200&q=80',
  'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=200&q=80',
  'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=200&q=80',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200&q=80',
];

const TILE_SIZE = 72;
const COLS = Math.ceil(width / (TILE_SIZE + 10)) + 1;
const ROWS = 4;

function buildGrid() {
  const tiles = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const idx = (row * COLS + col) % FOOD_ITEMS.length;
      tiles.push({ uri: FOOD_ITEMS[idx], row, col });
    }
  }
  return tiles;
}

function AnimatedRow({ rowIndex, tiles }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const rowWidth = COLS * (TILE_SIZE + 10);
  const direction = rowIndex % 2 === 0 ? -1 : 1;
  const duration = 18000 + rowIndex * 2000;

  useEffect(() => {
    const start = direction === -1 ? 0 : -(rowWidth / 2);
    const end = direction === -1 ? -(rowWidth / 2) : 0;
    translateX.setValue(start);
    Animated.loop(
      Animated.timing(translateX, { toValue: end, duration, useNativeDriver: true })
    ).start();
  }, []);

  const doubled = [...tiles, ...tiles];
  return (
    <Animated.View style={[styles.row, { top: rowIndex * (TILE_SIZE + 14), transform: [{ translateX }] }]}>
      {doubled.map((tile, i) => (
        <View key={i} style={styles.tile}>
          <Image source={{ uri: tile.uri }} style={styles.tileImage} resizeMode="cover" />
        </View>
      ))}
    </Animated.View>
  );
}

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

  const grid = buildGrid();
  const rows = Array.from({ length: ROWS }, (_, i) => grid.filter(t => t.row === i));

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
    <View style={styles.container}>
      {/* Animated food tile background */}
      <View style={styles.bgCanvas}>
        {rows.map((rowTiles, i) => (
          <AnimatedRow key={i} rowIndex={i} tiles={rowTiles} />
        ))}
      </View>
      <View style={styles.overlay} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Hero */}
          <View style={styles.hero}>
            <Image source={logoSource} style={styles.logo} />
            <Text style={styles.appName}>{branding?.appName || 'UniEats'}</Text>
            <Text style={styles.tagline}>Order ahead from your favourite cafes</Text>
          </View>

          {/* Card */}
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

            <Text style={styles.footerText}>© {new Date().getFullYear()} {branding?.appName || 'UniEats'}. All rights reserved.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d1117' },

  bgCanvas: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: height * 0.42, overflow: 'hidden', paddingTop: 20,
  },
  row: { position: 'absolute', flexDirection: 'row', left: 0 },
  tile: {
    width: TILE_SIZE, height: TILE_SIZE, marginRight: 10,
    borderRadius: 18, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
  },
  tileImage: { width: '100%', height: '100%', opacity: 0.75 },

  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(13, 17, 23, 0.6)',
  },

  scroll: { flexGrow: 1 },

  hero: { alignItems: 'center', paddingTop: 70, paddingBottom: 28 },
  logo: { width: 80, height: 80, resizeMode: 'contain', marginBottom: 10, borderRadius: 18 },
  appName: { fontSize: 34, fontWeight: 'bold', color: '#fff', letterSpacing: 1 },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 5 },

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
  footerText: { textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 16, marginBottom: 10 },
});
