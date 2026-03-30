import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { mockFoodItems, FoodItem } from '../constants/mockData';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 200;

interface FoodMenuScreenProps {
  addToCart: (item: FoodItem) => void;
}

const FoodMenuScreen: React.FC<FoodMenuScreenProps> = ({ addToCart }) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const scrollY = new Animated.Value(0);

  const categories = ['All', 'Sri Lankan', 'Chinese', 'Fast Food', 'International', 'Healthy', 'Desserts'];

  const filteredItems = selectedCategory === 'All'
    ? mockFoodItems
    : mockFoodItems.filter(item => item.category === selectedCategory);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - 50],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT],
    outputRange: [0, -HEADER_HEIGHT / 2],
    extrapolate: 'clamp',
  });

  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <TouchableOpacity style={styles.foodCard} disabled={!item.isAvailable}>
      <Image source={{ uri: item.image }} style={styles.foodImage} />
      <View style={styles.foodInfo}>
        <View style={styles.foodHeader}>
          <Text style={styles.foodName}>{item.name}</Text>
          {!item.isAvailable && (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableText}>Unavailable</Text>
            </View>
          )}
        </View>

        <Text style={styles.foodDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.foodMeta}>
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={theme.colors.accent} />
            <Text style={styles.rating}>{item.rating}</Text>
          </View>
          <Text style={styles.foodPrice}>Rs. {item.price}</Text>
        </View>

        <TouchableOpacity
          style={[styles.addButton, !item.isAvailable && styles.disabledButton]}
          onPress={() => item.isAvailable && addToCart(item)}
          disabled={!item.isAvailable}
        >
          <Ionicons
            name="add"
            size={20}
            color={item.isAvailable ? theme.colors.background : theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Parallax Header */}
      <Animated.View
        style={[
          styles.header,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslateY }],
          },
        ]}
      >
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400' }}
          style={styles.headerImage}
        />
        <View style={styles.headerOverlay}>
          <Text style={styles.headerTitle}>Main Canteen</Text>
          <View style={styles.headerMeta}>
            <Ionicons name="star" size={16} color={theme.colors.accent} />
            <Text style={styles.headerRating}>4.5</Text>
            <Text style={styles.headerStatus}>• Open until 8:00 PM</Text>
          </View>
        </View>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.content}>
          {/* Category Chips */}
          <View style={styles.categoriesContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category && styles.selectedCategoryChip,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category && styles.selectedCategoryText,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Food Items List */}
          <FlatList
            data={filteredItems}
            renderItem={renderFoodItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            contentContainerStyle={styles.foodList}
          />
        </View>
      </Animated.ScrollView>

      {/* Floating Cart Button */}
      <TouchableOpacity style={styles.cartButton}>
        <Ionicons name="bag-outline" size={24} color={theme.colors.background} />
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>3</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    height: HEADER_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  headerImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
    padding: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.background,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  headerRating: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.background,
    marginLeft: theme.spacing.xs,
  },
  headerStatus: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.background,
    marginLeft: theme.spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingTop: HEADER_HEIGHT,
  },
  categoriesContainer: {
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.md,
  },
  categoriesScroll: {
    paddingHorizontal: theme.spacing.lg,
  },
  categoryChip: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing.sm,
  },
  selectedCategoryChip: {
    backgroundColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  selectedCategoryText: {
    color: theme.colors.background,
  },
  foodList: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  foodCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  foodImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  foodInfo: {
    padding: theme.spacing.md,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  foodName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    flex: 1,
  },
  unavailableBadge: {
    backgroundColor: theme.colors.error,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  },
  unavailableText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.background,
    fontWeight: theme.typography.fontWeight.medium,
  },
  foodDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  foodMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
    fontWeight: theme.typography.fontWeight.medium,
    marginLeft: theme.spacing.xs,
  },
  foodPrice: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  addButton: {
    position: 'absolute',
    bottom: theme.spacing.md,
    right: theme.spacing.md,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.round,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cartButton: {
    position: 'absolute',
    bottom: 100,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.round,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.lg,
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.round,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: {
    color: theme.colors.background,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
  },
});

export default FoodMenuScreen;