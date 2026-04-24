import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCart } from '../context/CartContext';

const ORANGE = '#FF6B35';

export default function FloatingCart() {
    const navigation = useNavigation();
    const { itemCount } = useCart();

    if (itemCount === 0) return null;

    return (
        <TouchableOpacity
            style={styles.fab}
            activeOpacity={0.9}
            onPress={() => {
                if (navigation.toggleDrawer) {
                    navigation.toggleDrawer();
                } else {
                    navigation.navigate('Cart');
                }
            }}
        >
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{itemCount}</Text>
            </View>
            <Text style={styles.icon}>🛒</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        bottom: 25,
        right: 20,
        backgroundColor: ORANGE,
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        height: 60,
        borderRadius: 30,
        elevation: 8,
        shadowColor: ORANGE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        zIndex: 9999,
    },
    icon: {
        fontSize: 26,
        color: '#fff',
        marginLeft: -2,
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: ORANGE,
        borderRadius: 12,
        minWidth: 24,
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    badgeText: {
        color: ORANGE,
        fontWeight: 'bold',
        fontSize: 10,
    }
});
