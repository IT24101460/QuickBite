import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    TextInput, Alert, Image, ScrollView,
} from 'react-native';
import { useCart } from '../context/CartContext';
import API from '../services/api';
import TopNavBar from '../components/TopNavBar';
import { getImageUrl } from '../utils/imageUtils';

const ORANGE = '#FF6B35';

export default function CartScreen({ navigation }) {
    const {
        cartItems, removeFromCart, updateQty, updateItemNote, cartTotal, finalTotal,
        appliedPromotion, discountAmount, applyPromotion, removePromotion,
    } = useCart();
    const [promoCode, setPromoCode] = useState('');
    const [promoLoading, setPromoLoading] = useState(false);
    const [pickupTime, setPickupTime] = useState('');
    const [pickupSlots, setPickupSlots] = useState([]);
    const [canteen, setCanteen] = useState(null);

    const validatePromoCode = (code) => {
        if (!code || !code.trim()) {
            return 'Enter a promotion ID';
        }
        
        const trimmedCode = code.trim();
        
        // Length validation
        if (trimmedCode.length < 3) {
            return 'Promotion ID must be at least 3 characters';
        }
        
        if (trimmedCode.length > 50) {
            return 'Promotion ID cannot exceed 50 characters';
        }
        
        // Character validation (alphanumeric, hyphens, underscores)
        const validPattern = /^[a-zA-Z0-9-_]+$/;
        if (!validPattern.test(trimmedCode)) {
            return 'Promotion ID can only contain letters, numbers, hyphens, and underscores';
        }
        
        return null; // No error
    };
    
    const validateCartForPromotion = () => {
        if (cartItems.length === 0) {
            return 'Your cart is empty. Add items to apply a promotion.';
        }
        
        if (cartTotal <= 0) {
            return 'Invalid cart total. Cannot apply promotion.';
        }
        
        return null; // No error
    };

    const handleApplyPromo = async () => {
        // Validate promo code format
        const promoError = validatePromoCode(promoCode);
        if (promoError) {
            return Alert.alert('Invalid Promotion ID', promoError);
        }
        
        // Validate cart state
        const cartError = validateCartForPromotion();
        if (cartError) {
            return Alert.alert('Cart Error', cartError);
        }
        
        // Check if promotion is already applied
        if (appliedPromotion && appliedPromotion._id === promoCode.trim()) {
            return Alert.alert('Already Applied', 'This promotion is already applied to your cart.');
        }
        
        setPromoLoading(true);
        try {
            const res = await API.post('/promotions/apply', {
                promotionId: promoCode.trim(),
                cartTotal,
                cartItems: cartItems.map(i => ({ foodItemId: i.foodItemId || i._id })),
            });
            
            // Validate response
            if (!res.data || !res.data.promotion) {
                throw new Error('Invalid promotion response');
            }
            
            const { promotion, discountAmount, finalTotal } = res.data;
            
            // Additional client-side validation
            if (discountAmount <= 0) {
                throw new Error('No discount applied');
            }
            
            if (finalTotal < 0) {
                throw new Error('Invalid final total calculation');
            }
            
            applyPromotion({ ...promotion, _id: promoCode.trim() }, discountAmount);
            Alert.alert(
                '✅ Promotion Applied!', 
                `${promotion.title}\nDiscount: LKR ${discountAmount.toFixed(2)}\nNew Total: LKR ${finalTotal.toFixed(2)}`
            );
        } catch (err) {
            console.error('Promotion application error:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Invalid promotion';
            
            // Provide user-friendly error messages
            let userMessage = errorMessage;
            if (errorMessage.includes('not found') || errorMessage.includes('expired')) {
                userMessage = 'This promotion is not valid or has expired.';
            } else if (errorMessage.includes('qualify')) {
                userMessage = 'Your cart items do not qualify for this promotion.';
            } else if (errorMessage.includes('already applied')) {
                userMessage = 'This promotion is already applied to your cart.';
            }
            
            Alert.alert('Promotion Error', userMessage);
        } finally {
            setPromoLoading(false);
        }
    };

    // Time conversion helper
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

    const minutesToTime = (minutes) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        const period = h >= 12 ? 'PM' : 'AM';
        const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
        return `${displayHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
    };

    // Generate dynamic pickup slots
    const generatePickupSlots = () => {
        if (!canteen) return [];
        
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const openMin = timeToMinutes(canteen.openingTime || '08:00 AM');
        const closeMin = timeToMinutes(canteen.closingTime || '05:00 PM');
        
        // Start from the next 30-minute slot after current time
        let nextSlot = Math.ceil((currentMinutes + 1) / 30) * 30;
        
        // If current time is before opening, start from opening time
        if (currentMinutes < openMin) {
            nextSlot = openMin;
        }
        
        const slots = [];
        while (nextSlot <= closeMin - 30 && slots.length < 10) { // Show max 10 slots
            slots.push(minutesToTime(nextSlot));
            nextSlot += 30; // 30-minute intervals
        }
        
        return slots;
    };

    useEffect(() => {
        // Fetch canteen info for the first item in cart
        if (cartItems.length > 0) {
            API.get('/canteens').then(res => {
                const canteens = res.data?.canteens || [];
                const matching = canteens.find(c => String(c._id) === String(cartItems[0]?.canteenId)) || canteens[0];
                if (matching) {
                    setCanteen(matching);
                }
            }).catch(ignore => {});
        }
    }, [cartItems]);

    useEffect(() => {
        if (canteen) {
            const slots = generatePickupSlots();
            setPickupSlots(slots);
            // Reset pickup time if current selection is no longer valid
            if (pickupTime && !slots.includes(pickupTime)) {
                setPickupTime('');
            }
        }
    }, [canteen, pickupTime]);

    const renderItem = ({ item }) => (
        <View style={styles.cartItemWrapper}>
            <View style={styles.cartItem}>
                {item.image
                    ? <Image source={{ uri: getImageUrl(item.image) }} style={styles.itemImg} resizeMode="cover" />
                    : <View style={styles.itemImgPlaceholder}><Text style={styles.placeholderIcon}>🍽️</Text></View>}
                <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.itemPrice}>LKR {item.price.toFixed(2)} each</Text>
                </View>
                <View style={styles.itemRight}>
                    <View style={styles.qtyControl}>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item._id || item.foodItemId, item.quantity - 1)}>
                            <Text style={styles.qtyBtnText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.qtyNum}>{item.quantity}</Text>
                        <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item._id || item.foodItemId, item.quantity + 1)}>
                            <Text style={styles.qtyBtnText}>+</Text>
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.lineTotal}>LKR {(item.price * item.quantity).toFixed(2)}</Text>
                    <TouchableOpacity onPress={() => removeFromCart(item._id || item.foodItemId)}>
                        <Text style={styles.removeBtn}>🗑</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.noteContainer}>
                <TextInput
                    style={styles.noteInput}
                    placeholder="Add note (e.g. extra cheese, less sugar)..."
                    placeholderTextColor="#999"
                    value={item.note || ''}
                    onChangeText={(text) => updateItemNote(item._id || item.foodItemId, text)}
                />
            </View>
        </View>
    );

    if (cartItems.length === 0) {
        return (
            <View style={styles.empty}>
                <Text style={styles.emptyIcon}>🛒</Text>
                <Text style={styles.emptyTitle}>Your cart is empty</Text>
                <Text style={styles.emptySub}>Add some delicious food!</Text>
                <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Home')}>
                    <Text style={styles.browseBtnText}>Browse Menu</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleProceedToCheckout = () => {
        if (!pickupTime) {
            return Alert.alert('Pickup Time Required', 'Please choose a pickup time before checkout.');
        }

        navigation.navigate('Checkout', { pickupTime });
    };

    return (
        <View style={styles.container}>
            <TopNavBar navigation={navigation} hideBottomRow={true} />

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: 85, paddingBottom: 20 }}>
                <FlatList
                    data={cartItems}
                    renderItem={renderItem}
                    keyExtractor={i => i._id || i.foodItemId}
                    scrollEnabled={false}
                    contentContainerStyle={styles.list}
                />

                {/* Promo Code */}
                <View style={styles.promoCard}>
                    <Text style={styles.cardLabel}>Promo Code</Text>
                    {appliedPromotion ? (
                        <View style={styles.appliedPromo}>
                            <Text style={styles.appliedPromoText}>✅ {appliedPromotion.title} applied</Text>
                            <TouchableOpacity onPress={removePromotion}>
                                <Text style={styles.removePromo}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <View style={styles.promoRow}>
                            <TextInput
                                style={styles.promoInput}
                                placeholder="Enter promotion ID"
                                placeholderTextColor="#aaa"
                                value={promoCode}
                                onChangeText={setPromoCode}
                            />
                            <TouchableOpacity style={styles.promoBtn} onPress={handleApplyPromo} disabled={promoLoading}>
                                <Text style={styles.promoBtnText}>{promoLoading ? '...' : 'Apply'}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Pickup Time */}
                <View style={styles.promoCard}>
                    <Text style={styles.cardLabel}>⏰ Pickup Time</Text>
                    <Text style={styles.canteenHours}>
                        Canteen Hours: {canteen?.openingTime || '08:00 AM'} - {canteen?.closingTime || '05:00 PM'}
                    </Text>
                    {pickupSlots.length > 0 ? (
                        <FlatList
                            data={pickupSlots}
                            horizontal
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[styles.slotBtn, pickupTime === item && styles.slotBtnActive]}
                                    onPress={() => setPickupTime(item)}
                                >
                                    <Text style={[styles.slotText, pickupTime === item && styles.slotTextActive]}>{item}</Text>
                                </TouchableOpacity>
                            )}
                            keyExtractor={i => i}
                            showsHorizontalScrollIndicator={false}
                        />
                    ) : (
                        <View style={styles.noSlotsContainer}>
                            <Text style={styles.noSlotsText}>
                                {canteen ? 'No available pickup slots for today. Canteen may be closed or all slots have passed.' : 'Loading canteen information...'}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Summary */}
                <View style={styles.summaryCard}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>LKR {cartTotal.toFixed(2)}</Text>
                    </View>
                    {discountAmount > 0 && (
                        <View style={styles.summaryRow}>
                            <Text style={[styles.summaryLabel, { color: '#4CAF50' }]}>Discount</Text>
                            <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>− LKR {discountAmount.toFixed(2)}</Text>
                        </View>
                    )}
                    <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12, marginTop: 4 }]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>LKR {finalTotal.toFixed(2)}</Text>
                    </View>
                </View>
            </ScrollView>

            <View style={styles.checkoutBar}>
                <TouchableOpacity
                    style={styles.checkoutBtn}
                    onPress={handleProceedToCheckout}
                >
                    <Text style={styles.checkoutBtnText}>Proceed to Checkout  →</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF7F2' },
    list: { padding: 12 },
    cartItemWrapper: {
        backgroundColor: '#fff', borderRadius: 14, marginBottom: 12, elevation: 2,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4,
    },
    cartItem: {
        flexDirection: 'row', padding: 12, alignItems: 'center',
    },
    noteContainer: {
        paddingHorizontal: 12, paddingBottom: 12, paddingTop: 4,
        borderTopWidth: 1, borderTopColor: '#F0F0F0',
    },
    noteInput: {
        backgroundColor: '#FFF3EC', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
        fontSize: 13, color: '#333',
    },
    itemImg: { width: 64, height: 64, borderRadius: 10 },
    itemImgPlaceholder: { width: 64, height: 64, borderRadius: 10, backgroundColor: '#FFF0E8', justifyContent: 'center', alignItems: 'center' },
    placeholderIcon: { fontSize: 28 },
    itemInfo: { flex: 1, marginHorizontal: 10 },
    itemName: { fontSize: 14, fontWeight: '600', color: '#222' },
    itemPrice: { fontSize: 12, color: '#888', marginTop: 4 },
    itemRight: { alignItems: 'center' },
    qtyControl: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    qtyBtn: { backgroundColor: ORANGE, width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
    qtyBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', lineHeight: 18 },
    qtyNum: { fontSize: 15, fontWeight: 'bold', color: '#222', minWidth: 20, textAlign: 'center' },
    lineTotal: { fontSize: 13, fontWeight: 'bold', color: ORANGE, marginBottom: 4 },
    removeBtn: { fontSize: 18 },
    promoCard: { backgroundColor: '#fff', margin: 12, marginTop: 0, borderRadius: 14, padding: 16, elevation: 2 },
    cardLabel: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 10 },
    appliedPromo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    appliedPromoText: { color: '#4CAF50', fontWeight: '600', fontSize: 14 },
    removePromo: { color: '#f44336', fontSize: 13, fontWeight: '600' },
    promoRow: { flexDirection: 'row', gap: 8 },
    promoInput: {
        flex: 1, borderWidth: 1.5, borderColor: '#E8E8E8', borderRadius: 10,
        paddingHorizontal: 12, paddingVertical: 9, fontSize: 13, color: '#333',
    },
    promoBtn: { backgroundColor: ORANGE, borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
    promoBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
    slotBtn: {
        borderWidth: 1.5, borderColor: '#E8E8E8', borderRadius: 20, paddingHorizontal: 12,
        paddingVertical: 7, marginRight: 8,
    },
    slotBtnActive: { backgroundColor: ORANGE, borderColor: ORANGE },
    slotText: { fontSize: 12, color: '#555', fontWeight: '600' },
    slotTextActive: { color: '#fff' },
    canteenHours: { fontSize: 12, color: '#888', marginBottom: 10, fontStyle: 'italic' },
    noSlotsContainer: { padding: 16, backgroundColor: '#FFF3E8', borderRadius: 8, alignItems: 'center' },
    noSlotsText: { fontSize: 13, color: '#FF6B35', textAlign: 'center', lineHeight: 18 },
    summaryCard: { backgroundColor: '#fff', margin: 12, marginTop: 0, borderRadius: 14, padding: 16, elevation: 2 },
    summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { fontSize: 14, color: '#666' },
    summaryValue: { fontSize: 14, color: '#333', fontWeight: '600' },
    totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#222' },
    totalValue: { fontSize: 18, fontWeight: 'bold', color: ORANGE },
    checkoutBar: { backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
    checkoutBtn: {
        backgroundColor: ORANGE, borderRadius: 14, paddingVertical: 15, alignItems: 'center',
        shadowColor: ORANGE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
    },
    checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 40 },
    emptyIcon: { fontSize: 64 },
    emptyTitle: { fontSize: 22, fontWeight: 'bold', color: '#333', marginTop: 16 },
    emptySub: { fontSize: 14, color: '#999', marginTop: 8, marginBottom: 28 },
    browseBtn: { backgroundColor: ORANGE, borderRadius: 12, paddingVertical: 13, paddingHorizontal: 30 },
    browseBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});
