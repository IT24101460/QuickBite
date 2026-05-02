import React, { useState, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image, ActivityIndicator, Modal, TextInput
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getImageUrl } from '../utils/imageUtils';

const ORANGE = '#FF6B35';

export default function ProfileScreen({ navigation }) {
    const { user, login: updateUserContext, logout, isAdmin, role, token } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [savedCards, setSavedCards] = useState([]);
    const [paymentOptions, setPaymentOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [editingOption, setEditingOption] = useState(null);
    const [cardholderName, setCardholderName] = useState('');

    useFocusEffect(
        useCallback(() => {
            const loadCards = async () => {
                try {
                    const existingCards = await AsyncStorage.getItem('@saved_cards');
                    if (existingCards) {
                        setSavedCards(JSON.parse(existingCards));
                    }
                } catch (e) {
                    console.error("Failed to load cards", e);
                }
            };
            loadCards();
            loadPaymentOptions();
        }, [])
    );

    const loadPaymentOptions = async () => {
        try {
            setLoading(true);
            const response = await API.get('/user-payments', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPaymentOptions(response.data.paymentOptions || []);
        } catch (error) {
            console.error('Error loading payment options:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout', style: 'destructive',
                onPress: async () => {
                    // Clear saved cards from AsyncStorage
                    await AsyncStorage.removeItem('@saved_cards');
                    // Clear saved cards from state
                    setSavedCards([]);
                    setPaymentOptions([]);
                    // Call logout
                    await logout();
                },
            },
        ]);
    };

    const handleEdit = (option) => {
        setEditingOption(option);
        setCardholderName(option.cardholderName);
        setEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!cardholderName.trim()) {
            return Alert.alert('Error', 'Cardholder name cannot be empty');
        }

        try {
            await API.patch(
                `/user-payments/${editingOption._id}`,
                { cardholderName: cardholderName.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            Alert.alert('Success', 'Payment option updated');
            setEditModal(false);
            loadPaymentOptions();
        } catch (error) {
            Alert.alert('Error', error.response?.data?.message || 'Failed to update');
        }
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

    const pickProfilePic = () => {
        launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, async (res) => {
            if (!res.didCancel && res.assets?.length > 0) {
                setUploading(true);
                try {
                    const asset = res.assets[0];
                    const formData = new FormData();
                    formData.append('image', {
                        uri: asset.uri,
                        type: asset.type || 'image/jpeg',
                        name: asset.fileName || 'profile.jpg',
                    });

                    const response = await API.put(`/users/${user._id}/profile-pic`, formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                    });

                    const newImageUrl = response.data.image;
                    // Update global state and async storage so it persists
                    await updateUserContext(token, { ...user, image: newImageUrl, profilePic: newImageUrl });
                    
                    Alert.alert('Success', 'Profile picture updated successfully!');
                } catch (error) {
                    console.error('Upload Error:', error.response?.data || error);
                    const backendError = error.response?.data?.error || error.response?.data?.message || error.message;
                    Alert.alert('Upload Failed', `Could not upload picture.\n\nReason: ${backendError}`);
                } finally {
                    setUploading(false);
                }
            }
        });
    };

    const addPaymentOption = () => {
        navigation.navigate('AddCard');
    }

    const InfoRow = ({ label, value }) => (
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{label}</Text>
            <Text style={styles.infoValue}>{value || '—'}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.openDrawer()}
                >
                    <Text style={styles.backButtonText}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>👤 My Profile</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                {/* Avatar */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={pickProfilePic} style={styles.avatarContainer}>
                        {uploading ? (
                            <View style={styles.avatar}><ActivityIndicator color="#fff" /></View>
                        ) : (user?.image || user?.profilePic) ? (
                            <Image source={{ uri: getImageUrl(user?.image || user?.profilePic) }} style={styles.avatarImage} />
                        ) : (
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{user?.firstName?.[0]?.toUpperCase() || '👤'}</Text>
                            </View>
                        )}
                        <View style={styles.editBadge}><Text style={styles.editBadgeIcon}>✏️</Text></View>
                    </TouchableOpacity>

                    <Text style={styles.name}>{user?.firstName || 'Guest'} {user?.lastName}</Text>
                    {isAdmin && <View style={styles.adminBadge}><Text style={styles.adminBadgeText}>⚙️ Super Admin</Text></View>}
                    {role === 'owner' && <View style={styles.adminBadge}><Text style={styles.adminBadgeText}>🏪 Canteen Owner</Text></View>}
                </View>

                {/* Info */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Account Info</Text>
                    <InfoRow label="Email" value={user?.email} />
                    <InfoRow label="Mobile Number" value={user?.phoneNumber?.toString()} />
                </View>

                {/* Saved Payment Methods */}
                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Text style={styles.cardTitle}>💳 Saved Payment Options</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('AddCard')}>
                            <Text style={styles.addText}>+ Add →</Text>
                        </TouchableOpacity>
                    </View>
                    {loading ? (
                        <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                            <ActivityIndicator size="small" color={ORANGE} />
                        </View>
                    ) : paymentOptions.length > 0 ? (
                        <>
                            {paymentOptions.slice(0, 3).map((option) => {
                                const displayName = option.paymentType === 'card' 
                                    ? `${option.cardholderName} - •••• ${option.last4}`
                                    : option.paymentType === 'wallet'
                                    ? `${option.walletProvider || 'Wallet'} - ${option.last4}`
                                    : option.paymentType === 'bank_transfer'
                                    ? `${option.bankName || 'Bank'} - ${option.last4}`
                                    : option.cardholderName;

                                return (
                                    <View key={option._id} style={styles.payMethod}>
                                        <View style={styles.paymentInfo}>
                                            <Text style={styles.payBank}>{displayName}</Text>
                                            <Text style={styles.payType}>
                                                {option.paymentType.replace('_', ' ').toUpperCase()}
                                                {option.isDefault && ' • DEFAULT'}
                                            </Text>
                                        </View>
                                        <View style={styles.paymentActions}>
                                            <TouchableOpacity
                                                style={[styles.miniBtn, styles.editMiniBtn]}
                                                onPress={() => handleEdit(option)}
                                            >
                                                <Text style={styles.miniBtnText}>✏️</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={[styles.miniBtn, styles.deleteMiniBtn]}
                                                onPress={() => handleDelete(option._id, displayName)}
                                            >
                                                <Text style={styles.miniBtnText}>🗑️</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })}
                            {paymentOptions.length > 3 && (
                                <TouchableOpacity onPress={() => navigation.navigate('PaymentOptions')}>
                                    <Text style={styles.viewMoreText}>
                                        +{paymentOptions.length - 3} more • View All →
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </>
                    ) : (
                        <Text style={styles.noPaymentText}>No payment options saved yet.</Text>
                    )}
                </View>

                {/* Admin/Owner Sections */}
                {(isAdmin || role === 'owner') && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>{isAdmin ? '⚙️ Admin Panel' : '🏪 Owner Tools'}</Text>

                        {isAdmin && [
                            { label: '🏪 Manage All Canteens', screen: 'AdminCanteens' },
                            { label: '🍽️ Approve/Manage Food Items', screen: 'AdminFoodItems' },
                            { label: '📦 System Order Logs', screen: 'AdminOrders' },
                            { label: '🎁 Manage Promotions', screen: 'AdminPromotions' },
                        ].map(item => (
                            <TouchableOpacity key={item.screen} style={styles.linkRow} onPress={() => navigation.navigate(item.screen)}>
                                <Text style={styles.linkText}>{item.label}</Text>
                                <Text style={styles.arrow}>→</Text>
                            </TouchableOpacity>
                        ))}

                        {role === 'owner' && [
                            { label: '📦 Incoming Orders', screen: 'OwnerOrdersScreen' },
                            { label: '🍽️ Manage My Menu', screen: 'OwnerMenuScreen' },
                            { label: '⭐ View Feedback', screen: 'OwnerFeedbackScreen' }
                        ].map(item => (
                            <TouchableOpacity key={item.screen} style={styles.linkRow} onPress={() => Alert.alert('Navigate', `To ${item.screen}`)}>
                                <Text style={styles.linkText}>{item.label}</Text>
                                <Text style={styles.arrow}>→</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>🚪 Logout</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Edit Modal */}
            <Modal
                visible={editModal}
                transparent
                animationType="fade"
                onRequestClose={() => setEditModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Payment Option</Text>

                        <View style={styles.modalForm}>
                            <Text style={styles.modalLabel}>Cardholder Name</Text>
                            <TextInput
                                style={styles.modalInput}
                                placeholder="Enter name"
                                placeholderTextColor="#aaa"
                                value={cardholderName}
                                onChangeText={setCardholderName}
                            />
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.cancelBtn]}
                                onPress={() => setEditModal(false)}
                            >
                                <Text style={styles.modalBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.saveBtn]}
                                onPress={handleSaveEdit}
                            >
                                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { backgroundColor: ORANGE, paddingTop: 52, paddingBottom: 25, paddingHorizontal: 20 },
    backButton: { marginBottom: 12, padding: 8 },
    backButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    avatarSection: { alignItems: 'center', paddingVertical: 25, marginTop: -20, backgroundColor: '#fff', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, elevation: 3, marginBottom: 15 },
    avatarContainer: { position: 'relative', marginBottom: 12 },
    avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: ORANGE, justifyContent: 'center', alignItems: 'center' },
    avatarImage: { width: 90, height: 90, borderRadius: 45 },
    avatarText: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
    editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#fff', borderRadius: 15, padding: 5, elevation: 5 },
    editBadgeIcon: { fontSize: 14 },
    name: { fontSize: 22, fontWeight: 'bold', color: '#222' },
    adminBadge: { backgroundColor: '#FFF0EE', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4, marginTop: 8 },
    adminBadgeText: { color: ORANGE, fontWeight: '700', fontSize: 13 },
    card: { backgroundColor: '#fff', margin: 15, marginTop: 0, marginBottom: 15, borderRadius: 16, padding: 18, elevation: 2 },
    cardTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    cardTitle: { fontSize: 14, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
    addText: { color: ORANGE, fontWeight: 'bold', fontSize: 13 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
    infoLabel: { fontSize: 14, color: '#888' },
    infoValue: { fontSize: 14, fontWeight: '600', color: '#333' },
    payMethod: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1.5, borderColor: '#EEE', borderRadius: 12, marginBottom: 10, justifyContent: 'space-between' },
    payIcon: { fontSize: 26, marginRight: 12 },
    payBank: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    payNum: { fontSize: 12, color: '#888', marginTop: 2 },
    paymentInfo: { flex: 1 },
    paymentActions: { flexDirection: 'row', gap: 8 },
    miniBtn: { width: 32, height: 32, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    editMiniBtn: { backgroundColor: '#FFF3E0' },
    deleteMiniBtn: { backgroundColor: '#FFEBEE' },
    miniBtnText: { fontSize: 14 },
    payType: { fontSize: 11, color: '#888', marginTop: 2 },
    linkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
    linkText: { fontSize: 15, color: '#444', fontWeight: '500' },
    arrow: { fontSize: 16, color: '#ccc' },
    logoutBtn: { margin: 16, backgroundColor: '#FFF0EE', borderRadius: 14, padding: 15, alignItems: 'center', borderWidth: 1.5, borderColor: '#FFD4C2' },
    logoutText: { color: '#E53935', fontWeight: 'bold', fontSize: 16 },

    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '85%',
        elevation: 10
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 20 },
    modalForm: { marginBottom: 20 },
    modalLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8 },
    modalInput: {
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
        color: '#333',
        borderWidth: 1,
        borderColor: '#e0e0e0'
    },
    modalButtons: { flexDirection: 'row', gap: 12, justifyContent: 'flex-end' },
    modalBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
    cancelBtn: { backgroundColor: '#e0e0e0' },
    saveBtn: { backgroundColor: ORANGE },
    modalBtnText: { fontSize: 14, fontWeight: '600', color: '#333' },
    viewMoreText: { color: ORANGE, fontSize: 12, fontWeight: '600', marginTop: 8 },
    noPaymentText: { color: '#888', fontSize: 13, fontStyle: 'italic', marginTop: 5, marginBottom: 5 }
});
