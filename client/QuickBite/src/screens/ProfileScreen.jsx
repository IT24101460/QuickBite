import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image, ActivityIndicator
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useAuth } from '../context/AuthContext';

const ORANGE = '#FF6B35';

export default function ProfileScreen({ navigation }) {
    const { user, login: updateUserContext, logout, isAdmin, role } = useAuth();
    const [uploading, setUploading] = useState(false);

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout', style: 'destructive',
                onPress: async () => { await logout(); },
            },
        ]);
    };

    const pickProfilePic = () => {
        launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, async (res) => {
            if (!res.didCancel && res.assets?.length > 0) {
                setUploading(true);
                // Here we would normally upload `res.assets[0]` to the backend via FormData
                // e.g. await API.put('/users/profile-pic', formData);

                // For demonstration, we'll pretend it updated and just alert the user.
                setTimeout(() => {
                    Alert.alert('Success', 'Profile picture updated successfully!');
                    setUploading(false);
                }, 1000);
            }
        });
    };

    const addPaymentOption = () => {
        Alert.alert('Coming Soon', 'Integrating secure payment gateways very soon!');
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
                <Text style={styles.headerTitle}>👤 My Profile</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                {/* Avatar */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={pickProfilePic} style={styles.avatarContainer}>
                        {uploading ? (
                            <View style={styles.avatar}><ActivityIndicator color="#fff" /></View>
                        ) : user?.profilePic ? (
                            <Image source={{ uri: `http://10.0.2.2:3000${user.profilePic}` }} style={styles.avatarImage} />
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

                {/* Saved Payment Methods (Mocked for E-commerce feel) */}
                <View style={styles.card}>
                    <View style={styles.cardTitleRow}>
                        <Text style={styles.cardTitle}>💳 Saved Payment Options</Text>
                        <TouchableOpacity onPress={addPaymentOption}>
                            <Text style={styles.addText}>+ Add</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.payMethod}>
                        <Text style={styles.payIcon}>💳</Text>
                        <View>
                            <Text style={styles.payBank}>BOC Debit Card</Text>
                            <Text style={styles.payNum}>**** **** **** 1234</Text>
                        </View>
                    </TouchableOpacity>
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
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { backgroundColor: ORANGE, paddingTop: 52, paddingBottom: 25, paddingHorizontal: 20 },
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
    payMethod: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1.5, borderColor: '#EEE', borderRadius: 12 },
    payIcon: { fontSize: 26, marginRight: 12 },
    payBank: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    payNum: { fontSize: 12, color: '#888', marginTop: 2 },
    linkRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
    linkText: { fontSize: 15, color: '#444', fontWeight: '500' },
    arrow: { fontSize: 16, color: '#ccc' },
    logoutBtn: { margin: 16, backgroundColor: '#FFF0EE', borderRadius: 14, padding: 15, alignItems: 'center', borderWidth: 1.5, borderColor: '#FFD4C2' },
    logoutText: { color: '#E53935', fontWeight: 'bold', fontSize: 16 },
});
