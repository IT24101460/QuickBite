import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API from '../services/api';

const ORANGE = '#dc5a2ae7';

export default function SidebarCart({ navigation }) {
    const { user } = useAuth();
    const { cartItems, finalTotal, updateQty, removeFromCart, clearCart } = useCart();
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        // Fetch a couple of recent orders for the sidebar
        if (user) {
            API.get('/orders')
                .then(res => setRecentOrders(res.data.orders?.slice(0, 3) || []))
                .catch(err => console.log('Sidebar orders err', err.message));
        }
    }, [user]);

    const navigateToCheckout = () => {
        if (cartItems.length === 0) return;
        navigation.closeDrawer();
        navigation.navigate('HomeContainer', { screen: 'Checkout' });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.userIcon}>
                    {user?.profilePic ? (
                        <Image source={{ uri: `http://10.0.2.2:3000${user.profilePic}` }} style={styles.avatar} />
                    ) : (
                        <Text style={{ fontSize: 28 }}>👤</Text>
                    )}
                </View>
                <Text style={styles.userName}>{user?.firstName || 'User'} {user?.lastName}</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                {/* CART SECTION */}
                <Text style={styles.sectionTitle}>🛒 Your Cart</Text>
                {cartItems.length === 0 ? (
                    <Text style={styles.emptyText}>Cart is empty</Text>
                ) : (
                    <View>
                        {cartItems.map((item, idx) => (
                            <View key={idx} style={styles.cartItemRow}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                                    <Text style={styles.itemPrice}>LKR {item.price}</Text>
                                </View>
                                <View style={styles.qtyControls}>
                                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item._id || item.foodItemId, item.quantity - 1)}>
                                        <Text style={styles.qtyBtnText}>-</Text>
                                    </TouchableOpacity>
                                    <Text style={styles.qtyText}>{item.quantity}</Text>
                                    <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item._id || item.foodItemId, item.quantity + 1)}>
                                        <Text style={styles.qtyBtnText}>+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                        <TouchableOpacity style={styles.clearBtn} onPress={clearCart}>
                            <Text style={styles.clearBtnText}>Clear Cart</Text>
                        </TouchableOpacity>
                    </View>
                )}

                <View style={styles.divider} />

                {/* ORDER HISTORY SECTION */}
                <View style={[styles.sectionTitleRow, { marginTop: 10 }]}>
                    <Text style={styles.sectionTitle}>📦 Recent Orders</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
                        <Text style={styles.seeAll}>See All</Text>
                    </TouchableOpacity>
                </View>

                {recentOrders.length === 0 ? (
                    <Text style={styles.emptyText}>No recent orders</Text>
                ) : (
                    recentOrders.map(o => (
                        <TouchableOpacity
                            key={o._id}
                            style={styles.orderItem}
                            onPress={() => navigation.navigate('OrderDetail', { order: o })}
                        >
                            <Text style={styles.orderDate}>{new Date(o.createdAt).toLocaleDateString()}</Text>
                            <Text style={styles.orderItems} numberOfLines={1}>
                                {o.items.map(i => `${i.name}(${i.quantity})`).join(', ')}
                            </Text>
                            <Text style={styles.orderStatus}>{o.status}</Text>
                        </TouchableOpacity>
                    ))
                )}

                <View style={styles.divider} />

                {/* NAVIGATION QUICK LINKS */}
                <TouchableOpacity style={styles.navRow} onPress={() => navigation.navigate('Profile')}>
                    <Text style={styles.navText}>⚙️ Profile Settings</Text>
                </TouchableOpacity>

            </ScrollView>

            <View style={styles.footer}>
                <Text style={styles.totalText}>Total: LKR {finalTotal.toFixed(2)}</Text>
                <TouchableOpacity
                    style={[styles.payoutBtn, cartItems.length === 0 && styles.payoutBtnDisabled]}
                    onPress={navigateToCheckout}
                    disabled={cartItems.length === 0}
                >
                    <Text style={styles.payoutBtnText}>Proceed to Payout ➔</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { backgroundColor: '#F8F9FA', paddingTop: 50, paddingBottom: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
    userIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFE5DB', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    avatar: { width: 60, height: 60, borderRadius: 30 },
    userName: { fontSize: 16, fontWeight: 'bold', color: '#222' },
    scroll: { padding: 16, paddingBottom: 40 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: ORANGE, marginBottom: 12 },
    sectionTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    seeAll: { color: '#888', fontSize: 12, fontWeight: '600' },
    emptyText: { color: '#aaa', fontSize: 13, fontStyle: 'italic', marginBottom: 10 },
    cartItemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    itemName: { fontSize: 14, fontWeight: '600', color: '#333' },
    itemPrice: { fontSize: 12, color: '#888', marginTop: 2 },
    qtyControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FA', borderRadius: 8, padding: 4 },
    qtyBtn: { paddingHorizontal: 8, paddingVertical: 4 },
    qtyBtnText: { fontSize: 16, fontWeight: 'bold', color: ORANGE },
    qtyText: { marginHorizontal: 8, fontSize: 14, fontWeight: 'bold' },
    clearBtn: { alignSelf: 'flex-start', marginTop: 5 },
    clearBtnText: { color: '#f44336', fontSize: 12, fontWeight: '600' },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 20 },
    orderItem: { backgroundColor: '#F8F9FA', padding: 12, borderRadius: 8, marginBottom: 8 },
    orderDate: { fontSize: 12, color: '#888', marginBottom: 4 },
    orderItems: { fontSize: 13, fontWeight: '600', color: '#444' },
    orderStatus: { fontSize: 11, fontWeight: 'bold', color: ORANGE, marginTop: 4, alignSelf: 'flex-end' },
    navRow: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
    navText: { fontSize: 15, fontWeight: '600', color: '#555' },
    footer: { padding: 20, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee', elevation: 15 },
    totalText: { fontSize: 15, fontWeight: 'bold', color: '#555', marginBottom: 10, textAlign: 'center' },
    payoutBtn: { backgroundColor: ORANGE, padding: 15, borderRadius: 12, alignItems: 'center' },
    payoutBtnDisabled: { opacity: 0.5 },
    payoutBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
