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

// Real food images shown in the animated background
const FOOD_ITEMS = [
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80',// burger
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80', // pizza
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&q=80', // noodles
  'https://images.unsplash.com/photo-1553621042-f6e147245754?w=200&q=80', // sushi
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80', // salad
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200&q=80', // fried rice
  'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=200&q=80', // sandwich
  'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&q=80', // dessert
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&q=80', // curry
  'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=200&q=80', // steak
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=200&q=80', // eggs
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&q=80', // pancakes
  'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=200&q=80', // ice cream
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80',  // bowl
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&q=80', // food spread
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&q=80', // fried chicken
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&q=80', // fresh salad
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=200&q=80', // pasta
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&q=80', // restaurant food
  'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=200&q=80', // healthy bowl
  'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=200&q=80', // asian food
  'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=200&q=80', // tacos
  'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=200&q=80', // french toast
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200&q=80', // soup
];

const TILE_SIZE = 72;
const COLS = Math.ceil(width / (TILE_SIZE + 10)) + 1;
const ROWS = 4;

// Build a fixed shuffled grid of tiles from the food list
function buildGrid() {
  const tiles = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const idx = (row * COLS + col) % FOOD_ITEMS.length;
      tiles.push({ emoji: FOOD_ITEMS[idx], row, col });
    }
  }
  return tiles;
}

