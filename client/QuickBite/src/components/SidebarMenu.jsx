import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

const ORANGE = '#FF6B35';

export default function SidebarMenu({ navigation }) {
    const { user, logout } = useAuth();
    const [showPaymentOptions, setShowPaymentOptions] = useState(false);
    const [savedCards, setSavedCards] = useState([]);

    const menuItems = [
        { title: 'Profile', icon: '👤', route: 'Profile' },
        { title: 'Payment Options', icon: '💳', isAccordion: true },
        { title: 'Settings', icon: '⚙️', route: 'Settings' },
        { title: 'Orders', icon: '📦', route: 'Orders' },
    ];

    const handleNavigation = (route) => {
        navigation.closeDrawer();
        if (!user && route !== 'Home') {
            return navigation.navigate('Login');
        }
        navigation.navigate('HomeContainer', { screen: route });
    };

    const togglePaymentOptions = async () => {
        const nextState = !showPaymentOptions;
        setShowPaymentOptions(nextState);
        if (nextState) {
            try {
                const existing = await AsyncStorage.getItem('@saved_cards');
                if (existing) {
                    setSavedCards(JSON.parse(existing));
                }
            } catch (e) { console.error(e); }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.userIcon}>
                    {(user?.image || user?.profilePic) ? (
                        <Image source={{ uri: (user?.image || user?.profilePic).startsWith('http') ? (user?.image || user?.profilePic) : `http://10.0.2.2:3000${user?.image || user?.profilePic}` }} style={styles.avatar} />
                    ) : (
                        <Text style={{ fontSize: 32 }}>👤</Text>
                    )}
                </View>
                <Text style={styles.userName}>{user?.firstName || 'User'} {user?.lastName}</Text>
                <Text style={styles.userEmail}>{user?.email}</Text>
            </View>

            <View style={styles.menuContainer}>
                {menuItems.map((item, index) => (
                    <View key={index}>
                        <TouchableOpacity 
                            style={styles.menuItem} 
                            onPress={() => item.isAccordion ? togglePaymentOptions() : handleNavigation(item.route)}
                        >
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Text style={styles.menuIcon}>{item.icon}</Text>
                                <Text style={styles.menuText}>{item.title}</Text>
                            </View>
                            {item.isAccordion && (
                                <Text style={styles.accordionArrow}>{showPaymentOptions ? '▲' : '▼'}</Text>
                            )}
                        </TouchableOpacity>
                        
                        {item.isAccordion && showPaymentOptions && (
                            <View>
                                {savedCards.map((card, idx) => (
                                    <TouchableOpacity 
                                        key={`card-${idx}`}
                                        style={styles.subMenuItem} 
                                        onPress={() => {}}
                                    >
                                        <Text style={styles.subMenuIcon}>
                                            {card.type === 'Visa' ? '💳' : card.type === 'Mastercard' ? '🔴🟡' : card.type === 'Amex' ? '💠' : '💳'}
                                        </Text>
                                        <Text style={styles.subMenuText}>{card.type} •••• {card.last4}</Text>
                                    </TouchableOpacity>
                                ))}
                                <TouchableOpacity 
                                    style={styles.subMenuItem} 
                                    onPress={() => handleNavigation('AddCard')}
                                >
                                    <Text style={styles.subMenuIcon}>➕</Text>
                                    <Text style={styles.subMenuText}>Add New Card</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                ))}
            </View>

            <View style={styles.footer}>
                {user ? (
                    <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
                        <Text style={styles.logoutIcon}>🚪</Text>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity style={styles.logoutBtn} onPress={() => { navigation.closeDrawer(); navigation.navigate('Login'); }}>
                        <Text style={styles.logoutIcon}>🔑</Text>
                        <Text style={styles.logoutText}>Sign In / Register</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { 
        backgroundColor: ORANGE, 
        paddingTop: 60, 
        paddingBottom: 30, 
        paddingHorizontal: 20,
        borderBottomRightRadius: 30,
    },
    userIcon: { 
        width: 70, height: 70, 
        borderRadius: 35, 
        backgroundColor: '#fff', 
        justifyContent: 'center', alignItems: 'center', 
        marginBottom: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    avatar: { width: 70, height: 70, borderRadius: 35 },
    userName: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
    userEmail: { fontSize: 14, color: '#FFE0D6' },
    
    menuContainer: { flex: 1, paddingTop: 20 },
    menuItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        paddingVertical: 18, 
        paddingHorizontal: 25,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    menuIcon: { fontSize: 22, marginRight: 20 },
    menuText: { fontSize: 16, fontWeight: '600', color: '#333' },
    accordionArrow: { fontSize: 12, color: '#aaa' },
    
    subMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingLeft: 65,
        paddingRight: 25,
        backgroundColor: '#FCFCFC',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    subMenuIcon: { fontSize: 16, marginRight: 15 },
    subMenuText: { fontSize: 14, fontWeight: '500', color: '#555' },
    
    footer: { 
        padding: 25, 
        borderTopWidth: 1, 
        borderTopColor: '#eee',
        backgroundColor: '#F8F9FA'
    },
    logoutBtn: { flexDirection: 'row', alignItems: 'center' },
    logoutIcon: { fontSize: 20, marginRight: 15 },
    logoutText: { fontSize: 16, fontWeight: 'bold', color: '#E53935' },
});
