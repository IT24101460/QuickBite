import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';

const ORANGE = '#FF6B35';

export default function FloatingCart() {
    const navigation = useNavigation();
    const { itemCount, finalTotal } = useCart();

    if (itemCount === 0) return null;

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.pill}
                activeOpacity={0.9}
                onPress={() => {
                    if (navigation.toggleDrawer) {
                        navigation.toggleDrawer();
                    } else {
                        navigation.navigate('Cart');
                    }
                }}
            >
                <View style={styles.leftSection}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{itemCount}</Text>
                    </View>
                    <Text style={styles.cartIcon}>🛒</Text>
                    <Text style={styles.viewCartText}>View Cart</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.rightSection}>
                    <Text style={styles.totalText}>LKR {finalTotal ? finalTotal.toFixed(2) : '0.00'}</Text>
                    <Text style={styles.arrowIcon}>→</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 25,
        width: '100%',
        alignItems: 'center',
        zIndex: 9999,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderWidth: 1.5,
        borderColor: ORANGE,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 30,
        elevation: 8,
        shadowColor: ORANGE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    badge: {
        backgroundColor: ORANGE,
        borderRadius: 12,
        minWidth: 22,
        height: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    badgeText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12,
    },
    cartIcon: {
        fontSize: 16,
        marginRight: 4,
    },
    viewCartText: {
        color: ORANGE,
        fontWeight: 'bold',
        fontSize: 14,
    },
    divider: {
        width: 1,
        height: 14,
        backgroundColor: '#FFE0D6',
        marginHorizontal: 10,
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    totalText: {
        color: ORANGE,
        fontWeight: 'bold',
        fontSize: 14,
        marginRight: 6,
    },
    arrowIcon: {
        color: ORANGE,
        fontSize: 16,
        fontWeight: 'bold',
    }
});
