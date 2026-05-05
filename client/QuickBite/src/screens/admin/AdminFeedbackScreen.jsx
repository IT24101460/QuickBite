import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image, RefreshControl } from 'react-native';
import API from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';

const ORANGE = '#FF6B35';

export default function AdminFeedbackScreen({ navigation }) {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAllFeedback = async () => {
        try {
            const res = await API.get('/feedback');
            setFeedbacks(res.data?.feedback || []);
        } catch (e) {
            console.error("Admin feedback fetch error:", e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchAllFeedback();
    }, []);

    // Refresh feedbacks when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchAllFeedback();
        }, [])
    );

    const deleteFeedback = (id) => {
        Alert.alert("Delete Feedback", "Are you sure you want to remove this feedback from the system?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    try {
                        await API.delete(`/feedback/${id}`);
                        fetchAllFeedback();
                    } catch (e) {
                        Alert.alert("Error", "Failed to delete feedback");
                    }
                }
            }
        ]);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.studentName}>{item.userId?.firstName} {item.userId?.lastName}</Text>
                    <Text style={styles.email}>{item.userId?.email}</Text>
                </View>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>

            <View style={styles.ratingRow}>
                <Text style={styles.ratingStars}>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</Text>
                <View style={styles.typeBadge}>
                    <Text style={styles.typeText}>{item.complaintType?.toUpperCase()}</Text>
                </View>
            </View>

            <Text style={styles.canteenTag}>🏪 {item.canteenId?.canteenName || 'Global'}</Text>
            
            <Text style={styles.comment}>"{item.comment}"</Text>

            {item.complaintImage ? (
                <View style={styles.imageContainer}>
                    <Image 
                        source={{ uri: getImageUrl(item.complaintImage) }} 
                        style={styles.reviewImage} 
                        resizeMode="cover"
                    />
                </View>
            ) : null}

            {item.response && (
                <View style={styles.replyBox}>
                    <Text style={styles.replyLabel}>Owner Response:</Text>
                    <Text style={styles.replyText}>{item.response}</Text>
                </View>
            )}

            <TouchableOpacity style={styles.delBtn} onPress={() => deleteFeedback(item._id)}>
                <Text style={styles.delBtnText}>🗑️ Delete Feedback</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
                <Text style={styles.headerTitle}>🛡️ System Feedback</Text>
            </View>

            {loading ? <ActivityIndicator size="large" color={ORANGE} style={{ marginTop: 50 }} /> : (
                <FlatList
                    data={feedbacks}
                    renderItem={renderItem}
                    keyExtractor={i => i._id}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchAllFeedback(); }} colors={[ORANGE]} />}
                    ListEmptyComponent={<Text style={styles.empty}>No student feedback found in the system.</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { backgroundColor: ORANGE, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' },
    backBtn: { marginRight: 12 },
    backArrow: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
    studentName: { fontSize: 16, fontWeight: 'bold', color: '#222' },
    email: { fontSize: 12, color: '#888' },
    date: { fontSize: 11, color: '#aaa' },
    ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    ratingStars: { color: '#FFB800', fontSize: 18 },
    typeBadge: { backgroundColor: '#F0F0F0', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    typeText: { fontSize: 10, fontWeight: 'bold', color: '#666' },
    canteenTag: { fontSize: 13, color: ORANGE, fontWeight: '600', marginBottom: 8 },
    comment: { fontSize: 14, color: '#444', fontStyle: 'italic', lineHeight: 20 },
    imageContainer: { marginTop: 12, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' },
    reviewImage: { width: '100%', height: 180 },
    replyBox: { marginTop: 12, padding: 12, backgroundColor: '#FFF9F5', borderRadius: 8, borderLeftWidth: 3, borderLeftColor: ORANGE },
    replyLabel: { fontSize: 11, fontWeight: 'bold', color: ORANGE, marginBottom: 4 },
    replyText: { fontSize: 13, color: '#555' },
    delBtn: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 12, alignItems: 'center' },
    delBtnText: { color: '#e74c3c', fontSize: 13, fontWeight: '600' },
    empty: { textAlign: 'center', color: '#aaa', marginTop: 50 },
});
