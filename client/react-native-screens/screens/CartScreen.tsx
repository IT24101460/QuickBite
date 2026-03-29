// SLIIT Eats - Cart Screen
// Copy this file to: src/screens/CartScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { FOOD_ITEMS, CartItem } from '../constants/mockData';

interface CartScreenProps {
  navigation: any;
}

// Sample cart data
const initialCartItems: CartItem[] = [
  { ...FOOD_ITEMS[0], quantity: 2 },
  { ...FOOD_ITEMS[3], quantity: 1 },
];

const CartScreen: React.FC<CartScreenProps> = ({ navigation }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);

  const updateQuantity = (itemId: string, change: number) => {
    setCartItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
          const newQuantity = Math.max(0, item.quantity + change);
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const removeItem = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  const renderCartItem = (item: CartItem) => (
    <View key={item.id} style={styles.cartItem}>
      <Image source={{ uri: item.image }} style={styles.itemImage} />
      
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeItem(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        <Text style={styles.itemCategory}>{item.category}</Text>

        <View style={styles.itemFooter}>
          <Text style={styles.itemPrice}>Rs. {item.price}</Text>
          
          <View style={styles.quantityControl}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item.id, -1)}
            >
              <Ionicons name="remove" size={16} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.quantity}>{item.quantity}</Text>
            <TouchableOpacity
              style={[styles.quantityButton, styles.quantityButtonPrimary]}
              onPress={() => updateQuantity(item.id, 1)}
            >
              <Ionicons name="add" size={16} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
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
        <Text style={styles.headerTitle}>My Cart</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => setCartItems([])}
        >
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      {cartItems.length > 0 ? (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Delivery Info */}
            <View style={styles.deliveryCard}>
              <View style={styles.deliveryIcon}>
                <Ionicons name="location" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryLabel}>Deliver to</Text>
                <Text style={styles.deliveryAddress}>SLIIT Campus - Main Building</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.changeText}>Change</Text>
              </TouchableOpacity>
            </View>

            {/* Cart Items */}
            <View style={styles.cartSection}>
              <Text style={styles.sectionTitle}>Order Items</Text>
              {cartItems.map(renderCartItem)}
            </View>

            {/* Add Note */}
            <TouchableOpacity style={styles.addNoteCard}>
              <Ionicons name="create-outline" size={20} color={COLORS.primary} />
              <Text style={styles.addNoteText}>Add a note to your order</Text>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>

            {/* Promo Code */}
            <View style={styles.promoCard}>
              <View style={styles.promoLeft}>
                <Ionicons name="pricetag" size={20} color={COLORS.primary} />
                <Text style={styles.promoText}>Apply Promo Code</Text>
              </View>
              <TouchableOpacity style={styles.applyButton}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>

            {/* Order Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>Rs. {subtotal}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValueFree}>FREE</Text>
              </View>

              <View style={styles.summaryDivider} />
              
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>Rs. {total}</Text>
              </View>
            </View>

            <View style={{ height: 120 }} />
          </ScrollView>

          {/* Checkout Button */}
          <View style={styles.checkoutContainer}>
            <View style={styles.checkoutInfo}>
              <Text style={styles.checkoutLabel}>Total Payment</Text>
              <Text style={styles.checkoutTotal}>Rs. {total}</Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => navigation.navigate('Checkout')}
            >
              <Text style={styles.checkoutButtonText}>Checkout</Text>
              <Ionicons name="arrow-forward" size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="cart-outline" size={80} color={COLORS.border} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Looks like you have not added anything to your cart yet
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.browseButtonText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      )}
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
  clearButton: {
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
  },
  clearText: {
    fontSize: SIZES.fontMd,
    color: COLORS.error,
    fontWeight: '500',
  },
  scrollContent: {
    paddingHorizontal: SIZES.lg,
  },
  deliveryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    ...SHADOWS.small,
  },
  deliveryIcon: {
    width: 44,
    height: 44,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryInfo: {
    flex: 1,
    marginLeft: SIZES.sm,
  },
  deliveryLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  deliveryAddress: {
    fontSize: SIZES.fontMd,
    color: COLORS.text,
    fontWeight: '500',
  },
  changeText: {
    fontSize: SIZES.fontMd,
    color: COLORS.primary,
    fontWeight: '600',
  },
  cartSection: {
    marginBottom: SIZES.md,
  },
  sectionTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    marginBottom: SIZES.sm,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  itemImage: {
    width: 100,
    height: 100,
  },
  itemContent: {
    flex: 1,
    padding: SIZES.sm,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemName: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  removeButton: {
    padding: SIZES.xs,
  },
  itemCategory: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: SIZES.radiusSm,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonPrimary: {
    backgroundColor: COLORS.primary,
  },
  quantity: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.text,
    minWidth: 20,
    textAlign: 'center',
  },
  addNoteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    ...SHADOWS.small,
  },
  addNoteText: {
    flex: 1,
    fontSize: SIZES.fontMd,
    color: COLORS.text,
    marginLeft: SIZES.sm,
  },
  promoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    ...SHADOWS.small,
  },
  promoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoText: {
    fontSize: SIZES.fontMd,
    color: COLORS.text,
    marginLeft: SIZES.sm,
  },
  applyButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
  },
  applyButtonText: {
    fontSize: SIZES.fontSm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.md,
    ...SHADOWS.small,
  },
  summaryTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  summaryLabel: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: SIZES.fontMd,
    color: COLORS.text,
    fontWeight: '500',
  },
  summaryValueFree: {
    fontSize: SIZES.fontMd,
    color: COLORS.success,
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.sm,
  },
  totalLabel: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: SIZES.font2xl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  checkoutContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    paddingBottom: SIZES.xl,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
    ...SHADOWS.large,
  },
  checkoutInfo: {
    flex: 1,
  },
  checkoutLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  checkoutTotal: {
    fontSize: SIZES.font2xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusLg,
    gap: SIZES.sm,
  },
  checkoutButtonText: {
    fontSize: SIZES.fontLg,
    fontWeight: '600',
    color: COLORS.white,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.xl,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  emptyTitle: {
    fontSize: SIZES.font2xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  emptySubtitle: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.lg,
  },
  browseButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusLg,
  },
  browseButtonText: {
    fontSize: SIZES.fontLg,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default CartScreen;
