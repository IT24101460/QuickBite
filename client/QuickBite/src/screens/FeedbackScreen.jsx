import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Rating,
} from 'react-native';
import API from '../services/api';

export default function FeedbackScreen({ navigation }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmitFeedback = async () => {
    if (rating === 0) {
      Alert.alert('Error', 'Please select a rating');
      return;
    }

    if (!comment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/feedback', {
        rating,
        comment: comment.trim(),
      });

      if (response.status === 201) {
        Alert.alert('Success', 'Thank you for your feedback!', [
          {
            text: 'OK',
            onPress: () => {
              setRating(0);
              setComment('');
              navigation.goBack();
            },
          },
        ]);
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Failed to submit feedback';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>⭐ Your Feedback</Text>
      </View>

      {/* Feedback Form */}
      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>How was your experience?</Text>

        {/* Rating */}
        <View style={styles.ratingContainer}>
          <Text style={styles.label}>Rate Us</Text>
          <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
              >
                <Text style={[styles.star, rating >= star && styles.starFilled]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {rating > 0 && (
            <Text style={styles.ratingText}>You rated us {rating} stars</Text>
          )}
        </View>

        {/* Comment */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your Comment</Text>
          <TextInput
            placeholder="Tell us what you think..."
            style={styles.textArea}
            multiline
            numberOfLines={6}
            value={comment}
            onChangeText={setComment}
            editable={!loading}
            textAlignVertical="top"
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.disabledButton]}
          onPress={handleSubmitFeedback}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Feedback</Text>
          )}
        </TouchableOpacity>

        {/* Help Text */}
        <View style={styles.helpText}>
          <Text style={styles.helpTextContent}>
            Your feedback helps us improve our service. Thank you for taking the time!
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    paddingBottom: 20,
  },
  headerContainer: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    marginRight: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  formContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  ratingContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  starContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  star: {
    fontSize: 40,
    color: '#ddd',
  },
  starFilled: {
    color: '#FFD700',
  },
  ratingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 24,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpText: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  helpTextContent: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
});
