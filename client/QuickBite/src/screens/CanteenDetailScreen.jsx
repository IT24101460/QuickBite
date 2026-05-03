import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, Image, Dimensions, RefreshControl, Alert
} from 'react-native';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import TopNavBar from '../components/TopNavBar';
import { getImageUrl } from '../utils/imageUtils';

const ORANGE = '#FF6B35';
const { width, height } = Dimensions.get('window');

export default function CanteenDetailScreen({ navigation, route }) {
    const { canteen } = route.params;
    const { addToCart, cartItems, cartTotal, applyPromotion } = useCart();

    const [foodItems, setFoodItems] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const bannerRef = useRef(null);
    const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [sortBy, setSortBy] = useState('none');

    const categories = ['All', ...new Set(foodItems.map(f => f.category).filter(Boolean))];

    const fetchData = useCallback(async () => {
        try {
            const results = await Promise.allSettled([
                API.get(`/foods?canteenId=${canteen._id}`),
                API.get('/promotions'),
                API.get(`/feedback/canteen/${canteen._id}`)
            ]);

            const foodRes = results[0];
            const promoRes = results[1];
            const feedbackRes = results[2];

            const foods = foodRes.status === 'fulfilled' ? (foodRes.value.data?.foodItems || []) : [];
            const allPromos = promoRes.status === 'fulfilled' ? (promoRes.value.data?.promotions || []) : [];
            const reviewList = feedbackRes.status === 'fulfilled' ? (feedbackRes.value.data?.feedback || []) : [];

            setFoodItems(foods);
            setFeedbacks(reviewList);

            const canteenPromos = allPromos.filter(p => String(p.canteenId?._id || p.canteenId) === String(canteen._id));

            if (canteenPromos.length > 0) {
                setPromotions(canteenPromos);
            } else {
                const samplePromotions = [
                    { _id: 'sample_c1', bannerImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80' },
                    { _id: 'sample_c2', bannerImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80' },
                    { _id: 'sample_c3', bannerImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80' }
                ];
                setPromotions(samplePromotions);
            }
        } catch (e) {
            console.error("Error fetching canteen detail data:", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [canteen._id]);

    useEffect(() => {
        setLoading(true);
        fetchData();
    }, [fetchData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchData();
    };

    // Auto-changing banner
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

    let filteredItems = foodItems.filter(item => {
        const matchSearch = (item.name || '').toLowerCase().includes(search.toLowerCase());
        const matchCat = category === 'All' || item.category === category;
        return matchSearch && matchCat;
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
                    canteenId: promotion.canteenId?._id || promotion.canteenId || canteen._id,
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
        <TouchableOpacity style={styles.promoBanner} activeOpacity={0.9} onPress={() => handlePromotionPress(item)}>
            {item.bannerImage
                ? <Image source={{ uri: getImageUrl(item.bannerImage) }} style={styles.promoBannerImg} resizeMode="cover" />
                : <View style={styles.promoBannerPlaceholder} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <TopNavBar navigation={navigation} search={search} setSearch={setSearch} placeholder={`🔍 Search in ${canteen.canteenName}...`} />

            <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={{ paddingTop: 100, paddingBottom: 20 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[ORANGE]} />}
            >
                {/* Hero Banner */}
                {canteen.canteenImage
                    ? <Image source={{ uri: getImageUrl(canteen.canteenImage) }} style={styles.heroImg} resizeMode="cover" />
                    : <View style={styles.heroPlaceholder}><Text style={styles.heroPlaceholderIcon}>🏪</Text></View>}

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        {canteen.canteenImage && <Image source={{ uri: getImageUrl(canteen.canteenImage) }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} />}
                        <View>
                            <Text style={styles.canteenName}>{canteen.canteenName}</Text>
                            <Text style={styles.detail}>📍 {canteen.location}</Text>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <Text style={styles.detail}>🕐 Opening Hours: {canteen.openingTime} – {canteen.closingTime}</Text>
                    <Text style={styles.detail}>⭐ Rating: {feedbacks.length > 0 ? (feedbacks.reduce((a,b)=>a+b.rating,0)/feedbacks.length).toFixed(1) : 'New'}</Text>
                </View>

                {promotions.length > 0 && (
                    <View style={styles.promoContainer}>
                        <FlatList
                            ref={bannerRef}
                            data={promotions}
                            renderItem={renderPromo}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={i => i._id || Math.random().toString()}
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
                )}

                <View style={{ marginTop: 15 }}>
                    <Text style={styles.sectionTitle}>📋 Categories</Text>
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

                <Text style={styles.sectionTitle}>🍽️ Menu Items</Text>
                {loading && !refreshing ? <ActivityIndicator color={ORANGE} style={{ paddingVertical: 20 }} /> : (
                    <FlatList
                        data={filteredItems}
                        scrollEnabled={false}
                        keyExtractor={i => i._id || i.foodItemId || Math.random().toString()}
                        numColumns={2}
                        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 10 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.foodCard}
                                onPress={() => navigation.navigate('FoodDetail', { item })}
                            >
                                {item.image
                                    ? <Image source={{ uri: getImageUrl(item.image) }} style={styles.foodImg} resizeMode="cover" />  
                                    : <View style={styles.foodImgPlaceholder}><Text style={styles.placeholderIcon}>🍽️</Text></View>}
                                <View style={{ padding: 8 }}>
                                    <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
                                    <Text style={styles.foodPrice}>LKR {item.price ? item.price.toFixed(2) : '0.00'}</Text>
                                    <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item, 1)}>
                                        <Text style={styles.addBtnText}>+ Add to Cart</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={<Text style={styles.empty}>No food items matching criteria</Text>}
                    />
                )}

                <View style={styles.reviewSection}>
                    <View style={styles.reviewHeader}>
                        <Text style={styles.sectionTitle}>💬 Student Reviews</Text>
                        <TouchableOpacity 
                            onPress={() => navigation.navigate('Feedback', { canteenId: canteen._id })}
                            style={styles.addReviewBtn}
                        >
                            <Text style={styles.addReviewText}>+ Rate Canteen</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {feedbacks.length === 0 ? (
                        <Text style={styles.empty}>No reviews yet for this canteen.</Text>
                    ) : (
                        feedbacks.slice(0, 8).map(fb => (
                            <View key={fb._id} style={styles.reviewCard}>
                                <View style={styles.reviewTop}>
                                    <Text style={styles.reviewerName}>{fb.userId?.firstName || 'Student'}</Text>
                                    <Text style={styles.stars}>{'★'.repeat(fb.rating)}{'☆'.repeat(5-fb.rating)}</Text>
                                </View>
                                <Text style={styles.reviewText}>{fb.comment}</Text>
                                {fb.complaintImage ? (
                                    <Image 
                                        source={{ uri: getImageUrl(fb.complaintImage) }} 
                                        style={styles.reviewImage} 
                                        resizeMode="cover"
                                    />
                                ) : null}
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF7F2' },
    heroImg: { width: '100%', height: 180 },
    heroPlaceholder: { width: '100%', height: 180, backgroundColor: '#FFF0E8', justifyContent: 'center', alignItems: 'center' },
    heroPlaceholderIcon: { fontSize: 60 },
    infoCard: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: -50, borderRadius: 16, padding: 15, elevation: 6, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
    canteenName: { fontSize: 22, fontWeight: 'bold', color: '#222' },
    detail: { fontSize: 13, color: '#666', marginBottom: 4 },
    divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 10 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#222', paddingHorizontal: 16, marginBottom: 12 },
    promoContainer: { width: '100%', alignItems: 'center', marginTop: 20 },
    promoBanner: {
        width: width - 32,
        height: height * 0.25,
        backgroundColor: '#FFE0D6',
        marginHorizontal: 16,
        marginTop: 0,
        borderRadius: 10,
        overflow: 'hidden'
    },
    promoBannerImg: { width: '100%', height: '100%' },
    promoBannerPlaceholder: { width: '100%', height: '100%', backgroundColor: '#FFD4C2' },
    dotsRow: { flexDirection: 'row', position: 'absolute', bottom: 10, width: '100%', justifyContent: 'center' },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)', marginLeft: 6 },
    dotActive: { backgroundColor: '#fff', width: 14 },
    catChip: { backgroundColor: '#fff', borderRadius: 25, paddingHorizontal: 22, paddingVertical: 12, marginRight: 10, borderWidth: 1.5, borderColor: '#E8E8E8' },
    catChipActive: { backgroundColor: ORANGE, borderColor: ORANGE },
    catChipText: { fontSize: 16, color: '#666', fontWeight: '600' },
    catChipTextActive: { color: '#fff' },
    sortRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginVertical: 12 },
    sortLabel: { fontSize: 13, fontWeight: 'bold', color: '#555', marginRight: 10 },
    sortBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: '#eee', marginRight: 6 },
    sortBtnActive: { backgroundColor: '#ffe5db' },
    sortBtnText: { fontSize: 12, color: '#666', fontWeight: '600' },
    sortBtnTextActive: { color: ORANGE, fontWeight: 'bold' },
    foodCard: { flex: 1, margin: 6, backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
    foodImg: { width: '100%', height: 110 },
    foodImgPlaceholder: { width: '100%', height: 110, backgroundColor: '#FFF0E8', justifyContent: 'center', alignItems: 'center' },
    placeholderIcon: { fontSize: 32 },
    foodName: { fontSize: 14, fontWeight: 'bold', color: '#222', marginBottom: 2 },
    foodPrice: { fontSize: 13, fontWeight: 'bold', color: ORANGE, marginBottom: 8 },
    addBtn: { backgroundColor: ORANGE, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
    addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    empty: { textAlign: 'center', color: '#aaa', paddingVertical: 30, fontSize: 14 },

    reviewSection: { marginTop: 20, paddingBottom: 20 },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    addReviewBtn: { marginRight: 16, backgroundColor: '#FFF0E8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    addReviewText: { color: ORANGE, fontWeight: 'bold', fontSize: 12 },
    reviewCard: { backgroundColor: '#fff', marginHorizontal: 16, padding: 16, borderRadius: 12, marginBottom: 10, elevation: 2 },
    reviewTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    reviewerName: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    stars: { color: '#FFB800', fontSize: 14 },
    reviewText: { fontSize: 14, color: '#555', fontStyle: 'italic' },
    reviewImage: { width: '100%', height: 180, borderRadius: 8, marginTop: 10, backgroundColor: '#eee' },
});
