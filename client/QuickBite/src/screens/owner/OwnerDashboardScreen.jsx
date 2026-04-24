import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';

const ORANGE = '#FF6B35';

export default function OwnerDashboardScreen({ navigation }) {
    const { user, logout } = useAuth();
    const [liveStats, setLiveStats] = useState({ ordersToday: 0, revenueToday: 0, rating: '5.0' });

    useEffect(() => {
        fetchOverview();
    }, []);

    const fetchOverview = async () => {
        try {
            const res = await API.get('/reports/owner-stats');
            setLiveStats(res.data.stats);
        } catch (e) { }
    }

    const stats = [
        { title: 'Pending Orders', value: liveStats.ordersToday.toString(), icon: '⏳' },
        { title: 'Completed Today', value: '42', icon: '✅' },
        { title: 'Total Revenue', value: `Rs ${liveStats.revenueToday}`, icon: '💰' },
        { title: 'Canteen Rating', value: liveStats.rating.toString(), icon: '⭐' }
    ];

    const actions = [
        { title: 'Manage Menu', icon: '🍔', desc: 'Add or edit foods', route: 'ManageMenu' },
        { title: 'Live Orders', icon: '📝', desc: 'View current queue', route: 'LiveOrders' },
        { title: 'Promotions', icon: '🏷️', desc: 'Manage discounts', route: 'ManagePromotions' },
        { title: 'Canteen Settings', icon: '⚙️', desc: 'Edit details', route: 'OwnerSettings' },
        { title: 'Feedbacks', icon: '🌟', desc: 'View user reviews', route: 'ManageFeedbacks' },
        { title: 'Support Help', icon: '🎧', desc: 'Contact Admin', route: 'ContactAdmin' },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Owner Dashboard</Text>
                    <Text style={styles.headerSub}>Welcome back, {user?.firstName}!</Text>
                </View>
                <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                {/* Stats Row */}
                <Text style={styles.sectionTitle}>Daily Overview</Text>
                <View style={styles.statsRow}>
                    {stats.map((s, i) => (
                        <View key={i} style={styles.statCard}>
                            <Text style={styles.statIcon}>{s.icon}</Text>
                            <Text style={styles.statValue}>{s.value}</Text>
                            <Text style={styles.statTitle}>{s.title}</Text>
                        </View>
                    ))}
                </View>

                {/* Quick Actions Grid */}
                <Text style={styles.sectionTitle}>Canteen Management</Text>
                <View style={styles.actionGrid}>
                    {actions.map((act, i) => (
                        <TouchableOpacity
                            key={i}
                            style={styles.actionCard}
                            onPress={() => navigation.navigate(act.route)}
                        >
                            <View style={styles.actionIconBox}>
                                <Text style={styles.actionIcon}>{act.icon}</Text>
                            </View>
                            <Text style={styles.actionTitle}>{act.title}</Text>
                            <Text style={styles.actionDesc}>{act.desc}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Recent Feedbacks / Alerts */}
                <View style={styles.alertCard}>
                    <Text style={styles.alertIcon}>🌟</Text>
                    <View style={{ flex: 1, paddingLeft: 12 }}>
                        <Text style={styles.alertTitle}>New Feedback Received</Text>
                        <Text style={styles.alertDesc}>"The Chicken Fried Rice was amazing!" - Student</Text>
                    </View>
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { backgroundColor: ORANGE, paddingTop: 50, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    headerSub: { color: '#FFE0D2', fontSize: 14, marginTop: 4 },
    logoutBtn: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
    logoutText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
    scrollContent: { padding: 20, paddingBottom: 40 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 12, marginTop: 10 },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
    statCard: { backgroundColor: '#fff', flex: 1, marginHorizontal: 4, borderRadius: 12, padding: 15, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    statIcon: { fontSize: 24, marginBottom: 8 },
    statValue: { fontSize: 18, fontWeight: 'bold', color: ORANGE },
    statTitle: { fontSize: 11, color: '#888', marginTop: 4, textAlign: 'center' },

    actionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
    actionCard: { backgroundColor: '#fff', width: '48%', borderRadius: 16, padding: 16, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
    actionIconBox: { backgroundColor: '#FFF0E8', width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    actionIcon: { fontSize: 22 },
    actionTitle: { fontSize: 15, fontWeight: 'bold', color: '#222', marginBottom: 4 },
    actionDesc: { fontSize: 12, color: '#888' },

    alertCard: { backgroundColor: '#fff', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 2, borderWidth: 1, borderColor: '#eee' },
    alertIcon: { fontSize: 28 },
    alertTitle: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    alertDesc: { fontSize: 13, color: '#666', marginTop: 2, fontStyle: 'italic' },
});
