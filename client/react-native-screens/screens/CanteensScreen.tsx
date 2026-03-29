// SLIIT Eats - Canteens Screen
// Copy this file to: src/screens/CanteensScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { CANTEENS, Canteen } from '../constants/mockData';

interface CanteensScreenProps {
  navigation: any;
}

const CanteensScreen: React.FC<CanteensScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'open' | 'closed'>('all');

  const filteredCanteens = CANTEENS.filter(canteen => {
    const matchesSearch = canteen.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || 
      (filter === 'open' && canteen.isOpen) ||
      (filter === 'closed' && !canteen.isOpen);
    return matchesSearch && matchesFilter;
  });

  const renderCanteenCard = (canteen: Canteen) => (
    <TouchableOpacity
      key={canteen.id}
      style={styles.canteenCard}
      onPress={() => navigation.navigate('FoodMenu', { canteen })}
      disabled={!canteen.isOpen}
    >
      <Image source={{ uri: canteen.image }} style={styles.canteenImage} />
      
      {/* Status Badge */}
      <View style={[
        styles.statusBadge,
        { backgroundColor: canteen.isOpen ? COLORS.success : COLORS.error }
      ]}>
        <Text style={styles.statusText}>
          {canteen.isOpen ? 'Open' : 'Closed'}
        </Text>
      </View>

      <View style={styles.canteenContent}>
        <View style={styles.canteenHeader}>
          <Text style={styles.canteenName}>{canteen.name}</Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#FFB800" />
            <Text style={styles.ratingText}>{canteen.rating}</Text>
          </View>
        </View>

        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.locationText}>{canteen.location}</Text>
        </View>

        <View style={styles.canteenFooter}>
          <View style={styles.timeRow}>
            <Ionicons name="time-outline" size={16} color={COLORS.primary} />
            <Text style={styles.timeText}>{canteen.deliveryTime}</Text>
          </View>

          {canteen.isOpen && (
            <TouchableOpacity
              style={styles.orderButton}
              onPress={() => navigation.navigate('FoodMenu', { canteen })}
            >
              <Text style={styles.orderButtonText}>Order Now</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Canteens</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            placeholder="Search canteens..."
            placeholderTextColor={COLORS.textSecondary}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['all', 'open', 'closed'] as const).map((filterOption) => (
          <TouchableOpacity
            key={filterOption}
            style={[
              styles.filterTab,
              filter === filterOption && styles.filterTabActive
            ]}
            onPress={() => setFilter(filterOption)}
          >
            <Text style={[
              styles.filterText,
              filter === filterOption && styles.filterTextActive
            ]}>
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Canteens List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      >
        {filteredCanteens.length > 0 ? (
          filteredCanteens.map(renderCanteenCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="restaurant-outline" size={64} color={COLORS.border} />
            <Text style={styles.emptyTitle}>No canteens found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your search or filter
            </Text>
          </View>
        )}

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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingTop: SIZES.xl,
    paddingBottom: SIZES.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  headerTitle: {
    fontSize: SIZES.font2xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  searchSection: {
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    paddingHorizontal: SIZES.md,
    ...SHADOWS.small,
  },
  searchInput: {
    flex: 1,
    paddingVertical: SIZES.md,
    paddingHorizontal: SIZES.sm,
    fontSize: SIZES.fontMd,
    color: COLORS.text,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.lg,
    marginBottom: SIZES.md,
    gap: SIZES.sm,
  },
  filterTab: {
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.white,
    ...SHADOWS.small,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.white,
  },
  listContainer: {
    paddingHorizontal: SIZES.lg,
  },
  canteenCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusXl,
    marginBottom: SIZES.md,
    overflow: 'hidden',
    ...SHADOWS.medium,
  },
  canteenImage: {
    width: '100%',
    height: 160,
  },
  statusBadge: {
    position: 'absolute',
    top: SIZES.md,
    right: SIZES.md,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusFull,
  },
  statusText: {
    color: COLORS.white,
    fontSize: SIZES.fontSm,
    fontWeight: '600',
  },
  canteenContent: {
    padding: SIZES.md,
  },
  canteenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  canteenName: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusMd,
    gap: 4,
  },
  ratingText: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: SIZES.md,
  },
  locationText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  canteenFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: SIZES.fontMd,
    color: COLORS.primary,
    fontWeight: '500',
  },
  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    gap: SIZES.xs,
  },
  orderButtonText: {
    color: COLORS.white,
    fontSize: SIZES.fontMd,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: SIZES.xxl * 2,
  },
  emptyTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: SIZES.md,
  },
  emptySubtitle: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs,
  },
});

export default CanteensScreen;
