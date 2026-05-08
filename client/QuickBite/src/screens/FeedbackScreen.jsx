import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Alert, Image, ActivityIndicator,
} from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import API from '../services/api';
import { getImageUrl } from '../utils/imageUtils';

const ORANGE = '#FF6B35';

export default function FeedbackScreen({ navigation, route }) {
  const { orderId, foodItemId, canteenId, foodName, editMode, existingFeedback } = route.params || {};
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [complaintType, setComplaintType] = useState('general');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize form with existing feedback data if in edit mode
  useEffect(() => {
    if (editMode && existingFeedback) {
      setRating(existingFeedback.rating || 0);
      setComment(existingFeedback.comment || '');
      setComplaintType(existingFeedback.complaintType || 'general');
      if (existingFeedback.complaintImage) {
        setImage({ uri: getImageUrl(existingFeedback.complaintImage) });
      }
    }
  }, [editMode, existingFeedback]);

  const TYPES = ['general', 'food_quality', 'service', 'hygiene', 'other'];

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, (res) => {
      if (!res.didCancel && res.assets?.length > 0) {
        setImage(res.assets[0]);
      }
    });
  };

  const handleSubmit = async () => {
    if (rating === 0) return Alert.alert('Error', 'Please select a rating');
    if (!comment.trim()) return Alert.alert('Error', 'Please enter a comment');
    if (comment.trim().length < 10) return Alert.alert('Error', 'Review must be at least 10 characters long');
    if (comment.trim().length > 50) return Alert.alert('Error', 'Review must be at shorter than 50 characters long');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('rating', String(rating));
      formData.append('comment', comment.trim());
      formData.append('complaintType', complaintType);
      if (foodItemId) formData.append('foodItemId', foodItemId);
      if (orderId) formData.append('orderId', orderId);
      if (canteenId) formData.append('canteenId', canteenId);
      if (image && !image.uri.startsWith('http')) {
        // Only append new image, not existing ones
        formData.append('complaintImage', {
          uri: image.uri,
          name: image.fileName || 'complaint.jpg',
          type: image.type || 'image/jpeg',
        });
      }

      let response;
      if (editMode && existingFeedback) {
        // Update existing feedback
        response = await API.put(`/feedback/user/${existingFeedback._id}`, formData, { 
          headers: { 'Content-Type': 'multipart/form-data' } 
        });
        Alert.alert('✅ Updated!', 'Your review has been updated.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        // Create new feedback
        response = await API.post('/feedback', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        Alert.alert('✅ Thank you!', 'Your feedback has been submitted.', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{editMode ? '✏️ Edit Review' : '⭐ Feedback'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {foodName && <Text style={styles.aboutLabel}>Review for: <Text style={styles.aboutItem}>{foodName}</Text></Text>}

        {/* Star Rating */}
        <View style={styles.card}>
          <Text style={styles.label}>Your Rating</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map(s => (
              <TouchableOpacity key={s} onPress={() => setRating(s)}>
                <Text style={[styles.star, s <= rating && styles.starActive]}>★</Text>
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && <Text style={styles.ratingLabel}>{'⭐'.repeat(rating)} ({['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]})</Text>}
        </View>

        {/* Complaint Type */}
        <View style={styles.card}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.typeRow}>
            {TYPES.map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.typeChip, complaintType === t && styles.typeChipActive]}
                onPress={() => setComplaintType(t)}
              >
                <Text style={[styles.typeText, complaintType === t && styles.typeTextActive]}>
                  {t.replace('_', ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Comment */}
        <View style={styles.card}>
          <Text style={styles.label}>Your Comment</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Share your experience..."
            placeholderTextColor="#aaa"
            multiline
            numberOfLines={5}
            value={comment}
            onChangeText={setComment}
            textAlignVertical="top"
          />
        </View>

        {/* Image Upload */}
        <View style={styles.card}>
          <Text style={styles.label}>Attach Image (optional)</Text>
          <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
            {image ? (
              <Image source={{ uri: image.uri }} style={styles.preview} resizeMode="cover" />
            ) : (
              <Text style={styles.uploadText}>📷 Select Image</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{editMode ? 'Update Review' : 'Submit Feedback'}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7F2' },
  header: {
    backgroundColor: ORANGE, paddingTop: 52, paddingBottom: 16,
    paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center',
  },
  backBtn: { marginRight: 12, padding: 4 },
  backArrow: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  scroll: { padding: 16 },
  aboutLabel: { fontSize: 14, color: '#666', marginBottom: 14 },
  aboutItem: { color: ORANGE, fontWeight: 'bold' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 14, elevation: 2 },
  label: { fontSize: 14, fontWeight: '700', color: '#333', marginBottom: 12 },
  stars: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  star: { fontSize: 38, color: '#ddd' },
  starActive: { color: '#FFB800' },
  ratingLabel: { fontSize: 13, color: '#888', marginTop: 4 },
  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { borderWidth: 1.5, borderColor: '#E8E8E8', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  typeChipActive: { backgroundColor: ORANGE, borderColor: ORANGE },
  typeText: { fontSize: 12, color: '#666', fontWeight: '600' },
  typeTextActive: { color: '#fff' },
  textArea: {
    borderWidth: 1.5, borderColor: '#E8E8E8', borderRadius: 12, padding: 12,
    fontSize: 14, color: '#333', minHeight: 100,
  },
  uploadBtn: {
    borderWidth: 2, borderColor: ORANGE, borderStyle: 'dashed',
    borderRadius: 12, height: 120, justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  preview: { width: '100%', height: '100%' },
  uploadText: { color: ORANGE, fontWeight: '600', fontSize: 15 },
  submitBtn: {
    backgroundColor: ORANGE, borderRadius: 14, paddingVertical: 15, alignItems: 'center',
    shadowColor: ORANGE, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
    marginBottom: 30,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
