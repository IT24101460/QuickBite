import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS, SIZES } from '../../styles/adminTheme';

const CARDS = [
    { emoji: '🏪', title: 'Canteens', desc: 'Add, edit, delete canteens', screen: 'AdminCanteens', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRPuD46k_zFL6h_1jG7ai3FzvV68QzcMFdpPw&s' },
    { emoji: '🍽️', title: 'Food Items', desc: 'Manage menu items & images', screen: 'AdminFoodItems', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTrputZL2ItlxOH_6FhfLbIgM-H0_FGcFVIYQ&s' },
    { emoji: '📦', title: 'Orders', desc: 'Update order status', screen: 'AdminOrders', image: 'https://www.lhpack.com/uploads/e755ce996.jpg' },
    { emoji: '🎁', title: 'Promotions', desc: 'Create & manage promotions', screen: 'AdminPromotions', image: 'https://static.vecteezy.com/system/resources/previews/048/070/160/non_2x/seafood-restaurant-promotion-poster-design-free-psd.png' },
    { emoji: '👥', title: 'Owners', desc: 'Create and manage owner accounts', screen: 'AdminOwners', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSis9h27SVYwpOyLhpbS5roA_mu75Gh0DkImg&s' },
    { emoji: '🌟', title: 'Feedback', desc: 'Monitor reviews and images', screen: 'AdminFeedback', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRE3kWcnEKd1yqnZzxI2uaeL3yCq7hWut_IDw&s' },
    { emoji: '🖼️', title: 'Branding', desc: 'Upload app logo', screen: 'AdminBranding', image: 'https://static.vecteezy.com/system/resources/thumbnails/010/411/845/small/restaurant-logo-design-template-free-vector.jpg' },
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
                            style={styles.card}
                            onPress={() => navigation.navigate(card.screen)}
                            activeOpacity={0.8}
                        >
                            <ImageBackground source={{ uri: card.image }} style={styles.actionImageBg} imageStyle={{ borderRadius: BORDER_RADIUS.xl }}>
                                <View style={styles.actionOverlay}>
                                    <View style={styles.actionHeaderOverlay}>
                                        <Text style={styles.actionIconOverlay}>{card.emoji}</Text>
                                    </View>
                                    <View style={styles.actionTextContainer}>
                                        <Text style={styles.cardTitle}>{card.title}</Text>
                                        <Text style={styles.cardDesc}>{card.desc}</Text>
                                    </View>
                                </View>
                            </ImageBackground>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        backgroundColor: COLORS.primary,
        paddingTop: 52,
        paddingBottom: SPACING.xl,
        paddingHorizontal: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        ...SHADOWS.lg,
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
    headerTitle: {
        color: COLORS.textWhite,
        fontSize: TYPOGRAPHY.h2.fontSize,
        fontWeight: TYPOGRAPHY.h2.fontWeight
    },
    headerSub: {
        color: 'rgba(255,255,255,0.9)',
        fontSize: TYPOGRAPHY.body2.fontSize,
        marginTop: 2
    },
    scroll: { padding: SPACING.lg },
    welcome: {
        fontSize: TYPOGRAPHY.h1.fontSize,
        fontWeight: TYPOGRAPHY.h1.fontWeight,
        color: COLORS.textPrimary,
        marginBottom: SPACING.xs
    },
    wSub: {
        fontSize: TYPOGRAPHY.body2.fontSize,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xl
    },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.md },
    card: {
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
        padding: SPACING.lg,
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
    cardTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textWhite,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10,
        marginBottom: 2,
    },
    cardDesc: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.85)',
        fontWeight: '500',
    },
});