// One row of tiles that slides endlessly — uses recursive timing for true infinite loop
function AnimatedRow({ rowIndex, tiles }) {
  const translateX = useRef(new Animated.Value(0)).current;
  const animRef = useRef(null);
  const isMounted = useRef(true);

  // Triple tiles so there's always content visible during any reset point
  const tripled = [...tiles, ...tiles, ...tiles];
  // A single "unit" is one full copy of tiles
  const rowWidth = tiles.length * (TILE_SIZE + 10);
  const direction = rowIndex % 2 === 0 ? -1 : 1;
  const duration = (16000 + rowIndex * 2500) * tiles.length / 6; // scale duration per tile count

  useEffect(() => {
    isMounted.current = true;

    const startVal = direction === -1 ? 0 : -rowWidth;
    const endVal = direction === -1 ? -rowWidth : 0;

    const runLoop = () => {
      if (!isMounted.current) return;
      translateX.setValue(startVal);
      animRef.current = Animated.timing(translateX, {
        toValue: endVal,
        duration,
        useNativeDriver: true,
      });
      animRef.current.start(({ finished }) => {
        if (finished && isMounted.current) runLoop(); // restart immediately
      });
    };

    runLoop();

    return () => {
      isMounted.current = false;
      if (animRef.current) animRef.current.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.row,
        {
          top: rowIndex * (TILE_SIZE + 14),
          transform: [{ translateX }],
        },
      ]}
    >
      {tripled.map((tile, i) => (
        <View key={i} style={styles.tile}>
          <Image
            source={{ uri: tile.emoji }}
            style={styles.tileImage}
            resizeMode="cover"
          />
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
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { login } = useAuth();
  const { branding } = useBranding();
  const logoSource = branding?.logoUrl ? { uri: getImageUrl(branding.logoUrl) } : null;

  const grid = buildGrid();
  const rows = Array.from({ length: ROWS }, (_, i) =>
    grid.filter(t => t.row === i)
  );

  const validate = (field, value) => {
    const errs = { ...errors };
    if (field === 'email') {
      if (!value.trim()) errs.email = 'Email is required.';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) errs.email = 'Enter a valid email address.';
      else delete errs.email;
    }
    if (field === 'password') {
      if (!value.trim()) errs.password = 'Password is required.';
      else if (value.length < 6) errs.password = 'Password must be at least 6 characters.';
      else delete errs.password;
    }
    setErrors(errs);
    return errs;
  };

  const handleBlur = (field, value) => {
    setTouched(t => ({ ...t, [field]: true }));
    validate(field, value);
  };

  const handleChange = (field, value, setter) => {
    setter(value);
    if (touched[field]) validate(field, value);
  };

  const handleLogin = async () => {
    // Mark all fields touched and run full validation
    setTouched({ email: true, password: true });
    const emailErrs = validate('email', email);
    const pwErrs = validate('password', password);
    if (emailErrs.email || pwErrs.password) return;
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

      {/* Animated food background */}
      <View style={styles.bgCanvas}>
        {rows.map((rowTiles, i) => (
          <AnimatedRow key={i} rowIndex={i} tiles={rowTiles} />
        ))}
      </View>

      {/* Dark overlay for readability */}
      <View style={styles.overlay} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Hero / Branding */}
          <View style={styles.hero}>
            {logoSource && (
              <Image source={logoSource} style={styles.logo} />
            )}
            <Text style={styles.appName}>{branding?.appName || 'UniEats'}</Text>
            <Text style={styles.tagline}>Order ahead from your favourite cafes</Text>
          </View>

          {/* Login Card */}
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
              style={[styles.input, touched.email && errors.email && styles.inputError]}
              placeholder={loginMode === 'owner' ? 'owner@cafe.com' : loginMode === 'admin' ? 'admin@email.com' : 'you@email.com'}
              placeholderTextColor="#aaa"
              value={email}
              onChangeText={v => handleChange('email', v, setEmail)}
              onBlur={() => handleBlur('email', email)}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            {touched.email && errors.email && (
              <Text style={styles.errorText}>⚠ {errors.email}</Text>
            )}

            <Text style={styles.label}>Password</Text>
            <View style={styles.pwRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginBottom: 0 }, touched.password && errors.password && styles.inputError]}
                placeholder="••••••••"
                placeholderTextColor="#aaa"
                value={password}
                onChangeText={v => handleChange('password', v, setPassword)}
                onBlur={() => handleBlur('password', password)}
                secureTextEntry={!showPw}
                editable={!loading}
              />
              <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
                <Text style={styles.eye}>{showPw ? '👁' : '👁️‍🗨️'}</Text>
              </TouchableOpacity>
            </View>
            {touched.password && errors.password && (
              <Text style={[styles.errorText, { marginTop: 6 }]}>⚠ {errors.password}</Text>
            )}

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.btnText}>{loginMode === 'owner' ? 'Seller Login' : loginMode === 'admin' ? 'Admin Login' : 'Login'}</Text>}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },

  // Animated background canvas
  bgCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.55,
    overflow: 'hidden',
    paddingTop: 20,
  },
  row: {
    position: 'absolute',
    flexDirection: 'row',
    left: 0,
  },
  tile: {
    width: TILE_SIZE,
    height: TILE_SIZE,
    marginRight: 10,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  tileImage: {
    width: '100%',
    height: '100%',
    opacity: 0.75,
  },

  // Dark gradient overlay
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(13, 17, 23, 0.6)',
  },

  scroll: { flexGrow: 1 },

  // Hero branding section
  hero: {
    alignItems: 'center',
    paddingTop: 90,
    paddingBottom: 36,
  },
  logo: {
    width: 90,
    height: 90,
    resizeMode: 'contain',
    marginBottom: 12,
    borderRadius: 20,
  },
  appName: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 6,
    letterSpacing: 0.3,
  },

  // Login card
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 28,
    flex: 1,
    minHeight: 420,
  },
  cardTitle: { fontSize: 26, fontWeight: 'bold', color: '#222', marginBottom: 6 },
  cardSub: { fontSize: 13, color: '#777', lineHeight: 18, marginBottom: 22 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: {
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    padding: 13,
    fontSize: 15,
    color: '#222',
    backgroundColor: '#fafafa',
    marginBottom: 4,
  },
  inputError: {
    borderColor: '#E53935',
    backgroundColor: '#FFF5F5',
  },
  errorText: {
    fontSize: 12,
    color: '#E53935',
    marginBottom: 12,
    marginLeft: 2,
  },
  pwRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  eyeBtn: { padding: 12, marginLeft: 4 },
  eye: { fontSize: 20 },
  btn: {
    backgroundColor: ORANGE,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  link: { alignItems: 'center', marginTop: 4, marginBottom: 25 },
  linkText: { color: '#888', fontSize: 14 },
  sellerBox: { borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 16, marginTop: 4 },
  sellerHeader: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF7F2', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#FFE0D2',
  },
  sellerTitle: { fontSize: 15, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  sellerText: { fontSize: 12, color: '#777', lineHeight: 16 },
  sellerArrow: { fontSize: 24, color: ORANGE, fontWeight: 'bold', marginLeft: 12 },
  sellerPanel: { padding: 14 },
  sellerPanelText: { fontSize: 12, color: '#666', lineHeight: 18, marginBottom: 12 },
  sellerLoginBtn: {
    alignSelf: 'flex-start', backgroundColor: ORANGE,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9,
  },
  sellerLoginText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  adminLink: { alignItems: 'center', marginTop: 16 },
  adminLinkText: { fontSize: 12, color: '#999', fontWeight: '600' },
});
