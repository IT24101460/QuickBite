import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import API from '../../services/api';
import { getImageUrl } from '../../utils/imageUtils';

const ORANGE = '#FF6B35';

export default function OwnerFeedbacksScreen({ route, navigation }) {
    const passedCanteenId = route.params?.canteenId;
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null); // the feedback item object
    const [replyText, setReplyText] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchFeedbacks();
    }, []);

    // Refresh feedbacks when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchFeedbacks();
        }, [passedCanteenId])
    );

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            let myCanteenId = passedCanteenId;
            if (!myCanteenId) {
                const menuPromise = await API.get('/canteens/my');
                myCanteenId = menuPromise.data.canteen._id;
            }

            const reqRes = await API.get(`/feedback/canteen/${myCanteenId}`);
            setFeedbacks(reqRes.data.feedback || []);
        } catch (error) {
            console.log("Error loading feedback records:", error);
        } finally {
            setLoading(false);
        }
    };

    const openReplyModal = (f) => {
        setReplyingTo(f);
        setReplyText(f.response || '');
    };

    const submitReply = async () => {
        if (!replyText.trim()) return Alert.alert("Error", "Please type a reply.");
        setSaving(true);
        try {
            await API.put(`/feedback/${replyingTo._id}`, {
                response: replyText,
                status: 'resolved'
            });
            Alert.alert("Sent", "Your response has been published to the customer!");
            setReplyingTo(null);
            fetchFeedbacks();
        } catch (error) {
            Alert.alert("Failed", "Could not send the reply to the backend.");
        } finally {
            setSaving(false);
        }
    };

    const StarRating = ({ rating }) => {
        return (
            <View style={{ flexDirection: 'row' }}>
                {[...Array(5)].map((_, i) => (
                    <Text key={i} style={[styles.star, { color: i < rating ? ORANGE : '#ccc' }]}>★</Text>
                ))}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Text style={styles.backArrow}>←</Text></TouchableOpacity>
                <Text style={styles.title}>Customer Feedbacks</Text>
            </View>

            {loading ? <ActivityIndicator size="large" color={ORANGE} style={{ marginTop: 50 }} /> : (
                <FlatList
                    contentContainerStyle={{ padding: 20 }}
                    data={feedbacks}
                    keyExtractor={item => item._id}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={styles.customerName}>{item.userId?.firstName} {item.userId?.lastName}</Text>
                                <Text style={styles.dateText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                            </View>

                            <StarRating rating={item.rating} />

                            <Text style={styles.comment}>"{item.comment}"</Text>

                            {/* Show Complaint Image if attached */}
                            {item.complaintImage ? (
                                <View style={styles.imageContainer}>
                                    <Image 
                                        source={{ uri: getImageUrl(item.complaintImage) }} 
                                        style={styles.reviewImage} 
                                        resizeMode="cover"
                                    />
                                    <Text style={styles.imageLabel}>Attached Evidence 📸</Text>
                                </View>
                            ) : null}

                            {item.foodItemId && (
                                <Text style={styles.foodTag}>Related to: {item.foodItemId.name}</Text>
                            )}

                            {item.response ? (
                                <View style={styles.ownerReplyBox}>
                                    <Text style={styles.ownerReplyLabel}>Your Reply:</Text>
                                    <Text style={styles.ownerReplyText}>{item.response}</Text>
                                    <TouchableOpacity onPress={() => openReplyModal(item)}>
                                        <Text style={styles.editReplyBtn}>Edit Reply</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <TouchableOpacity style={styles.replyBtn} onPress={() => openReplyModal(item)}>
                                    <Text style={styles.replyBtnText}>Reply To Customer</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                    ListEmptyComponent={<Text style={styles.empty}>No customer feedback found yet.</Text>}
                />
            )}

            {replyingTo && (
                <Modal visible transparent animationType="fade">
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBg}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalTitle}>Reply to {replyingTo.userId?.firstName}</Text>
                            <Text style={styles.targetComment}>"{replyingTo.comment}"</Text>

                            <TextInput
                                style={styles.input}
                                placeholder="Type your professional response here..."
                                value={replyText}
                                onChangeText={setReplyText}
                                multiline
                                autoFocus
                            />

                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setReplyingTo(null)}><Text style={{ fontWeight: 'bold' }}>Cancel</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.sendBtn} onPress={submitReply} disabled={saving}>
                                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Send Reply</Text>}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8F9FA' },
    header: { backgroundColor: ORANGE, paddingTop: 52, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
    backBtn: { paddingRight: 15 },
    backArrow: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
    title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

    card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 15, elevation: 2 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    customerName: { fontSize: 16, fontWeight: 'bold', color: '#222' },
    dateText: { fontSize: 12, color: '#999' },
    star: { fontSize: 16 },
    comment: { fontSize: 15, color: '#333', marginTop: 10, fontStyle: 'italic' },
    
    imageContainer: { marginTop: 12, borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#eee' },
    reviewImage: { width: '100%', height: 160 },
    imageLabel: { fontSize: 10, color: '#999', textAlign: 'center', paddingVertical: 4, backgroundColor: '#f9f9f9' },

    foodTag: { fontSize: 12, color: '#666', marginTop: 8, backgroundColor: '#f0f0f0', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },

    replyBtn: { marginTop: 15, backgroundColor: ORANGE, padding: 10, borderRadius: 8, alignItems: 'center' },
    replyBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

    ownerReplyBox: { marginTop: 15, backgroundColor: '#FFF5F0', padding: 12, borderRadius: 8, borderLeftWidth: 3, borderLeftColor: ORANGE },
    ownerReplyLabel: { fontSize: 12, fontWeight: 'bold', color: ORANGE, marginBottom: 4 },
    ownerReplyText: { fontSize: 14, color: '#444' },
    editReplyBtn: { fontSize: 12, color: ORANGE, fontWeight: 'bold', marginTop: 8, textAlign: 'right' },

    modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 16 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#222', marginBottom: 10 },
    targetComment: { fontSize: 14, fontStyle: 'italic', color: '#666', marginBottom: 15, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 8 },
    input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, height: 100, textAlignVertical: 'top', fontSize: 15, marginBottom: 15 },

    cancelBtn: { flex: 1, padding: 15, borderRadius: 10, backgroundColor: '#eee', alignItems: 'center' },
    sendBtn: { flex: 1, padding: 15, borderRadius: 10, backgroundColor: ORANGE, alignItems: 'center' },
    empty: { textAlign: 'center', color: '#888', marginTop: 40 }
});
