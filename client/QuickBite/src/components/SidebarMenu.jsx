import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated, Dimensions, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUtils';
import { COLORS } from '../styles/adminTheme';

const ORANGE = COLORS.primary;
const { width, height } = Dimensions.get('window');

// Food images for animated background - copied from login/signup screens
const FOOD_ITEMS = [
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&q=80',// burger
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&q=80', // pizza
  'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=200&q=80', // noodles
  'https://images.unsplash.com/photo-1553621042-f6e147245754?w=200&q=80', // sushi
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&q=80', // salad
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=200&q=80', // fried rice
  'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?w=200&q=80', // sandwich
  'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=200&q=80', // dessert
  'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=200&q=80', // curry
  'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=200&q=80', // steak
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=200&q=80', // eggs
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=200&q=80', // pancakes
  'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=200&q=80', // ice cream
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80',  // bowl
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200&q=80', // food spread
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&q=80', // fried chicken
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&q=80', // fresh salad
  'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=200&q=80', // pasta
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&q=80', // restaurant food
  'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=200&q=80', // healthy bowl
  'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=200&q=80', // asian food
  'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=200&q=80', // tacos
  'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=200&q=80', // french toast
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=200&q=80', // soup
];

const TILE_SIZE = 65;
const COLS = Math.ceil(width / (TILE_SIZE + 6)) + 1;
const ROWS = 3;

function buildGrid() {
  const tiles = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      tiles.push({
        id: `${row}-${col}`,
        image: FOOD_ITEMS[Math.floor(Math.random() * FOOD_ITEMS.length)],
        row,
        col,
      });
    }
  }
  return tiles;
}

