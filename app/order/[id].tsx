import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Layout, Spacing } from '@/constants/Layout';
import { Typography, TextStyles } from '@/constants/Typography';
import { useAppColorScheme } from '@/contexts/ThemeContext';
import { useState, useEffect } from 'react';

const { width: screenWidth } = Dimensions.get('window');

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme];
  const [currentStep, setCurrentStep] = useState(2);
  const [estimatedTime, setEstimatedTime] = useState(12);

  // Mock order data
  const order = {
    id: id || 'ORD-2024-002',
    orderNumber: 'ORD-2024-002',
    storeName: 'Fresh Mart',
    storeImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=80&h=80&fit=crop&crop=center',
    storePhone: '+91 98765 43210',
    deliveryPartner: 'Rajesh Kumar',
    deliveryPhone: '+91 87654 32109',
    deliveryLocation: { latitude: 12.9716, longitude: 77.5946 },
    userLocation: { latitude: 12.9750, longitude: 77.5980 },
    estimatedDelivery: '2:45 PM',
    totalAmount: 567,
    status: 'on_the_way',
    items: [
      { name: 'Fresh Tomatoes', quantity: 2, unit: 'kg', price: 90 },
      { name: 'Organic Onions', quantity: 1, unit: 'kg', price: 35 },
      { name: 'Basmati Rice', quantity: 1, unit: '1kg', price: 150 },
      { name: 'Amul Milk', quantity: 3, unit: '1L', price: 168 },
    ],
    timeline: [
      { 
        step: 0, 
        title: 'Order Confirmed', 
        description: 'Your order has been confirmed',
        time: '1:15 PM',
        completed: true 
      },
      { 
        step: 1, 
        title: 'Order Packed', 
        description: 'Your order is being prepared',
        time: '1:25 PM',
        completed: true 
      },
      { 
        step: 2, 
        title: 'On the way', 
        description: 'Your order is on the way',
        time: '1:35 PM',
        completed: true,
        active: true 
      },
      { 
        step: 3, 
        title: 'Delivered', 
        description: 'Order will be delivered soon',
        time: '2:45 PM (Est)',
        completed: false 
      },
    ],
  };

  // Simulate real-time updates
  useEffect(() => {
    const timer = setInterval(() => {
      setEstimatedTime(prev => Math.max(0, prev - 1));
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  const renderTimelineStep = (step: any, index: number) => (
    <View key={step.step} style={styles.timelineStep}>
      <View style={styles.timelineLeft}>
        <View
          style={[
            styles.timelineIcon,
            {
              backgroundColor: step.completed 
                ? colors.success 
                : step.active 
                ? colors.primary 
                : colors.border,
            },
          ]}
        >
          {step.completed ? (
            <IconSymbol name="checkmark" size={16} color={colors.textInverse} />
          ) : step.active ? (
            <View style={[styles.pulsingDot, { backgroundColor: colors.textInverse }]} />
          ) : (
            <View style={[styles.inactiveDot, { backgroundColor: colors.textTertiary }]} />
          )}
        </View>
        {index < order.timeline.length - 1 && (
          <View
            style={[
              styles.timelineLine,
              { backgroundColor: step.completed ? colors.success : colors.border },
            ]}
          />
        )}
      </View>
      
      <View style={styles.timelineContent}>
        <Text style={[styles.timelineTitle, { color: colors.text }]}>
          {step.title}
        </Text>
        <Text style={[styles.timelineDescription, { color: colors.textSecondary }]}>
          {step.description}
        </Text>
        <Text style={[styles.timelineTime, { color: colors.textSecondary }]}>
          {step.time}
        </Text>
      </View>
    </View>
  );

  const renderOrderItem = (item: any, index: number) => (
    <View key={index} style={[styles.orderItem, { borderBottomColor: colors.divider }]}>
      <Text style={[styles.itemName, { color: colors.text }]}>
        {item.name}
      </Text>
      <View style={styles.itemDetails}>
        <Text style={[styles.itemQuantity, { color: colors.textSecondary }]}>
          {item.quantity} {item.unit}
        </Text>
        <Text style={[styles.itemPrice, { color: colors.text }]}>
          ₹{item.price}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.divider }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <IconSymbol name="arrow.left" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Order Tracking
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {order.orderNumber}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.helpButton}
          onPress={() => {}}
        >
          <IconSymbol name="questionmark.circle" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Map Placeholder */}
        <View style={[styles.mapContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.mapPlaceholder}>
            <IconSymbol name="map" size={48} color={colors.textSecondary} />
            <Text style={[styles.mapPlaceholderText, { color: colors.textSecondary }]}>
              Live tracking map would appear here
            </Text>
            <Text style={[styles.mapSubtext, { color: colors.textTertiary }]}>
              Your delivery partner is {estimatedTime} mins away
            </Text>
          </View>
          
          {/* ETA Badge */}
          <View style={[styles.etaBadge, { backgroundColor: colors.primary }]}>
            <IconSymbol name="clock" size={16} color={colors.textInverse} />
            <Text style={[styles.etaText, { color: colors.textInverse }]}>
              ETA {order.estimatedDelivery}
            </Text>
          </View>
        </View>

        {/* Delivery Partner Info */}
        <View style={[styles.deliveryPartnerCard, { backgroundColor: colors.surface }]}>
          <View style={styles.partnerInfo}>
            <View style={[styles.partnerAvatar, { backgroundColor: colors.primary + '20' }]}>
              <IconSymbol name="person.fill" size={24} color={colors.primary} />
            </View>
            <View style={styles.partnerDetails}>
              <Text style={[styles.partnerName, { color: colors.text }]}>
                {order.deliveryPartner}
              </Text>
              <Text style={[styles.partnerRole, { color: colors.textSecondary }]}>
                Delivery Partner
              </Text>
              <View style={styles.partnerRating}>
                <IconSymbol name="star.fill" size={14} color={colors.rating} />
                <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                  4.8 (124 deliveries)
                </Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.callButton, { backgroundColor: colors.success + '20' }]}
            activeOpacity={0.7}
          >
            <IconSymbol name="phone.fill" size={20} color={colors.success} />
          </TouchableOpacity>
        </View>

        {/* Order Timeline */}
        <View style={[styles.timelineCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Order Status
          </Text>
          
          <View style={styles.timeline}>
            {order.timeline.map((step, index) => renderTimelineStep(step, index))}
          </View>
        </View>

        {/* Order Details */}
        <View style={[styles.orderDetailsCard, { backgroundColor: colors.surface }]}>
          <View style={styles.storeHeader}>
            <Image source={{ uri: order.storeImage }} style={styles.storeImage} />
            <View style={styles.storeInfo}>
              <Text style={[styles.storeName, { color: colors.text }]}>
                {order.storeName}
              </Text>
              <Text style={[styles.orderTotal, { color: colors.textSecondary }]}>
                Total: ₹{order.totalAmount}
              </Text>
            </View>
            <TouchableOpacity style={styles.storeCallButton}>
              <IconSymbol name="phone" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Order Items ({order.items.length})
          </Text>
          
          {order.items.map((item, index) => renderOrderItem(item, index))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, { 
              backgroundColor: colors.surface,
              borderColor: colors.border 
            }]}
            activeOpacity={0.7}
          >
            <IconSymbol name="arrow.clockwise" size={20} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>
              Reorder
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { 
              backgroundColor: colors.surface,
              borderColor: colors.border 
            }]}
            activeOpacity={0.7}
          >
            <IconSymbol name="star" size={20} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>
              Rate Order
            </Text>
          </TouchableOpacity>
        </View>
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
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    ...TextStyles.bodyLarge,
    fontWeight: Typography.fontWeight.semibold,
  },
  headerSubtitle: {
    ...TextStyles.caption,
  },
  helpButton: {
    padding: Spacing.xs,
  },
  mapContainer: {
    height: 250,
    margin: Spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    position: 'relative',
    overflow: 'hidden',
    ...Layout.shadow.md,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  mapPlaceholderText: {
    ...TextStyles.body,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  mapSubtext: {
    ...TextStyles.bodySmall,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  etaBadge: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Layout.borderRadius.lg,
  },
  etaText: {
    ...TextStyles.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
    marginLeft: Spacing.xs,
  },
  deliveryPartnerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: Layout.borderRadius.lg,
    ...Layout.shadow.sm,
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  partnerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  partnerDetails: {
    flex: 1,
  },
  partnerName: {
    ...TextStyles.bodyLarge,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xxs,
  },
  partnerRole: {
    ...TextStyles.bodySmall,
    marginBottom: Spacing.xs,
  },
  partnerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...TextStyles.caption,
    marginLeft: Spacing.xs,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineCard: {
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: Layout.borderRadius.lg,
    ...Layout.shadow.sm,
  },
  sectionTitle: {
    ...TextStyles.h5,
    marginBottom: Spacing.lg,
  },
  timeline: {
    paddingLeft: Spacing.sm,
  },
  timelineStep: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  timelineLeft: {
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  inactiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timelineLine: {
    width: 2,
    height: 40,
    marginTop: Spacing.xs,
  },
  timelineContent: {
    flex: 1,
    paddingTop: Spacing.xs,
  },
  timelineTitle: {
    ...TextStyles.body,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xxs,
  },
  timelineDescription: {
    ...TextStyles.bodySmall,
    marginBottom: Spacing.xs,
  },
  timelineTime: {
    ...TextStyles.caption,
  },
  orderDetailsCard: {
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: Layout.borderRadius.lg,
    ...Layout.shadow.sm,
  },
  storeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  storeImage: {
    width: 50,
    height: 50,
    borderRadius: Layout.borderRadius.md,
    marginRight: Spacing.md,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    ...TextStyles.bodyLarge,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.xxs,
  },
  orderTotal: {
    ...TextStyles.body,
    fontWeight: Typography.fontWeight.medium,
  },
  storeCallButton: {
    padding: Spacing.sm,
  },
  divider: {
    height: 1,
    marginBottom: Spacing.lg,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  itemName: {
    ...TextStyles.body,
    flex: 1,
    marginRight: Spacing.md,
  },
  itemDetails: {
    alignItems: 'flex-end',
  },
  itemQuantity: {
    ...TextStyles.bodySmall,
    marginBottom: Spacing.xxs,
  },
  itemPrice: {
    ...TextStyles.body,
    fontWeight: Typography.fontWeight.semibold,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
  },
  actionButtonText: {
    ...TextStyles.body,
    fontWeight: Typography.fontWeight.semibold,
    marginLeft: Spacing.sm,
  },
});