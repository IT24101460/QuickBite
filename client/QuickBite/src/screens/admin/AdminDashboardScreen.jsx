import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

const ORANGE = '#FF6B35';

const CARDS = [
    { emoji: '🏪', title: 'Canteens', desc: 'Add, edit, delete canteens', screen: 'AdminCanteens', color: '#E3F2FD' },
    { emoji: '🍽️', title: 'Food Items', desc: 'Manage menu items & images', screen: 'AdminFoodItems', color: '#F3E5F5' },
    { emoji: '📦', title: 'Orders', desc: 'Update order status', screen: 'AdminOrders', color: '#E8F5E9' },
    { emoji: '🎁', title: 'Promotions', desc: 'Create & manage promotions', screen: 'AdminPromotions', color: '#FFF8E1' },
    { emoji: '👥', title: 'Owners', desc: 'Create and manage owner accounts', screen: 'AdminOwners', color: '#E0F7FA' },
];

export default function AdminDashboardScreen({ navigation }) {
    const { logout } = useAuth();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>⚙️ Admin Dashboard</Text>
                    <Text style={styles.headerSub}>QuickBite Management</Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scroll}>
                <Text style={styles.welcome}>Welcome, Admin 👋</Text>
                <Text style={styles.wSub}>Manage your canteen system from here.</Text>

                <View style={styles.grid}>
                    {CARDS.map(card => (
                        <TouchableOpacity
                            key={card.screen}
                            style={[styles.card, { backgroundColor: card.color }]}
                            onPress={() => navigation.navigate(card.screen)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.cardEmoji}>{card.emoji}</Text>
                            <Text style={styles.cardTitle}>{card.title}</Text>
                            <Text style={styles.cardDesc}>{card.desc}</Text>
                            <Text style={styles.cardArrow}>→</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: {
        backgroundColor: ORANGE, paddingTop: 52, paddingBottom: 18,
        paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'
    },
    logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
    headerSub: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
    scroll: { padding: 16 },
    welcome: { fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 4 },
    wSub: { fontSize: 14, color: '#888', marginBottom: 20 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    card: {
        width: '47%', borderRadius: 18, padding: 18, minHeight: 130,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
    },
    cardEmoji: { fontSize: 32, marginBottom: 8 },
    cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 4 },
    cardDesc: { fontSize: 12, color: '#666', flex: 1 },
    cardArrow: { fontSize: 18, color: '#aaa', marginTop: 8, alignSelf: 'flex-end' },
});
