import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
    Alert, TextInput, ScrollView, RefreshControl, Modal, Image, Switch,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import API from '../../services/api';

const ORANGE = '#FF6B35';
const STATUS_COLORS = { pending: '#FF9800', confirmed: '#2196F3', preparing: '#9C27B0', ready: '#4CAF50', completed: '#607D8B', cancelled: '#F44336' };
const STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];

export default function AdminOrdersScreen({ navigation }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [filterStatus, setFilterStatus] = useState('');

    const fetch = async () => {
        try {
            const url = filterStatus ? `/orders?status=${filterStatus}` : '/orders';
            const r = await API.get(url);
            setOrders(r.data?.orders || []);
        } catch (e) { } finally { setLoading(false); setRefreshing(false); }
    };
    useEffect(() => { fetch(); }, [filterStatus]);

    const updateStatus = (id, status) => Alert.alert('Update Status', `Set to "${status}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
            text: 'Update', onPress: async () => {
                try { await API.patch(`/orders/${id}/status`, { status }); fetch(); }
                catch (e) { Alert.alert('Error', e.response?.data?.message || 'Failed'); }
            }
        },
    ]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.back}>←</Text></TouchableOpacity>
                <Text style={styles.headerTitle}>📦 Manage Orders</Text>
            </View>

            {/* Status Filter */}
            <FlatList
                data={['', ...STATUSES]}
                horizontal showsHorizontalScrollIndicator={false}
                keyExtractor={i => i}
                contentContainerStyle={{ padding: 10 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={[styles.chip, filterStatus === item && styles.chipActive]}
                        onPress={() => setFilterStatus(item)}
                    >
                        <Text style={[styles.chipText, filterStatus === item && styles.chipTextActive]}>{item || 'All'}</Text>
                    </TouchableOpacity>
                )}
            />

            {loading ? <ActivityIndicator size="large" color={ORANGE} style={{ marginTop: 20 }} /> : (
                <FlatList
                    data={orders}
                    keyExtractor={i => i._id}
                    contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} colors={[ORANGE]} />}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardTop}>
                                <Text style={styles.qNum}>#{item.queueNumber || '—'} · {item.studentName}</Text>
                                <View style={[styles.badge, { backgroundColor: STATUS_COLORS[item.status] || '#999' }]}>
                                    <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
                                </View>
                            </View>
                            <Text style={styles.items} numberOfLines={1}>{item.items?.map(i => `${i.name}×${i.quantity}`).join(', ')}</Text>
                            <Text style={styles.amount}>LKR {(item.finalAmount || item.totalAmount || 0).toFixed(2)}</Text>
                            {item.pickupTime ? <Text style={styles.pickup}>⏰ {item.pickupTime}</Text> : null}
                            <FlatList
                                data={STATUSES}
                                horizontal showsHorizontalScrollIndicator={false}
                                keyExtractor={s => s}
                                style={{ marginTop: 8 }}
                                renderItem={({ item: s }) => (
                                    <TouchableOpacity
                                        style={[styles.statusBtn, item.status === s && { backgroundColor: STATUS_COLORS[s] }]}
                                        onPress={() => item.status !== s && updateStatus(item._id, s)}
                                    >
                                        <Text style={[styles.statusBtnText, item.status === s && { color: '#fff' }]}>{s}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No orders found</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { backgroundColor: ORANGE, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
    backBtn: { marginRight: 10, padding: 4 },
    back: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    chip: { borderWidth: 1.5, borderColor: '#E8E8E8', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, backgroundColor: '#fff' },
    chipActive: { backgroundColor: ORANGE, borderColor: ORANGE },
    chipText: { fontSize: 13, color: '#666', fontWeight: '600' },
    chipTextActive: { color: '#fff' },
    card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    qNum: { fontSize: 14, fontWeight: 'bold', color: '#222' },
    badge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    items: { fontSize: 12, color: '#666', marginBottom: 4 },
    amount: { fontSize: 14, fontWeight: 'bold', color: ORANGE },
    pickup: { fontSize: 12, color: '#888', marginTop: 2 },
    statusBtn: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, marginRight: 6 },
    statusBtnText: { fontSize: 11, fontWeight: '600', color: '#555' },
    empty: { textAlign: 'center', color: '#aaa', paddingVertical: 40 },
});

// ─── AdminFoodItemsScreen ──────────────────────────────────────────────────
// (Defined below as a separate export for the file structure)