export default function SidebarMenu({ navigation }) {
    const { user, logout } = useAuth();
    const [showPaymentOptions, setShowPaymentOptions] = useState(false);
    const [savedCards, setSavedCards] = useState([]);
    
    // Animation setup for food background - Login/Signup style
    const tiles = useRef(buildGrid()).current;

    // One row of tiles that slides endlessly — uses recursive timing for true infinite loop
    function AnimatedRow({ rowIndex, tiles }) {
        const translateX = useRef(new Animated.Value(0)).current;
        const animRef = useRef(null);
        const isMounted = useRef(true);

        const rowWidth = tiles.length * (TILE_SIZE + 8);
        const direction = rowIndex % 2 === 0 ? -1 : 1;
        const duration = (15000 + rowIndex * 2500) * tiles.length / 6; // scale duration per tile count

        useEffect(() => {
            isMounted.current = true;

            const startVal = direction === -1 ? 0 : -rowWidth;
            const endVal = direction === -1 ? -rowWidth : 0;

            const runLoop = () => {
                if (!isMounted.current) return;
                translateX.setValue(startVal);
                animRef.current = Animated.timing(translateX, {
                    toValue: endVal,
                    duration,
                    useNativeDriver: true,
                });
                animRef.current.start(() => {
                    runLoop();
                });
            };

            runLoop();

            return () => {
                isMounted.current = false;
                if (animRef.current) {
                    animRef.current.stop();
                }
            };
        }, [direction, duration, rowWidth]);

        // Triple the tiles for infinity pattern
        const tripled = [...tiles, ...tiles, ...tiles];

        return (
            <Animated.View
                style={[
                    styles.row,
                    {
                        top: 20 + rowIndex * (TILE_SIZE + 12),
                        transform: [{ translateX }],
                    },
                ]}
            >
                {tripled.map((tile, i) => (
                    <View key={i} style={styles.foodTile}>
                        <Image
                            source={{ uri: tile.image }}
                            style={styles.foodTileImage}
                            resizeMode="cover"
                        />
                    </View>
                ))}
            </Animated.View>
        );
    }

    // Create rows for animation
    const rows = Array.from({ length: ROWS }, (_, i) =>
        tiles.filter(t => t.row === i)
    );

    const menuItems = [
        { 
            title: 'Profile', 
            icon: '👤', 
            route: 'Profile',
            bannerImage: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=400&q=80'
        },
        { 
            title: 'My Reviews', 
            icon: '⭐', 
            route: 'MyReviews',
            bannerImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&q=80'
        },
        { 
            title: 'Payment Options', 
            icon: '💳', 
            isAccordion: true,
            bannerImage: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&q=80'
        },
        { 
            title: 'Settings', 
            icon: '⚙️', 
            route: 'Settings',
            bannerImage: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&q=80'
        },
        { 
            title: 'Orders', 
            icon: '📦', 
            route: 'Orders',
            bannerImage: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80'
        },
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

    const removeCard = async (indexToRemove) => {
        Alert.alert(
            'Delete Card',
            'Are you sure you want to remove this card?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const updatedCards = savedCards.filter((_, index) => index !== indexToRemove);
                            await AsyncStorage.setItem('@saved_cards', JSON.stringify(updatedCards));
                            setSavedCards(updatedCards);
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }
            ]
        );
    };

    const handleEditCard = () => {
        Alert.alert("Edit Card", "To edit this card's details, please delete it and add a new one.", [{ text: "OK" }]);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {/* Food Image Background */}
                <View style={styles.foodBackground}>
                    {rows.map((rowTiles, i) => (
                        <AnimatedRow key={i} rowIndex={i} tiles={rowTiles} />
                    ))}
                </View>
                
                {/* Profile Content */}
                <View style={styles.profileOverlay}>
                    <View style={styles.userIcon}>
                        {(user?.image || user?.profilePic) ? (
                            <Image source={{ uri: getImageUrl(user?.image || user?.profilePic) }} style={styles.avatar} />
                        ) : (
                            <Text style={styles.avatarPlaceholder}>👤</Text>
                        )}
                    </View>
                    <Text style={styles.userName}>{user?.firstName || 'User'} {user?.lastName}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                </View>
            </View>

            <View style={styles.menuContainer}>
                {menuItems.map((item, index) => (
                    <View key={index}>
                        <TouchableOpacity 
                            style={styles.menuItem} 
                            onPress={() => item.isAccordion ? togglePaymentOptions() : handleNavigation(item.route)}
                        >
                            <Image 
                                source={{ uri: item.bannerImage }} 
                                style={styles.menuBannerImage} 
                                resizeMode="cover"
                            />
                            <View style={styles.menuContent}>
                                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                    <Text style={styles.menuIcon}>{item.icon}</Text>
                                    <Text style={styles.menuText}>{item.title}</Text>
                                </View>
                                {item.isAccordion && (
                                    <Text style={styles.accordionArrow}>{showPaymentOptions ? '▲' : '▼'}</Text>
                                )}
                            </View>
                        </TouchableOpacity>
                        
                        {item.isAccordion && showPaymentOptions && (
                            <View>
                                {savedCards.map((card, idx) => (
                                    <View key={`card-${idx}`} style={[styles.subMenuItem, { paddingRight: 15, paddingLeft: 60, justifyContent: 'space-between' }]}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                                            <Text style={styles.subMenuIcon}>
                                                {card.type === 'Visa' ? '💳' : card.type === 'Mastercard' ? '🔴🟡' : card.type === 'Amex' ? '💠' : '💳'}
                                            </Text>
                                            <Text style={styles.subMenuText}>{card.type} •••• {card.last4}</Text>
                                        </View>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <TouchableOpacity style={{ padding: 5, marginRight: 8 }} onPress={handleEditCard}>
                                                <Text style={{ fontSize: 16 }}>✏️</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={{ padding: 5 }} onPress={() => removeCard(idx)}>
                                                <Text style={{ fontSize: 16 }}>🗑️</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
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
    container: { flex: 1, backgroundColor: '#FFFFFF', borderRightWidth: 3, borderRightColor: COLORS.primaryLight },
    header: { 
        position: 'relative',
        backgroundColor: '#000', 
        paddingTop: 60, 
        paddingBottom: 50, 
        paddingHorizontal: 20,
        borderBottomRightRadius: 30,
        borderBottomWidth: 2,
        borderBottomColor: COLORS.primary,
        overflow: 'hidden',
    },
    foodBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.3,
    },
    foodTile: {
        width: TILE_SIZE,
        height: TILE_SIZE,
        marginRight: 6,
        borderRadius: 10,
        overflow: 'hidden',
    },
    foodTileImage: {
        width: '100%',
        height: '100%',
        opacity: 0.8,
    },
    row: { 
        position: 'absolute', 
        flexDirection: 'row', 
        left: 0,
    },
    profileOverlay: {
        position: 'relative',
        zIndex: 1,
        alignItems: 'center',
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
    avatarPlaceholder: { fontSize: 32 },
    userName: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
    userEmail: { fontSize: 14, color: '#FFE0D6' },
    
    menuContainer: { flex: 1, paddingTop: 20 },
    menuItem: { 
        position: 'relative',
        height: 70,
        marginHorizontal: 10,
        marginVertical: 5,
        borderRadius: 8,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        backgroundColor: '#f8f9fa',
    },
    menuBannerImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
    },
    menuContent: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        backgroundColor: 'rgba(255,107,53,0.15)',
    },
    menuIcon: { fontSize: 22, marginRight: 20 },
    menuText: { fontSize: 16, fontWeight: '600', color: '#fff' },
    accordionArrow: { fontSize: 12, color: '#fff' },
    
    subMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingLeft: 65,
        paddingRight: 25,
        marginHorizontal: 10,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E1E8ED'
    },
    subMenuIcon: { fontSize: 16, marginRight: 15 },
    subMenuText: { fontSize: 14, fontWeight: '500', color: '#555' },
    
    footer: { 
        paddingVertical: 25, 
        paddingHorizontal: 15,
        marginHorizontal: 1,
        borderTopWidth: 1, 
        borderTopColor: '#E1E8ED',
        backgroundColor: '#F8F9FA'
    },
    logoutBtn: { flexDirection: 'row', alignItems: 'center' },
    logoutIcon: { fontSize: 20, marginRight: 15 },
    logoutText: { fontSize: 16, fontWeight: 'bold', color: COLORS.primary },
});
