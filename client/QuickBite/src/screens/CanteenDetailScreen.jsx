import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, Image, Dimensions, TextInput
} from 'react-native';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import FloatingCart from '../components/FloatingCart';

const ORANGE = '#FF6B35';
const { width } = Dimensions.get('window');

export default function CanteenDetailScreen({ navigation, route }) {
    const { canteen } = route.params;
    const { addToCart } = useCart();

    const [foodItems, setFoodItems] = useState([]);
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);

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
                const allPromos = promoRes.data?.promotions || [];
                // Filter promos that belong to ONLY this canteen
                const canteenPromos = allPromos; // if backend supports .canteenId we do: allPromos.filter(p => String(p.canteen) === String(canteen._id));
                setPromotions(canteenPromos);
            })
            .catch(() => setFoodItems([]))
            .finally(() => setLoading(false));
    }, []);

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
                ? <Image source={{ uri: `http://10.0.2.2:3000${item.bannerImage}` }} style={styles.promoBannerImg} resizeMode="cover" />
                : <View style={styles.promoBannerPlaceholder} />}
            <View style={styles.promoOverlay}>
                <Text style={styles.promoTitle}>{item.title}</Text>
                <Text style={styles.promoDiscount}>
                    {item.discountType === 'percentage' ? `${item.discountValue}% OFF` : `LKR ${item.discountValue} OFF`}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Sleek Search Navigation Bar */}
            <View style={styles.navBar}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnNav}>
                    <Text style={styles.backArrowNav}>←</Text>
                </TouchableOpacity>
                <View style={styles.navSearchContainer}>
                    <TextInput
                        style={styles.navSearchInput}
                        placeholder={`🔍 Search in ${canteen.canteenName}...`}
                        placeholderTextColor="#aaa"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Hero Banner */}
                {canteen.canteenImage
                    ? <Image source={{ uri: `http://10.0.2.2:3000${canteen.canteenImage}` }} style={styles.heroImg} resizeMode="cover" />
                    : <View style={styles.heroPlaceholder}><Text style={{ fontSize: 60 }}>🏪</Text></View>}

                {/* Info Card */}
                <View style={styles.infoCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        {canteen.logo && <Image source={{ uri: `http://10.0.2.2:3000${canteen.logo}` }} style={{ width: 40, height: 40, borderRadius: 20, marginRight: 10 }} />}
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
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>🔥 Exclusive Promotions</Text>
                        <FlatList
                            data={promotions}
                            renderItem={renderPromo}
                            horizontal
                            pagingEnabled
                            showsHorizontalScrollIndicator={false}
                            keyExtractor={i => i._id}
                        />
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
                                    ? <Image source={{ uri: `http://10.0.2.2:3000${item.image}` }} style={styles.foodImg} resizeMode="cover" />
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

            <FloatingCart />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    navBar: {
        backgroundColor: '#fff', paddingTop: 45, paddingBottom: 10,
        paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: '#F0F0F0', elevation: 2, zIndex: 10
    },
    backBtnNav: { marginRight: 12, paddingVertical: 4 },
    backArrowNav: { color: ORANGE, fontSize: 24, fontWeight: 'bold' },
    navSearchContainer: { flex: 1 },
    navSearchInput: {
        backgroundColor: '#F5F5F5', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8,
        fontSize: 14, color: '#333',
    },
    heroImg: { width: '100%', height: 180 },
    heroPlaceholder: { width: '100%', height: 180, backgroundColor: '#FFF0E8', justifyContent: 'center', alignItems: 'center' },
    infoCard: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: -30, borderRadius: 16, padding: 20, elevation: 6, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
    canteenName: { fontSize: 22, fontWeight: 'bold', color: '#222' },
    detail: { fontSize: 13, color: '#666', marginBottom: 4 },
    divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 10 },
    section: { marginTop: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#222', paddingHorizontal: 16, marginBottom: 12 },
    promoBanner: { width: width, height: 140, backgroundColor: '#FFE0D6' },
    promoBannerImg: { width: '100%', height: '100%' },
    promoBannerPlaceholder: { width: '100%', height: '100%', backgroundColor: '#FFD4C2' },
    promoOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: 12 },
    promoTitle: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    promoDiscount: { color: '#FFD700', fontWeight: 'bold', fontSize: 13, marginTop: 2 },
    catChip: { backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, borderWidth: 1.5, borderColor: '#E8E8E8' },
    catChipActive: { backgroundColor: ORANGE, borderColor: ORANGE },
    catChipText: { fontSize: 13, color: '#666', fontWeight: '600' },
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
