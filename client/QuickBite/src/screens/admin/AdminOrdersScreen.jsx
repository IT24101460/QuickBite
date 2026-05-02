import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
    Alert, TextInput, ScrollView, RefreshControl, Modal, Image, Switch,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import API from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';

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
            <View style={styles.filterBar}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterContent}
                >
                    {['', ...STATUSES].map(item => (
                    <TouchableOpacity
                        key={item || 'all'}
                        style={[styles.chip, filterStatus === item && styles.chipActive]}
                        onPress={() => setFilterStatus(item)}
                    >
                        <Text style={[styles.chipText, filterStatus === item && styles.chipTextActive]}>{item || 'All'}</Text>
                    </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

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
                            <View style={styles.itemList}>
                                {item.items?.map((orderItem, idx) => (
                                    <View key={`${orderItem.foodItemId || orderItem.name}-${idx}`} style={styles.itemRow}>
                                        <Text style={styles.itemName} numberOfLines={1}>
                                            {orderItem.name} ×{orderItem.quantity}
                                        </Text>
                                        <View style={styles.categoryBadge}>
                                            <Text style={styles.categoryBadgeText} numberOfLines={1}>
                                                {orderItem.category || 'General'}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </View>
                            <Text style={styles.amount}>LKR {(item.finalAmount || item.totalAmount || 0).toFixed(2)}</Text>
                            {item.pickupTime ? <Text style={styles.pickup}>⏰ {item.pickupTime}</Text> : null}
                            {item.paymentProof ? (
                                <View style={styles.slipBox}>
                                    <Image source={{ uri: getImageUrl(item.paymentProof) }} style={styles.slip} resizeMode="contain" />
                                    <Text style={styles.slipLabel}>Payment Verification Slip</Text>
                                </View>
                            ) : null}
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
    filterBar: { height: 52, backgroundColor: '#F8F9FA', justifyContent: 'center' },
    filterContent: { paddingHorizontal: 10, alignItems: 'center' },
    chip: { minHeight: 34, borderWidth: 1.5, borderColor: '#E8E8E8', borderRadius: 17, paddingHorizontal: 14, marginRight: 8, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
    chipActive: { backgroundColor: ORANGE, borderColor: ORANGE },
    chipText: { fontSize: 13, lineHeight: 16, color: '#666', fontWeight: '600', includeFontPadding: false, textAlignVertical: 'center' },
    chipTextActive: { color: '#fff' },
    card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, elevation: 2 },
    cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    qNum: { fontSize: 14, fontWeight: 'bold', color: '#222' },
    badge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 4 },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    itemList: { marginBottom: 6 },
    itemRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
    itemName: { flex: 1, minWidth: 0, fontSize: 12, color: '#666', marginRight: 10 },
    categoryBadge: {
        maxWidth: 120,
        height: 24,
        backgroundColor: '#FFF0E8',
        borderRadius: 12,
        paddingHorizontal: 9,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    categoryBadgeText: { color: ORANGE, fontSize: 10, lineHeight: 14, fontWeight: '700', includeFontPadding: false, textAlignVertical: 'center' },
    amount: { fontSize: 14, fontWeight: 'bold', color: ORANGE },
    pickup: { fontSize: 12, color: '#888', marginTop: 2 },
    statusBtn: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5, marginRight: 6 },
    statusBtnText: { fontSize: 11, fontWeight: '600', color: '#555' },
    empty: { textAlign: 'center', color: '#aaa', paddingVertical: 40 },
    slipBox: { marginTop: 10, backgroundColor: '#f9f9f9', borderRadius: 8, padding: 8, borderWidth: 1, borderColor: '#eee' },
    slip: { width: '100%', height: 120, borderRadius: 6 },
    slipLabel: { fontSize: 10, color: '#999', textAlign: 'center', marginTop: 4, fontWeight: 'bold' },
});

// ─── AdminFoodItemsScreen ──────────────────────────────────────────────────
// (Defined below as a separate export for the file structure)
