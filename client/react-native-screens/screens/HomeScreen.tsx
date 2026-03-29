// SLIIT Eats - Home Screen
// Copy this file to: src/screens/HomeScreen.tsx

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { CANTEENS, FOOD_ITEMS, CATEGORIES } from '../constants/mockData';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const popularItems = FOOD_ITEMS.filter(item => item.rating >= 4.5).slice(0, 4);
  const openCanteens = CANTEENS.filter(canteen => canteen.isOpen);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.locationContainer}>
            <Ionicons name="location" size={20} color={COLORS.primary} />
            <Text style={styles.locationLabel}>Deliver to</Text>
          </View>
          <TouchableOpacity style={styles.locationButton}>
            <Text style={styles.locationText}>SLIIT Campus</Text>
            <Ionicons name="chevron-down" size={16} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
          <View style={styles.notificationBadge}>
            <Text style={styles.badgeText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
        {/* Greeting */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greeting}>Good Morning</Text>
          <Text style={styles.userName}>John!</Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            placeholder="Search for food..."
            placeholderTextColor={COLORS.textSecondary}
            style={styles.searchInput}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="options-outline" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Promo Banner */}
        <TouchableOpacity style={styles.promoBanner}>
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>Special Offer</Text>
            <Text style={styles.promoDiscount}>20% OFF</Text>
            <Text style={styles.promoDescription}>On all lunch items today</Text>
            <TouchableOpacity style={styles.promoButton}>
              <Text style={styles.promoButtonText}>Order Now</Text>
            </TouchableOpacity>
          </View>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=200' }}
            style={styles.promoImage}
          />
        </TouchableOpacity>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {CATEGORIES.map((category, index) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryItem,
                index === 0 && styles.categoryItemActive
              ]}
            >
              <View style={[
                styles.categoryIcon,
                index === 0 && styles.categoryIconActive
              ]}>
                <Ionicons
                  name={category.icon as any}
                  size={24}
                  color={index === 0 ? COLORS.white : COLORS.primary}
                />
              </View>
              <Text style={[
                styles.categoryName,
                index === 0 && styles.categoryNameActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Open Canteens */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Open Canteens</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Canteens')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.canteensScroll}>
          {openCanteens.map((canteen) => (
            <TouchableOpacity
              key={canteen.id}
              style={styles.canteenCard}
              onPress={() => navigation.navigate('FoodMenu', { canteen })}
            >
              <Image source={{ uri: canteen.image }} style={styles.canteenImage} />
              <View style={styles.canteenInfo}>
                <Text style={styles.canteenName}>{canteen.name}</Text>
                <View style={styles.canteenMeta}>
                  <View style={styles.ratingContainer}>
                    <Ionicons name="star" size={14} color="#FFB800" />
                    <Text style={styles.rating}>{canteen.rating}</Text>
                  </View>
                  <View style={styles.timeContainer}>
                    <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.deliveryTime}>{canteen.deliveryTime}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Popular Items */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Items</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.popularGrid}>
          {popularItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.foodCard}
              onPress={() => navigation.navigate('FoodDetail', { item })}
            >
              <Image source={{ uri: item.image }} style={styles.foodImage} />
              <View style={styles.foodInfo}>
                <Text style={styles.foodName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.foodDescription} numberOfLines={2}>{item.description}</Text>
                <View style={styles.foodFooter}>
                  <Text style={styles.foodPrice}>Rs. {item.price}</Text>
                  <TouchableOpacity style={styles.addButton}>
                    <Ionicons name="add" size={18} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.md,
    backgroundColor: COLORS.background,
  },
  headerLeft: {
    flex: 1,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: SIZES.fontLg,
    fontWeight: '600',
    color: COLORS.text,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: SIZES.lg,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: SIZES.md,
  },
  greeting: {
    fontSize: SIZES.font3xl,
    color: COLORS.text,
  },
  userName: {
    fontSize: SIZES.font3xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    paddingHorizontal: SIZES.md,
    marginBottom: SIZES.lg,
    ...SHADOWS.small,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.sm,
    fontSize: SIZES.fontMd,
    color: COLORS.text,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoBanner: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusXl,
    padding: SIZES.lg,
    marginBottom: SIZES.lg,
    overflow: 'hidden',
  },
  promoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  promoTitle: {
    fontSize: SIZES.fontSm,
    color: COLORS.white,
    opacity: 0.9,
  },
  promoDiscount: {
    fontSize: SIZES.font5xl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginVertical: 4,
  },
  promoDescription: {
    fontSize: SIZES.fontSm,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: SIZES.sm,
  },
  promoButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: SIZES.fontSm,
  },
  promoImage: {
    width: 120,
    height: 120,
    borderRadius: SIZES.radiusLg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  seeAll: {
    fontSize: SIZES.fontMd,
    color: COLORS.primary,
    fontWeight: '500',
  },
  categoriesScroll: {
    marginBottom: SIZES.lg,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: SIZES.md,
  },
  categoryItemActive: {},
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: SIZES.radiusLg,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.xs,
    ...SHADOWS.small,
  },
  categoryIconActive: {
    backgroundColor: COLORS.primary,
  },
  categoryName: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  categoryNameActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  canteensScroll: {
    marginBottom: SIZES.lg,
  },
  canteenCard: {
    width: 200,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    marginRight: SIZES.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  canteenImage: {
    width: '100%',
    height: 100,
  },
  canteenInfo: {
    padding: SIZES.sm,
  },
  canteenName: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  canteenMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rating: {
    fontSize: SIZES.fontSm,
    color: COLORS.text,
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  deliveryTime: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  popularGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  foodCard: {
    width: (width - SIZES.lg * 2 - SIZES.md) / 2,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    marginBottom: SIZES.md,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  foodImage: {
    width: '100%',
    height: 100,
  },
  foodInfo: {
    padding: SIZES.sm,
  },
  foodName: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  foodDescription: {
    fontSize: SIZES.fontXs,
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
    lineHeight: 14,
  },
  foodFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodPrice: {
    fontSize: SIZES.fontMd,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: SIZES.radiusSm,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default HomeScreen;
