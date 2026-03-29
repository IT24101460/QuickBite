// SLIIT Eats - Orders Screen
// Copy this file to: src/screens/OrdersScreen.tsx

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { SAMPLE_ORDERS, Order } from '../constants/mockData';

interface OrdersScreenProps {
  navigation: any;
}

const OrdersScreen: React.FC<OrdersScreenProps> = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');

  const activeOrders = SAMPLE_ORDERS.filter(
    order => order.status === 'pending' || order.status === 'preparing' || order.status === 'ready'
  );
  const historyOrders = SAMPLE_ORDERS.filter(
    order => order.status === 'completed' || order.status === 'cancelled'
  );

  const getStatusConfig = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return { color: COLORS.warning, icon: 'time', label: 'Order Placed' };
      case 'preparing':
        return { color: COLORS.primary, icon: 'flame', label: 'Preparing' };
      case 'ready':
        return { color: COLORS.success, icon: 'checkmark-circle', label: 'Ready for Pickup' };
      case 'completed':
        return { color: COLORS.success, icon: 'checkmark-done-circle', label: 'Completed' };
      case 'cancelled':
        return { color: COLORS.error, icon: 'close-circle', label: 'Cancelled' };
      default:
        return { color: COLORS.textSecondary, icon: 'help-circle', label: 'Unknown' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderOrderCard = (order: Order) => {
    const statusConfig = getStatusConfig(order.status);
    const isActive = order.status === 'pending' || order.status === 'preparing' || order.status === 'ready';

    return (
      <TouchableOpacity
        key={order.id}
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetail', { order })}
      >
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>Order #{order.id}</Text>
            <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: `${statusConfig.color}15` }]}>
            <Ionicons name={statusConfig.icon as any} size={14} color={statusConfig.color} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>
        </View>

        {/* Order Items Preview */}
        <View style={styles.itemsPreview}>
          <View style={styles.imagesRow}>
            {order.items.slice(0, 3).map((item, index) => (
              <Image
                key={item.id}
                source={{ uri: item.image }}
                style={[
                  styles.itemPreviewImage,
                  { marginLeft: index > 0 ? -12 : 0, zIndex: 3 - index }
                ]}
              />
            ))}
            {order.items.length > 3 && (
              <View style={[styles.moreItems, { marginLeft: -12 }]}>
                <Text style={styles.moreItemsText}>+{order.items.length - 3}</Text>
              </View>
            )}
          </View>
          <View style={styles.itemsInfo}>
            <Text style={styles.itemsCount}>
              {order.items.reduce((sum, item) => sum + item.quantity, 0)} items
            </Text>
            <Text style={styles.canteenName}>{order.canteenName}</Text>
          </View>
        </View>

        {/* Progress Bar (for active orders) */}
        {isActive && (
          <View style={styles.progressSection}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: order.status === 'pending' ? '33%' :
                           order.status === 'preparing' ? '66%' : '100%',
                    backgroundColor: statusConfig.color,
                  }
                ]}
              />
            </View>
            <View style={styles.progressLabels}>
              <Text style={[styles.progressLabel, order.status !== 'pending' && styles.progressLabelInactive]}>
                Ordered
              </Text>
              <Text style={[styles.progressLabel, order.status === 'pending' && styles.progressLabelInactive]}>
                Preparing
              </Text>
              <Text style={[styles.progressLabel, order.status !== 'ready' && styles.progressLabelInactive]}>
                Ready
              </Text>
            </View>
          </View>
        )}

        {/* Order Footer */}
        <View style={styles.orderFooter}>
          <View>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>Rs. {order.total}</Text>
          </View>
          
          {isActive ? (
            <View style={styles.estimatedTime}>
              <Ionicons name="time-outline" size={16} color={COLORS.primary} />
              <Text style={styles.estimatedTimeText}>{order.estimatedTime}</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.reorderButton}>
              <Ionicons name="refresh" size={16} color={COLORS.primary} />
              <Text style={styles.reorderText}>Reorder</Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = (isActive: boolean) => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name={isActive ? 'receipt-outline' : 'time-outline'}
          size={64}
          color={COLORS.border}
        />
      </View>
      <Text style={styles.emptyTitle}>
        {isActive ? 'No active orders' : 'No order history'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {isActive
          ? 'Your active orders will appear here'
          : 'Your completed orders will appear here'}
      </Text>
      {isActive && (
        <TouchableOpacity
          style={styles.orderNowButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.orderNowText}>Order Now</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity style={styles.helpButton}>
          <Ionicons name="help-circle-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.tabActive]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>
            Active
          </Text>
          {activeOrders.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{activeOrders.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === 'active' ? (
          activeOrders.length > 0 ? (
            activeOrders.map(renderOrderCard)
          ) : (
            renderEmptyState(true)
          )
        ) : (
          historyOrders.length > 0 ? (
            historyOrders.map(renderOrderCard)
          ) : (
            renderEmptyState(false)
          )
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
  headerTitle: {
    fontSize: SIZES.font3xl,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  helpButton: {
    width: 44,
    height: 44,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: SIZES.lg,
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.xs,
    marginBottom: SIZES.md,
    ...SHADOWS.small,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMd,
    gap: SIZES.xs,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
  },
  tabText: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  tabBadge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SIZES.sm,
    paddingVertical: 2,
    borderRadius: SIZES.radiusFull,
  },
  tabBadgeText: {
    fontSize: SIZES.fontXs,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  scrollContent: {
    paddingHorizontal: SIZES.lg,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: SIZES.radiusXl,
    padding: SIZES.md,
    marginBottom: SIZES.md,
    ...SHADOWS.medium,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.md,
  },
  orderId: {
    fontSize: SIZES.fontLg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  orderDate: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.sm,
    paddingVertical: SIZES.xs,
    borderRadius: SIZES.radiusFull,
    gap: 4,
  },
  statusText: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
  },
  itemsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.md,
  },
  imagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPreviewImage: {
    width: 44,
    height: 44,
    borderRadius: SIZES.radiusMd,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  moreItems: {
    width: 44,
    height: 44,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  moreItemsText: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  itemsInfo: {
    marginLeft: SIZES.md,
  },
  itemsCount: {
    fontSize: SIZES.fontMd,
    fontWeight: '500',
    color: COLORS.text,
  },
  canteenName: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  progressSection: {
    marginBottom: SIZES.md,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: SIZES.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: SIZES.fontXs,
    color: COLORS.text,
    fontWeight: '500',
  },
  progressLabelInactive: {
    color: COLORS.textLight,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  totalLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
  },
  totalAmount: {
    fontSize: SIZES.fontXl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  estimatedTime: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    gap: 4,
  },
  estimatedTimeText: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.primary,
  },
  reorderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    borderRadius: SIZES.radiusMd,
    gap: 4,
  },
  reorderText: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: SIZES.xxl * 2,
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
  orderNowButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.xl,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusLg,
  },
  orderNowText: {
    fontSize: SIZES.fontLg,
    fontWeight: '600',
    color: COLORS.white,
  },
});

export default OrdersScreen;
