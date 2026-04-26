import React from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
} from 'react-native';

const ORANGE = '#FF6B35';
const STATUS_COLORS = {
    pending: '#FF9800', confirmed: '#2196F3', preparing: '#9C27B0',
    ready: '#4CAF50', completed: '#607D8B', cancelled: '#F44336',
};

export default function OrderDetailScreen({ navigation, route }) {
    const { order } = route.params;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Order Detail</Text>
            </View>

            <ScrollView contentContainerStyle={{ padding: 16 }}>
                {/* Status */}
                <View style={styles.statusCard}>
                    <Text style={styles.queueNum}>Queue #{order.queueNumber || '—'}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[order.status] || '#999' }]}>
                        <Text style={styles.statusText}>{order.status?.toUpperCase()}</Text>
                    </View>
                </View>

                {/* Items */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>🍽️ Items</Text>
                    {order.items?.map((item, idx) => (
                        <View key={idx} style={{ paddingVertical: 6 }}>
                            <View style={[styles.itemRow, { paddingVertical: 0 }]}>
                                <Text style={styles.itemName}>{item.name} ×{item.quantity}</Text>
                                <Text style={styles.itemPrice}>LKR {(item.price * item.quantity).toFixed(2)}</Text>
                            </View>
                            {item.note ? (
                                <Text style={{ fontSize: 13, color: '#888', marginTop: 2 }}>↳ Note: {item.note}</Text>
                            ) : null}
                        </View>
                    ))}
                    <View style={styles.divider} />
                    {order.discountAmount > 0 && (
                        <View style={styles.itemRow}>
                            <Text style={{ color: '#4CAF50', fontWeight: '600' }}>Discount</Text>
                            <Text style={{ color: '#4CAF50', fontWeight: '600' }}>− LKR {order.discountAmount.toFixed(2)}</Text>
                        </View>
                    )}
                    <View style={styles.itemRow}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>LKR {(order.finalAmount || order.totalAmount).toFixed(2)}</Text>
                    </View>
                </View>

                {/* Info */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>ℹ️ Details</Text>
                    {order.pickupTime ? <Text style={styles.detailRow}>⏰ Pickup: {order.pickupTime}</Text> : null}
                    {order.note ? <Text style={styles.detailRow}>📝 Note: {order.note}</Text> : null}
                    <Text style={styles.detailRow}>📅 {new Date(order.createdAt).toLocaleString()}</Text>
                </View>

                {/* Feedback Button */}
                {order.status === 'completed' && (
                    <TouchableOpacity
                        style={styles.feedbackBtn}
                        onPress={() => navigation.navigate('Feedback', {
                            orderId: order._id,
                            canteenId: order.canteenId,
                            foodName: order.items?.[0]?.name,
                        })}
                    >
                        <Text style={styles.feedbackBtnText}>⭐ Leave Feedback</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        backgroundColor: ORANGE, paddingTop: 52, paddingBottom: 16,
        paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center',
    },
    backBtn: { marginRight: 12, padding: 4 },
    backArrow: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    statusCard: {
        backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2,
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    },
    queueNum: { fontSize: 22, fontWeight: 'bold', color: '#222' },
    statusBadge: { borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6 },
    statusText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, elevation: 2 },
    cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#222', marginBottom: 12 },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
    itemName: { fontSize: 14, color: '#444', flex: 1 },
    itemPrice: { fontSize: 14, fontWeight: '600', color: '#333' },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 8 },
    totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#222' },
    totalValue: { fontSize: 16, fontWeight: 'bold', color: ORANGE },
    detailRow: { fontSize: 14, color: '#555', marginBottom: 6 },
    feedbackBtn: {
        backgroundColor: '#FFF3EE', borderWidth: 2, borderColor: ORANGE,
        borderRadius: 14, padding: 15, alignItems: 'center', marginBottom: 20,
    },
    feedbackBtnText: { color: ORANGE, fontWeight: 'bold', fontSize: 15 },
});
