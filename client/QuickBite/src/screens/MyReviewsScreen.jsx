import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator,
    Alert, RefreshControl, Image, ScrollView
} from 'react-native';
import API from '../services/api';
import TopNavBar from '../components/TopNavBar';
import { getImageUrl } from '../utils/imageUtils';

const ORANGE = '#FF6B35';

export default function MyReviewsScreen({ navigation }) {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchReviews = async () => {
        try {
            const res = await API.get('/feedback/user/my-feedback');
            setReviews(res.data?.feedback || []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setReviews([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    // Refresh reviews when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            fetchReviews();
        }, [])
    );

    const handleEditReview = (review) => {
        navigation.navigate('Feedback', {
            canteenId: review.canteenId,
            editMode: true,
            existingFeedback: review
        });
    };

    const handleDeleteReview = async (reviewId) => {
        Alert.alert(
            'Delete Review',
            'Are you sure you want to delete your review?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await API.delete(`/feedback/user/${reviewId}`);
                            setReviews(reviews.filter(r => r._id !== reviewId));
                            Alert.alert('Success', 'Your review has been deleted.');
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete review.');
                        }
                    }
                }
            ]
        );
    };

    const renderReview = ({ item }) => (
        <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
                <View style={styles.canteenInfo}>
                    <Text style={styles.canteenName}>{item.canteenName || 'Unknown Canteen'}</Text>
                    <Text style={styles.reviewDate}>
                        {new Date(item.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </Text>
                </View>
                <View style={styles.ratingContainer}>
                    <Text style={styles.rating}>⭐ {item.rating?.toFixed(1) || '0.0'}</Text>
                </View>
            </View>

            <Text style={styles.reviewText}>{item.comment || 'No comment provided'}</Text>

            {item.foodName && (
                <Text style={styles.foodInfo}>🍽️ {item.foodName}</Text>
            )}

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() => handleEditReview(item)}
                >
                    <Text style={styles.editBtnText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteReview(item._id)}
                >
                    <Text style={styles.deleteBtnText}>Delete</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <TopNavBar navigation={navigation} placeholder="My Reviews" />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={ORANGE} />
                    <Text style={styles.loadingText}>Loading your reviews...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <TopNavBar navigation={navigation} placeholder="My Reviews" />
            
            {reviews.length === 0 ? (
                <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>⭐</Text>
                    <Text style={styles.emptyTitle}>No Reviews Yet</Text>
                    <Text style={styles.emptySubtitle}>
                        Start reviewing your favorite meals!
                    </Text>
                    <TouchableOpacity
                        style={styles.orderNowBtn}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <Text style={styles.orderNowBtnText}>Browse Canteens</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={reviews}
                    renderItem={renderReview}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => {
                            setRefreshing(true);
                            fetchReviews();
                        }} colors={[ORANGE]} />
                    }
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF7F2' },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 12,
        color: '#666',
        fontSize: 14
    },
    list: { padding: 16, paddingTop: 150 },
    reviewCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
    },
    reviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12
    },
    canteenInfo: {
        flex: 1
    },
    canteenName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4
    },
    reviewDate: {
        fontSize: 12,
        color: '#666'
    },
    ratingContainer: {
        backgroundColor: '#FFF3E0',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12
    },
    rating: {
        fontSize: 14,
        fontWeight: 'bold',
        color: ORANGE
    },
    reviewText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
        marginBottom: 8
    },
    foodInfo: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        marginBottom: 12
    },
    actions: {
        flexDirection: 'row',
        gap: 12
    },
    editBtn: {
        backgroundColor: ORANGE,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        flex: 1
    },
    editBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    deleteBtn: {
        backgroundColor: '#F44336',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 6,
        flex: 1
    },
    deleteBtnText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40
    },
    emptyIcon: {
        fontSize: 80,
        marginBottom: 16
    },
    emptyTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 32
    },
    orderNowBtn: {
        backgroundColor: ORANGE,
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 25,
        shadowColor: ORANGE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4
    },
    orderNowBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold'
    }
});
