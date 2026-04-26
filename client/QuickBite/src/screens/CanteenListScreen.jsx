import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl,
} from 'react-native';
import API from '../services/api';
import TopNavBar from '../components/TopNavBar';

const ORANGE = '#FF6B35';

export default function CanteenListScreen({ navigation }) {
    const [canteens, setCanteens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

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
            {loading ? <ActivityIndicator size="large" color={ORANGE} style={{ marginTop: 40 }} /> : (
                <FlatList
                    data={canteens}
                    keyExtractor={i => i._id}
                    contentContainerStyle={{ padding: 12 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchCanteens(); }} colors={[ORANGE]} />}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('CanteenDetail', { canteen: item })}>
                            <View style={styles.cardIcon}><Text style={{ fontSize: 30 }}>🏪</Text></View>
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
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    card: {
        flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 14,
        marginBottom: 10, elevation: 2, alignItems: 'center',
    },
    cardIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFF0E8', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    cardInfo: { flex: 1 },
    name: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 4 },
    location: { fontSize: 13, color: '#888' },
    hours: { fontSize: 12, color: '#aaa', marginTop: 2 },
    arrow: { fontSize: 18, color: '#ccc' },
    empty: { textAlign: 'center', color: '#aaa', paddingVertical: 40, fontSize: 14 },
});
