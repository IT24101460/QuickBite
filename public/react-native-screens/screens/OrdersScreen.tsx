import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../constants/theme';
import { mockOrders, Order } from '../constants/mockData';
import { apiService, Order as APIOrder } from '../services/api';

const OrdersScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Active' | 'History'>('Active');
  const [orders, setOrders] = useState<APIOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedOrders = await apiService.getMyOrders();
      setOrders(fetchedOrders);
    } catch (err) {
      console.error('Error loading orders:', err);
      setError('Failed to load orders. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const activeOrders = orders.filter(order => order.status !== 'delivered' && order.status !== 'cancelled');
  const orderHistory = orders.filter(order => order.status === 'delivered' || order.status === 'cancelled');

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return theme.colors.warning;
      case 'preparing':
        return theme.colors.primary;
      case 'ready':
        return theme.colors.success;
      case 'delivered':
        return theme.colors.success;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'preparing':
        return 'restaurant-outline';
      case 'ready':
        return 'checkmark-circle-outline';
      case 'delivered':
        return 'checkmark-circle';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle-outline';
    }
  };

  const getProgressSteps = (status: Order['status']) => {
    const steps = [
      { key: 'ordered', label: 'Ordered', completed: true },
      { key: 'preparing', label: 'Preparing', completed: ['preparing', 'ready', 'delivered'].includes(status) },
      { key: 'ready', label: 'Ready', completed: ['ready', 'delivered'].includes(status) },
      { key: 'delivered', label: 'Delivered', completed: status === 'delivered' },
    ];
    return steps;
  };

  const renderOrderCard = ({ item }: { item: APIOrder }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Order #{item._id.slice(-8)}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.createdAt).toLocaleDateString()} • {new Date(item.createdAt).toLocaleTimeString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons name={getStatusIcon(item.status)} size={14} color={theme.colors.background} />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.deliveryInfo}>
        <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
        <Text style={styles.deliveryLocation}>{item.deliveryLocation}</Text>
      </View>

      <View style={styles.orderItems}>
        {item.items.map((cartItem, index) => (
          <Text key={cartItem._id || index} style={styles.orderItem}>
            {cartItem.quantity}x {cartItem.foodItem.name}
            {index < item.items.length - 1 ? ', ' : ''}
          </Text>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.orderTotal}>Rs. {item.total}</Text>
        <Text style={styles.estimatedTime}>{item.estimatedTime}</Text>
      </View>

      {activeTab === 'Active' && item.status !== 'cancelled' && (
        <View style={styles.progressContainer}>
          {getProgressSteps(item.status).map((step, index) => (
            <View key={step.key} style={styles.progressStep}>
              <View style={[
                styles.progressCircle,
                step.completed && styles.progressCircleCompleted,
              ]}>
                {step.completed && (
                  <Ionicons name="checkmark" size={12} color={theme.colors.background} />
                )}
              </View>
              <Text style={[
                styles.progressLabel,
                step.completed && styles.progressLabelCompleted,
              ]}>
                {step.label}
              </Text>
              {index < getProgressSteps(item.status).length - 1 && (
                <View style={[
                  styles.progressLine,
                  step.completed && styles.progressLineCompleted,
                ]} />
              )}
            </View>
          ))}
        </View>
      )}

      {activeTab === 'Active' && item.status === 'ready' && (
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Mark as Delivered</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const currentOrders = activeTab === 'Active' ? activeOrders : orderHistory;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading your orders...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadOrders}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'Active' && styles.activeTab]}
              onPress={() => setActiveTab('Active')}
            >
              <Text style={[styles.tabText, activeTab === 'Active' && styles.activeTabText]}>
                Active ({activeOrders.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'History' && styles.activeTab]}
              onPress={() => setActiveTab('History')}
            >
              <Text style={[styles.tabText, activeTab === 'History' && styles.activeTabText]}>
                History ({orderHistory.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Orders List */}
          {currentOrders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name={activeTab === 'Active' ? 'receipt-outline' : 'time-outline'}
                size={80}
                color={theme.colors.textSecondary}
              />
              <Text style={styles.emptyTitle}>
                {activeTab === 'Active' ? 'No active orders' : 'No order history'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {activeTab === 'Active'
                  ? 'Your active orders will appear here'
                  : 'Your past orders will appear here'
                }
              </Text>
            </View>
          ) : (
            <FlatList
              data={currentOrders}
              renderItem={renderOrderCard}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.ordersList}
              showsVerticalScrollIndicator={false}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
  },
  activeTab: {
    backgroundColor: theme.colors.primary,
  },
  tabText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.textSecondary,
  },
  activeTabText: {
    color: theme.colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
  },
  emptySubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  ordersList: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  orderCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  orderId: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  orderDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.background,
    fontWeight: theme.typography.fontWeight.medium,
    marginLeft: theme.spacing.xs,
    textTransform: 'capitalize',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  deliveryLocation: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  orderItems: {
    marginBottom: theme.spacing.sm,
  },
  orderItem: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  orderTotal: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  estimatedTime: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.md,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressCircle: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.round,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  progressCircleCompleted: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  progressLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  progressLabelCompleted: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  progressLine: {
    position: 'absolute',
    top: 12,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: theme.colors.border,
  },
  progressLineCompleted: {
    backgroundColor: theme.colors.primary,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  actionButtonText: {
    color: theme.colors.background,
    fontWeight: theme.typography.fontWeight.medium,
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
});

export default OrdersScreen;