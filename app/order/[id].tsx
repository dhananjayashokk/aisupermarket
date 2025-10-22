import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Layout, Spacing } from '@/constants/Layout';
import { Typography, TextStyles } from '@/constants/Typography';
import { useAppColorScheme } from '@/contexts/ThemeContext';
import { useState, useEffect, useRef } from 'react';
import { ApiService } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { subscribeToOrder, unsubscribeFromOrder } from '@/services/supabase';

const { width: screenWidth } = Dimensions.get('window');

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme];
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estimatedTime, setEstimatedTime] = useState(25);
  const realtimeChannelRef = useRef<any>(null);
  
  // Normalize status from different API response formats
  const normalizeStatus = (statusData: any): { status: string; progress: number } => {
    // Handle different API response formats
    if (typeof statusData === 'string') {
      return { status: normalizeStatusString(statusData), progress: 0 };
    }
    
    if (statusData && typeof statusData === 'object') {
      const status = statusData.current || statusData.status || 'pending';
      const progress = statusData.progress || 0;
      return { status: normalizeStatusString(status), progress };
    }
    
    return { status: 'pending', progress: 0 };
  };
  
  // Normalize different status string formats to our standard keys
  const normalizeStatusString = (status: string): string => {
    if (!status) return 'pending';
    
    const originalStatus = status;
    const normalizedStatus = status.toLowerCase().replace(/[\s_-]+/g, '_');
    
    // Map various API status formats to our standard keys
    const statusMap: { [key: string]: string } = {
      'pending': 'pending',
      'placed': 'pending',
      'order_placed': 'pending',
      
      'preparing': 'order_preparing',
      'order_preparing': 'order_preparing',
      'in_preparation': 'order_preparing',
      'kitchen': 'order_preparing',
      
      'confirmed': 'order_confirmed',
      'order_confirmed': 'order_confirmed',
      'accepted': 'order_confirmed',
      'approved': 'order_confirmed',
      
      'ready': 'ready_to_dispatch',
      'ready_to_dispatch': 'ready_to_dispatch',
      'ready_for_pickup': 'ready_to_dispatch',
      'packed': 'ready_to_dispatch',
      'completed': 'ready_to_dispatch',
      
      'out_for_delivery': 'out_for_delivery',
      'dispatched': 'out_for_delivery',
      'on_the_way': 'out_for_delivery',
      'in_transit': 'out_for_delivery',
      
      'delivered': 'delivered',
      'completed': 'delivered',
      'finished': 'delivered'
    };
    
    const mappedStatus = statusMap[normalizedStatus] || normalizedStatus;
    console.log(`Status mapping: "${originalStatus}" -> "${normalizedStatus}" -> "${mappedStatus}"`);
    
    return mappedStatus;
  };
  
  // Get display information for each status
  const getStatusDisplay = (status: string): { label: string; description: string; color: string } => {
    const displayMap: { [key: string]: { label: string; description: string; color: string } } = {
      'pending': {
        label: 'Order Placed',
        description: 'Your order has been received and is being reviewed',
        color: 'orange'
      },
      'order_preparing': {
        label: 'Preparing',
        description: 'The store is preparing your order',
        color: 'blue'
      },
      'order_confirmed': {
        label: 'Confirmed',
        description: 'Your order has been confirmed by the store',
        color: 'green'
      },
      'ready_to_dispatch': {
        label: 'Ready to Dispatch',
        description: 'Your order is packed and ready for delivery',
        color: 'purple'
      },
      'out_for_delivery': {
        label: 'Out for Delivery',
        description: 'Your order is on the way to you',
        color: 'blue'
      },
      'delivered': {
        label: 'Delivered',
        description: 'Your order has been successfully delivered',
        color: 'green'
      }
    };
    
    return displayMap[status] || {
      label: 'Processing',
      description: 'Your order is being processed',
      color: 'orange'
    };
  };

  // Define delivery order status progression based on API response
  const getDeliveryTimeline = (currentStatus: string, progress: number, orderTime: string, deliverySlot?: string) => {
    const statuses = [
      { 
        key: 'pending',
        title: 'Order Placed',
        description: 'Your order has been placed and is being reviewed',
        icon: 'checkmark.circle.fill',
        progressThreshold: 0
      },
      { 
        key: 'order_preparing',
        title: 'Order Preparing',
        description: 'Your order is being prepared by the store',
        icon: 'bag.fill',
        progressThreshold: 20
      },
      { 
        key: 'order_confirmed',
        title: 'Order Confirmed',
        description: 'Your order has been confirmed by the store',
        icon: 'checkmark.seal.fill',
        progressThreshold: 40
      },
      { 
        key: 'ready_to_dispatch',
        title: 'Ready to Dispatch',
        description: 'Your order is packed and ready for pickup',
        icon: 'shippingbox.fill',
        progressThreshold: 60
      },
      { 
        key: 'out_for_delivery',
        title: 'Out for Delivery',
        description: 'Your order is on the way to your location',
        icon: 'car.fill',
        progressThreshold: 80
      },
      { 
        key: 'delivered',
        title: 'Delivered',
        description: 'Your order has been successfully delivered',
        icon: 'house.fill',
        progressThreshold: 100
      },
    ];

    const currentIndex = statuses.findIndex(s => s.key === currentStatus);
    const validCurrentIndex = currentIndex >= 0 ? currentIndex : 0; // Default to first status if not found
    
    console.log(`Timeline generation: currentStatus="${currentStatus}", currentIndex=${currentIndex}, validCurrentIndex=${validCurrentIndex}`);
    console.log('Available statuses:', statuses.map((s, i) => `${i}: ${s.key}`));
    
    return statuses.map((status, index) => {
      const baseTime = new Date(orderTime);
      
      // Calculate time based on step progression
      let stepTime;
      if (index <= validCurrentIndex) {
        // For completed and current steps, show actual time based on order progression
        stepTime = new Date(baseTime.getTime() + (index * 20 * 60 * 1000)); // 20 minutes between steps
      } else {
        // For future steps, show estimated time
        if (deliverySlot && index === statuses.length - 1) {
          stepTime = new Date(deliverySlot);
        } else {
          stepTime = new Date(baseTime.getTime() + (index * 30 * 60 * 1000)); // 30 minutes estimated
        }
      }
      
      // Current stage should be pending (in progress), only previous stages are completed
      const isCompleted = index < validCurrentIndex; // Previous stages are completed
      const isCurrent = index === validCurrentIndex;  // Current stage is pending but highlighted as active
      const isPending = index > validCurrentIndex;    // Future stages are pending
      
      if (index <= validCurrentIndex + 1) {
        console.log(`Step ${index} (${status.key}): completed=${isCompleted}, current=${isCurrent}, pending=${isPending}`);
      }
      
      return {
        step: index,
        title: status.title,
        description: status.description,
        time: isCompleted || isCurrent ? 
          stepTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
          `${stepTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (Est)`,
        completed: isCompleted,
        current: isCurrent,
        active: isCurrent, // Keep active for backward compatibility with rendering
        pending: isPending,
        icon: status.icon
      };
    });
  };

  // Create mock order data for fallback order IDs
  const createMockOrderData = async (orderId: string) => {
    try {
      const timestamp = orderId.replace('ORD-', '');
      const orderTime = new Date(parseInt(timestamp));
      
      // Try to load stored cart data for this fallback order
      let storedData = null;
      try {
        const storedDataString = await AsyncStorage.getItem(`fallback_order_${orderId}`);
        if (storedDataString) {
          storedData = JSON.parse(storedDataString);
          console.log('Loaded stored fallback order data:', storedData);
        }
      } catch (err) {
        console.warn('Could not load stored fallback order data:', err);
      }
      
      // Simulate different order statuses based on timestamp for testing
      const minutesElapsed = Math.floor((Date.now() - parseInt(timestamp)) / (60 * 1000));
      let simulatedStatus = 'pending';
      let simulatedProgress = 10;
      
      if (minutesElapsed > 3) {
        simulatedStatus = 'order_preparing';
        simulatedProgress = 20;
      }
      if (minutesElapsed > 8) {
        simulatedStatus = 'order_confirmed';
        simulatedProgress = 40;
      }
      if (minutesElapsed > 15) {
        simulatedStatus = 'ready_to_dispatch';
        simulatedProgress = 60;
      }
      if (minutesElapsed > 20) {
        simulatedStatus = 'out_for_delivery';
        simulatedProgress = 80;
      }
      if (minutesElapsed > 30) {
        simulatedStatus = 'delivered';
        simulatedProgress = 100;
      }
      
      console.log(`Mock order status simulation: ${minutesElapsed} minutes elapsed -> ${simulatedStatus} (${simulatedProgress}%)`);
      
      const mockOrder = {
        id: orderId,
        orderNumber: orderId,
        storeName: 'Fresh Mart',
        storeImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=80&h=80&fit=crop&crop=center',
        storePhone: '+91 98765 43210',
        storeAddress: '123 Main Street, Your City',
        deliveryPartner: 'Delivery Partner',
        deliveryPhone: '+91 87654 32109',
        estimatedDelivery: new Date(orderTime.getTime() + 30 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        totalAmount: storedData?.totalAmount || 0,
        subtotal: storedData?.subtotal || 0,
        deliveryCharge: storedData?.deliveryFee || 30,
        status: simulatedStatus,
        statusDisplay: getStatusDisplay(simulatedStatus),
        progress: simulatedProgress,
        paymentStatus: 'pending',
        paymentMethod: storedData?.paymentMethod || 'Cash on Delivery',
        items: storedData?.items || [],
        createdAt: orderTime.toISOString(),
        updatedAt: orderTime.toISOString(),
        specialInstructions: 'Please call when arriving',
        customerInfo: {},
        timeline: getDeliveryTimeline(
          simulatedStatus,
          simulatedProgress,
          orderTime.toISOString()
        )
      };
      
      setOrder(mockOrder);
      console.log('Created mock order data for fallback ID:', orderId);
    } catch (err) {
      console.error('Error creating mock order data:', err);
      setError('Unable to create order tracking data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch order details from API
  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Handle fallback order IDs that start with 'ORD-' (generated from timestamp)
      if (id?.startsWith('ORD-') && id.length > 10) {
        console.log('Detected fallback order ID, creating mock order data:', id);
        await createMockOrderData(id);
        return;
      }
      
      // Special test cases for specific order IDs when API is not available
      // Remove this section when real API is working properly
      if ((id === '19' || id === '31') && false) { // Disabled - change to true for testing
        console.log(`Creating test data for order #${id}`);
        const testOrder = {
          id: id,
          orderNumber: `ORD-${id}`,
          storeName: 'Fresh Mart',
          storeImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=80&h=80&fit=crop&crop=center',
          storePhone: '+91 98765 43210',
          storeAddress: '123 Main Street, Your City',
          deliveryPartner: 'Delivery Partner',
          deliveryPhone: '+91 87654 32109',
          estimatedDelivery: '3:30 PM',
          totalAmount: 850,
          subtotal: 820,
          deliveryCharge: 30,
          status: 'order_confirmed',
          statusDisplay: getStatusDisplay('order_confirmed'),
          progress: 40,
          paymentStatus: 'pending',
          paymentMethod: 'Cash on Delivery',
          items: [
            {
              name: 'Fresh Apples',
              quantity: 2,
              price: 240,
              product: {
                name: 'Fresh Apples',
                description: 'Fresh red apples',
                sku: 'APL-001'
              }
            },
            {
              name: 'Whole Wheat Bread',
              quantity: 3,
              price: 135,
              product: {
                name: 'Whole Wheat Bread',
                description: 'Freshly baked bread',
                sku: 'BRD-001'
              }
            },
            {
              name: 'Organic Milk',
              quantity: 2,
              price: 180,
              product: {
                name: 'Organic Milk',
                description: 'Full cream organic milk',
                sku: 'MLK-001'
              }
            },
            {
              name: 'Brown Eggs',
              quantity: 1,
              price: 265,
              product: {
                name: 'Brown Eggs (12 pack)',
                description: 'Farm fresh brown eggs',
                sku: 'EGG-001'
              }
            }
          ],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          specialInstructions: 'Please call when arriving',
          customerInfo: {},
          timeline: getDeliveryTimeline(
            'order_confirmed',
            40,
            new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          )
        };

        console.log(`Test order #${id} created with ${testOrder.items.length} items, total: ₹${testOrder.totalAmount}`);

        setOrder(testOrder);
        setLoading(false);
        return;
      }
      
      const response = await ApiService.orders.getDeliveryOrderDetails(id || 'new-order');

      console.log('Order details API response:', response);

      // The API returns { success: true, data: {...} } or { success: true, order: {...} }
      const orderData = response.data || response.order || response;
      
      // Log the API response structure for debugging
      console.log('Raw orderData structure:', {
        status: orderData.orderStatus || orderData.status,
        paymentStatus: orderData.paymentStatus,
        items: orderData.items?.length,
        orderDataKeys: Object.keys(orderData)
      });

      // Determine the current status from API response
      const normalizedStatus = normalizeStatus(orderData.orderStatus || orderData.status);

      console.log('Parsed status info:', {
        normalizedStatus,
        rawStatus: orderData.orderStatus || orderData.status,
        orderDataKeys: Object.keys(orderData)
      });

      // Calculate order totals from items if pricing is not available
      const items = orderData.items || [];
      const calculatedSubtotal = items.reduce((sum: number, item: any) => {
        const itemTotal = parseFloat(item.totalPrice || item.pricing?.totalPrice || item.price || '0');
        return sum + itemTotal;
      }, 0);

      const deliveryCharge = parseFloat(orderData.deliveryCharge || orderData.pricing?.deliveryCharge || '30');
      const subtotal = parseFloat(orderData.subtotal || orderData.pricing?.subtotal || calculatedSubtotal || '0');
      const totalAmount = parseFloat(orderData.totalAmount || orderData.pricing?.totalAmount || (subtotal + deliveryCharge) || '0');

      console.log('Order calculations:', {
        items: items.length,
        calculatedSubtotal,
        deliveryCharge,
        subtotal,
        totalAmount,
        rawSubtotal: orderData.subtotal,
        rawTotalAmount: orderData.totalAmount
      });

      // Transform API response to match our UI structure
      const transformedOrder = {
        id: orderData.id || id,
        orderNumber: orderData.orderNumber || `ORD-${id}`,
        storeName: orderData.store?.name || 'Store',
        storeImage: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=80&h=80&fit=crop&crop=center',
        storePhone: orderData.store?.phone || '+91 98765 43210',
        storeAddress: orderData.store?.address || '',
        deliveryPartner: 'Delivery Partner', // Not in API yet
        deliveryPhone: '+91 87654 32109', // Not in API yet
        estimatedDelivery: orderData.deliverySlot ? new Date(orderData.deliverySlot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '2:45 PM',
        totalAmount,
        subtotal,
        deliveryCharge,
        status: normalizedStatus.status,
        statusDisplay: orderData.status?.display || getStatusDisplay(normalizedStatus.status),
        progress: normalizedStatus.progress,
        paymentStatus: orderData.paymentStatus || 'pending',
        paymentMethod: orderData.payment?.method?.displayName || 'Cash on Delivery',
        items: items.map((item: any) => ({
          id: item.id,
          quantity: item.quantityAccepted || item.quantityOrdered || item.quantity || 1,
          totalPrice: item.totalPrice,
          unitPrice: item.unitPrice,
          product: {
            name: item.product?.name || item.name || 'Unknown Item',
            description: item.product?.description || item.description,
            sku: item.storeProduct?.localSku || item.sku
          },
          pricing: {
            totalPrice: item.totalPrice,
            unitPrice: item.unitPrice,
            mrp: item.storeProduct?.mrp
          },
          quantity: {
            ordered: item.quantityOrdered || item.quantity,
            accepted: item.quantityAccepted || item.quantity
          }
        })),
        createdAt: orderData.createdAt || new Date().toISOString(),
        updatedAt: orderData.updatedAt || new Date().toISOString(),
        specialInstructions: orderData.specialInstructions || '',
        customerInfo: orderData.customer || {},
        timeline: getDeliveryTimeline(
          normalizedStatus.status,
          normalizedStatus.progress,
          orderData.createdAt || new Date().toISOString(),
          orderData.deliverySlot
        )
      };
      
      // Log the final timeline for debugging
      console.log('=== TIMELINE DEBUG INFO ===');
      console.log('Final order status:', transformedOrder.status);
      console.log('Status display:', transformedOrder.statusDisplay);
      console.log('Generated timeline:');
      transformedOrder.timeline.forEach((step, i) => {
        const state = step.current ? 'ACTIVE ●' : step.completed ? 'COMPLETED ✓' : 'PENDING ○';
        console.log(`  ${i}: ${step.title} - ${state}`);
      });
      console.log('=== END DEBUG INFO ===');
      
      setOrder(transformedOrder);
    } catch (err) {
      console.error('Error fetching order details:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load order details';
      setError(errorMessage);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle realtime order updates
  const handleRealtimeUpdate = (payload: any) => {
    console.log('Realtime update received:', payload);

    if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
      const updatedData = payload.new;

      // Refetch the complete order details to get all nested data
      fetchOrderDetails();

      // Optional: Show a toast/notification to user about the update
      console.log('Order updated in realtime:', updatedData.orderStatus);
    }
  };

  // Set up realtime subscription
  const setupRealtimeSubscription = () => {
    if (!id || id.startsWith('ORD-')) {
      // Don't set up realtime for fallback orders
      return;
    }

    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return;
    }

    console.log('Setting up realtime subscription for order:', orderId);

    // Subscribe to order updates
    const channel = subscribeToOrder(orderId, handleRealtimeUpdate);
    realtimeChannelRef.current = channel;
  };

  // Clean up realtime subscription
  const cleanupRealtimeSubscription = async () => {
    if (realtimeChannelRef.current) {
      console.log('Cleaning up realtime subscription');
      await unsubscribeFromOrder(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }
  };

  // Fetch order details on component mount and set up realtime
  useEffect(() => {
    if (id) {
      fetchOrderDetails();
      setupRealtimeSubscription();
    }

    // Cleanup on unmount
    return () => {
      cleanupRealtimeSubscription();
    };
  }, [id]);

  // Simulate real-time updates for estimated time
  useEffect(() => {
    const timer = setInterval(() => {
      setEstimatedTime(prev => Math.max(0, prev - 1));
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading order details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error && !order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle" size={48} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Unable to load order</Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={fetchOrderDetails}
          >
            <Text style={[styles.retryButtonText, { color: colors.textInverse }]}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // No order data
  if (!order) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <IconSymbol name="questionmark.circle" size={48} color={colors.textSecondary} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Order not found</Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>The order you're looking for could not be found.</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => router.back()}
          >
            <Text style={[styles.retryButtonText, { color: colors.textInverse }]}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderTimelineStep = (step: any, index: number) => (
    <View key={step.step} style={styles.timelineStep}>
      <View style={styles.timelineLeft}>
        <View
          style={[
            styles.timelineIcon,
            {
              backgroundColor: step.completed
                ? colors.success 
                : step.current
                ? colors.primary
                : colors.border,
            },
          ]}
        >
          {step.completed ? (
            <IconSymbol name="checkmark" size={16} color={colors.textInverse} />
          ) : step.current ? (
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
        <Text style={[
          styles.timelineTitle, 
          { 
            color: step.current ? colors.text : step.completed ? colors.text : colors.textSecondary,
            fontWeight: step.current ? Typography.fontWeight.bold : Typography.fontWeight.medium
          }
        ]}>
          {step.title}
        </Text>
        <Text style={[
          styles.timelineDescription, 
          { color: step.current ? colors.textSecondary : step.completed ? colors.textSecondary : colors.textTertiary }
        ]}>
          {step.description}
        </Text>
        <Text style={[
          styles.timelineTime, 
          { 
            color: step.current ? colors.textSecondary : step.completed ? colors.textSecondary : colors.textTertiary,
            fontStyle: step.pending && !step.current ? 'italic' : 'normal',
            fontWeight: step.current ? Typography.fontWeight.medium : Typography.fontWeight.regular
          }
        ]}>
          {step.time}
        </Text>
      </View>
    </View>
  );

  const renderOrderItem = (item: any, index: number) => (
    <View key={index} style={[styles.orderItem, { borderBottomColor: colors.divider }]}>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.text }]}>
          {item.product?.name || item.name || 'Unknown Item'}
        </Text>
        {item.product?.description && (
          <Text style={[styles.itemDescription, { color: colors.textSecondary }]}>
            {item.product.description}
          </Text>
        )}
        {item.product?.sku && (
          <Text style={[styles.itemSku, { color: colors.textTertiary }]}>
            SKU: {item.product.sku}
          </Text>
        )}
      </View>
      <View style={styles.itemDetails}>
        <View style={styles.quantityInfo}>
          <Text style={[styles.itemQuantity, { color: colors.textSecondary }]}>
            Qty: {item.quantity?.ordered || item.quantity || 1}
          </Text>
          {item.quantity?.accepted && item.quantity.accepted !== item.quantity.ordered && (
            <Text style={[styles.acceptedQuantity, { color: colors.warning }]}>
              (Accepted: {item.quantity.accepted})
            </Text>
          )}
        </View>
        <View style={styles.priceInfo}>
          <Text style={[styles.itemPrice, { color: colors.text }]}>
            ₹{parseFloat(item.pricing?.totalPrice || item.totalPrice || item.price || '0').toFixed(2)}
          </Text>
          {item.pricing?.mrp && parseFloat(item.pricing.mrp) > parseFloat(item.pricing.unitPrice || item.pricing.totalPrice) && (
            <Text style={[styles.itemMrp, { color: colors.textTertiary }]}>
              MRP: ₹{parseFloat(item.pricing.mrp).toFixed(2)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.divider }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface + '80' }]}
          onPress={() => {
            console.log('Back button pressed - navigating to home');
            // Always navigate to the home screen where stores are listed
            router.replace('/(tabs)/');
          }}
          activeOpacity={0.5}
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

        {/* Order Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <View style={styles.summaryHeader}>
            <View>
              <Text style={[styles.summaryTitle, { color: colors.text }]}>Order Summary</Text>
              <Text style={[styles.summaryOrderNumber, { color: colors.textSecondary }]}>
                {order.orderNumber}
              </Text>
            </View>
            <View style={[styles.statusBadge, {
              backgroundColor: order.statusDisplay?.color === 'green' ? colors.success + '20' : colors.warning + '20'
            }]}>
              <Text style={[styles.statusBadgeText, {
                color: order.statusDisplay?.color === 'green' ? colors.success : colors.warning
              }]}>
                {order.statusDisplay?.label || order.status}
              </Text>
            </View>
          </View>

          <View style={[styles.summaryDivider, { backgroundColor: colors.divider }]} />

          <View style={styles.summaryGrid}>
            <View style={styles.summaryGridItem}>
              <Text style={[styles.summaryGridLabel, { color: colors.textSecondary }]}>Items</Text>
              <Text style={[styles.summaryGridValue, { color: colors.text }]}>{order.items.length}</Text>
            </View>
            <View style={styles.summaryGridItem}>
              <Text style={[styles.summaryGridLabel, { color: colors.textSecondary }]}>Subtotal</Text>
              <Text style={[styles.summaryGridValue, { color: colors.text }]}>₹{order.subtotal?.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryGridItem}>
              <Text style={[styles.summaryGridLabel, { color: colors.textSecondary }]}>Delivery</Text>
              <Text style={[styles.summaryGridValue, { color: colors.text }]}>₹{order.deliveryCharge?.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryGridItem}>
              <Text style={[styles.summaryGridLabel, { color: colors.textSecondary }]}>Total</Text>
              <Text style={[styles.summaryGridValueLarge, { color: colors.primary }]}>₹{order.totalAmount?.toFixed(2)}</Text>
            </View>
          </View>

          <View style={[styles.summaryDivider, { backgroundColor: colors.divider }]} />

          <View style={styles.summaryPayment}>
            <View style={styles.summaryPaymentRow}>
              <IconSymbol name="creditcard" size={16} color={colors.textSecondary} />
              <Text style={[styles.summaryPaymentText, { color: colors.textSecondary }]}>
                {order.paymentMethod}
              </Text>
            </View>
            <Text style={[styles.summaryPaymentStatus, {
              color: order.paymentStatus === 'paid' ? colors.success : colors.warning
            }]}>
              {order.paymentStatus?.toUpperCase()}
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
                Total: ₹{order.totalAmount?.toFixed(2) || '0.00'}
              </Text>
              <View style={styles.statusInfo}>
                <Text style={[styles.statusLabel, { color: order.statusDisplay?.color === 'green' ? colors.success : colors.warning }]}>
                  {order.statusDisplay?.label || order.status}
                </Text>
                <Text style={[styles.statusDescription, { color: colors.textSecondary }]}>
                  {order.statusDisplay?.description || 'Order is being processed'}
                </Text>
              </View>
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
          
          {/* Billing Summary */}
          <View style={[styles.billingSummary, { marginTop: Spacing.lg }]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Subtotal</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>₹{order.subtotal?.toFixed(2) || '0.00'}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Delivery Charge</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>₹{order.deliveryCharge?.toFixed(2) || '0.00'}</Text>
            </View>
            
            <View style={[styles.summaryRow, styles.totalRow, { borderTopColor: colors.divider }]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total Amount</Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>₹{order.totalAmount?.toFixed(2) || '0.00'}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Payment Method</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{order.paymentMethod}</Text>
            </View>
            
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Payment Status</Text>
              <Text style={[styles.paymentStatus, { 
                color: order.paymentStatus === 'paid' ? colors.success : colors.warning 
              }]}>{order.paymentStatus?.toUpperCase()}</Text>
            </View>
          </View>
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
    padding: Spacing.md,
    marginRight: Spacing.sm,
    borderRadius: Layout.borderRadius.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
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
  
  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxxl,
  },
  loadingText: {
    ...TextStyles.bodyLarge,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xxxl,
  },
  errorTitle: {
    ...TextStyles.h4,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    ...TextStyles.body,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Layout.borderRadius.md,
  },
  retryButtonText: {
    ...TextStyles.button,
  },
  
  // Enhanced Order Item Styles
  itemInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  itemDescription: {
    ...TextStyles.bodySmall,
    marginTop: Spacing.xs,
  },
  itemSku: {
    ...TextStyles.caption,
    marginTop: Spacing.xs,
  },
  quantityInfo: {
    alignItems: 'flex-end',
  },
  acceptedQuantity: {
    ...TextStyles.caption,
    marginTop: Spacing.xs,
  },
  priceInfo: {
    alignItems: 'flex-end',
  },
  itemMrp: {
    ...TextStyles.caption,
    textDecorationLine: 'line-through',
    marginTop: Spacing.xs,
  },
  
  // Status Info Styles
  statusInfo: {
    marginTop: Spacing.sm,
  },
  statusLabel: {
    ...TextStyles.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
  },
  statusDescription: {
    ...TextStyles.caption,
    marginTop: Spacing.xs,
  },
  
  // Billing Summary Styles
  billingSummary: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  summaryLabel: {
    ...TextStyles.body,
  },
  summaryValue: {
    ...TextStyles.body,
    fontWeight: Typography.fontWeight.medium,
  },
  totalRow: {
    borderTopWidth: 1,
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
  },
  totalLabel: {
    ...TextStyles.bodyLarge,
    fontWeight: Typography.fontWeight.semibold,
  },
  totalValue: {
    ...TextStyles.price,
  },
  paymentStatus: {
    ...TextStyles.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
  },

  // Order Summary Card Styles
  summaryCard: {
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: Layout.borderRadius.lg,
    ...Layout.shadow.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  summaryTitle: {
    ...TextStyles.h5,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xxs,
  },
  summaryOrderNumber: {
    ...TextStyles.bodySmall,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  statusBadgeText: {
    ...TextStyles.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
  },
  summaryDivider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  summaryGridItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
  },
  summaryGridLabel: {
    ...TextStyles.caption,
    marginBottom: Spacing.xs,
  },
  summaryGridValue: {
    ...TextStyles.bodyLarge,
    fontWeight: Typography.fontWeight.semibold,
  },
  summaryGridValueLarge: {
    ...TextStyles.h4,
    fontWeight: Typography.fontWeight.bold,
  },
  summaryPayment: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryPaymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  summaryPaymentText: {
    ...TextStyles.body,
  },
  summaryPaymentStatus: {
    ...TextStyles.bodySmall,
    fontWeight: Typography.fontWeight.bold,
  },
});
