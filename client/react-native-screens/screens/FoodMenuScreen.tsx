// SLIIT Eats - Food Menu Screen
// Copy this file to: src/screens/FoodMenuScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { FOOD_ITEMS, CATEGORIES, FoodItem, Canteen } from '../constants/mockData';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 200;

interface FoodMenuScreenProps {
  navigation: any;
  route: {
    params: {
      canteen: Canteen;
    };
  };
}

const FoodMenuScreen: React.FC<FoodMenuScreenProps> = ({ navigation, route }) => {
  const { canteen } = route.params;
  const [selectedCategory, setSelectedCategory] = useState('all');
  const scrollY = new Animated.Value(0);

  const canteenFoods = FOOD_ITEMS.filter(item => item.canteenId === canteen.id);
  const filteredFoods = selectedCategory === 'all'
    ? canteenFoods
    : canteenFoods.filter(item => 
        item.category.toLowerCase() === selectedCategory.toLowerCase()
      );

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const renderFoodItem = (item: FoodItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.foodCard, !item.isAvailable && styles.foodCardDisabled]}
      onPress={() => item.isAvailable && navigation.navigate('FoodDetail', { item })}
      disabled={!item.isAvailable}
    >
      <Image source={{ uri: item.image }} style={styles.foodImage} />
      
      {!item.isAvailable && (
        <View style={styles.unavailableOverlay}>
          <Text style={styles.unavailableText}>Unavailable</Text>
        </View>
      )}

      <View style={styles.foodContent}>
        <View style={styles.foodHeader}>
          <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.ratingSmall}>
            <Ionicons name="star" size={12} color="#FFB800" />
            <Text style={styles.ratingTextSmall}>{item.rating}</Text>
          </View>
        </View>

        <Text style={styles.foodDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.foodMeta}>
          <View style={styles.prepTime}>
            <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
            <Text style={styles.prepTimeText}>{item.preparationTime}</Text>
          </View>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
        </View>

        <View style={styles.foodFooter}>
          <Text style={styles.foodPrice}>Rs. {item.price}</Text>
          {item.isAvailable && (
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={() => {
                // Add to cart logic
              }}
            >
              <Ionicons name="add" size={18} color={COLORS.white} />
              <Text style={styles.addToCartText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Header Image */}
      <Animated.View style={[styles.headerImage, { opacity: headerOpacity }]}>
        <Image source={{ uri: canteen.image }} style={styles.coverImage} />
        <View style={styles.headerOverlay} />
      </Animated.View>

      {/* Fixed Navigation */}
      <View style={styles.fixedNav}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <Ionicons name="heart-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={{ height: HEADER_HEIGHT - 40 }} />

        {/* Canteen Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <View>
              <Text style={styles.canteenName}>{canteen.name}</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.locationText}>{canteen.location}</Text>
              </View>
            </View>
            <View style={styles.ratingLarge}>
              <Ionicons name="star" size={18} color="#FFB800" />
              <Text style={styles.ratingLargeText}>{canteen.rating}</Text>
            </View>
          </View>

          <View style={styles.infoStats}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={20} color={COLORS.primary} />
              <Text style={styles.statValue}>{canteen.deliveryTime}</Text>
              <Text style={styles.statLabel}>Delivery</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="restaurant-outline" size={20} color={COLORS.primary} />
              <Text style={styles.statValue}>{canteenFoods.length}</Text>
              <Text style={styles.statLabel}>Items</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Ionicons name="wallet-outline" size={20} color={COLORS.primary} />
              <Text style={styles.statValue}>Free</Text>
              <Text style={styles.statLabel}>Delivery</Text>
            </View>
          </View>
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Menu</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  selectedCategory === category.id && styles.categoryChipActive
                ]}
                onPress={() => setSelectedCategory(category.id)}
              >
                <Ionicons
                  name={category.icon as any}
                  size={16}
                  color={selectedCategory === category.id ? COLORS.white : COLORS.primary}
                />
                <Text style={[
                  styles.categoryChipText,
                  selectedCategory === category.id && styles.categoryChipTextActive
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Food Items */}
        <View style={styles.foodList}>
          {filteredFoods.length > 0 ? (
            filteredFoods.map(renderFoodItem)
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="fast-food-outline" size={48} color={COLORS.border} />
              <Text style={styles.emptyText}>No items in this category</Text>
            </View>
          )}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Floating Cart Button */}
      <TouchableOpacity
        style={styles.floatingCart}
        onPress={() => navigation.navigate('Cart')}
      >
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>2</Text>
        </View>
        <Ionicons name="cart" size={24} color={COLORS.white} />
        <Text style={styles.cartText}>View Cart</Text>
        <Text style={styles.cartTotal}>Rs. 850</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: HEADER_HEIGHT,
    zIndex: 0,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  fixedNav: {
    position: 'absolute',
    top: SIZES.xl + 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    zIndex: 10,
  },
  navButton: {
    width: 44,
    height: 44,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    marginHorizontal: SIZES.lg,
    borderRadius: SIZES.radiusXl,
    padding: SIZES.lg,
    ...SHADOWS.medium,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.md,
  },
  canteenName: {
    fontSize: SIZES.font3xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  ratingLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    gap: 4,
  },
  ratingLargeText: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  infoStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
  },
  statLabel: {
    fontSize: SIZES.fontXs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.xs,
  },
  categoriesSection: {
    marginTop: SIZES.lg,
    paddingHorizontal: SIZES.lg,
  },
  sectionTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  categoriesScroll: {
    gap: SIZES.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusFull,
    gap: 6,
    marginRight: SIZES.sm,
    ...SHADOWS.small,
  },
  categoryChipActive: {
    backgroundColor: COLORS.primary,
  },
  categoryChipText: {
    fontSize: SIZES.fontMd,
    color: COLORS.text,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: COLORS.white,
  },
  foodList: {
    paddingHorizontal: SIZES.lg,
    marginTop: SIZES.lg,
  },
  foodCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    marginBottom: SIZES.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  foodCardDisabled: {
    opacity: 0.7,
  },
  foodImage: {
    width: 120,
    height: 140,
  },
  unavailableOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    width: 120,
  },
  unavailableText: {
    color: COLORS.white,
    fontWeight: '600',
    fontSize: SIZES.fontSm,
  },
  foodContent: {
    flex: 1,
    padding: SIZES.sm,
    justifyContent: 'space-between',
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodName: {
    fontSize: SIZES.fontLg,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  ratingSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingTextSmall: {
    fontSize: SIZES.fontSm,
    fontWeight: '500',
    color: COLORS.text,
  },
  foodDescription: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginVertical: 4,
  },
  foodMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  prepTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  prepTimeText: {
    fontSize: SIZES.fontXs,
    color: COLORS.textSecondary,
  },
  categoryBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: SIZES.radiusSm,
  },
  categoryBadgeText: {
    fontSize: SIZES.fontXs,
    color: COLORS.primary,
    fontWeight: '500',
  },
  foodFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  foodPrice: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  addToCartButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusMd,
    gap: 4,
  },
  addToCartText: {
    color: COLORS.white,
    fontSize: SIZES.fontSm,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SIZES.xxl,
  },
  emptyText: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    marginTop: SIZES.sm,
  },
  floatingCart: {
    position: 'absolute',
    bottom: SIZES.xl,
    left: SIZES.lg,
    right: SIZES.lg,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusXl,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.lg,
    ...SHADOWS.large,
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    left: SIZES.lg,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: COLORS.primary,
    fontSize: SIZES.fontSm,
    fontWeight: 'bold',
  },
  cartText: {
    flex: 1,
    color: COLORS.white,
    fontSize: SIZES.fontLg,
    fontWeight: '600',
    marginLeft: SIZES.sm,
  },
  cartTotal: {
    color: COLORS.white,
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
  },
});

export default FoodMenuScreen;
