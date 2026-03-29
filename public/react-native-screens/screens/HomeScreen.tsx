import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { apiService, FoodItem as APIFoodItem } from '../services/api';

// Define local interfaces that match the API
interface Canteen {
  id: string;
  name: string;
  image: string;
  rating: number;
  status: 'open' | 'closed';
  openingHours: string;
  location: string;
  categories: string[];
}

interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  canteenId: string;
  rating: number;
  isPopular: boolean;
  isAvailable: boolean;
}

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  addToCart: (item: FoodItem) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ addToCart }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock canteens data (since backend doesn't have canteens endpoint yet)
  const mockCanteens: Canteen[] = [
    {
      id: '1',
      name: 'Main Canteen',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
      rating: 4.5,
      status: 'open',
      openingHours: '7:00 AM - 8:00 PM',
      location: 'Ground Floor',
      categories: ['Sri Lankan', 'Chinese', 'Beverages'],
    },
    {
      id: '2',
      name: 'Cafeteria',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
      rating: 4.2,
      status: 'open',
      openingHours: '8:00 AM - 6:00 PM',
      location: 'Level 2',
      categories: ['Fast Food', 'Desserts', 'Coffee'],
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch food items from backend
      const items = await apiService.getFoodItems();

      // Transform backend data to match our interface
      const transformedItems: FoodItem[] = items.map(item => ({
        id: item._id,
        name: item.name,
        description: `${item.name} - Fresh and delicious!`, // Generate description
        price: item.price,
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400', // Default image
        category: item.name.includes('Pizza') || item.name.includes('Burger') ? 'Fast Food' :
                 item.name.includes('Tea') || item.name.includes('Coffee') ? 'Beverages' :
                 item.name.includes('Biryani') || item.name.includes('Dosa') ? 'Sri Lankan' : 'General',
        canteenId: '1', // Default canteen
        rating: 4.0 + Math.random() * 1, // Random rating between 4.0-5.0
        isPopular: item.price > 50, // Mark expensive items as popular
        isAvailable: item.quantity > 0,
      }));

      setFoodItems(transformedItems);
      setCanteens(mockCanteens); // Use mock canteens for now
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const openCanteens = canteens.filter(canteen => canteen.status === 'open');
  const popularItems = foodItems.filter(item => item.isPopular);
  const filteredItems = selectedCategory === 'All'
    ? popularItems
    : popularItems.filter(item => item.category === selectedCategory);

  const categories = ['All', 'Sri Lankan', 'Chinese', 'Fast Food', 'Desserts'];

  const renderCanteenCard = ({ item }: { item: typeof mockCanteens[0] }) => (
    <TouchableOpacity style={styles.canteenCard}>
      <Image source={{ uri: item.image }} style={styles.canteenImage} />
      <View style={styles.canteenInfo}>
        <Text style={styles.canteenName}>{item.name}</Text>
        <View style={styles.canteenMeta}>
          <Ionicons name="star" size={14} color={theme.colors.accent} />
          <Text style={styles.rating}>{item.rating}</Text>
          <View style={[styles.statusBadge, item.status === 'open' ? styles.openBadge : styles.closedBadge]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <TouchableOpacity style={styles.foodCard} onPress={() => addToCart(item)}>
      <Image source={{ uri: item.image }} style={styles.foodImage} />
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodPrice}>Rs. {item.price}</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => addToCart(item)}>
          <Ionicons name="add" size={20} color={theme.colors.background} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading delicious food...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Good morning! 👋</Text>
            <Text style={styles.subtitle}>What would you like to eat today?</Text>
          </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for food or canteens..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Promo Banner */}
      <View style={styles.promoBanner}>
        <View style={styles.promoContent}>
          <Text style={styles.promoTitle}>Special Offer!</Text>
          <Text style={styles.promoSubtitle}>Get 20% off on your first order</Text>
          <TouchableOpacity style={styles.promoButton}>
            <Text style={styles.promoButtonText}>Order Now</Text>
          </TouchableOpacity>
        </View>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=200' }}
          style={styles.promoImage}
        />
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.sectionTitle}>Categories</Text>
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

      {/* Open Canteens */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Open Canteens</Text>
        <FlatList
          data={openCanteens}
          renderItem={renderCanteenCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.canteensList}
        />
      </View>

      {/* Popular Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Popular Items</Text>
        <FlatList
          data={filteredItems}
          renderItem={renderFoodItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.foodGrid}
        />
      </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: theme.colors.background,
    fontWeight: theme.typography.fontWeight.medium,
  },
  header: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
  },
  greeting: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
  },
  promoBanner: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  promoContent: {
    flex: 1,
  },
  promoTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.background,
  },
  promoSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.background,
    marginVertical: theme.spacing.sm,
  },
  promoButton: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semiBold,
  },
  promoImage: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.md,
  },
  categoriesContainer: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  categoriesScroll: {
    marginBottom: theme.spacing.sm,
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
  },
  selectedCategoryText: {
    color: theme.colors.background,
    fontWeight: theme.typography.fontWeight.medium,
  },
  section: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  canteensList: {
    paddingRight: theme.spacing.lg,
  },
  canteenCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing.md,
    width: width * 0.7,
    ...theme.shadows.md,
  },
  canteenImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  canteenInfo: {
    padding: theme.spacing.md,
  },
  canteenName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semiBold,
    color: theme.colors.text,
  },
  canteenMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  rating: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  },
  openBadge: {
    backgroundColor: theme.colors.success,
  },
  closedBadge: {
    backgroundColor: theme.colors.error,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.background,
    fontWeight: theme.typography.fontWeight.medium,
  },
  foodGrid: {
    paddingBottom: theme.spacing.xl,
  },
  foodCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    margin: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  foodImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  foodInfo: {
    padding: theme.spacing.sm,
  },
  foodName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text,
  },
  foodPrice: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginVertical: theme.spacing.xs,
  },
  addButton: {
    position: 'absolute',
    bottom: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.round,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomeScreen;