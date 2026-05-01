import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import API from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';

const ORANGE = '#FF6B35';
const TABS = ['Pending', 'Preparing', 'Ready', 'Completed'];

export default function OwnerLiveOrdersScreen({ route, navigation }) {
    const passedCanteenId = route.params?.canteenId;
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Pending');
    const [updatingId, setUpdatingId] = useState(null);

    useEffect(() => {
        fetchOrders();
        // Simple polling for a real-world feel
        const interval = setInterval(() => { fetchOrders() }, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const url = passedCanteenId ? `/orders?canteenId=${passedCanteenId}` : '/orders';
            const res = await API.get(url);
            setOrders(res.data.orders || []);
        } catch (error) {
            console.log("Error loading queue:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId, newStatus) => {
        setUpdatingId(orderId);
        try {
            await API.patch(`/orders/${orderId}/status`, { status: newStatus });
            fetchOrders();
        } catch (error) {
            Alert.alert("Update Failed", "Could not shift order tracking status.");
        } finally {
            setUpdatingId(null);
        }
    };

    const StatusButton = ({ order }) => {
        if (order.status === 'pending') {
            return (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#3498db' }]} onPress={() => updateStatus(order._id, 'preparing')}>
                    <Text style={styles.actionText}>Accept & Prepare</Text>
                </TouchableOpacity>
            );
        }
        if (order.status === 'preparing') {
            return (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#f1c40f' }]} onPress={() => updateStatus(order._id, 'ready')}>
                    <Text style={[styles.actionText, { color: '#856404' }]}>Mark Ready</Text>
                </TouchableOpacity>
            );
        }
        if (order.status === 'ready') {
            return (
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2ecc71' }]} onPress={() => updateStatus(order._id, 'completed')}>
                    <Text style={styles.actionText}>Hand to Student</Text>
                </TouchableOpacity>
            );
        }
        return <Text style={{ color: '#999', fontStyle: 'italic', marginTop: 10 }}>Order finalized.</Text>;
    };

    // Derived states
    const filteredOrders = orders.filter(o => o.status === activeTab.toLowerCase());

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
                <Text style={styles.title}>Live Queue</Text>
            </View>

            <View style={styles.tabContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {TABS.map(tab => (
                        <TouchableOpacity
                            key={tab}
                            style={[styles.tab, activeTab === tab && styles.activeTab]}
                            onPress={() => setActiveTab(tab)}
                        >
                            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? <ActivityIndicator size="large" color={ORANGE} style={{ marginTop: 50 }} /> : (
                <FlatList
                    contentContainerStyle={{ padding: 20 }}
                    data={filteredOrders}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.studentName}>{item.studentName?.toUpperCase()}</Text>
                                <Text style={styles.timeLabel}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                            </View>

                            <View style={styles.itemList}>
                                {item.items.map((cartItem, idx) => (
                                    <View key={idx} style={{ marginBottom: 4 }}>
                                        <Text style={styles.foodText}>
                                            {cartItem.quantity}x {cartItem.name}
                                        </Text>
                                        {cartItem.note ? (
                                            <Text style={{ fontSize: 13, color: '#e67e22', fontStyle: 'italic', marginLeft: 8 }}>
                                                ↳ {cartItem.note}
                                            </Text>
                                        ) : null}
                                    </View>
                                ))}
                            </View>

                            {item.paymentProof ? (
                                <View style={styles.slipBox}>
                                    <Image source={{ uri: getImageUrl(item.paymentProof) }} style={styles.slip} resizeMode="contain" />
                                    <Text style={styles.slipLabel}>Payment Receipt (Student Upload)</Text>
                                </View>
                            ) : null}

                            <View style={styles.footerRow}>
                                <View>
                                    <Text style={styles.paymentMetric}>Paid: Rs {item.finalAmount}</Text>
                                    {item.pickupTime ? <Text style={styles.pickupAlert}>Pickup: {item.pickupTime}</Text> : null}
                                </View>
                                {updatingId === item._id ? <ActivityIndicator color={ORANGE} /> : <StatusButton order={item} />}
                            </View>

                            {item.note && (
                                <View style={styles.noteBox}>
                                    <Text style={styles.noteText}>Note: {item.note}</Text>
                                </View>
                            )}
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No {activeTab} orders at the moment.</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F0F2F5' },
    header: { backgroundColor: ORANGE, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
    backBtn: { paddingRight: 15 },
    backArrow: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

    tabContainer: { backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 10, elevation: 3 },
    tab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, marginHorizontal: 5, backgroundColor: '#f0f0f0' },
    activeTab: { backgroundColor: ORANGE },
    tabText: { color: '#666', fontWeight: 'bold' },
    activeTabText: { color: '#fff' },

    card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 15, elevation: 2, borderLeftWidth: 4, borderColor: ORANGE },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 8, marginBottom: 10 },
    studentName: { fontSize: 16, fontWeight: 'bold', color: '#222' },
    timeLabel: { fontSize: 13, color: '#888' },

    itemList: { marginBottom: 12 },
    foodText: { fontSize: 15, color: '#444', marginBottom: 4 },

    footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 10 },
    paymentMetric: { fontSize: 14, fontWeight: 'bold', color: '#2ecc71' },
    pickupAlert: { fontSize: 13, color: '#e74c3c', fontWeight: 'bold', marginTop: 3 },

    actionBtn: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 8 },
    actionText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

    noteBox: { backgroundColor: '#FFF9C4', padding: 10, borderRadius: 8, marginTop: 12 },
    noteText: { color: '#F57F17', fontStyle: 'italic', fontSize: 13 },

    slipBox: { marginVertical: 10, backgroundColor: '#f8f9fa', borderRadius: 10, padding: 10, borderWidth: 1, borderColor: '#e0e0e0' },
    slip: { width: '100%', height: 150, borderRadius: 8 },
    slipLabel: { fontSize: 11, color: '#7f8c8d', textAlign: 'center', marginTop: 6, fontWeight: '600' },

    empty: { textAlign: 'center', color: '#888', marginTop: 40 }
});
