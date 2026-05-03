import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useBranding } from '../context/BrandingContext';
import { getImageUrl } from '../utils/imageUtils';

const ORANGE = '#e35f2fd2';

export default function TopNavBar({ navigation, search, setSearch, placeholder = "🔍 Search amazing food...", hideBottomRow = false, isHome = false }) {
    const { user } = useAuth();
    const { itemCount, finalTotal } = useCart();
    const { branding } = useBranding();

    const canGoBack = !isHome && navigation.canGoBack ? navigation.canGoBack() : false;

    return (
        <View style={styles.navBar}>
            {/* Top Row: Profile/Back and Cart Pill */}
            <View style={[styles.topRow, setSearch && { marginBottom: 0 }]}>
                <View style={styles.leftSection}>
                    {canGoBack && (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnNav}>
                            <Text style={styles.backArrowNav}>←</Text>
                        </TouchableOpacity>
                    )}
                    <View style={styles.uberGroup}>
                        <TouchableOpacity style={styles.hamburgerBtn} onPress={() => navigation.toggleDrawer?.()}>
                            <Text style={styles.hamburgerIcon}>≡</Text>
                        </TouchableOpacity>
                        {branding?.logoUrl ? (
                            <Image source={{ uri: getImageUrl(branding.logoUrl) }} style={styles.brandLogo} resizeMode="contain" />
                        ) : (
                            <Text style={styles.logoText}>Q<Text style={styles.logoBold}>B</Text></Text>
                        )}
                    </View>
                </View>

                {setSearch && (
                    <View style={styles.centerSearchWrapper}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={styles.centerSearchInput}
                            placeholder="Search..."
                            placeholderTextColor="#888"
                            value={search}
                            onChangeText={setSearch}
                        />
                    </View>
                )}

                <View style={styles.rightSection}>
                    {user ? (
                        <TouchableOpacity
                            style={styles.cartPill}
                            onPress={() => navigation.navigate?.('Cart')}
                        >
                            <Text style={styles.cartPillIcon}>🛒</Text>
                            <Text style={styles.cartPillText}>
                                {itemCount > 0 ? `LKR ${finalTotal.toFixed(2)}` : 'LKR 0.00'}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.authButtonsContainer}>
                            <TouchableOpacity
                                style={styles.signupBtn}
                                onPress={() => navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'SignUp' }],
                                })}
                            >
                                <Text style={styles.signupBtnText}>Sign Up</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.loginBtn}
                                onPress={() => navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'Login' }],
                                })}
                            >
                                <Text style={styles.loginBtnText}>Login</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>

            {/* Bottom Row: Contextual Search / Title */}
            {(!hideBottomRow && !setSearch) && (
                <View style={styles.bottomRow}>
                    <View style={styles.titleWrapper}>
                        <Text style={styles.navTitleText} numberOfLines={1}>{placeholder}</Text>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    navBar: {
        position: 'absolute',
        top: 0,
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.85)', // Apple-style translucent background
        paddingTop: 25,
        paddingBottom: 15,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.05)',
        zIndex: 100,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtnNav: { marginRight: 15, paddingVertical: 4 },
    backArrowNav: { color: '#333', fontSize: 26, fontWeight: 'bold' },

    uberGroup: { flexDirection: 'row', alignItems: 'center' },
    hamburgerBtn: { marginRight: 15, paddingVertical: 4 },
    hamburgerIcon: { fontSize: 32, color: '#000', lineHeight: 36, fontWeight: '400' },
    logoText: { fontSize: 20, color: '#000', letterSpacing: -0.5 },
    logoBold: { fontWeight: 'bold', color: ORANGE },
    brandLogo: { width: 34, height: 34 },

    centerSearchWrapper: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F2',
        borderRadius: 20,
        marginHorizontal: 10,
        paddingHorizontal: 12,
        height: 38,
        maxWidth: 150,
    },
    centerSearchInput: {
        flex: 1, fontSize: 13, color: '#333', height: '100%', paddingVertical: 0
    },

    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cartPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderWidth: 1,
        borderColor: '#E8E8E8'
    },
    cartPillIcon: { fontSize: 16, marginRight: 6 },
    cartPillText: { fontSize: 14, fontWeight: 'bold', color: '#333' },

    authButtonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    signupBtn: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: ORANGE,
        backgroundColor: '#fff',
    },
    signupBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: ORANGE,
    },
    loginBtn: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 8,
        backgroundColor: ORANGE,
    },
    loginBtnText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#fff',
    },

    bottomRow: {
        width: '100%',
    },
    searchWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F2F2F2',
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 44,
    },
    navSearchInput: {
        flex: 1, fontSize: 15, color: '#333', height: '100%', fontWeight: '500'
    },
    titleWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 5,
        paddingBottom: 10,
    },
    navTitleText: {
        fontSize: 20, color: '#222', fontWeight: 'bold', letterSpacing: 0.3
    },
    searchIcon: {
        fontSize: 13,
        marginRight: 6,
    },
});
