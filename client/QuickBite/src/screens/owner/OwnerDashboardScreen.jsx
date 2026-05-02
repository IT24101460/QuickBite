import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS, SIZES } from '../../styles/adminTheme';
import { getImageUrl } from '../../utils/imageUtils';

export default function OwnerDashboardScreen({ navigation }) {
    const { user, logout } = useAuth();
    const [liveStats, setLiveStats] = useState({ ordersToday: 0, revenueToday: 0, rating: '5.0' });
    const [myCanteens, setMyCanteens] = useState([]);
    const [selectedCanteenId, setSelectedCanteenId] = useState(null);
    const [selectedCanteen, setSelectedCanteen] = useState(null);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loadingStats, setLoadingStats] = useState(false);

    useEffect(() => {
        fetchMyCanteens();
    }, []);

    const fetchMyCanteens = async () => {
        try {
            const res = await API.get('/canteens/my-all');
            setMyCanteens(res.data.canteens || []);
            if (res.data.canteens?.length > 0) {
                setSelectedCanteenId(res.data.canteens[0]._id);
                setSelectedCanteen(res.data.canteens[0]);
            }
        } catch (e) { }
    };

    const fetchCanteenStats = async (canteenId) => {
        if (!canteenId) return;
        setLoadingStats(true);
        try {
            const res = await API.get(`/reports/canteen-stats/${canteenId}`);
            setLiveStats(res.data.stats || { ordersToday: 0, revenueToday: 0, rating: '5.0' });
        } catch (e) {
            // Fallback to default stats if API fails
            setLiveStats({ ordersToday: 0, revenueToday: 0, rating: '5.0' });
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchCanteenFeedbacks = async (canteenId) => {
        if (!canteenId) return;
        try {
            const res = await API.get(`/feedbacks/canteen/${canteenId}`);
            setFeedbacks(res.data.feedbacks || []);
        } catch (e) {
            setFeedbacks([]);
        }
    };

    const handleCanteenSelect = (canteenId) => {
        setSelectedCanteenId(canteenId);
        const canteen = myCanteens.find(c => c._id === canteenId);
        setSelectedCanteen(canteen);
        fetchCanteenStats(canteenId);
        fetchCanteenFeedbacks(canteenId);
    };

    useEffect(() => {
        if (selectedCanteenId) {
            fetchCanteenStats(selectedCanteenId);
            fetchCanteenFeedbacks(selectedCanteenId);
        }
    }, [selectedCanteenId]);

    const stats = [
        { title: 'Pending Orders', value: liveStats.ordersToday.toString(), icon: '⏳' },
        { title: 'Completed Today', value: liveStats.completedToday?.toString() || '0', icon: '✅' },
        { title: 'Total Revenue', value: `Rs ${liveStats.revenueToday}`, icon: '💰' },
        { title: 'Canteen Rating', value: liveStats.rating?.toString() || '5.0', icon: '⭐' }
    ];

    const actions = [
        { title: 'Manage Menu', icon: '🍔', desc: 'Add or edit foods', route: 'ManageMenu' },
        { title: 'Live Orders', icon: '📝', desc: 'View current queue', route: 'LiveOrders' },
        { title: 'Promotions', icon: '🏷️', desc: 'Manage discounts', route: 'ManagePromotions' },
        { title: 'Canteen Settings', icon: '⚙️', desc: 'Edit details', route: 'OwnerSettings' },
        { title: 'All Feedbacks', icon: '🌟', desc: 'View user reviews', route: 'ManageFeedbacks' },
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

                {/* My Canteens */}
                <Text style={styles.sectionTitle}>Your Assigned Canteens</Text>
                {myCanteens.length === 0 ? (
                    <View style={styles.alertCard}>
                        <Text style={styles.alertIcon}>🏪</Text>
                        <View style={{ flex: 1, paddingLeft: 12 }}>
                            <Text style={styles.alertTitle}>No Canteens Assigned</Text>
                            <Text style={styles.alertDesc}>Please contact the admin to link a canteen to your account.</Text>
                        </View>
                    </View>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.canteensScroll}>
                        {myCanteens.map(c => (
                            <TouchableOpacity 
                                key={c._id} 
                                style={[styles.canteenCard, selectedCanteenId === c._id && styles.canteenCardSelected]}
                                onPress={() => handleCanteenSelect(c._id)}
                            >
                                <View style={styles.canteenImageContainer}>
                                    {c.canteenImage ? (
                                        <Image source={{ uri: getImageUrl(c.canteenImage) }} style={styles.canteenImage} resizeMode="cover" />
                                    ) : (
                                        <View style={styles.canteenImagePlaceholder}>
                                            <Text style={styles.canteenIcon}>🏪</Text>
                                        </View>
                                    )}
                                </View>
                                <Text style={[styles.canteenName, selectedCanteenId === c._id && styles.canteenNameSelected]}>{c.canteenName}</Text>
                                <Text style={styles.canteenLoc}>{c.location}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}

                {/* Stats Row */}
                <Text style={styles.sectionTitle}>
                    {selectedCanteen ? `${selectedCanteen.canteenName} - Daily Overview` : 'Daily Overview'}
                </Text>
                {loadingStats ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Loading stats...</Text>
                    </View>
                ) : (
                    <View style={styles.statsRow}>
                        {stats.map((s, i) => (
                            <View key={i} style={styles.statCard}>
                                <Text style={styles.statIcon}>{s.icon}</Text>
                                <Text style={styles.statValue}>{s.value}</Text>
                                <Text style={styles.statTitle}>{s.title}</Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Quick Actions Grid */}
                <Text style={styles.sectionTitle}>Canteen Management</Text>
                <View style={styles.actionGrid}>
                    {actions.map((act, i) => (
                        <TouchableOpacity
                            key={i}
                            style={styles.actionCard}
                            onPress={() => {
                                if (!selectedCanteenId) return Alert.alert('Error', 'No canteen assigned to you yet.');
                                navigation.navigate(act.route, { canteenId: selectedCanteenId });
                            }}
                        >
                            <View style={styles.actionIconBox}>
                                <Text style={styles.actionIcon}>{act.icon}</Text>
                            </View>
                            <Text style={styles.actionTitle}>{act.title}</Text>
                            <Text style={styles.actionDesc}>{act.desc}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Feedback Alert */}
                {selectedCanteen && feedbacks.length > 0 ? (
                    <View style={styles.alertCard}>
                        <Text style={styles.alertIcon}>🌟</Text>
                        <View style={{ flex: 1, paddingLeft: 12 }}>
                            <Text style={styles.alertTitle}>Latest Feedback for {selectedCanteen.canteenName}</Text>
                            <Text style={styles.alertDesc}>
                                "{feedbacks[0].comment || 'Great service!'}" - {feedbacks[0].studentName || 'Student'}
                            </Text>
                            <Text style={styles.ratingText}>⭐ {feedbacks[0].rating || '5.0'}/5.0</Text>
                        </View>
                    </View>
                ) : selectedCanteen ? (
                    <View style={styles.alertCard}>
                        <Text style={styles.alertIcon}>📝</Text>
                        <View style={{ flex: 1, paddingLeft: 12 }}>
                            <Text style={styles.alertTitle}>No Feedback Yet</Text>
                            <Text style={styles.alertDesc}>No feedback received for {selectedCanteen.canteenName}</Text>
                        </View>
                    </View>
                ) : null}

            </ScrollView>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        ...SHADOWS.lg,
    },
    headerTitle: { 
        color: COLORS.textWhite, 
        fontSize: TYPOGRAPHY.h2.fontSize, 
        fontWeight: TYPOGRAPHY.h2.fontWeight 
    },
    headerSub: { 
        color: 'rgba(255,255,255,0.9)', 
        fontSize: TYPOGRAPHY.body2.fontSize,
        marginTop: SPACING.xs
    },
    logoutBtn: { 
        backgroundColor: 'rgba(255,255,255,0.2)', 
        paddingHorizontal: SPACING.md, 
        paddingVertical: SPACING.sm, 
        borderRadius: BORDER_RADIUS.md 
    },
    logoutText: { 
        color: COLORS.textWhite, 
        fontWeight: TYPOGRAPHY.button.fontWeight, 
        fontSize: TYPOGRAPHY.caption.fontSize 
    },
    scrollContent: { padding: SPACING.lg, paddingBottom: SPACING.xl },
    sectionTitle: { 
        fontSize: TYPOGRAPHY.h3.fontSize, 
        fontWeight: TYPOGRAPHY.h3.fontWeight, 
        color: COLORS.textPrimary, 
        marginBottom: SPACING.md, 
        marginTop: SPACING.lg 
    },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.xl },
    statCard: { 
        backgroundColor: COLORS.surface, 
        flex: 1, 
        marginHorizontal: SPACING.xs, 
        borderRadius: BORDER_RADIUS.lg, 
        padding: SPACING.lg, 
        alignItems: 'center', 
        ...SHADOWS.md,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    statIcon: { fontSize: 28, marginBottom: SPACING.sm },
    statValue: { 
        fontSize: TYPOGRAPHY.h3.fontSize, 
        fontWeight: 'bold', 
        color: COLORS.primary 
    },
    statTitle: { 
        fontSize: TYPOGRAPHY.caption.fontSize, 
        color: COLORS.textSecondary, 
        marginTop: SPACING.xs, 
        textAlign: 'center' 
    },

    canteensScroll: { marginBottom: SPACING.lg },
    canteenCard: { 
        backgroundColor: COLORS.surface, 
        padding: SPACING.md, 
        borderRadius: BORDER_RADIUS.lg, 
        marginRight: SPACING.md, 
        width: 140, 
        alignItems: 'center', 
        borderWidth: 2, 
        borderColor: 'transparent', 
        ...SHADOWS.sm,
        minHeight: 140,
        justifyContent: 'center'
    },
    canteenCardSelected: { 
        borderColor: COLORS.primary, 
        backgroundColor: COLORS.primaryUltraLight 
    },
    canteenImageContainer: {
        width: 60,
        height: 60,
        borderRadius: BORDER_RADIUS.md,
        overflow: 'hidden',
        marginBottom: SPACING.sm,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
    },
    canteenImage: {
        width: '100%',
        height: '100%',
    },
    canteenImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.primaryUltraLight,
        justifyContent: 'center',
        alignItems: 'center',
    },
    canteenIcon: { fontSize: 24 },
    canteenName: { 
        fontSize: TYPOGRAPHY.caption.fontSize, 
        fontWeight: '600', 
        color: COLORS.textPrimary, 
        textAlign: 'center' 
    },
    canteenNameSelected: { color: COLORS.primary },
    canteenLoc: { 
        fontSize: TYPOGRAPHY.caption.fontSize, 
        color: COLORS.textSecondary, 
        textAlign: 'center', 
        marginTop: SPACING.xs 
    },

    actionGrid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between', 
        marginBottom: SPACING.lg 
    },
    actionCard: { 
        backgroundColor: COLORS.surface, 
        width: '48%', 
        borderRadius: BORDER_RADIUS.xl, 
        padding: SPACING.lg, 
        marginBottom: SPACING.md, 
        ...SHADOWS.md,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        minHeight: 120,
    },
    actionIconBox: { 
        backgroundColor: COLORS.primaryUltraLight, 
        width: 50, 
        height: 50, 
        borderRadius: BORDER_RADIUS.lg, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: SPACING.md 
    },
    actionIcon: { fontSize: 24 },
    actionTitle: { 
        fontSize: TYPOGRAPHY.body2.fontSize, 
        fontWeight: '600', 
        color: COLORS.textPrimary, 
        marginBottom: SPACING.xs 
    },
    actionDesc: { 
        fontSize: TYPOGRAPHY.caption.fontSize, 
        color: COLORS.textSecondary 
    },

    alertCard: { 
        backgroundColor: COLORS.surface, 
        padding: SPACING.lg, 
        borderRadius: BORDER_RADIUS.lg, 
        flexDirection: 'row', 
        alignItems: 'center', 
        ...SHADOWS.md, 
        borderWidth: 1, 
        borderColor: COLORS.borderLight 
    },
    alertIcon: { fontSize: 28 },
    alertTitle: { 
        fontSize: TYPOGRAPHY.body2.fontSize, 
        fontWeight: '600', 
        color: COLORS.textPrimary 
    },
    alertDesc: { 
        fontSize: TYPOGRAPHY.caption.fontSize, 
        color: COLORS.textSecondary, 
        marginTop: SPACING.xs, 
        fontStyle: 'italic' 
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: SPACING.lg,
    },
    loadingText: {
        fontSize: TYPOGRAPHY.body2.fontSize,
        color: COLORS.textSecondary,
    },
    ratingText: {
        fontSize: TYPOGRAPHY.caption.fontSize,
        color: COLORS.primary,
        fontWeight: '600',
        marginTop: SPACING.xs,
    },
});
