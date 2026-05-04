import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ImageBackground, Alert, RefreshControl } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import API from '../../services/api';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS, SIZES } from '../../styles/adminTheme';
import { getImageUrl } from '../../utils/imageUtils';

export default function OwnerDashboardScreen({ navigation }) {
    const { user, logout } = useAuth();
    const [liveStats, setLiveStats] = useState({ ordersToday: 0, completedToday: 0, revenueToday: 0, rating: '5.0' });
    const [myCanteens, setMyCanteens] = useState([]);
    const [selectedCanteenId, setSelectedCanteenId] = useState(null);
    const [selectedCanteen, setSelectedCanteen] = useState(null);
    const [feedbacks, setFeedbacks] = useState([]);
    const [loadingStats, setLoadingStats] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchMyCanteens = async () => {
        try {
            const res = await API.get('/canteens/my-all');
            setMyCanteens(res.data.canteens || []);
            if (res.data.canteens?.length > 0 && !selectedCanteenId) {
                setSelectedCanteenId(res.data.canteens[0]._id);
                setSelectedCanteen(res.data.canteens[0]);
            }
        } catch (e) { }
    };

    useEffect(() => {
        fetchMyCanteens();
    }, []);

    const fetchCanteenStats = async (canteenId) => {
        if (!canteenId) return;
        setLoadingStats(true);
        try {
            const res = await API.get(`/reports/owner-stats?canteenId=${canteenId}`);
            setLiveStats(res.data.stats || { ordersToday: 0, completedToday: 0, revenueToday: 0, rating: '5.0' });
        } catch (e) {
            setLiveStats({ ordersToday: 0, completedToday: 0, revenueToday: 0, rating: '5.0' });
        } finally {
            setLoadingStats(false);
        }
    };

    const fetchCanteenFeedbacks = async (canteenId) => {
        if (!canteenId) return;
        try {
            const res = await API.get(`/feedback/canteen/${canteenId}`);
            setFeedbacks(res.data.feedback || []);
        } catch (e) {
            setFeedbacks([]);
        }
    };

    // Auto Refresh whenever focusing on this screen
    useFocusEffect(
        useCallback(() => {
            if (selectedCanteenId) {
                fetchCanteenStats(selectedCanteenId);
                fetchCanteenFeedbacks(selectedCanteenId);
            }
        }, [selectedCanteenId])
    );

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchMyCanteens();
        if (selectedCanteenId) {
            await fetchCanteenStats(selectedCanteenId);
            await fetchCanteenFeedbacks(selectedCanteenId);
        }
        setRefreshing(false);
    };

    const handleCanteenSelect = (canteenId) => {
        setSelectedCanteenId(canteenId);
        const canteen = myCanteens.find(c => c._id === canteenId);
        setSelectedCanteen(canteen);
        fetchCanteenStats(canteenId);
        fetchCanteenFeedbacks(canteenId);
    };

    const stats = [
        { title: 'Pending Orders', value: Object.hasOwn(liveStats, 'ordersToday') ? liveStats.ordersToday.toString() : '0', icon: '⏳', bgColor: 'rgba(255,255,255,0.2)', textColor: '#FFFFFF', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsPr0pNHhRGFjDDrDdY6PlulVg142UvU_ZfJ5u7nLmAg&s' },
        { title: 'Completed Today', value: liveStats.completedToday?.toString() || '0', icon: '✅', bgColor: 'rgba(255,255,255,0.2)', textColor: '#FFFFFF', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTP8VzGDhEfv7f0Trrh6xiuoOszrJtOZJh0MQ&s' },
        { title: 'Total Revenue', value: `Rs ${liveStats.revenueToday || 0}`, icon: '💰', bgColor: 'rgba(255,255,255,0.2)', textColor: '#FFFFFF', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWfE82c3tujQa5JNiVQZU8dL9R4g4ExUo7bA&s' },
        { title: 'Canteen Rating', value: liveStats.rating?.toString() || '5.0', icon: '⭐', bgColor: 'rgba(255,255,255,0.2)', textColor: '#FFFFFF', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqS-epGfcIed051yI5YE3t-K5dRqz-XCYuNw&s' }
    ];

    const actions = [
        { title: 'Manage Menu', icon: '🍔', desc: 'Add or edit foods', route: 'ManageMenu', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5Kn7yce3AUsWrzBKIC9o_K3O2Zee-tr74VQ&s' },
        { title: 'Live Orders', icon: '📝', desc: 'View current queue', route: 'LiveOrders', image: 'https://img.freepik.com/free-photo/people-taking-photos-food_23-2149303524.jpg?semt=ais_hybrid&w=740&q=80' },
        { title: 'Promotions', icon: '🏷️', desc: 'Manage discounts', route: 'ManagePromotions', image: 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/restaurant-food-promo-flyer-design-template-1abf712010eeddfec2b2e44edf67a632_screen.jpg?ts=1684734449' },
        { title: 'Canteen Settings', icon: '⚙️', desc: 'Edit details', route: 'OwnerSettings', image: 'https://about.unimelb.edu.au/__data/assets/image/0023/456251/varieties/banner.jpg' },
        { title: 'All Feedbacks', icon: '🌟', desc: 'View user reviews', route: 'ManageFeedbacks', image: 'https://images.ctfassets.net/trvmqu12jq2l/2g8RVwcCttnUxkUYoed6FI/064d0007e6bcaed7bc0b4550318d03f7/blog-hero-1920x678-v74.07.02.jpg' },
        { title: 'Support Help', icon: '🎧', desc: 'Contact Admin', route: 'ContactAdmin', image: 'https://img.freepik.com/free-photo/multiethnic-customer-support-team-work_482257-121935.jpg?semt=ais_hybrid&w=740&q=80' },
    ];

    return (
        <View style={styles.container}>
            {/* Header */}
            <ImageBackground source={require('../../assets/SLIIT KANDY UNI.jpg')} style={styles.headerBg}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Owner Dashboard</Text>
                        <Text style={styles.headerSub}>Welcome back, {user?.firstName}!</Text>
                    </View>
                    <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
                }
            >
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

                {/* Stats Grid 2x2 */}
                <Text style={styles.sectionTitle}>
                    {selectedCanteen ? `${selectedCanteen.canteenName} - Daily Overview` : 'Daily Overview'}
                </Text>

                <View style={styles.statsGrid}>
                    {stats.map((s, i) => (
                        <View key={i} style={styles.statGridCard}>
                            <ImageBackground source={{ uri: s.image }} style={styles.actionImageBg} imageStyle={{ borderRadius: BORDER_RADIUS.lg }}>
                                <View style={styles.statOverlay}>
                                    <View style={styles.statHeaderRow}>
                                        <Text style={styles.statTitleImg}>{s.title}</Text>
                                        <View style={[styles.iconContainer, { backgroundColor: s.bgColor }]}>
                                            <Text style={styles.statIcon}>{s.icon}</Text>
                                        </View>
                                    </View>
                                    <Text style={[styles.statValue, { color: s.textColor }]}>{s.value}</Text>
                                </View>
                            </ImageBackground>
                        </View>
                    ))}
                </View>

                {/* Quick Actions Grid with Images */}
                <Text style={styles.sectionTitle}>Canteen Management</Text>
                <View style={styles.actionGrid}>
                    {actions.map((act, i) => (
                        <TouchableOpacity
                            key={i}
                            style={styles.actionCard}
                            activeOpacity={0.8}
                            onPress={() => {
                                if (!selectedCanteenId) return Alert.alert('Error', 'No canteen assigned to you yet.');
                                navigation.navigate(act.route, { canteenId: selectedCanteenId });
                            }}
                        >
                            <ImageBackground source={{ uri: act.image }} style={styles.actionImageBg} imageStyle={{ borderRadius: BORDER_RADIUS.xl }}>
                                <View style={styles.actionOverlay}>
                                    <View style={styles.actionHeaderOverlay}>
                                        <Text style={styles.actionIconOverlay}>{act.icon}</Text>
                                    </View>
                                    <View style={styles.actionTextContainer}>
                                        <Text style={styles.actionTitleImg}>{act.title}</Text>
                                        <Text style={styles.actionDescImg}>{act.desc}</Text>
                                    </View>
                                </View>
                            </ImageBackground>
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
                                "{feedbacks[0].comment || 'Great service!'}" -{" "}
                                {feedbacks[0].userId?.firstName
                                    ? `${feedbacks[0].userId.firstName}${feedbacks[0].userId.lastName ? ` ${feedbacks[0].userId.lastName}` : ""}`
                                    : "Customer"}
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
    headerBg: {
        width: '100%',
        ...SHADOWS.lg,
    },
    header: {
        backgroundColor: 'rgba(0,0,0,0.65)',
        paddingTop: 52,
        paddingBottom: SPACING.lg,
        paddingHorizontal: SPACING.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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

    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: SPACING.xs
    },
    statGridCard: {
        width: '48%',
        borderRadius: BORDER_RADIUS.lg,
        marginBottom: SPACING.md,
        ...SHADOWS.sm,
        elevation: 3,
        minHeight: 110,
    },
    statOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.55)',
        padding: SPACING.lg,
        borderRadius: BORDER_RADIUS.lg,
        justifyContent: 'space-between',
    },
    statHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: SPACING.md,
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statIcon: { fontSize: 16 },
    statTitleImg: {
        fontSize: 13,
        color: '#E0E0E0',
        fontWeight: '600',
        flex: 1,
        paddingRight: 8,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '900',
    },

    canteensScroll: { marginBottom: SPACING.md },
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
        width: '48%',
        borderRadius: BORDER_RADIUS.xl,
        marginBottom: SPACING.md,
        ...SHADOWS.md,
        minHeight: 140,
        elevation: 3,
    },
    actionImageBg: {
        flex: 1,
        borderRadius: BORDER_RADIUS.xl,
        overflow: 'hidden',
        justifyContent: 'flex-end',
    },
    actionOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: SPACING.md,
        justifyContent: 'space-between',
    },
    actionHeaderOverlay: {
        alignItems: 'flex-end',
    },
    actionIconOverlay: {
        fontSize: 22,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: BORDER_RADIUS.round,
        paddingHorizontal: 8,
        paddingVertical: 5,
        overflow: 'hidden',
    },
    actionTextContainer: {
        marginTop: 'auto',
    },
    actionTitleImg: {
        fontSize: 15,
        fontWeight: 'bold',
        color: COLORS.textWhite,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
        marginBottom: 2,
    },
    actionDescImg: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '500',
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
    ratingText: {
        fontSize: TYPOGRAPHY.caption.fontSize,
        color: COLORS.primary,
        fontWeight: '600',
        marginTop: SPACING.xs,
    },
});
