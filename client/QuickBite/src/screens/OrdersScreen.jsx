import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl, ScrollView, Image
} from 'react-native';
import API from '../services/api';
import TopNavBar from '../components/TopNavBar';
import { getImageUrl } from '../utils/imageUtils';

const ORANGE = '#FF6B35';

const STATUS_CONFIG = {
    pending: { color: '#FF9800', bg: '#FFF3E0', icon: '⏳', label: 'Pending' },
    confirmed: { color: '#2196F3', bg: '#E3F2FD', icon: '✅', label: 'Confirmed' },
    preparing: { color: '#9C27B0', bg: '#E3F2FD', icon: '👨‍🍳', label: 'Preparing' },
    ready: { color: '#4CAF50', bg: '#E8F5E8', icon: '🎯', label: 'Ready for Pickup' },
    completed: { color: '#607D8B', bg: '#E3F2FD', icon: '✅', label: 'Completed' },
    cancelled: { color: '#F44336', bg: '#FFEBEE', icon: '❌', label: 'Cancelled' }
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

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const onRefresh = () => { setRefreshing(true); fetchOrders(); };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const renderOrder = ({ item }) => {
        const statusConfig = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
        const isCustomOrder = item.items?.some(i => i.isCustomOrder);
        const customOrderItem = item.items?.find(i => i.isCustomOrder);
        
        // Calculate time difference for cancellation eligibility
        const orderTime = new Date(item.createdAt);
        const currentTime = new Date();
        const hoursDiff = (currentTime - orderTime) / (1000 * 60 * 60);
        const canCancel = hoursDiff < 3 && item.status === 'pending';

        return (
            <TouchableOpacity
                style={styles.orderCard}
                onPress={() => navigation.navigate('OrderDetail', { order: item })}
                activeOpacity={0.95}
            >
                {/* Order Header */}
                <View style={styles.orderHeader}>
                    <View style={styles.orderInfo}>
                        <View style={styles.queueSection}>
                            <Text style={styles.queueLabel}>Queue</Text>
                            <Text style={styles.queueNumber}>#{item.queueNumber || '—'}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                            <Text style={[styles.statusIcon, { color: statusConfig.color }]}>
                                {statusConfig.icon}
                            </Text>
                            <Text style={[styles.statusText, { color: statusConfig.color }]}>
                                {statusConfig.label}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.orderAmount}>
                        <Text style={styles.amountLabel}>Total</Text>
                        <Text style={styles.amountValue}>
                            LKR {(item.finalAmount || item.totalAmount || 0).toFixed(2)}
                        </Text>
                    </View>
                </View>

                {/* Order Type Badge */}
                {isCustomOrder && (
                    <View style={styles.customOrderBadge}>
                        <Text style={styles.customOrderIcon}>🎂</Text>
                        <Text style={styles.customOrderText}>Custom Order</Text>
                    </View>
                )}

                {/* Order Summary */}
                <View style={styles.summarySection}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>📅 Order Date:</Text>
                        <Text style={styles.summaryValue}>
                            {isCustomOrder && item.pickupDate 
                                ? new Date(item.pickupDate).toLocaleDateString('en-US', { 
                                    weekday: 'short', 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                })
                                : formatDate(item.createdAt)}
                        </Text>
                    </View>
                    
                    {!isCustomOrder && item.pickupTime && (
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>⏰ Pickup Time:</Text>
                            <Text style={styles.summaryValue}>{item.pickupTime}</Text>
                        </View>
                    )}
                    
                    {isCustomOrder && item.pickupDate && (
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>📅 Pickup Date:</Text>
                            <Text style={styles.summaryValue}>
                                {new Date(item.pickupDate).toLocaleDateString('en-US', { 
                                    weekday: 'short', 
                                    year: 'numeric', 
                                    month: 'short', 
                                    day: 'numeric' 
                                })}
                            </Text>
                        </View>
                    )}
                    
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>📍 Canteen:</Text>
                        <Text style={styles.summaryValue}>{item.canteenName || 'Campus Canteen'}</Text>
                    </View>
                    
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>💳 Payment Method:</Text>
                        <Text style={styles.summaryValue}>
                            {item.paymentMethod === 'cash' ? '💵 Cash' : 
                             item.paymentMethod === 'card' ? '💳 Card' : 
                             item.paymentMethod === 'bank' ? '🏦 Bank Transfer' : 'Unknown'}
                        </Text>
                    </View>
                    
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>📦 Items:</Text>
                        <Text style={styles.summaryValue}>
                            {item.items?.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                        </Text>
                    </View>
                </View>

                {/* Payment Slip Display */}
                {item.paymentMethod === 'bank' && item.paymentProof && (
                    <View style={styles.paymentSlipSection}>
                        <Text style={styles.sectionTitle}>💳 Payment Slip</Text>
                        <TouchableOpacity 
                            style={styles.paymentSlip}
                            onPress={() => {
                                // Show payment slip image
                                Alert.alert(
                                    'Payment Slip',
                                    'Tap to view full payment slip',
                                    [
                                        { text: 'View', onPress: () => {
                                            navigation.navigate('ImagePreview', { 
                                                imageUrl: getImageUrl(item.paymentProof),
                                                title: 'Payment Slip'
                                            });
                                        }},
                                        { text: 'Cancel', style: 'cancel' }
                                    ]
                                );
                            }}
                        >
                            <Image 
                                source={{ uri: getImageUrl(item.paymentProof) }} 
                                style={styles.paymentSlipImage} 
                                resizeMode="cover" 
                            />
                            <View style={styles.paymentSlipOverlay}>
                                <Text style={styles.paymentSlipText}>📄 Tap to view</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionsSection}>
                    <Text style={styles.sectionTitle}>Actions</Text>
                    <View style={styles.actionsContainer}>
                        {canCancel && (
                            <TouchableOpacity
                                style={styles.cancelBtn}
                                onPress={() => handleCancelOrder(item._id)}
                            >
                                <Text style={styles.cancelBtnText}>❌ Cancel Order</Text>
                            </TouchableOpacity>
                        )}
                        
                        <TouchableOpacity
                            style={styles.viewDetailsBtn}
                            onPress={() => navigation.navigate('OrderDetail', { order: item })}
                        >
                            <Text style={styles.viewDetailsBtnText}>📋 View Details</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    const handleCancelOrder = async (orderId) => {
        Alert.alert(
            'Cancel Order',
            'Are you sure you want to cancel this order?',
            [
                { text: 'No', style: 'cancel' },
                { 
                    text: 'Yes, Cancel', 
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await API.patch(`/orders/${orderId}/status`, { status: 'cancelled' });
                            Alert.alert('Order Cancelled', 'Your order has been cancelled successfully.');
                            onRefresh(); // Refresh orders list
                        } catch (error) {
                            Alert.alert('Error', 'Failed to cancel order. Please try again.');
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={ORANGE} />
                <Text style={styles.loadingText}>Loading your orders...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TopNavBar navigation={navigation} placeholder="📦 My Orders" />
            
            {orders.length === 0 ? (
                <View style={styles.emptyState}>
                    <View style={styles.emptyContent}>
                        <Text style={styles.emptyIcon}>📦</Text>
                        <Text style={styles.emptyTitle}>No Orders Yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Start ordering to see your delicious meals here!
                        </Text>
                        <TouchableOpacity 
                            style={styles.orderNowBtn}
                            onPress={() => navigation.navigate('Home')}
                        >
                            <Text style={styles.orderNowBtnText}>Order Now</Text>
                        </TouchableOpacity>
                    </View>
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
    container: { flex: 1, backgroundColor: '#FFF7F2' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    list: { padding: 16, paddingTop: 150 },
    
    // Order Card Styles
    orderCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        overflow: 'hidden'
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
        paddingHorizontal: 16,
        paddingTop: 16
    },
    orderInfo: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12
    },
    queueSection: {
        alignItems: 'center'
    },
    queueLabel: {
        fontSize: 11,
        color: '#888',
        fontWeight: '600',
        marginBottom: 2
    },
    queueNumber: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6
    },
    statusIcon: {
        fontSize: 14
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700'
    },
    orderAmount: {
        alignItems: 'flex-end'
    },
    amountLabel: {
        fontSize: 11,
        color: '#888',
        marginBottom: 2
    },
    amountValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: ORANGE
    },
    
    // Custom Order Badge
    customOrderBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF0E8',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#FFE0D6'
    },
    customOrderIcon: {
        fontSize: 14,
        marginRight: 4
    },
    customOrderText: {
        fontSize: 11,
        color: ORANGE,
        fontWeight: '600'
    },
    
    // Items Section
    itemsSection: {
        paddingHorizontal: 16,
        marginBottom: 16
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8
    },
    orderItem: {
        flexDirection: 'row',
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        alignItems: 'center'
    },
    itemImage: {
        width: 50,
        height: 50,
        borderRadius: 8,
        marginRight: 12
    },
    itemDetails: {
        flex: 1
    },
    itemName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4
    },
    itemMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    itemQuantity: {
        fontSize: 12,
        color: '#666',
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6
    },
    itemPrice: {
        fontSize: 13,
        fontWeight: 'bold',
        color: ORANGE
    },
    itemNote: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        marginTop: 4
    },
    
    // Custom Order Details
    customOrderDetails: {
        backgroundColor: '#FFF0E8',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: '#FFE0D6'
    },
    customDesc: {
        fontSize: 13,
        color: '#555',
        lineHeight: 18,
        marginBottom: 8
    },
    customMeta: {
        gap: 4
    },
    customMetaItem: {
        fontSize: 12,
        color: '#666'
    },
    
    // Order Details
    orderDetails: {
        paddingHorizontal: 16,
        marginBottom: 16
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
        backgroundColor: '#FAFAFA',
        borderRadius: 8,
        padding: 12
    },
    detailLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600'
    },
    detailValue: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
        flex: 1,
        textAlign: 'right'
    },
    
    // Status Message
    statusMessageContainer: {
        backgroundColor: '#FFF3E0',
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 8,
        padding: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#FF9800'
    },
    statusMessage: {
        fontSize: 12,
        color: '#333'
    },
    
    // Empty State
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 150
    },
    emptyContent: {
        alignItems: 'center',
        padding: 40
    },
    emptyIcon: {
        fontSize: 80,
        marginBottom: 16
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 32
    },
    orderNowBtn: {
        backgroundColor: ORANGE,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 25,
        shadowColor: ORANGE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4
    },
    orderNowBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    },
    
    // Loading
    loadingText: {
        fontSize: 14,
        color: '#666',
        marginTop: 12
    },
    
    // Summary Section
    summarySection: {
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
    },
    summaryLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
        flex: 1
    },
    summaryValue: {
        fontSize: 12,
        color: '#333',
        fontWeight: '500',
        flex: 2,
        textAlign: 'right'
    },
    
    // Payment Slip Section
    paymentSlipSection: {
        backgroundColor: '#F0F8FF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#E3F2FD'
    },
    paymentSlip: {
        borderRadius: 8,
        overflow: 'hidden',
        height: 120,
        marginBottom: 8
    },
    paymentSlipImage: {
        width: '100%',
        height: '100%'
    },
    paymentSlipOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    paymentSlipText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold'
    },
    
    // Actions Section
    actionsSection: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16
    },
    actionsContainer: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'stretch'
    },
    cancelBtn: {
        backgroundColor: '#F44336',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignItems: 'center',
        flex: 1
    },
    cancelBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold'
    },
    viewDetailsBtn: {
        backgroundColor: ORANGE,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignItems: 'center',
        flex: 1
    },
    viewDetailsBtnText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold'
    }
});
