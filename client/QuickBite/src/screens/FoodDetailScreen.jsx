import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, Image, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, FlatList,
} from 'react-native';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import TopNavBar from '../components/TopNavBar';

const ORANGE = '#FF6B35';

export default function FoodDetailScreen({ navigation, route }) {
    const { item: food } = route.params;
    const { addToCart } = useCart();
    const [feedbacks, setFeedbacks] = useState([]);
    const [fbLoading, setFbLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            const res = await API.get(`/feedback/food/${food._id}`);
            setFeedbacks(res.data?.feedback || []);
        } catch (e) {
            setFeedbacks([]);
        } finally {
            setFbLoading(false);
        }
    };

    const handleAddToCart = () => {
        setAdding(true);
        addToCart(food, quantity);
        setTimeout(() => {
            setAdding(false);
            Alert.alert('Added! 🛒', `${food.name} × ${quantity} added to cart`, [
                { text: 'Continue Shopping', style: 'cancel' },
                { text: 'Go to Cart', onPress: () => navigation.navigate('Cart') },
            ]);
        }, 300);
    };

    const avgRating = feedbacks.length
        ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
        : null;

    const renderStar = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

    return (
        <View style={styles.container}>
            <TopNavBar navigation={navigation} placeholder={food.name} />
            

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 85, paddingBottom: 20 }}>
                {/* Food Image */}
                {food.image
                    ? <Image source={{ uri: food.image.startsWith('http') ? food.image : `http://10.0.2.2:3000${food.image}` }} style={styles.heroImg} resizeMode="cover" />
                    : <View style={styles.heroPlaceholder}><Text style={{ fontSize: 80 }}>🍽️</Text></View>}



                {/* Details Card */}
                <View style={styles.details}>
                    <View style={styles.nameRow}>
                        <Text style={styles.foodName}>{food.name}</Text>
                        <Text style={styles.price}>LKR {food.price.toFixed(2)}</Text>
                    </View>
                    <Text style={styles.category}>📂 {food.category || 'General'}</Text>
                    {food.canteenId?.canteenName && (
                        <Text style={styles.canteen}>🏪 {food.canteenId.canteenName}</Text>
                    )}
                    {food.description ? <Text style={styles.desc}>{food.description}</Text> : null}

                    {/* Qty selector */}
                    <View style={styles.qtyRow}>
                        <Text style={styles.qtyLabel}>Quantity</Text>
                        <View style={styles.qtyControl}>
                            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(Math.max(1, quantity - 1))}>
                                <Text style={styles.qtyBtnText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.qtyNum}>{quantity}</Text>
                            <TouchableOpacity style={styles.qtyBtn} onPress={() => setQuantity(quantity + 1)}>
                                <Text style={styles.qtyBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <TouchableOpacity style={[styles.addBtn, adding && { opacity: 0.7 }]} onPress={handleAddToCart} disabled={adding}>
                        <Text style={styles.addBtnText}>
                            🛒 Add to Cart  ·  LKR {(food.price * quantity).toFixed(2)}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Reviews */}
                <View style={styles.reviewSection}>
                    <View style={styles.reviewHeader}>
                        <View>
                            <Text style={styles.sectionTitle}>⭐ Reviews</Text>
                            {avgRating && <Text style={styles.avgRating}>{avgRating} / 5.0 ({feedbacks.length})</Text>}
                        </View>
                        <TouchableOpacity
                            style={styles.writeReviewBtn}
                            onPress={() => navigation.navigate('Feedback', {
                                foodItemId: food._id,
                                canteenId: food.canteenId?._id || food.canteenId,
                                foodName: food.name
                            })}
                        >
                            <Text style={styles.writeReviewText}>+ Write Review</Text>
                        </TouchableOpacity>
                    </View>

                    {fbLoading ? (
                        <ActivityIndicator color={ORANGE} style={{ paddingVertical: 20 }} />
                    ) : feedbacks.length === 0 ? (
                        <Text style={styles.noReviews}>No reviews yet. Be the first!</Text>
                    ) : (
                        feedbacks.map(fb => (
                            <View key={fb._id} style={styles.reviewCard}>
                                <View style={styles.reviewTop}>
                                    <Text style={styles.reviewer}>{fb.userId?.firstName || 'Student'}</Text>
                                    <Text style={styles.stars}>{renderStar(fb.rating)}</Text>
                                </View>
                                <Text style={styles.reviewComment}>{fb.comment}</Text>
                                {fb.complaintImage ? (
                                    <Image
                                        source={{ uri: `http://10.0.2.2:3000${fb.complaintImage}` }}
                                        style={styles.reviewImg}
                                        resizeMode="cover"
                                    />
                                ) : null}
                                <Text style={styles.reviewDate}>{new Date(fb.createdAt).toLocaleDateString()}</Text>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    heroImg: { width: '100%', height: 240 },
    heroPlaceholder: { width: '100%', height: 240, backgroundColor: '#FFF0E8', justifyContent: 'center', alignItems: 'center' },
    details: { backgroundColor: '#fff', borderRadius: 20, margin: 12, padding: 20, elevation: 3 },
    nameRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    foodName: { fontSize: 22, fontWeight: 'bold', color: '#222', flex: 1, marginRight: 8 },
    price: { fontSize: 20, fontWeight: 'bold', color: ORANGE },
    category: { fontSize: 13, color: '#888', marginBottom: 4 },
    canteen: { fontSize: 13, color: '#888', marginBottom: 8 },
    desc: { fontSize: 14, color: '#555', lineHeight: 20, marginBottom: 12 },
    qtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    qtyLabel: { fontSize: 15, fontWeight: '600', color: '#333' },
    qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 14 },
    qtyBtn: {
        backgroundColor: ORANGE, width: 36, height: 36, borderRadius: 18,
        justifyContent: 'center', alignItems: 'center',
    },
    qtyBtnText: { color: '#fff', fontSize: 20, fontWeight: 'bold', lineHeight: 22 },
    qtyNum: { fontSize: 18, fontWeight: 'bold', color: '#222', minWidth: 24, textAlign: 'center' },
    addBtn: {
        backgroundColor: ORANGE, borderRadius: 14, paddingVertical: 14, alignItems: 'center',
        shadowColor: ORANGE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
    },
    addBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    reviewSection: { margin: 12, marginTop: 0 },
    reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#222' },
    avgRating: { fontSize: 14, color: ORANGE, fontWeight: '700' },
    writeReviewBtn: { backgroundColor: '#FFF0E8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#FFE0D6' },
    writeReviewText: { color: ORANGE, fontSize: 13, fontWeight: 'bold' },
    noReviews: { color: '#aaa', textAlign: 'center', paddingVertical: 20, fontSize: 14 },
    reviewCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2 },
    reviewTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    reviewer: { fontWeight: 'bold', color: '#333', fontSize: 14 },
    stars: { color: '#FFB800', fontSize: 14 },
    reviewComment: { color: '#555', fontSize: 14, lineHeight: 20 },
    reviewImg: { width: '100%', height: 140, borderRadius: 8, marginTop: 8 },
    reviewDate: { fontSize: 11, color: '#bbb', marginTop: 6 },
});
