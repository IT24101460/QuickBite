import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS, SIZES } from '../../styles/adminTheme';

const CARDS = [
    { emoji: '🏪', title: 'Canteens', desc: 'Add, edit, delete canteens', screen: 'AdminCanteens', color: COLORS.primaryUltraLight, iconColor: COLORS.primary },
    { emoji: '🍽️', title: 'Food Items', desc: 'Manage menu items & images', screen: 'AdminFoodItems', color: '#F3E5F5', iconColor: '#9B59B6' },
    { emoji: '📦', title: 'Orders', desc: 'Update order status', screen: 'AdminOrders', color: '#E8F5E9', iconColor: '#27AE60' },
    { emoji: '🎁', title: 'Promotions', desc: 'Create & manage promotions', screen: 'AdminPromotions', color: '#FFF8E1', iconColor: '#F39C12' },
    { emoji: '👥', title: 'Owners', desc: 'Create and manage owner accounts', screen: 'AdminOwners', color: '#E0F7FA', iconColor: '#3498DB' },
    { emoji: '🌟', title: 'Feedback', desc: 'Monitor reviews and images', screen: 'AdminFeedback', color: '#FFF3E0', iconColor: '#E67E22' },
    { emoji: '🖼️', title: 'Branding', desc: 'Upload app logo', screen: 'AdminBranding', color: '#F1F8E9', iconColor: '#27AE60' },
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
        width: '47%', 
        borderRadius: BORDER_RADIUS.xl, 
        padding: SPACING.lg, 
        minHeight: 140,
        ...SHADOWS.md,
        borderWidth: 1,
        borderColor: COLORS.borderLight,
        position: 'relative',
        overflow: 'hidden',
    },
    cardEmoji: { 
        fontSize: 36, 
        marginBottom: SPACING.sm,
        alignSelf: 'center',
    },
    cardTitle: { 
        fontSize: TYPOGRAPHY.body1.fontSize, 
        fontWeight: '600', 
        color: COLORS.textPrimary, 
        marginBottom: SPACING.xs,
        textAlign: 'center'
    },
    cardDesc: { 
        fontSize: TYPOGRAPHY.caption.fontSize, 
        color: COLORS.textSecondary, 
        flex: 1,
        textAlign: 'center',
        lineHeight: 16
    },
    cardArrow: { 
        fontSize: 20, 
        color: COLORS.textTertiary, 
        marginTop: SPACING.sm, 
        alignSelf: 'center',
        fontWeight: 'bold'
    },
});
