import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, TextInput, Image, RefreshControl, ScrollView, Dimensions
} from 'react-native';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import TopNavBar from '../components/TopNavBar';

const ORANGE = '#FF6B35';
const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { itemCount } = useCart();
  const [foodItems, setFoodItems] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('none'); // 'none', 'A-Z', 'priceAsc', 'priceDesc', 'rating'

  const bannerRef = useRef(null);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  const categories = ['All', 'Rice', 'Noodles', 'Snacks', 'Drinks', 'Desserts', 'Other'];

  const fetchData = useCallback(async () => {
    try {
      const [foodRes, promoRes, canteenRes] = await Promise.all([
        API.get('/foods'),
        API.get('/promotions'),
        API.get('/canteens'),
      ]);
      setFoodItems(foodRes.data?.foodItems || []);
      setPromotions(promoRes.data?.promotions || []);
      setCanteens(canteenRes.data?.canteens || []);
    } catch (e) {
      console.log('Error fetching home data:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, []);

  // Daraz style auto-changing banner
  useEffect(() => {
    if (promotions.length > 1) {
      const interval = setInterval(() => {
        let nextIndex = (currentPromoIndex + 1) % promotions.length;
        setCurrentPromoIndex(nextIndex);
        bannerRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [currentPromoIndex, promotions.length]);

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  // Filter and Sort Logic
  let filteredItems = foodItems.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || item.category === category;
    return matchSearch && matchCat && item.isAvailable;
  });

  if (sortBy === 'A-Z') {
    filteredItems.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'priceAsc') {
    filteredItems.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'priceDesc') {
    filteredItems.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    // Assuming ratings might exist on averageRating field. 
    filteredItems.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
  }

  const renderPromo = ({ item }) => (
    <TouchableOpacity style={styles.promoBanner} activeOpacity={0.85}>
      {item.bannerImage
        ? <Image source={{ uri: item.bannerImage.startsWith('http') ? item.bannerImage : `http://10.0.2.2:3000${item.bannerImage}` }} style={styles.promoBannerImg} resizeMode="cover" />
        : <View style={styles.promoBannerPlaceholder} />}
    </TouchableOpacity>
  );

  const renderFood = ({ item }) => (
    <TouchableOpacity
      style={styles.foodCard}
      onPress={() => navigation.navigate('FoodDetail', { item })}
      activeOpacity={0.9}
    >
      {item.image
        ? <Image source={{ uri: item.image.startsWith('http') ? item.image : `http://10.0.2.2:3000${item.image}` }} style={styles.foodImg} resizeMode="cover" />
        : <View style={styles.foodImgPlaceholder}><Text style={{ fontSize: 40 }}>🍽️</Text></View>}
      <View style={styles.foodInfo}>
        <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.foodCat}>{item.category || 'General'}</Text>
        <Text style={styles.foodPrice}>LKR {item.price.toFixed(2)}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingText}>
            ⭐ {item.averageRating > 0 ? item.averageRating.toFixed(1) : 'New'}
            {item.totalReviews > 0 && (
              <Text style={styles.reviewCountText}> ({item.totalReviews})</Text>
            )}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={ORANGE} />
        <Text style={styles.loadingText}>Loading QuickBite...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopNavBar navigation={navigation} search={search} setSearch={setSearch} hideBottomRow={true} isHome={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[ORANGE]} />}
        contentContainerStyle={{ paddingTop: 85, paddingBottom: 20 }}
      >

        {/* Promotions Banner - Daraz Style */}
        {promotions.length > 0 ? (
          <View style={styles.promoContainer}>
            <FlatList
              ref={bannerRef}
              data={promotions}
              renderItem={renderPromo}
              keyExtractor={i => i._id}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const x = e.nativeEvent.contentOffset.x;
                setCurrentPromoIndex(Math.round(x / width));
              }}
            />
            {/* Dots */}
            <View style={styles.dotsRow}>
              {promotions.map((_, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.dot, currentPromoIndex === i && styles.dotActive]}
                  onPress={() => {
                    setCurrentPromoIndex(i);
                    bannerRef.current?.scrollToIndex({ index: i, animated: true });
                  }}
                />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.promoContainer}>
            <TouchableOpacity style={styles.promoBanner} activeOpacity={1}>
              {/* Fallback Banner Graphic */}
              <View style={[styles.promoBannerPlaceholder, { backgroundColor: '#FF8A65', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ fontSize: 50 }}>🎉</Text>
              </View>
              <View style={styles.promoOverlay}>
                <Text style={styles.promoTitle}>Welcome to QuickBite!</Text>
                <Text style={styles.promoDiscount}>Enjoy 10% OFF on your first purchase today</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Canteens */}
        {canteens.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>🏪 Our Canteens</Text>
              <TouchableOpacity onPress={() => navigation.navigate('CanteenList')}>
                <Text style={styles.seeAll}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={canteens.slice(0, 5)}
              horizontal
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.canteenChip}
                  onPress={() => navigation.navigate('CanteenDetail', { canteen: item })}
                >
                  {item.canteenImage
                    ? <Image style={styles.canteenSmallLogo} source={{ uri: item.canteenImage.startsWith('http') ? item.canteenImage : `http://10.0.2.2:3000${item.canteenImage}` }} />
                    : <Text>🏬</Text>}
                  <Text style={styles.canteenChipText}>{item.canteenName}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={i => i._id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16 }}
            />
          </View>
        )}

        {/* Category Filter */}
        <View style={{ marginTop: 15 }}>
          <FlatList
            data={categories}
            horizontal
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.catChip, category === item && styles.catChipActive]}
                onPress={() => setCategory(item)}
              >
                <Text style={[styles.catChipText, category === item && styles.catChipTextActive]}>{item}</Text>
              </TouchableOpacity>
            )}
            keyExtractor={i => i}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
          />
        </View>

        {/* Sorting Row */}
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>Sort By: </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {['none', 'A-Z', 'priceAsc', 'priceDesc', 'rating'].map(opt => (
              <TouchableOpacity
                key={opt}
                onPress={() => setSortBy(opt)}
                style={[styles.sortBtn, sortBy === opt && styles.sortBtnActive]}
              >
                <Text style={[styles.sortBtnText, sortBy === opt && styles.sortBtnTextActive]}>
                  {opt === 'priceAsc' ? 'Price ↑' : opt === 'priceDesc' ? 'Price ↓' : opt === 'rating' ? 'Top Rated' : opt}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Food Grid */}
        <View style={styles.sectionBot}>
          <Text style={styles.sectionTitle}>🔥 Popular Food Items</Text>
          {filteredItems.length === 0
            ? <Text style={styles.emptyText}>No items found</Text>
            : (
              <FlatList
                data={filteredItems}
                renderItem={renderFood}
                keyExtractor={i => i._id || i.foodItemId}
                numColumns={2}
                scrollEnabled={false}
                contentContainerStyle={styles.foodGrid}
              />
            )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7F3' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  loadingText: { marginTop: 12, color: '#888', fontSize: 14 },
  promoContainer: { width: '100%', alignItems: 'center' },
  promoBanner: {
    width: width - 32,
    height: height * 0.25,
    backgroundColor: '#FFE0D6',
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 10,
    overflow: 'hidden'
  },
  promoBannerImg: { width: '100%', height: '100%' },
  promoBannerPlaceholder: { width: '100%', height: '100%', backgroundColor: '#FFD4C2' },
  promoOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', padding: 12, paddingTop: 20
  },
  promoTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  promoDiscount: { color: '#FFD700', fontWeight: 'bold', fontSize: 13, marginTop: 2 },
  dotsRow: { flexDirection: 'row', position: 'absolute', bottom: 10, width: '100%', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)', marginLeft: 6 },
  dotActive: { backgroundColor: '#fff', width: 14 },
  section: { marginTop: 15 },
  sectionBot: { marginTop: 5, paddingBottom: 30 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#222', paddingHorizontal: 16, marginBottom: 10 },
  seeAll: { fontSize: 13, color: ORANGE, fontWeight: '600' },
  canteenChip: {
    backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8,
    marginRight: 10, borderWidth: 1.5, borderColor: '#F0F0F0', flexDirection: 'row', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 2,
  },
  canteenSmallLogo: { width: 20, height: 20, borderRadius: 10, marginRight: 6 },
  canteenChipText: { fontSize: 13, color: '#444', fontWeight: '600', marginLeft: 4 },
  catChip: {
    backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    marginRight: 8, borderWidth: 1.5, borderColor: '#E8E8E8',
  },
  catChipActive: { backgroundColor: ORANGE, borderColor: ORANGE },
  catChipText: { fontSize: 13, color: '#666', fontWeight: '600' },
  catChipTextActive: { color: '#fff' },
  sortRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginVertical: 12 },
  sortLabel: { fontSize: 13, fontWeight: 'bold', color: '#555', marginRight: 10 },
  sortBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#eee', marginRight: 6 },
  sortBtnActive: { backgroundColor: '#ffe5db' },
  sortBtnText: { fontSize: 12, color: '#666', fontWeight: '600' },
  sortBtnTextActive: { color: ORANGE, fontWeight: 'bold' },
  foodGrid: { paddingHorizontal: 10 },
  foodCard: {
    flex: 1, margin: 6, backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  foodImg: { width: '100%', height: 110 },
  foodImgPlaceholder: { width: '100%', height: 110, backgroundColor: '#FFF5F0', justifyContent: 'center', alignItems: 'center' },
  foodInfo: { padding: 10 },
  foodName: { fontSize: 14, fontWeight: 'bold', color: '#222' },
  foodCat: { fontSize: 11, color: '#999', marginTop: 2 },
  foodPrice: { fontSize: 14, fontWeight: 'bold', color: ORANGE, marginTop: 4 },
  ratingRow: { marginTop: 5 },
  ratingText: { fontSize: 11, fontWeight: 'bold', color: '#666' },
  emptyText: { textAlign: 'center', color: '#aaa', paddingVertical: 40, fontSize: 14 },
});
