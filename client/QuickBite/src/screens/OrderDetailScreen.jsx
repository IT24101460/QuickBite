import React, { useState } from 'react';
import {
    View, Text, StyleSheet, ScrollView, TouchableOpacity,
    ActivityIndicator, Alert, Image
} from 'react-native';
import API from '../services/api';
import TopNavBar from '../components/TopNavBar';
import { getImageUrl } from '../utils/imageUtils';

const ORANGE = '#FF6B35';

const STATUS_CONFIG = {
    pending: { color: '#FF9800', bg: '#FFF3E0', icon: '', label: 'Pending' },
    confirmed: { color: '#2196F3', bg: '#E3F2FD', icon: '', label: 'Confirmed' },
    preparing: { color: '#9C27B0', bg: '#E3F2FD', icon: '', label: 'Preparing' },
    ready: { color: '#4CAF50', bg: '#E8F5E8', icon: '', label: 'Ready for Pickup' },
    completed: { color: '#607D8B', bg: '#E3F2FD', icon: '', label: 'Completed' },
    cancelled: { color: '#F44336', bg: '#FFEBEE', icon: '', label: 'Cancelled' }
};

export default function OrderDetailScreen({ navigation, route }) {
    const { order } = route.params;
    const [loading, setLoading] = useState(false);
    const [orderStatus, setOrderStatus] = useState(order.status);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    
    // Users should not be able to update order status - only canteen owners/staff can do this
    const getStatusActions = () => {
        return null;
    };

    const isCustomOrder = order.items?.some(item => item.isCustomOrder);
    const customOrderItem = order.items?.find(item => item.isCustomOrder);

    return (
        <View style={styles.container}>
            <TopNavBar navigation={navigation} placeholder=" Order Details" />
            
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Order Status Card */}
                <View style={styles.statusCard}>
                    <View style={styles.statusHeader}>
                        <Text style={styles.statusTitle}>Order Status</Text>
                        <View style={[styles.statusBadge, { backgroundColor: STATUS_CONFIG[orderStatus]?.bg || '#999' }]} >
                            <Text style={styles.statusIcon}>{STATUS_CONFIG[orderStatus]?.icon}</Text>
                            <Text style={styles.statusText}>{STATUS_CONFIG[orderStatus]?.label}</Text>
                        </View>
                    </View>
                    <Text style={styles.queueNumber}>Queue #{order.queueNumber || '—'}</Text>
                </View>

                {/* Order Type Badge */}
                {isCustomOrder && (
                    <View style={styles.customOrderBadge}>
                        <Text style={styles.customOrderIcon}> </Text>
                        <Text style={styles.customOrderText}>Custom Order</Text>
                    </View>
                )}

                {/* Order Information Card */}
                <View style={styles.infoCard}>
                    <Text style={styles.cardTitle}> Order Information</Text>
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Order ID:</Text>
                        <Text style={styles.infoValue}>#{order._id?.slice(-6) || 'Unknown'}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Order Date:</Text>
                        <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Queue Number:</Text>
                        <Text style={styles.infoValue}>#{order.queueNumber || '—'}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Total Amount:</Text>
                        <Text style={styles.infoValueAmount}>LKR {(order.finalAmount || order.totalAmount || 0).toFixed(2)}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Payment Method:</Text>
                        <Text style={styles.infoValue}>
                            {order.paymentMethod === 'cash' ? ' Cash at Pickup' : 
                             order.paymentMethod === 'card' ? ' Card Payment' : 
                             order.paymentMethod === 'bank' ? ' Bank Transfer' : 'Unknown'}
                        </Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Canteen:</Text>
                        <Text style={styles.infoValue}>{order.canteenName || 'Campus Canteen'}</Text>
                    </View>
                </View>

                {/* Order Items Card */}
                <View style={styles.itemsCard}>
                    <Text style={styles.cardTitle}> Order Items</Text>
                    {order.items?.map((item, idx) => (
                        <View key={idx} style={styles.orderItem}>
                            {item.image && (
                                <Image 
                                    source={{ uri: getImageUrl(item.image) }} 
                                    style={styles.itemImage} 
                                    resizeMode="cover" 
                                />
                            )}
                            <View style={styles.itemDetails}>
                                <Text style={styles.itemName} numberOfLines={2}>
                                    {item.name}
                                    {item.isCustomOrder && (
                                        <Text style={styles.customBadge}> (Custom)</Text>
                                    )}
                                </Text>
                                <View style={styles.itemMeta}>
                                    <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                                    <Text style={styles.itemPrice}>LKR {(item.price * item.quantity).toFixed(2)}</Text>
                                </View>
                                {item.note && (
                                    <Text style={styles.itemNote} numberOfLines={3}>
                                         {item.note}
                                    </Text>
                                )}
                            </View>
                        </View>
                    ))}
                </View>

                {/* Custom Order Details */}
                {isCustomOrder && customOrderItem?.customOrderData && (
                    <View style={styles.customOrderCard}>
                        <Text style={styles.cardTitle}> Custom Order Details</Text>
                        <Text style={styles.customDesc}>{customOrderItem.customOrderData.description}</Text>
                        
                        <View style={styles.customMeta}>
                            <View style={styles.customMetaItem}>
                                <Text style={styles.customMetaLabel}> Pickup Date:</Text>
                                <Text style={styles.customMetaValue}>
                                    {new Date(customOrderItem.customOrderData.pickupDate).toLocaleDateString()}
                                </Text>
                            </View>
                            

                            <View style={styles.customMetaItem}>
                                <Text style={styles.customMetaLabel}> Budget:</Text>
                                <Text style={styles.customMetaValue}>
                                    LKR {customOrderItem.customOrderData.budget}
                                </Text>
                            </View>
                            

                            <View style={styles.customMetaItem}>
                                <Text style={styles.customMetaLabel}> Reference Images:</Text>
                                <Text style={styles.customMetaValue}>
                                    {customOrderItem.customOrderData.referenceImages?.length || 0} image(s)
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Pickup Information */}
                {!isCustomOrder && (
                    <View style={styles.infoCard}>
                        <Text style={styles.cardTitle}> Pickup Information</Text>
                        {order.pickupTime && (
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Pickup Time:</Text>
                                <Text style={styles.infoValue}>{order.pickupTime}</Text>
                            </View>
                        )}
                        <View style={styles.infoRow}>
                            <Text style={styles.infoLabel}>Pickup Date:</Text>
                            <Text style={styles.infoValue}>{formatDate(order.createdAt)}</Text>
                        </View>
                    </View>
                )}

                {/* Status Message */}
                {order.lastStatusMessage && (
                    <View style={styles.statusMessageCard}>
                        <Text style={styles.statusMessageTitle}> Status Update</Text>
                        <Text style={styles.statusMessage}>{order.lastStatusMessage}</Text>
                    </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionsCard}>
                    <Text style={styles.cardTitle}> Actions</Text>
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity
                            style={[styles.secondaryBtn, loading && { opacity: 0.6 }]}
                            onPress={() => navigation.navigate('Home')}
                            disabled={loading}
                        >
                            <Text style={styles.secondaryBtnText}> Back to Menu</Text>
                        </TouchableOpacity>
                        
                        {order.status === 'completed' && (
                            <TouchableOpacity
                                style={[styles.secondaryBtn, loading && { opacity: 0.6 }]}
                                onPress={() => navigation.navigate('Feedback', {
                                    orderId: order._id,
                                    canteenId: order.canteenId,
                                    foodName: order.items?.[0]?.name
                                })}
                                disabled={loading}
                            >
                                <Text style={styles.secondaryBtnText}> Leave Feedback</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF7F2' },
    scrollContent: { padding: 16, paddingTop: 150, paddingBottom: 20 },
    
    // Status Card
    statusCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8
    },
    statusHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16
    },
    statusTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 8
    },
    statusIcon: {
        fontSize: 16
    },
    statusText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#fff'
    },
    queueNumber: {
        fontSize: 16,
        fontWeight: 'bold',
        color: ORANGE
    },
    
    // Custom Order Badge
    customOrderBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF0E8',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#FFE0D6'
    },
    customOrderIcon: {
        fontSize: 14,
        marginRight: 4
    },
    customOrderText: {
        fontSize: 12,
        color: ORANGE,
        fontWeight: '600'
    },
    
    // Info Cards
    infoCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        padding: 16
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
        fontWeight: '600',
        flex: 1
    },
    infoValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        flex: 2,
        textAlign: 'right'
    },
    infoValueAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: ORANGE,
        flex: 2,
        textAlign: 'right'
    },
    
    // Items Card
    itemsCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8
    },
    orderItem: {
        flexDirection: 'row',
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center'
    },
    itemImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 16
    },
    itemDetails: {
        flex: 1
    },
    itemName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6
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
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6
    },
    itemPrice: {
        fontSize: 14,
        fontWeight: 'bold',
        color: ORANGE
    },
    itemNote: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        marginTop: 6,
        lineHeight: 16
    },
    customBadge: {
        fontSize: 11,
        color: ORANGE,
        fontWeight: '600',
        marginLeft: 4
    },
    
    // Custom Order Details
    customOrderCard: {
        backgroundColor: '#FFF0E8',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#FFE0D6'
    },
    customDesc: {
        fontSize: 14,
        color: '#555',
        lineHeight: 20,
        marginBottom: 12
    },
    customMeta: {
        gap: 12
    },
    customMetaItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#FAFAFA',
        borderRadius: 8,
        padding: 12
    },
    customMetaLabel: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
        flex: 1
    },
    customMetaValue: {
        fontSize: 13,
        color: '#333',
        fontWeight: '500',
        flex: 2,
        textAlign: 'right'
    },
    
    // Status Message
    statusMessageCard: {
        backgroundColor: '#FFF3E0',
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: '#FF9800'
    },
    statusMessageTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8
    },
    statusMessage: {
        fontSize: 13,
        color: '#555',
        lineHeight: 18
    },
    
    // Actions Card
    actionsCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8
    },
    actionsContainer: {
        gap: 12,
        alignItems: 'stretch'
    },
    actionBtn: {
        backgroundColor: ORANGE,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        shadowColor: ORANGE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4
    },
    actionBtnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold'
    },
    secondaryBtn: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0'
    },
    secondaryBtnText: {
        color: '#666',
        fontSize: 14,
        fontWeight: '600'
    }
});
