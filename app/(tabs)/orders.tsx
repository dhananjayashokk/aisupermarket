import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Image, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Layout, Spacing } from '@/constants/Layout';
import { Typography, TextStyles } from '@/constants/Typography';
import { useAppColorScheme } from '@/contexts/ThemeContext';
import { ApiService } from '@/services/api';
import { useState, useEffect } from 'react';

export default function OrdersScreen() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme];
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');

  // Status color mapping
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return colors.success;
      case 'confirmed': return colors.primary;
      case 'pending': return colors.warning;
      case 'cancelled': return colors.error;
      case 'out_for_delivery': return colors.info;
      default: return colors.textSecondary;
    }
  };

  // Fetch orders from API
  const fetchOrders = async (page = 1, status = 'all', isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await ApiService.orders.getCustomerOrders({
        page,
        limit: 10,
        status
      });

      const transformedOrders = response.orders.map((order: any) => ({
        id: order.id.toString(),
        orderNumber: order.orderNumber,
        storeName: order.store?.name || 'Store',
        storeImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=80&h=80&fit=crop&crop=center',
        date: new Date(order.timestamps.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        }),
        status: order.status.display.label,
        statusColor: getStatusColor(order.status.current),
        totalAmount: `₹${parseFloat(order.pricing.totalAmount).toFixed(0)}`,
        itemCount: order.itemCount,
        paymentStatus: order.payment.status,
        paymentMethod: order.payment.method.displayName,
        deliverySlot: order.delivery.slot ? new Date(order.delivery.slot).toLocaleDateString() : null,
        specialInstructions: order.delivery.specialInstructions
      }));

      if (page === 1) {
        setOrders(transformedOrders);
      } else {
        setOrders(prev => [...prev, ...transformedOrders]);
      }
      
      setPagination(response.pagination);
      setCurrentPage(page);

    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle refresh
  const onRefresh = () => {
    fetchOrders(1, statusFilter, true);
  };

  // Handle order card press
  const handleOrderPress = (orderId: string) => {
    router.push(`/order/${orderId}`);
  };

  const getEmptyState = () => (
    <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
      <IconSymbol name="receipt" size={64} color={colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>No Orders Yet</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Your order history will appear here
      </Text>
      <TouchableOpacity 
        style={[styles.shopButton, { backgroundColor: colors.primary }]}
        activeOpacity={0.8}
        onPress={() => router.push('/(tabs)')}
      >
        <Text style={[styles.shopButtonText, { color: colors.textInverse }]}>
          Start Shopping
        </Text>
      </TouchableOpacity>
    </View>
  );

  const getErrorState = () => (
    <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
      <IconSymbol name="exclamationmark.triangle" size={64} color={colors.error} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>Failed to Load Orders</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        {error}
      </Text>
      <TouchableOpacity 
        style={[styles.shopButton, { backgroundColor: colors.primary }]}
        activeOpacity={0.8}
        onPress={() => fetchOrders()}
      >
        <Text style={[styles.shopButtonText, { color: colors.textInverse }]}>
          Try Again
        </Text>
      </TouchableOpacity>
    </View>
  );

  const getLoadingState = () => (
    <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>Loading Orders...</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Orders</Text>
          {pagination && (
            <Text style={[styles.orderCount, { color: colors.textSecondary }]}>
              {pagination.total} total order{pagination.total !== 1 ? 's' : ''}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={onRefresh}>
          <IconSymbol name="arrow.clockwise" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {loading ? getLoadingState() : error ? getErrorState() : orders.length === 0 ? getEmptyState() : (
          <>
            {orders.map((order) => (
              <TouchableOpacity 
                key={order.id}
                style={[styles.orderCard, { 
                  backgroundColor: colors.surface,
                  ...Layout.shadow.md 
                }]}
                activeOpacity={0.7}
                onPress={() => handleOrderPress(order.id)}
              >
                <View style={styles.orderHeader}>
                  <Image 
                    source={{ uri: order.storeImage }} 
                    style={styles.storeImage}
                  />
                  <View style={styles.orderInfo}>
                    <Text style={[styles.storeName, { color: colors.text }]}>
                      {order.storeName}
                    </Text>
                    <Text style={[styles.orderDate, { color: colors.textSecondary }]}>
                      {order.date}
                    </Text>
                    <View style={styles.itemsPreview}>
                      <Text style={[styles.itemsText, { color: colors.textSecondary }]}>
                        {order.itemCount} item{order.itemCount !== 1 ? 's' : ''}
                      </Text>
                      <Text style={[styles.paymentMethod, { color: colors.textTertiary }]}>
                        • {order.paymentMethod}
                      </Text>
                    </View>
                    {order.deliverySlot && (
                      <Text style={[styles.deliverySlot, { color: colors.textTertiary }]}>
                        Delivery: {order.deliverySlot}
                      </Text>
                    )}
                  </View>
                </View>
                
                <View style={[styles.orderFooter, { borderTopColor: colors.divider }]}>
                  <View style={styles.statusContainer}>
                    <View style={[styles.statusBadge, { backgroundColor: order.statusColor + '20' }]}>
                      <Text style={[styles.statusText, { color: order.statusColor }]}>
                        {order.status}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.amountContainer}>
                    <Text style={[styles.totalAmount, { color: colors.text }]}>
                      {order.totalAmount}
                    </Text>
                    <TouchableOpacity style={styles.reorderButton}>
                      <Text style={[styles.reorderText, { color: colors.primary }]}>
                        Reorder
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    ...TextStyles.h4,
  },
  orderCount: {
    ...TextStyles.caption,
    marginTop: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  orderCard: {
    borderRadius: Layout.card.borderRadius,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  orderHeader: {
    flexDirection: 'row',
    padding: Layout.card.padding,
  },
  storeImage: {
    width: 60,
    height: 60,
    borderRadius: Layout.borderRadius.md,
    marginRight: Spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  storeName: {
    ...TextStyles.h5,
    marginBottom: Spacing.xs,
  },
  orderDate: {
    ...TextStyles.bodySmall,
    marginBottom: Spacing.sm,
  },
  itemsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemsText: {
    ...TextStyles.caption,
    flex: 1,
  },
  paymentMethod: {
    ...TextStyles.caption,
    marginLeft: Spacing.sm,
  },
  deliverySlot: {
    ...TextStyles.caption,
    marginTop: Spacing.xs,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.card.padding,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  statusContainer: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  statusText: {
    ...TextStyles.caption,
    fontWeight: Typography.fontWeight.semibold,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  totalAmount: {
    ...TextStyles.price,
    marginBottom: Spacing.xs,
  },
  reorderButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  reorderText: {
    ...TextStyles.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl,
    paddingTop: 100,
  },
  emptyTitle: {
    ...TextStyles.h4,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    ...TextStyles.body,
    textAlign: 'center',
    marginBottom: Spacing.xxl,
  },
  shopButton: {
    paddingHorizontal: Spacing.xxl,
    paddingVertical: Spacing.md,
    borderRadius: Layout.button.borderRadius,
  },
  shopButtonText: {
    ...TextStyles.button,
  },
});