import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl,
} from 'react-native';
import API from '../services/api';
import TopNavBar from '../components/TopNavBar';

const ORANGE = '#FF6B35';

const STATUS_COLORS = {
    pending: '#FF9800', confirmed: '#2196F3', preparing: '#9C27B0',
    ready: '#4CAF50', completed: '#607D8B', cancelled: '#F44336',
};

export default function OrdersScreen({ navigation }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchOrders = useCallback(async () => {
        try {
            const res = await API.get('/orders/my');
            setOrders(res.data?.orders || []);
        } catch (e) {
            setOrders([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => { fetchOrders(); }, []);

    const onRefresh = () => { setRefreshing(true); fetchOrders(); };

    const renderOrder = ({ item }) => (
        <TouchableOpacity
            style={styles.orderCard}
            onPress={() => navigation.navigate('OrderDetail', { order: item })}
            activeOpacity={0.85}
        >
            <View style={styles.orderTop}>
                <Text style={styles.queueNum}>Queue #{item.queueNumber || '—'}</Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] || '#999' }]}>
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
            </View>
            <Text style={styles.itemsText} numberOfLines={1}>
                {item.items?.map(i => `${i.name} ×${i.quantity}`).join(', ')}
            </Text>
            {item.pickupTime ? <Text style={styles.pickupTime}>⏰ Pickup: {item.pickupTime}</Text> : null}
            <View style={styles.orderBottom}>
                <Text style={styles.amount}>LKR {(item.finalAmount || item.totalAmount || 0).toFixed(2)}</Text>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={ORANGE} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TopNavBar navigation={navigation} placeholder="📦 My Orders" />
            {orders.length === 0 ? (
                <View style={styles.empty}>
                    <Text style={{ fontSize: 56 }}>📦</Text>
                    <Text style={styles.emptyTitle}>No orders yet</Text>
                    <Text style={styles.emptySub}>Your orders will appear here</Text>
                    <TouchableOpacity style={styles.browseBtn} onPress={() => navigation.navigate('Home')}>
                        <Text style={styles.browseBtnText}>Order Now</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderOrder}
                    keyExtractor={i => i._id}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[ORANGE]} />}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    list: { padding: 16, paddingTop: 125 },
    orderCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2,
    },
    orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    queueNum: { fontSize: 16, fontWeight: 'bold', color: '#222' },
    statusBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
    statusText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
    itemsText: { fontSize: 13, color: '#555', marginBottom: 6 },
    pickupTime: { fontSize: 12, color: ORANGE, fontWeight: '600', marginBottom: 6 },
    orderBottom: { flexDirection: 'row', justifyContent: 'space-between' },
    amount: { fontSize: 15, fontWeight: 'bold', color: ORANGE },
    date: { fontSize: 12, color: '#aaa' },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
    emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 16 },
    emptySub: { fontSize: 14, color: '#aaa', marginTop: 6, marginBottom: 24 },
    browseBtn: { backgroundColor: ORANGE, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 28 },
    browseBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
