import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, TextInput, Modal, FlatList
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

    // Card Payment States
    const [savedCards, setSavedCards] = useState([]);
    const [paymentOptions, setPaymentOptions] = useState([]);
    const [selectedCard, setSelectedCard] = useState(null);
    const [loadingPayments, setLoadingPayments] = useState(false);

    // Initialize saved cards and fetch from backend
    useEffect(() => {
        const loadData = async () => {
            if (user && token) {
                try {
                    setLoadingPayments(true);

                    // Load local cards
                    const localData = await AsyncStorage.getItem('@saved_cards');
                    const localCards = localData ? JSON.parse(localData) : [];
                    setSavedCards(localCards);

                    // Load backend cards
                    const response = await API.get('/user-payments', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const backendOptions = response.data.paymentOptions || [];
                    setPaymentOptions(backendOptions);

                    // Auto-select first available or default
                    const defaultOpt = backendOptions.find(o => o.isDefault);
                    if (defaultOpt) {
                        setSelectedCard(defaultOpt._id);
                    } else if (backendOptions.length > 0) {
                        setSelectedCard(backendOptions[0]._id);
                    } else if (localCards.length > 0) {
                        setSelectedCard(localCards[0].id);
                    }
                } catch (e) {
                    console.error("Failed to load payments", e);
                } finally {
                    setLoadingPayments(false);
                }
            } else {
                setSavedCards([]);
                setPaymentOptions([]);
                setSelectedCard(null);
            }
        };
        loadData();
    }, [user, token]);

    const [paymentProof, setPaymentProof] = useState(null);
    const [loading, setLoading] = useState(false);
    const [canteen, setCanteen] = useState(null);
    const [canteenBankDetails, setCanteenBankDetails] = useState('');

    useEffect(() => {
        if (route.params?.newlyAddedCard) {
            const newCard = route.params.newlyAddedCard;
            setSavedCards(prev => [...prev, newCard]);
            setSelectedCard(newCard.id);
            navigation.setParams({ newlyAddedCard: null });
        }
    }, [route.params?.newlyAddedCard]);

    useEffect(() => {
        // Fetch the bank details for the canteen related to the first item
        if (cartItems.length > 0) {
            // Assuming we check the details of foods to find their canteen, 
            // but for safety let's find the first item's food detail or fetch it.
            const foodId = cartItems[0].foodItemId || cartItems[0]._id;
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
        setLoading(true);
        try {
            // 1. Place order
            const orderPayload = {
                items: cartItems.map(i => ({
                    foodItemId: i.foodItemId || i._id,
                    name: i.name,
                    price: i.price,
                    quantity: i.quantity,
                    note: i.note || "",
                })),
                pickupTime: "Immediate",
                discountAmount: discountAmount || 0,
                promotionId: appliedPromotion ? appliedPromotion._id : null,
                canteenId: cartItems[0].canteenId || null
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
                    await API.post('/payments', payFormData);
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
                `Queue #${order.queueNumber}\nPreparation: Immediate\nTotal: LKR ${finalTotal.toFixed(2)}`,
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

                {/* Important Notice */}
                <View style={[styles.card, { backgroundColor: '#FFF9C4', borderColor: '#FBC02D', borderWidth: 1 }]}>
                    <Text style={[styles.cardTitle, { color: '#F57F17' }]}>ℹ️ Preparation Notice</Text>
                    <Text style={{ fontSize: 13, color: '#5D4037', lineHeight: 18 }}>
                        Once you proceed to pay, your order will be sent directly to the canteen for immediate preparation.
                        Please ensure you are ready to collect your items shortly.
                    </Text>
                </View>

                {/* Order Summary */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>📋 Order Details</Text>

                    {/* User Info */}
                    <View style={styles.userInfoBox}>
                        <Text style={styles.userInfoLabel}>Customer Name:</Text>
                        <Text style={styles.userInfoText}>{user?.name || 'Guest User'}</Text>
                        <Text style={[styles.userInfoLabel, { marginTop: 4 }]}>Email Address:</Text>
                        <Text style={styles.userInfoText}>{user?.email || 'N/A'}</Text>
                    </View>

                    <View style={styles.divider} />

                    <Text style={[styles.cardTitle, { fontSize: 13, marginTop: 8 }]}>Items in Order:</Text>
                    {cartItems.map((item, idx) => (
                        <View key={idx} style={{ marginBottom: 10 }}>
                            <View style={styles.summaryItem}>
                                <Text style={styles.summaryItemName} numberOfLines={1}>{item.name} ×{item.quantity}</Text>
                                <Text style={styles.summaryItemPrice}>LKR {(item.price * item.quantity).toFixed(2)}</Text>
                            </View>
                            {item.note ? (
                                <View style={styles.noteContainer}>
                                    <Text style={styles.noteText}>📝 {item.note}</Text>
                                </View>
                            ) : null}
                        </View>
                    ))}
                    <View style={styles.divider} />
                    {discountAmount > 0 && (
                        <View style={styles.summaryItem}>
                            <Text style={{ color: '#4CAF50', fontWeight: '600' }}>Discount</Text>
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
                            {loadingPayments ? (
                                <ActivityIndicator size="small" color={ORANGE} style={{ marginVertical: 10 }} />
                            ) : (
                                <>
                                    {[...paymentOptions, ...savedCards.filter(sc => !paymentOptions.find(po => po.last4 === sc.last4))].map((c, idx) => {
                                        const isLocal = !c._id;
                                        const cardId = c._id || c.id;
                                        return (
                                            <TouchableOpacity
                                                key={cardId || `card_${idx}`}
                                                style={[styles.savedCardRow, selectedCard === cardId && styles.savedCardRowActive]}
                                                onPress={() => setSelectedCard(cardId)}
                                            >
                                                <Text style={styles.savedCardIcon}>{c.type === 'Visa' ? '💳' : '🏧'}</Text>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={styles.savedCardText}>
                                                        {c.type || 'Card'} ending in {c.last4}
                                                    </Text>
                                                    {isLocal && <Text style={{ fontSize: 10, color: ORANGE, fontWeight: 'bold' }}>SYNCING...</Text>}
                                                </View>
                                                {selectedCard === cardId && <Text style={styles.checkIcon}>✅</Text>}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </>
                            )}
                            <TouchableOpacity
                                style={styles.savedCardRow}
                                onPress={() => navigation.navigate('AddCard')}
                            >
                                <Text style={styles.savedCardIcon}>➕</Text>
                                <Text style={styles.savedCardText}>Add a New Card</Text>
                                <Text style={{ fontSize: 16, color: '#aaa' }}>→</Text>
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
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, elevation: 2 },
    cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#222', marginBottom: 8 },
    descText: { fontSize: 13, color: '#888', marginBottom: 10 },
    timeSelectBtn: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        borderWidth: 1.5, borderColor: '#eee', borderRadius: 10, padding: 14, backgroundColor: '#FAFAFA'
    },
    timeSelectText: { fontSize: 16, fontWeight: '600', color: '#333' },
    timeSelectIcon: { fontSize: 14, color: '#888' },
    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, height: 350 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, textAlign: 'center', color: '#222' },
    pickerCols: { flexDirection: 'row', justifyContent: 'space-between', height: 200, marginBottom: 15 },
    pickerList: { flex: 1, borderWidth: 1, borderColor: '#eee', borderRadius: 10, marginRight: 10 },
    periodCol: { flex: 0.8, justifyContent: 'center' },
    timeItem: { paddingVertical: 12, alignItems: 'center' },
    timeItemActive: { backgroundColor: '#FFF0E8' },
    periodItem: { paddingVertical: 20, alignItems: 'center', borderWidth: 1, borderColor: '#eee', borderRadius: 10, marginBottom: 10 },
    timeItemText: { fontSize: 16, color: '#555', fontWeight: '500' },
    timeItemTextActive: { color: ORANGE, fontWeight: 'bold', fontSize: 18 },
    modalDone: { backgroundColor: ORANGE, padding: 14, borderRadius: 12, alignItems: 'center' },
    modalDoneText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    summaryItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryItemName: { flex: 1, fontSize: 14, color: '#444', marginRight: 8 },
    summaryItemPrice: { fontSize: 14, fontWeight: '600', color: '#333' },
    userInfoBox: { backgroundColor: '#F0F4F8', padding: 12, borderRadius: 10, marginVertical: 4 },
    userInfoLabel: { fontSize: 11, color: '#666', fontWeight: 'bold', textTransform: 'uppercase' },
    userInfoText: { fontSize: 14, color: '#333', fontWeight: '600' },
    noteContainer: { backgroundColor: '#FFF9C4', padding: 6, borderRadius: 6, marginTop: 2, marginLeft: 10 },
    noteText: { fontSize: 12, color: '#7B5E00', fontStyle: 'italic' },
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
    bankContainer: { backgroundColor: '#F8F9FA', marginTop: 10, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#eee' },
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
    guestNotice: { backgroundColor: '#FFF3E0', marginTop: 10, padding: 16, borderRadius: 10, borderWidth: 1, borderColor: '#FFB74D', alignItems: 'center' },
    guestNoticeText: { fontSize: 14, color: '#E65100', fontWeight: '600', marginBottom: 12, textAlign: 'center' },
    guestLoginBtn: { backgroundColor: ORANGE, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
    guestLoginBtnText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
    newCardForm: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 },
    stripeInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, fontSize: 14, color: '#333', backgroundColor: '#fff', marginBottom: 10 },
    footer: { backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    confirmBtn: {
        backgroundColor: ORANGE, borderRadius: 14, paddingVertical: 15, alignItems: 'center',
        shadowColor: ORANGE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
    },
    confirmBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});
