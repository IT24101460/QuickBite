import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView,
  Platform, Image, Dimensions, Animated,
} from 'react-native';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { getImageUrl } from '../utils/imageUtils';

const ORANGE = '#FF6B35';
const { width, height } = Dimensions.get('window');

// Real food images for the animated background
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
  'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=200&q=80',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&q=80',
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200&q=80',
  'https://images.unsplash.com/photo-1493962853295-0fd70327578a?w=200&q=80',
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
      Animated.timing(translateX, {
        toValue: end,
        duration,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const doubled = [...tiles, ...tiles];

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
      {doubled.map((tile, i) => (
        <View key={i} style={styles.tile}>
          <Image
            source={{ uri: tile.uri }}
            style={styles.tileImage}
            resizeMode="cover"
          />
        </View>
      ))}
    </Animated.View>
  );
}

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
  const logoSource = branding?.logoUrl ? { uri: getImageUrl(branding.logoUrl) } : null;

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const grid = buildGrid();
  const rows = Array.from({ length: ROWS }, (_, i) => grid.filter(t => t.row === i));

  const handleRegister = async () => {
    const { firstName, lastName, email, uniId, phoneNumber, password, confirmPassword } = form;
    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      return Alert.alert('Error', 'Please fill in all fields');
    }
    if (password !== confirmPassword) return Alert.alert('Error', 'Passwords do not match');
    if (password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');

    setLoading(true);
    try {
      const generatedUserId = uniId?.trim() || `USER${Date.now()}`;
      const res = await API.post('/users', { firstName, lastName, email, uniId: generatedUserId, phoneNumber: Number(phoneNumber), password });
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
    <View style={styles.container}>

      {/* Animated food background */}
      <View style={styles.bgCanvas}>
        {rows.map((rowTiles, i) => (
          <AnimatedRow key={i} rowIndex={i} tiles={rowTiles} />
        ))}
      </View>

      {/* Dark overlay */}
      <View style={styles.overlay} />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Hero */}
          <View style={styles.hero}>
            {logoSource && (
              <Image source={logoSource} style={styles.logo} />
            )}
            <Text style={styles.appName}>{branding?.appName || 'UniEats'}</Text>
            <Text style={styles.tagline}>Join thousands of happy students</Text>
          </View>

          {/* Sign Up Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create Account</Text>

            <View style={styles.nameRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <FormField label="First Name" k="firstName" form={form} set={set} loading={loading} placeholder="John" />
              </View>
              <View style={{ flex: 1 }}>
                <FormField label="Last Name" k="lastName" form={form} set={set} loading={loading} placeholder="Doe" />
              </View>
            </View>

            <FormField label="Email" k="email" form={form} set={set} loading={loading} placeholder="you@email.com" keyboardType="email-address" autoCapitalize="none" />
            <FormField label="User ID (optional)" k="uniId" form={form} set={set} loading={loading} placeholder="Leave blank to generate one" />
            <FormField label="Phone Number" k="phoneNumber" form={form} set={set} loading={loading} placeholder="0712345678" keyboardType="phone-pad" />
            <FormField label="Password" k="password" form={form} set={set} loading={loading} placeholder="••••••••" secureTextEntry />
            <FormField label="Confirm Password" k="confirmPassword" form={form} set={set} loading={loading} placeholder="••••••••" secureTextEntry />

            <TouchableOpacity style={[styles.btn, loading && { opacity: 0.6 }]} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.link} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.linkText}>Already have an account? <Text style={{ color: ORANGE, fontWeight: 'bold' }}>Login</Text></Text>
            </TouchableOpacity>

            <View style={styles.sellerNote}>
              <Text style={styles.sellerNoteTitle}>Want to sell food?</Text>
              <Text style={styles.sellerNoteText}>Seller accounts are approved and created by the platform admin. Use <Text style={{ fontWeight: 'bold' }}>Start selling with us</Text> from the login screen after approval.</Text>
            </View>

            <Text style={styles.footerText}>© {new Date().getFullYear()} {branding?.appName || 'UniEats'}. All rights reserved.</Text>
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

  // Animated food background
  bgCanvas: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.42,
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

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(13, 17, 23, 0.6)',
  },

  scroll: { flexGrow: 1 },

  hero: {
    alignItems: 'center',
    paddingTop: 70,
    paddingBottom: 28,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 10,
    borderRadius: 18,
  },
  appName: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 5,
  },

  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    flex: 1,
  },
  cardTitle: { fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 20 },
  nameRow: { flexDirection: 'row' },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 5 },
  input: {
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#222',
    backgroundColor: '#fafafa',
  },
  btn: {
    backgroundColor: ORANGE,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 18,
    shadowColor: ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { alignItems: 'center', marginBottom: 15 },
  linkText: { color: '#888', fontSize: 14 },
  sellerNote: {
    backgroundColor: '#FFF7F2',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FFE0D2',
    marginBottom: 14,
  },
  sellerNoteTitle: { fontSize: 14, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  sellerNoteText: { fontSize: 12, color: '#666', lineHeight: 17 },
  footerText: { textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 10, marginBottom: 10 },
});
