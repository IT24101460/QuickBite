import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, Image, RefreshControl, ScrollView, Dimensions, Alert
} from 'react-native';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import TopNavBar from '../components/TopNavBar';
import { useBranding } from '../context/BrandingContext';
import { getImageUrl } from '../utils/imageUtils';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../styles/adminTheme';

const { width, height } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { branding } = useBranding();
  const { cartItems, addToCart, cartTotal, applyPromotion } = useCart();
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
      setLoading(true);
      // Fetch data individually using allSettled so one failure doesn't stop the whole screen
      const results = await Promise.allSettled([
        API.get('/foods'),
        API.get('/promotions'),
        API.get('/canteens'),
      ]);

      const foodRes = results[0];
      const promoRes = results[1];
      const canteenRes = results[2];

      const foodItemsData = foodRes.status === 'fulfilled' ? (foodRes.value.data?.foodItems || []) : [];
      const promotionsData = promoRes.status === 'fulfilled' ? (promoRes.value.data?.promotions || []) : [];
      const canteensData = canteenRes.status === 'fulfilled' ? (canteenRes.value.data?.canteens || []) : [];

      setFoodItems(foodItemsData);
      setCanteens(canteensData);

      // Use backend promotions if they exist, otherwise fallback to high-quality sample ones
      if (promotionsData.length > 0) {
        setPromotions(promotionsData);
      } else {
        const samplePromotions = [
          { _id: 'sample_1', bannerImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80' },
          { _id: 'sample_2', bannerImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80' },
          { _id: 'sample_3', bannerImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80' }
        ];
        setPromotions(samplePromotions);
      }
    } catch (e) {
      console.log('Error fetching home data:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

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
    const matchSearch = (item.name || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'All' || item.category === category;
    return matchSearch && matchCat && item.isAvailable;
  });

  if (sortBy === 'A-Z') {
    filteredItems.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  } else if (sortBy === 'priceAsc') {
    filteredItems.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sortBy === 'priceDesc') {
    filteredItems.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sortBy === 'rating') {
    filteredItems.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
  }

  const handlePromotionPress = async (promotion) => {
    if (!promotion?._id || promotion._id.startsWith('sample_')) {
      return Alert.alert('Promotion unavailable', 'This banner is a preview promotion and cannot be applied.');
    }

    const promotionItems = promotion.foodItems || [];
    const appliesToSpecificItems = promotion.applicableTo === 'specific' && promotionItems.length > 0;
    let nextCartItems = cartItems;
    let nextCartTotal = cartTotal;

    if (appliesToSpecificItems) {
      const applicableIds = promotionItems.map(item => String(item._id || item.foodItemId));
      const cartHasApplicableItem = cartItems.some(item => applicableIds.includes(String(item.foodItemId || item._id)));

      if (!cartHasApplicableItem) {
        const promoItem = promotionItems[0];
        const itemToAdd = {
          ...promoItem,
          canteenId: promotion.canteenId?._id || promotion.canteenId || promoItem.canteenId,
        };

        addToCart(itemToAdd, 1);
        nextCartItems = [...cartItems, { ...itemToAdd, quantity: 1 }];
        nextCartTotal = nextCartItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
      }
    } else if (cartItems.length === 0) {
      return Alert.alert('Cart is empty', 'Add food items to your cart before applying this promotion.');
    }

    try {
      const res = await API.post('/promotions/apply', {
        promotionId: promotion._id,
        cartTotal: nextCartTotal,
        cartItems: nextCartItems.map(i => ({ foodItemId: i.foodItemId || i._id })),
      });

      applyPromotion({ ...promotion, ...res.data.promotion, _id: promotion._id }, res.data.discountAmount);
      navigation.navigate('Cart', { appliedPromotionId: promotion._id });
    } catch (err) {
      Alert.alert('Promotion not applied', err.response?.data?.message || 'This promotion cannot be applied to your cart.');
    }
  };

  const renderPromo = ({ item }) => (
    <TouchableOpacity style={styles.promoBanner} activeOpacity={0.85} onPress={() => handlePromotionPress(item)}>
      {item.bannerImage
        ? <Image source={{ uri: getImageUrl(item.bannerImage) }} style={styles.promoBannerImg} resizeMode="cover" />
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
        ? <Image source={{ uri: getImageUrl(item.image) }} style={styles.foodImg} resizeMode="cover" />
        : <View style={styles.foodImgPlaceholder}><Text style={styles.placeholderIcon}>🍽️</Text></View>}
      <View style={styles.foodInfo}>
        <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.foodCat}>{item.category || 'General'}</Text>
        <Text style={styles.foodPrice}>LKR {item.price ? item.price.toFixed(2) : '0.00'}</Text>
        <View style={styles.ratingRow}>
          <Text style={styles.ratingText}>⭐ {item.averageRating ? item.averageRating.toFixed(1) : 'New'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading {branding?.appName || 'UniEats'}...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TopNavBar navigation={navigation} search={search} setSearch={setSearch} hideBottomRow={true} isHome={true} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
        contentContainerStyle={{ paddingTop: 85, paddingBottom: 20 }}
      >

        {/* Promotions Banner - Daraz Style */}
        {promotions.length > 0 ? (
          <View style={styles.promoContainer}>
            <FlatList
              ref={bannerRef}
              data={promotions}
              renderItem={renderPromo}
              keyExtractor={i => i._id || Math.random().toString()}
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
              <View style={[styles.promoBannerPlaceholder, { backgroundColor: '#FF8A65', justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={styles.promoEmoji}>🎉</Text>
              </View>
              <View style={styles.promoOverlay}>
                <Text style={styles.promoTitle}>Welcome to {branding?.appName || 'UniEats'}!</Text>
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
                    ? <Image style={styles.canteenSmallLogo} source={{ uri: getImageUrl(item.canteenImage) }} />
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
          {filteredItems.length === 0 ? (
            <Text style={styles.emptyText}>No food items found matching your criteria.</Text>
          ) : (
            <FlatList
              data={filteredItems}
              renderItem={renderFood}
              keyExtractor={item => item._id}
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
  container: { flex: 1, backgroundColor: '#FFF7F2' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'transparent' },
  loadingText: { 
    marginTop: SPACING.md, 
    color: COLORS.textSecondary, 
    fontSize: TYPOGRAPHY.body2.fontSize 
  },
  promoContainer: { width: '100%', alignItems: 'center' },
  promoBanner: {
    width: width - 32,
    height: height * 0.25,
    backgroundColor: COLORS.primaryUltraLight,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  promoBannerImg: { width: '100%', height: '100%' },
  promoBannerPlaceholder: { 
    width: '100%', 
    height: '100%', 
    backgroundColor: COLORS.primaryLight 
  },
  promoOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', 
    padding: SPACING.md, 
    paddingTop: SPACING.lg
  },
  promoTitle: { 
    color: COLORS.textWhite, 
    fontWeight: 'bold', 
    fontSize: TYPOGRAPHY.body1.fontSize 
  },
  promoDiscount: { 
    color: '#FFD700', 
    fontWeight: 'bold', 
    fontSize: TYPOGRAPHY.caption.fontSize, 
    marginTop: SPACING.xs 
  },
  dotsRow: { 
    flexDirection: 'row', 
    position: 'absolute', 
    bottom: SPACING.sm, 
    width: '100%', 
    justifyContent: 'center' 
  },
  dot: { 
    width: 6, 
    height: 6, 
    borderRadius: BORDER_RADIUS.round, 
    backgroundColor: 'rgba(255,255,255,0.4)', 
    marginLeft: SPACING.xs 
  },
  dotActive: { 
    backgroundColor: COLORS.textWhite, 
    width: 14 
  },
  section: { marginTop: SPACING.md },
  sectionBot: { marginTop: SPACING.xs, paddingBottom: SPACING.xxxl },
  sectionRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: SPACING.md, 
    marginBottom: SPACING.sm 
  },
  sectionTitle: { 
    fontSize: TYPOGRAPHY.h4.fontSize, 
    fontWeight: TYPOGRAPHY.h4.fontWeight, 
    color: COLORS.textPrimary, 
    paddingHorizontal: SPACING.md, 
    marginBottom: SPACING.sm 
  },
  seeAll: { 
    fontSize: TYPOGRAPHY.caption.fontSize, 
    color: COLORS.primary, 
    fontWeight: '600' 
  },
  canteenChip: {
    backgroundColor: COLORS.surface, 
    borderRadius: BORDER_RADIUS.round, 
    paddingHorizontal: SPACING.md, 
    paddingVertical: SPACING.sm,
    marginRight: SPACING.sm, 
    borderWidth: 1.5, 
    borderColor: COLORS.borderLight, 
    flexDirection: 'row', 
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  canteenSmallLogo: { 
    width: 20, 
    height: 20, 
    borderRadius: BORDER_RADIUS.sm, 
    marginRight: SPACING.xs 
  },
  canteenChipText: { 
    fontSize: TYPOGRAPHY.caption.fontSize, 
    color: COLORS.textPrimary, 
    fontWeight: '600', 
    marginLeft: SPACING.xs 
  },
  catChip: {
    backgroundColor: COLORS.surface, 
    borderRadius: BORDER_RADIUS.round, 
    paddingHorizontal: SPACING.sm, 
    paddingVertical: SPACING.xs,
    marginRight: SPACING.sm, 
    borderWidth: 1.5, 
    borderColor: COLORS.border,
  },
  catChipActive: { 
    backgroundColor: COLORS.primary, 
    borderColor: COLORS.primary 
  },
  catChipText: { 
    fontSize: TYPOGRAPHY.caption.fontSize, 
    color: COLORS.textSecondary, 
    fontWeight: '600' 
  },
  catChipTextActive: { color: COLORS.textWhite },
  sortRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: SPACING.md, 
    marginVertical: SPACING.md 
  },
  sortLabel: { 
    fontSize: TYPOGRAPHY.caption.fontSize, 
    fontWeight: 'bold', 
    color: COLORS.textSecondary, 
    marginRight: SPACING.sm 
  },
  sortBtn: { 
    paddingHorizontal: SPACING.sm, 
    paddingVertical: SPACING.xs, 
    borderRadius: BORDER_RADIUS.sm, 
    backgroundColor: '#FFF7F2',
    marginRight: SPACING.xs 
  },
  sortBtnActive: { backgroundColor: COLORS.primaryUltraLight },
  sortBtnText: { 
    fontSize: TYPOGRAPHY.caption.fontSize, 
    color: COLORS.textSecondary, 
    fontWeight: '600' 
  },
  sortBtnTextActive: { 
    color: COLORS.primary, 
    fontWeight: 'bold' 
  },
  foodGrid: { paddingHorizontal: SPACING.sm },
  foodCard: {
    flex: 1, 
    margin: SPACING.sm, 
    backgroundColor: COLORS.surface, 
    borderRadius: BORDER_RADIUS.xl, 
    overflow: 'hidden',
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  foodImg: { width: '100%', height: 120 },
  foodImgPlaceholder: { 
    width: '100%', 
    height: 120, 
    backgroundColor: COLORS.primaryUltraLight, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  foodInfo: { padding: SPACING.sm },
  foodName: { 
    fontSize: TYPOGRAPHY.body2.fontSize, 
    fontWeight: '600', 
    color: COLORS.textPrimary 
  },
  foodCat: { 
    fontSize: TYPOGRAPHY.caption.fontSize, 
    color: COLORS.textSecondary, 
    marginTop: SPACING.xs 
  },
  foodPrice: { 
    fontSize: TYPOGRAPHY.body2.fontSize, 
    fontWeight: 'bold', 
    color: COLORS.primary, 
    marginTop: SPACING.xs 
  },
  ratingRow: { marginTop: SPACING.xs },
  ratingText: { 
    fontSize: TYPOGRAPHY.caption.fontSize, 
    fontWeight: 'bold', 
    color: COLORS.textSecondary 
  },
  emptyText: { 
    textAlign: 'center', 
    color: COLORS.textTertiary, 
    paddingVertical: SPACING.xxxl, 
    fontSize: TYPOGRAPHY.body2.fontSize 
  },
  placeholderIcon: { fontSize: 40 },
  promoEmoji: { fontSize: 50 },
});
