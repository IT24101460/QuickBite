import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import TopNavBar from '../components/TopNavBar';

const ORANGE = '#FF6B35';
const METHODS = [
    { id: 'cash', label: '💵 Cash', desc: 'Pay at pickup' },
    { id: 'card', label: '💳 Card', desc: 'Debit / Credit card online' },
    { id: 'bank', label: '🏦 Bank Transfer', desc: 'Upload payment slip' },
];

export default function CheckoutScreen({ route, navigation }) {
    const { cartItems, finalTotal, discountAmount, appliedPromotion, clearCart } = useCart();
    const { user } = useAuth();
    const [method, setMethod] = useState('cash');
    const pickupTime = route.params?.pickupTime || '';
    const isCustomOrder = route.params?.customOrder || false;

    // Card Payment States
    const [savedCards, setSavedCards] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);

    // Initialize saved cards only for authenticated users
    useEffect(() => {
        const loadCards = async () => {
            if (user) {
                try {
                    const existingCards = await AsyncStorage.getItem('@saved_cards');
                    if (existingCards) {
                        const cards = JSON.parse(existingCards);
                        setSavedCards(cards);
                        if (cards.length > 0) {
                            setSelectedCard(cards[0].id);
                        }
                    }
                } catch (e) {
                    console.error("Failed to load cards", e);
                }
            } else {
                // User logged out - clear saved cards
                setSavedCards([]);
                setSelectedCard(null);
            }
        };
        loadCards();
    }, [user]);

    const [paymentProof, setPaymentProof] = useState(null);
    const [loading, setLoading] = useState(false);
    const [canteen, setCanteen] = useState(null);
    const [canteenBankDetails, setCanteenBankDetails] = useState('');

    // Time Validation Helper
    const timeToMinutes = (timeStr) => {
        if (!timeStr) return 0;
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) return 0;
        let h = parseInt(match[1], 10);
        let m = parseInt(match[2], 10);
        let mode = match[3].toUpperCase();
        if (h === 12 && mode === 'AM') h = 0;
        if (h < 12 && mode === 'PM') h += 12;
        return h * 60 + m;
    };

    useEffect(() => {
        if (route.params?.newlyAddedCard) {
            const newCard = route.params.newlyAddedCard;
            setSavedCards(prev => [...prev, newCard]);
            setSelectedCard(newCard.id);
            navigation.setParams({ newlyAddedCard: null });
        }
    }, [navigation, route.params?.newlyAddedCard]);

    useEffect(() => {
        // Fetch the bank details for the canteen related to the first item
        if (cartItems.length > 0) {
            // Assuming we check the details of foods to find their canteen, 
            // but for safety let's find the first item's food detail or fetch it.
            // The item object might contain canteen context populated in fetching.
            // If the user's requested bank details is directly at /canteens/foodId,
            // we will just pull canteens globally and match if possible, or gracefully mock if backend isn't ready.
            API.get('/canteens').then(res => {
                const canteens = res.data?.canteens || [];
                const matching = canteens.find(c => String(c._id) === String(cartItems[0]?.canteenId)) || canteens[0];
                if (matching) {
                    setCanteen(matching);
                    setCanteenBankDetails(matching.bankDetails || "Bank: BOC\nAcc No: 123456789\nName: SLIIT Canteen");
                }
            }).catch(ignore => { });
        }
    }, [cartItems]);

    const pickProof = () => {
        launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, (res) => {
            if (!res.didCancel && res.assets?.length > 0) {
                setPaymentProof(res.assets[0]);
            }
        });
    };

    const handleConfirm = async () => {
        // Skip pickup time validation for custom orders
        if (!isCustomOrder && !pickupTime) {
            return Alert.alert('Pickup Time Required', 'Please go back to your cart and choose a pickup time.');
        }
        if (method === 'bank' && !paymentProof) {
            return Alert.alert('Payment Slip Required', 'Please upload your bank transfer slip before placing the order.');
        }

        // Validate pickup time against canteen open/close hours and future time (only for regular orders)
        if (!isCustomOrder && canteen) {
            const chosenMin = timeToMinutes(pickupTime);
            const openMin = timeToMinutes(canteen.openingTime || '08:00 AM');
            const closeMin = timeToMinutes(canteen.closingTime || '05:00 PM');
            
            // Get current time
            const now = new Date();
            const currentMin = now.getHours() * 60 + now.getMinutes();

            if (chosenMin < openMin || chosenMin > closeMin) {
                return Alert.alert(
                    'Invalid Pickup Time',
                    `Canteen operating hours are ${canteen.openingTime || '08:00 AM'} to ${canteen.closingTime || '05:00 PM'}. Please select a time within this window.`
                );
            }
            
            // Validate that pickup time is in the future (at least 15 minutes from now)
            if (chosenMin < currentMin + 15) {
                const currentTimeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
                return Alert.alert(
                    'Invalid Pickup Time',
                    `Pickup time must be at least 15 minutes from now. Current time is ${currentTimeStr}. Please select a future time slot.`
                );
            }
        }

        setLoading(true);
        try {
            // 1. Place order
            const orderPayload = {
                items: cartItems.map(i => ({
                    foodItemId: i.foodItemId || i._id,
                    name: i.name,
                    category: i.category || 'General',
                    price: i.price,
                    quantity: i.quantity,
                    note: i.note || "",
                    isCustomOrder: i.isCustomOrder || false,
                    customOrderData: i.customOrderData || null
                })),
                pickupTime: isCustomOrder ? 'Custom Order' : pickupTime,
                discountAmount: discountAmount || 0,
                promotionId: appliedPromotion ? appliedPromotion._id : null,
                canteenId: cartItems[0].canteenId || null,
                isCustomOrder: isCustomOrder
            };

            const orderRes = await API.post('/orders', orderPayload);
            const order = orderRes.data.order;

            // 2. Create payment
            if (method === 'card') {
                // Mock Card Gateway API Hit
                await API.post('/payments', {
                    orderId: order._id,
                    paymentMethod: method
                });

            } else if (method !== 'cash') {
                if (paymentProof) {
                    const payFormData = new FormData();
                    payFormData.append('orderId', order._id);
                    payFormData.append('paymentMethod', method);
                    payFormData.append('paymentProof', {
                        uri: paymentProof.uri,
                        name: paymentProof.fileName || 'proof.jpg',
                        type: paymentProof.type || 'image/jpeg',
                    });
                    await API.post('/payments', payFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });
                } else {
                    await API.post('/payments', {
                        orderId: order._id,
                        paymentMethod: method
                    });
                }
            }

            clearCart();
            Alert.alert(
                '🎉 Order Confirmed!',
                `Queue #${order.queueNumber}\nPickup: ${pickupTime}\nTotal: LKR ${finalTotal.toFixed(2)}`,
                [{
                    text: 'View Orders', onPress: () => {
                        navigation.goBack(); // Back to drawer home
                        navigation.navigate('Orders');
                    }
                }]
            );
        } catch (err) {
            const backendErrorDetail = err.response?.data?.error || err.response?.data?.message || err.message;
            console.error('Checkout Full Error:', err.response?.data || err.message);
            Alert.alert('Detailed Error', `Failed to place order.\nReason: ${backendErrorDetail}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <TopNavBar navigation={navigation} hideBottomRow={true} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16, paddingTop: 85 }}>

                {/* Pickup Time - Only show for regular orders */}
                {!isCustomOrder && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>⏰ Pickup Time</Text>
                        <Text style={styles.descText}>
                            Canteen Hours: {canteen?.openingTime || '08:00 AM'} - {canteen?.closingTime || '05:00 PM'}
                        </Text>
                        <View style={styles.timeDisplay}>
                            <Text style={styles.timeDisplayText}>{pickupTime || 'Not selected'}</Text>
                        </View>
                    </View>
                )}

                {/* Custom Order Info - Only show for custom orders */}
                {isCustomOrder && cartItems.find(item => item.isCustomOrder) && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>🎂 Custom Order Details</Text>
                        <View style={styles.customOrderSummary}>
                            <Text style={styles.customOrderTitle}>{cartItems.find(item => item.isCustomOrder)?.name}</Text>
                            <Text style={styles.customOrderDesc}>{cartItems.find(item => item.isCustomOrder)?.description}</Text>
                            <Text style={styles.customOrderInfo}>
                                Pickup Date: {new Date(cartItems.find(item => item.isCustomOrder)?.customOrderData?.pickupDate).toLocaleDateString()}
                            </Text>
                            <Text style={styles.customOrderInfo}>
                                Budget: LKR {cartItems.find(item => item.isCustomOrder)?.customOrderData?.budget}
                            </Text>
                            {cartItems.find(item => item.isCustomOrder)?.customOrderData?.referenceImages?.length > 0 && (
                                <Text style={styles.customOrderInfo}>
                                    📎 {cartItems.find(item => item.isCustomOrder)?.customOrderData.referenceImages.length} reference image(s)
                                </Text>
                            )}
                        </View>
                    </View>
                )}

                {/* Order Summary */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📋 Order Summary</Text>
                    {cartItems.map((item, idx) => (
                        <View key={idx} style={styles.summaryItem}>
                            <Text style={styles.summaryItemName} numberOfLines={1}>{item.name} ×{item.quantity}</Text>
                            <Text style={styles.summaryItemPrice}>LKR {(item.price * item.quantity).toFixed(2)}</Text>
                        </View>
                    ))}
                    <View style={styles.divider} />
                    {discountAmount > 0 && (
                        <View style={styles.summaryItem}>
                            <Text style={{ color: '#4CAF50', fontWeight: '600' }}>
                                {appliedPromotion?.title ? `${appliedPromotion.title} Discount` : 'Discount'}
                            </Text>
                            <Text style={{ color: '#4CAF50', fontWeight: '600' }}>− LKR {discountAmount.toFixed(2)}</Text>
                        </View>
                    )}
                    <View style={styles.summaryItem}>
                        <Text style={styles.totalLabel}>Total to Pay</Text>
                        <Text style={styles.totalValue}>LKR {finalTotal.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Payment Method */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>💳 Payment Method</Text>
                    {METHODS.map(m => (
                        <TouchableOpacity
                            key={m.id}
                            style={[styles.methodRow, method === m.id && styles.methodRowActive]}
                            onPress={() => setMethod(m.id)}
                        >
                            <View style={[styles.radio, method === m.id && styles.radioActive]}>
                                {method === m.id && <View style={styles.radioDot} />}
                            </View>
                            <View style={{ marginLeft: 12 }}>
                                <Text style={styles.methodLabel}>{m.label}</Text>
                                <Text style={styles.methodDesc}>{m.desc}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}

                    {/* Card Selection UI - Only for authenticated users */}
                    {method === 'card' && user && (
                        <View style={styles.bankContainer}>
                            <Text style={styles.bankTitle}>Select a Card:</Text>
                            {savedCards.map(c => (
                                <TouchableOpacity
                                    key={c.id}
                                    style={[styles.savedCardRow, selectedCard === c.id && styles.savedCardRowActive]}
                                    onPress={() => setSelectedCard(c.id)}
                                >
                                    <Text style={styles.savedCardIcon}>{c.type === 'Visa' ? '💳' : '🏧'}</Text>
                                    <Text style={styles.savedCardText}>{c.type} ending in {c.last4}</Text>
                                    {selectedCard === c.id && <Text style={styles.checkIcon}>✅</Text>}
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                style={styles.savedCardRow}
                                onPress={() => navigation.navigate('AddCard', { fromCheckout: true })}
                            >
                                <Text style={styles.savedCardIcon}>➕</Text>
                                <Text style={styles.savedCardText}>Add a New Card</Text>
                                <Text style={styles.arrowIcon}>→</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Guest Payment Notice */}
                    {method === 'card' && !user && (
                        <View style={styles.guestNotice}>
                            <Text style={styles.guestNoticeText}>Please log in to save and use payment cards</Text>
                            <TouchableOpacity
                                style={styles.guestLoginBtn}
                                onPress={() => navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'Login' }],
                                })}
                            >
                                <Text style={styles.guestLoginBtnText}>Login Now</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Bank Transfer Details & Upload Form */}
                    {method === 'bank' && (
                        <View style={styles.bankContainer}>
                            <Text style={styles.bankTitle}>Canteen Bank Details:</Text>
                            <Text style={styles.bankText}>{canteenBankDetails || 'Loading...'}</Text>

                            <TouchableOpacity style={styles.uploadBtn} onPress={pickProof}>
                                <Text style={styles.uploadBtnText}>
                                    {paymentProof ? `✅ Selected: ${paymentProof.fileName || 'Screenshot.png'}` : '📸 Upload Payment Slip / Screenshot'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.confirmBtn, loading && { opacity: 0.7 }]}
                    onPress={handleConfirm}
                    disabled={loading}
                >
                    {loading
                        ? <ActivityIndicator color="#fff" />
                        : <Text style={styles.confirmBtnText}>✅ Place Order  (LKR {finalTotal.toFixed(2)})</Text>}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF7F2' },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, elevation: 2 },
    cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#222', marginBottom: 8 },
    descText: { fontSize: 13, color: '#888', marginBottom: 10 },
    timeDisplay: { borderWidth: 1.5, borderColor: '#eee', borderRadius: 10, padding: 14, backgroundColor: '#FAFAFA' },
    timeDisplayText: { fontSize: 16, fontWeight: '600', color: '#333' },
    summaryItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryItemName: { flex: 1, fontSize: 14, color: '#444', marginRight: 8 },
    summaryItemPrice: { fontSize: 14, fontWeight: '600', color: '#333' },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 8 },
    totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#222' },
    totalValue: { fontSize: 17, fontWeight: 'bold', color: ORANGE },
    methodRow: {
        flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#EEE',
        borderRadius: 12, padding: 12, marginBottom: 8,
    },
    methodRowActive: { borderColor: ORANGE, backgroundColor: '#FFF8F5' },
    radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#ccc', justifyContent: 'center', alignItems: 'center' },
    radioActive: { borderColor: ORANGE },
    radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: ORANGE },
    methodLabel: { fontSize: 15, fontWeight: '600', color: '#222' },
    methodDesc: { fontSize: 12, color: '#888', marginTop: 2 },
    bankContainer: { backgroundColor: '#FFF3EC', marginTop: 10, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#F7D8CB' },
    bankTitle: { fontSize: 13, fontWeight: 'bold', color: '#444', marginBottom: 6 },
    bankText: { fontSize: 14, color: '#222', fontWeight: '500', marginBottom: 15 },
    uploadBtn: {
        borderWidth: 2, borderColor: '#4CAF50', borderStyle: 'dashed', borderRadius: 12,
        padding: 16, alignItems: 'center', backgroundColor: '#e8f5e9'
    },
    uploadBtnText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 13 },
    savedCardRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#eee', marginBottom: 8 },
    savedCardRowActive: { borderColor: ORANGE, backgroundColor: '#FFF0E8' },
    savedCardIcon: { fontSize: 16, marginRight: 10 },
    savedCardText: { flex: 1, fontSize: 14, fontWeight: '500', color: '#333' },
    checkIcon: { fontSize: 14 },
    arrowIcon: { fontSize: 16, color: '#aaa' },
    guestNotice: { backgroundColor: '#FFF3E0', marginTop: 10, padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#FFB74D', alignItems: 'center' },
    guestNoticeText: { fontSize: 14, color: '#E65100', fontWeight: '600', marginBottom: 12, textAlign: 'center' },
    guestLoginBtn: { backgroundColor: ORANGE, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
    guestLoginBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
    customOrderSummary: { backgroundColor: '#FFF0E8', borderRadius: 12, padding: 16, marginBottom: 8 },
    customOrderTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    customOrderDesc: { fontSize: 14, color: '#666', marginBottom: 8, fontStyle: 'italic' },
    customOrderInfo: { fontSize: 13, color: '#555', marginBottom: 2 },
    footer: { backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    confirmBtn: {
        backgroundColor: ORANGE, borderRadius: 14, paddingVertical: 15, alignItems: 'center',
        shadowColor: ORANGE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
    },
    confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});
