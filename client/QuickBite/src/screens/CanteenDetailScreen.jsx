import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, Image, Dimensions, TextInput
} from 'react-native';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import TopNavBar from '../components/TopNavBar';
import { getImageUrl } from '../utils/imageUtils';

const ORANGE = '#FF6B35';
const { width, height } = Dimensions.get('window');

export default function CanteenDetailScreen({ navigation, route }) {
    const { canteen } = route.params;
    const { addToCart } = useCart();

    const [foodItems, setFoodItems] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);

    const bannerRef = useRef(null);
    const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [sortBy, setSortBy] = useState('none');

    // Derived categories from available foods
    const categories = ['All', ...new Set(foodItems.map(f => f.category).filter(Boolean))];

    useEffect(() => {
        Promise.all([
            API.get(`/foods?canteenId=${canteen._id}`),
            API.get('/promotions') // We'll filter these client side
        ])
            .then(([foodRes, promoRes]) => {
                setFoodItems(foodRes.data?.foodItems || []);
                const samplePromotions = [
                    { _id: 'canteen_promo_1', bannerImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80' },
                    { _id: 'canteen_promo_2', bannerImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80' },
                    { _id: 'canteen_promo_3', bannerImage: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80' }
                ];
                setPromotions(samplePromotions);
            })
            .catch(() => setFoodItems([]))
            .finally(() => setLoading(false));
    }, []);

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
        const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
        const matchCat = category === 'All' || item.category === category;
        return matchSearch && matchCat;
    });

    if (sortBy === 'A-Z') {
        filteredItems.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'priceAsc') {
        filteredItems.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'priceDesc') {
        filteredItems.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
        filteredItems.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    }

    const renderPromo = ({ item }) => (
        <TouchableOpacity style={styles.promoBanner} activeOpacity={0.9}>
            {item.bannerImage
                ? <Image source={{ uri: getImageUrl(item.bannerImage) }} style={styles.promoBannerImg} resizeMode="cover" />
                : <View style={styles.promoBannerPlaceholder} />}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <TopNavBar navigation={navigation} search={search} setSearch={setSearch} placeholder={`🔍 Search in ${canteen.canteenName}...`} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 100, paddingBottom: 20 }}>
                {/* Hero Banner */}
                {canteen.canteenImage
                    ? <Image source={{ uri: getImageUrl(canteen.canteenImage) }} style={styles.heroImg} resizeMode="cover" />
                    : <View style={styles.heroPlaceholder}><Text style={{ fontSize: 60 }}>🏪</Text></View>}

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
                    <Text style={styles.detail}>⭐ Rating: {canteen.rating || 'New'}</Text>
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
                            keyExtractor={i => i._id}
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
                {loading ? <ActivityIndicator color={ORANGE} style={{ paddingVertical: 20 }} /> : (
                    <FlatList
                        data={filteredItems}
                        scrollEnabled={false}
                        keyExtractor={i => i._id}
                        numColumns={2}
                        contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 30 }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.foodCard}
                                onPress={() => navigation.navigate('FoodDetail', { item })}
                            >
                                {item.image
                                    ? <Image source={{ uri: getImageUrl(item.image) }} style={styles.foodImg} resizeMode="cover" />  
                                    : <View style={styles.foodImgPlaceholder}><Text style={{ fontSize: 32 }}>🍽️</Text></View>}
                                <View style={{ padding: 8 }}>
                                    <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
                                    <Text style={styles.foodPrice}>LKR {item.price.toFixed(2)}</Text>
                                    <TouchableOpacity style={styles.addBtn} onPress={() => addToCart(item, 1)}>
                                        <Text style={styles.addBtnText}>+ Add to Cart</Text>
                                    </TouchableOpacity>
                                </View>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={<Text style={styles.empty}>No food items matching criteria</Text>}
                    />
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    heroImg: { width: '100%', height: 180 },
    heroPlaceholder: { width: '100%', height: 180, backgroundColor: '#FFF0E8', justifyContent: 'center', alignItems: 'center' },
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
    foodName: { fontSize: 14, fontWeight: 'bold', color: '#222', marginBottom: 2 },
    foodPrice: { fontSize: 13, fontWeight: 'bold', color: ORANGE, marginBottom: 8 },
    addBtn: { backgroundColor: ORANGE, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
    addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    empty: { textAlign: 'center', color: '#aaa', paddingVertical: 30, fontSize: 14 },
});
