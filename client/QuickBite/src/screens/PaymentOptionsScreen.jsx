import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const ORANGE = '#FF6B35';

export default function PaymentOptionsScreen({ navigation }) {
    const { token } = useAuth();
    const [paymentOptions, setPaymentOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadPaymentOptions = useCallback(async (showErrorAlert = false) => {
        try {
            setLoading(true);
            const response = await API.get('/user-payments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPaymentOptions(response.data.paymentOptions || []);
        } catch (error) {
            console.error('Error loading payment options:', error);
            const message = error.response?.data?.message || 'Failed to load payment options';
            if (showErrorAlert) Alert.alert('Error', message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [token]);

    // Load payment options on screen focus
    useFocusEffect(
        useCallback(() => {
            loadPaymentOptions();
        }, [loadPaymentOptions])
    );

    const handleRefresh = () => {
        setRefreshing(true);
        loadPaymentOptions(true);
    };

    const handleSetDefault = (optionId) => {
        Alert.alert(
            'Set as Default',
            'Make this your default payment method?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Set Default',
                    onPress: async () => {
                        try {
                            await API.patch(
                                `/user-payments/${optionId}/set-default`,
                                {},
                                { headers: { Authorization: `Bearer ${token}` } }
                            );
                            Alert.alert('Success', 'Default payment method updated');
                            loadPaymentOptions();
                        } catch (error) {
                            Alert.alert('Error', error.response?.data?.message || 'Failed to set default');
                        }
                    }
                }
            ]
        );
    };

    const handleDelete = (optionId, displayName) => {
        Alert.alert(
            'Delete Payment Option',
            `Are you sure you want to remove ${displayName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await API.delete(`/user-payments/${optionId}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            Alert.alert('Success', 'Payment option removed');
                            loadPaymentOptions();
                        } catch (error) {
                            Alert.alert('Error', error.response?.data?.message || 'Failed to delete');
                        }
                    }
                }
            ]
        );
    };

    const getPaymentIcon = (type) => {
        switch (type) {
            case 'card':
                return '💳';
            case 'wallet':
                return '👝';
            case 'bank_transfer':
                return '🏦';
            case 'mobile_money':
                return '📱';
            default:
                return '💰';
        }
    };

    const getPaymentDisplay = (option) => {
        if (option.paymentType === 'card') {
            return `${option.display?.cardholderName} - ${option.display?.expiryDisplay}`;
        } else if (option.paymentType === 'wallet') {
            return `${option.display?.provider} - ${option.last4}`;
        } else if (option.paymentType === 'bank_transfer') {
            return `${option.display?.bank} - ${option.display?.accountName}`;
        }
        return option.cardholderName || 'Payment Method';
    };

    const renderPaymentOption = (option) => (
        <View key={option._id} style={styles.optionCard}>
            <View style={styles.optionHeader}>
                <View style={styles.optionLeft}>
                    <Text style={styles.optionIcon}>{getPaymentIcon(option.paymentType)}</Text>
                    <View style={styles.optionInfo}>
                        <Text style={styles.optionName}>{getPaymentDisplay(option)}</Text>
                        <Text style={styles.optionType}>
                            {option.paymentType.replace('_', ' ').toUpperCase()}
                        </Text>
                    </View>
                </View>
                {option.isDefault && (
                    <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>DEFAULT</Text>
                    </View>
                )}
            </View>

            <View style={styles.optionActions}>
                {!option.isDefault && (
                    <TouchableOpacity
                        style={[styles.actionBtn, styles.setDefaultBtn]}
                        onPress={() => handleSetDefault(option._id)}
                    >
                        <Text style={styles.actionBtnText}>Set Default</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtn]}
                    onPress={() => handleDelete(option._id, getPaymentDisplay(option))}
                >
                    <Text style={styles.actionBtnText}>🗑️ Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>💳 Payment Options</Text>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={ORANGE} />
                </View>
            ) : (
                <>
                    <ScrollView
                        style={styles.scrollView}
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        showsVerticalScrollIndicator={false}
                    >
                        {paymentOptions.length > 0 ? (
                            <View style={styles.listContainer}>
                                {paymentOptions.map(renderPaymentOption)}
                            </View>
                        ) : (
                            <View style={styles.centerContainer}>
                                <Text style={styles.emptyIcon}>💳</Text>
                                <Text style={styles.emptyTitle}>No Payment Options</Text>
                                <Text style={styles.emptyText}>
                                    You haven't saved any payment methods yet.
                                </Text>
                            </View>
                        )}
                    </ScrollView>

                    {/* Add Button */}
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('AddCard')}
                    >
                        <Text style={styles.addButtonText}>+ Add New Payment Option</Text>
                    </TouchableOpacity>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF7F2' },
    header: { backgroundColor: ORANGE, paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20 },
    backButton: { marginBottom: 12, padding: 8 },
    backButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },

    centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyIcon: { fontSize: 60, marginBottom: 16 },
    emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 8 },
    emptyText: { fontSize: 14, color: '#888', textAlign: 'center', paddingHorizontal: 30 },

    scrollView: { flex: 1 },
    listContainer: { padding: 16, paddingBottom: 100 },

    optionCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: ORANGE
    },
    optionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12
    },
    optionLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    optionIcon: { fontSize: 28, marginRight: 12 },
    optionInfo: { flex: 1 },
    optionName: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 4 },
    optionType: { fontSize: 12, color: '#888' },

    defaultBadge: {
        backgroundColor: '#E8F5E9',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 6
    },
    defaultBadgeText: { fontSize: 10, fontWeight: 'bold', color: '#2E7D32' },

    optionActions: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: 8
    },
    actionBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center'
    },
    setDefaultBtn: { backgroundColor: '#E3F2FD' },
    editBtn: { backgroundColor: '#FFF3E0' },
    deleteBtn: { backgroundColor: '#FFEBEE' },
    actionBtnText: { fontSize: 12, fontWeight: '600', color: '#555' },

    addButton: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        right: 16,
        backgroundColor: ORANGE,
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        elevation: 5
    },
    addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
