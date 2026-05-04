import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image
} from 'react-native';
import API from '../services/api';
import TopNavBar from '../components/TopNavBar';
import { getImageUrl } from '../utils/imageUtils';

const ORANGE = '#FF6B35';

export default function CanteenListScreen({ navigation, route }) {
    const [canteens, setCanteens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const { goToCustomOrder } = route.params || {};

    const fetchCanteens = async () => {
        try {
            const res = await API.get('/canteens');
            setCanteens(res.data?.canteens || []);
        } catch (e) { setCanteens([]); }
        finally { setLoading(false); setRefreshing(false); }
    };

    useEffect(() => { fetchCanteens(); }, []);

    return (
        <View style={styles.container}>
            <TopNavBar navigation={navigation} placeholder="🏪 All Canteens" />
            
            {/* Header Image */}
            <View style={styles.headerContainer}>
                <Image 
                    source={require('../assets/SLIIT KANDY UNI.jpg')} 
                    style={styles.headerImage} 
                    resizeMode="cover"
                />
                <View style={styles.headerOverlay}>
                    <Text style={styles.headerTitle}>All Canteens</Text>
                    <Text style={styles.headerSubtitle}>Choose your favorite canteen</Text>
                </View>
            </View>
            
            {loading ? <ActivityIndicator size="large" color={ORANGE} style={{ marginTop: 40 }} /> : (
                <FlatList
                    data={canteens}
                    keyExtractor={i => i._id}
                    contentContainerStyle={{ padding: 12, paddingBottom: 20 }}
                    style={{ marginTop: 10 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCanteens(); }} colors={[ORANGE]} />}
                    renderItem={({ item }) => (
                        <TouchableOpacity 
                            style={styles.card} 
                            onPress={() => {
                                if (goToCustomOrder) {
                                    navigation.navigate('CustomOrder', { 
                                        canteenId: item._id, 
                                        canteenName: item.canteenName 
                                    });
                                } else {
                                    navigation.navigate('CanteenDetail', { canteen: item });
                                }
                            }}
                        >
                            <View style={styles.imageContainer}>
                                {item.canteenImage ? (
                                    <Image 
                                        source={{ uri: getImageUrl(item.canteenImage) }} 
                                        style={styles.canteenImage} 
                                        resizeMode="cover"
                                    />
                                ) : (
                                    <View style={styles.placeholderImg}><Text style={styles.placeholderIcon}>🏪</Text></View>
                                )}
                            </View>
                            <View style={styles.cardInfo}>
                                <Text style={styles.name}>{item.canteenName}</Text>
                                <Text style={styles.location}>📍 {item.location}</Text>
                                <Text style={styles.hours}>🕐 {item.openingTime} – {item.closingTime}</Text>
                            </View>
                            <Text style={styles.arrow}>→</Text>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No canteens available</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF7F2' },
    headerContainer: { position: 'relative', width: '100%', height: 200, marginTop: 150 },
    headerImage: { width: '100%', height: '100%' },
    headerOverlay: { 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: 'rgba(0,0,0,0.6)', 
        padding: 20 
    },
    headerTitle: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: '#fff', 
        marginBottom: 4 
    },
    headerSubtitle: { 
        fontSize: 14, 
        color: '#fff', 
        opacity: 0.9 
    },
    card: {
        flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 12,
        marginBottom: 10, elevation: 2, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
    },
    imageContainer: { width: 80, height: 80, borderRadius: 12, overflow: 'hidden', backgroundColor: '#FFF0E8', marginRight: 12 },
    canteenImage: { width: '100%', height: '100%' },
    placeholderImg: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
    placeholderIcon: { fontSize: 30 },
    cardInfo: { flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 4 },
    location: { fontSize: 13, color: '#666' },
    hours: { fontSize: 12, color: '#aaa', marginTop: 2 },
    arrow: { fontSize: 18, color: '#ccc' },
    empty: { textAlign: 'center', color: '#aaa', paddingVertical: 40, fontSize: 14 },
});
