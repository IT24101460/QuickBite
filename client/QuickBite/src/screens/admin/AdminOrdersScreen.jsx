import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
    Alert, TextInput, ScrollView, RefreshControl, Modal, Image, Switch,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import API from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS, SIZES } from '../../styles/adminTheme';
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

            {loading ? <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} /> : (
                <FlatList
                    data={orders}
                    keyExtractor={i => i._id}
                    contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 20 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetch(); }} colors={[COLORS.primary]} />}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardTop}>
                                <Text style={styles.qNum}>#{item.queueNumber || '—'} · {item.studentName}</Text>
                                <View style={[styles.badge, { backgroundColor: COLORS.status[item.status] || '#999' }]}>
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
                                        style={[styles.statusBtn, item.status === s && { backgroundColor: COLORS.status[s] }]}
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
    container: { flex: 1, backgroundColor: COLORS.background },
    header: { 
        backgroundColor: COLORS.primary,
        paddingTop: 52,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        ...SHADOWS.md,
    },
    backBtn: { 
        marginRight: SPACING.sm,
        padding: SPACING.xs,
        borderRadius: BORDER_RADIUS.round,
        backgroundColor: 'rgba(255,255,255,0.1)'
    },
    back: { 
        color: COLORS.textWhite, 
        fontSize: 22, 
        fontWeight: '700' 
    },
    headerTitle: { 
        flex: 1, 
        color: COLORS.textWhite, 
        fontSize: TYPOGRAPHY.h3.fontSize, 
        fontWeight: TYPOGRAPHY.h3.fontWeight 
    },
    filterBar: { 
        height: SIZES.inputHeight, 
        backgroundColor: COLORS.background, 
        justifyContent: 'center' 
    },
    filterContent: { 
        paddingHorizontal: SPACING.md, 
        alignItems: 'center' 
    },
    chip: { 
        minHeight: 34, 
        borderWidth: 1.5, 
        borderColor: COLORS.borderLight, 
        borderRadius: BORDER_RADIUS.round, 
        paddingHorizontal: SPACING.md, 
        marginRight: SPACING.sm, 
        backgroundColor: COLORS.surface,
        justifyContent: 'center', 
        alignItems: 'center' 
    },
    chipActive: { 
        backgroundColor: COLORS.primary, 
        borderColor: COLORS.primary 
    },
    chipText: { 
        fontSize: TYPOGRAPHY.caption.fontSize, 
        lineHeight: 16, 
        color: COLORS.textSecondary, 
        fontWeight: '600', 
        includeFontPadding: false, 
        textAlignVertical: 'center' 
    },
    chipTextActive: { color: COLORS.textWhite },
    card: { 
        backgroundColor: COLORS.surface, 
        borderRadius: BORDER_RADIUS.lg, 
        padding: SPACING.md, 
        marginBottom: SPACING.sm, 
        ...SHADOWS.sm,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    cardTop: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: SPACING.sm 
    },
    qNum: { 
        fontSize: TYPOGRAPHY.body2.fontSize, 
        fontWeight: 'bold', 
        color: COLORS.textPrimary 
    },
    badge: { 
        borderRadius: BORDER_RADIUS.round, 
        paddingHorizontal: SPACING.sm, 
        paddingVertical: SPACING.xs 
    },
    badgeText: { 
        color: COLORS.textWhite, 
        fontSize: TYPOGRAPHY.caption.fontSize, 
        fontWeight: 'bold' 
    },
    itemList: { marginBottom: SPACING.sm },
    itemRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: SPACING.xs 
    },
    itemName: { 
        flex: 1, 
        minWidth: 0, 
        fontSize: TYPOGRAPHY.caption.fontSize, 
        color: COLORS.textSecondary, 
        marginRight: SPACING.sm 
    },
    categoryBadge: {
        maxWidth: 120,
        height: 24,
        backgroundColor: COLORS.primaryUltraLight,
        borderRadius: BORDER_RADIUS.round,
        paddingHorizontal: SPACING.sm,
        justifyContent: 'center',
        alignItems: 'center',
        flexShrink: 0,
    },
    categoryBadgeText: { 
        color: COLORS.primary, 
        fontSize: TYPOGRAPHY.caption.fontSize, 
        lineHeight: 14, 
        fontWeight: '700', 
        includeFontPadding: false, 
        textAlignVertical: 'center' 
    },
    amount: { 
        fontSize: TYPOGRAPHY.body2.fontSize, 
        fontWeight: 'bold', 
        color: COLORS.primary 
    },
    pickup: { 
        fontSize: TYPOGRAPHY.caption.fontSize, 
        color: COLORS.textSecondary, 
        marginTop: SPACING.xs 
    },
    statusBtn: { 
        borderWidth: 1, 
        borderColor: COLORS.border, 
        borderRadius: BORDER_RADIUS.md, 
        paddingHorizontal: SPACING.sm, 
        paddingVertical: SPACING.xs, 
        marginRight: SPACING.xs 
    },
    statusBtnText: { 
        fontSize: TYPOGRAPHY.caption.fontSize, 
        fontWeight: '600', 
        color: COLORS.textSecondary 
    },
    empty: { 
        textAlign: 'center', 
        color: COLORS.textTertiary, 
        paddingVertical: SPACING.xxxl 
    },
    slipBox: { 
        marginTop: SPACING.sm, 
        backgroundColor: COLORS.background, 
        borderRadius: BORDER_RADIUS.md, 
        padding: SPACING.sm, 
        borderWidth: 1, 
        borderColor: COLORS.borderLight 
    },
    slip: { 
        width: '100%', 
        height: 120, 
        borderRadius: BORDER_RADIUS.sm 
    },
    slipLabel: { 
        fontSize: TYPOGRAPHY.caption.fontSize, 
        color: COLORS.textTertiary, 
        textAlign: 'center', 
        marginTop: SPACING.xs, 
        fontWeight: 'bold' 
    },
});

// ─── AdminFoodItemsScreen ──────────────────────────────────────────────────
// (Defined below as a separate export for the file structure)
