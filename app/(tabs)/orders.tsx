import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Layout, Spacing } from '@/constants/Layout';
import { Typography, TextStyles } from '@/constants/Typography';
import { useAppColorScheme } from '@/contexts/ThemeContext';

export default function OrdersScreen() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme];

  // Mock order data
  const orders = [
    {
      id: '1',
      orderNumber: 'ORD-2024-001',
      storeName: 'Fresh Mart',
      storeImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=80&h=80&fit=crop&crop=center',
      date: '12 Aug, 10:30 AM',
      status: 'Delivered',
      statusColor: colors.success,
      totalAmount: '₹ 567',
      itemCount: 12,
      items: ['Tomatoes', 'Onions', 'Rice', '...'],
    },
    {
      id: '2',
      orderNumber: 'ORD-2024-002',
      storeName: 'Big Basket Express',
      storeImage: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=80&h=80&fit=crop&crop=center',
      date: '11 Aug, 2:15 PM',
      status: 'On the way',
      statusColor: colors.primary,
      totalAmount: '₹ 1,234',
      itemCount: 8,
      items: ['Milk', 'Bread', 'Eggs', '...'],
    },
    {
      id: '3',
      orderNumber: 'ORD-2024-003',
      storeName: 'Daily Needs Supermart',
      storeImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=80&h=80&fit=crop&crop=center&sat=-100&hue=60',
      date: '10 Aug, 6:45 PM',
      status: 'Delivered',
      statusColor: colors.success,
      totalAmount: '₹ 892',
      itemCount: 15,
      items: ['Detergent', 'Shampoo', 'Soap', '...'],
    },
  ];

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
      >
        <Text style={[styles.shopButtonText, { color: colors.textInverse }]}>
          Start Shopping
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Orders</Text>
        <TouchableOpacity>
          <IconSymbol name="magnifyingglass" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Orders List */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {orders.length === 0 ? getEmptyState() : (
          <>
            {orders.map((order) => (
              <TouchableOpacity 
                key={order.id}
                style={[styles.orderCard, { 
                  backgroundColor: colors.surface,
                  ...Layout.shadow.md 
                }]}
                activeOpacity={0.7}
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
                        {order.itemCount} items: {order.items.join(', ')}
                      </Text>
                    </View>
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