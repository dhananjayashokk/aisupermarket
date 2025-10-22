import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Layout, Spacing } from '@/constants/Layout';
import { Typography, TextStyles } from '@/constants/Typography';
import { useAppColorScheme } from '@/contexts/ThemeContext';
import { useCart } from '@/contexts/CartContext';
import { ApiService } from '@/services/api';
import { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import OrderSplashScreen from '@/components/OrderSplashScreen';

export default function CartScreen() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme];
  const { state: cartState, updateQuantity, removeItem, clearCart } = useCart();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const deliveryFee = cartState.totalAmount > 500 ? 0 : 30; // Free delivery over ₹500
  const subtotal = cartState.totalAmount;
  const savings = 0; // We don't have original price data in our cart context
  const total = subtotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (cartState.items.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Add minimum delay to show splash screen properly
      const startTime = Date.now();

      // Prepare order data according to the API specification
      const orderData = {
        items: cartState.items.map(item => ({
          storeProductId: item.id, // Using item.id as storeProductId
          quantity: item.quantity
        })),
        deliverySlot: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
        specialInstructions: "Please call when arriving",
        paymentMethodId: 1 // Default payment method
      };

      const [response] = await Promise.all([
        ApiService.orders.placeDeliveryOrder(orderData),
        // Ensure minimum splash screen time of 3.5 seconds
        new Promise(resolve => {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(3500 - elapsed, 0);
          setTimeout(resolve, remaining);
        })
      ]);

      console.log('Order placement response:', response);

      // Success - clear cart and navigate to order tracking
      clearCart();
      
      // Navigate to order tracking page with the order ID
      const orderId = response.orderId || response.id || response.orderNumber || response.order?.id;
      
      if (orderId) {
        console.log('Navigating to order tracking with orderId:', orderId);
        router.push(`/order/${orderId}`);
      } else {
        // Generate a fallback order ID based on timestamp
        const fallbackOrderId = `ORD-${Date.now()}`;
        console.warn('No order ID found in response, using fallback:', fallbackOrderId);
        console.warn('Full response object:', JSON.stringify(response, null, 2));
        
        // Store cart data for the fallback order
        const fallbackOrderData = {
          orderId: fallbackOrderId,
          items: cartState.items,
          totalAmount: total,
          subtotal: subtotal,
          deliveryFee: deliveryFee,
          timestamp: Date.now(),
          paymentMethod: 'Cash on Delivery'
        };
        
        AsyncStorage.setItem(`fallback_order_${fallbackOrderId}`, JSON.stringify(fallbackOrderData))
          .then(() => {
            console.log('Stored fallback order data:', fallbackOrderId);
          })
          .catch(err => {
            console.error('Failed to store fallback order data:', err);
          });
        
        router.push(`/order/${fallbackOrderId}`);
      }
      
      // Show brief success message
      Alert.alert(
        'Order Placed!', 
        'Your order has been placed successfully. You can track its progress now.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error placing order:', error);
      Alert.alert(
        'Order Failed', 
        error instanceof Error ? error.message : 'Failed to place order. Please try again.'
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const QuantitySelector = ({ quantity, onIncrease, onDecrease }: any) => (
    <View style={[styles.quantitySelector, { borderColor: colors.border }]}>
      <TouchableOpacity 
        style={styles.quantityButton}
        onPress={onDecrease}
        activeOpacity={0.7}
      >
        <IconSymbol name="minus" size={16} color={colors.primary} />
      </TouchableOpacity>
      <Text style={[styles.quantityText, { color: colors.text }]}>{quantity}</Text>
      <TouchableOpacity 
        style={styles.quantityButton}
        onPress={onIncrease}
        activeOpacity={0.7}
      >
        <IconSymbol name="plus" size={16} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );

  const getEmptyCart = () => (
    <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
      <IconSymbol name="cart" size={64} color={colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>Your Cart is Empty</Text>
      <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
        Add items from stores to get started
      </Text>
      <TouchableOpacity
        style={[styles.shopButton, { backgroundColor: colors.primary }]}
        activeOpacity={0.8}
        onPress={() => router.replace('/(tabs)')}
      >
        <Text style={[styles.shopButtonText, { color: colors.textInverse }]}>
          Browse Stores
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Order Splash Screen */}
      <OrderSplashScreen visible={isPlacingOrder} />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Cart</Text>
        <Text style={[styles.itemCount, { color: colors.textSecondary }]}>
          {cartState.totalItems} item{cartState.totalItems !== 1 ? 's' : ''}
        </Text>
      </View>

      {cartState.items.length === 0 ? getEmptyCart() : (
        <>
          {/* Cart Items */}
          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Store Info */}
            <View style={[styles.storeInfo, { backgroundColor: colors.surface }]}>
              <IconSymbol name="storefront" size={20} color={colors.primary} />
              <Text style={[styles.storeName, { color: colors.text }]}>Fresh Mart</Text>
              <Text style={[styles.deliveryTime, { color: colors.textSecondary }]}>
                Delivery in 25 mins
              </Text>
            </View>

            {/* Items */}
            {cartState.items.map((item) => (
              <View 
                key={item.id}
                style={[styles.cartItem, { 
                  backgroundColor: colors.surface,
                  borderBottomColor: colors.divider 
                }]}
              >
                <Image source={{ uri: item.image }} style={styles.itemImage} />
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemName, { color: colors.text }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.itemUnit, { color: colors.textSecondary }]}>
                    {item.unit}
                  </Text>
                  <View style={styles.priceRow}>
                    <Text style={[styles.itemPrice, { color: colors.text }]}>
                      ₹{item.price}
                    </Text>
                    {item.originalPrice && (
                      <Text style={[styles.originalPrice, { color: colors.textTertiary }]}>
                        ₹{item.originalPrice}
                      </Text>
                    )}
                    {item.discount && (
                      <View style={[styles.discountBadge, { backgroundColor: colors.success + '20' }]}>
                        <Text style={[styles.discountText, { color: colors.success }]}>
                          {item.discount}% OFF
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={styles.quantityContainer}>
                  <QuantitySelector 
                    quantity={item.quantity}
                    onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                    onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
                  />
                  <Text style={[styles.itemTotal, { color: colors.text }]}>
                    ₹{(item.price * item.quantity).toFixed(0)}
                  </Text>
                </View>
              </View>
            ))}

            {/* Bill Details */}
            <View style={[styles.billDetails, { backgroundColor: colors.surface }]}>
              <Text style={[styles.billTitle, { color: colors.text }]}>Bill Details</Text>
              
              <View style={styles.billRow}>
                <Text style={[styles.billLabel, { color: colors.textSecondary }]}>
                  Item Total
                </Text>
                <Text style={[styles.billValue, { color: colors.text }]}>
                  ₹{subtotal.toFixed(2)}
                </Text>
              </View>

              <View style={styles.billRow}>
                <Text style={[styles.billLabel, { color: colors.textSecondary }]}>
                  Delivery Fee
                </Text>
                <Text style={[styles.billValue, { color: colors.text }]}>
                  ₹{deliveryFee.toFixed(2)}
                </Text>
              </View>

              {savings > 0 && (
                <View style={styles.billRow}>
                  <Text style={[styles.billLabel, { color: colors.success }]}>
                    Total Savings
                  </Text>
                  <Text style={[styles.billValue, { color: colors.success }]}>
                    -₹{savings.toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={[styles.totalRow, { borderTopColor: colors.divider }]}>
                <Text style={[styles.totalLabel, { color: colors.text }]}>
                  To Pay
                </Text>
                <Text style={[styles.totalValue, { color: colors.text }]}>
                  ₹{total.toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Add more items suggestion */}
            <TouchableOpacity 
              style={[styles.addMoreButton, { borderColor: colors.primary }]}
              activeOpacity={0.7}
            >
              <IconSymbol name="plus.circle" size={20} color={colors.primary} />
              <Text style={[styles.addMoreText, { color: colors.primary }]}>
                Add more items
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Checkout Button */}
          <View style={[styles.checkoutContainer, { 
            backgroundColor: colors.background,
            borderTopColor: colors.divider,
            ...Layout.shadow.lg 
          }]}>
            <View style={styles.checkoutInfo}>
              <Text style={[styles.checkoutTotal, { color: colors.text }]}>
                ₹{total.toFixed(2)}
              </Text>
              <Text style={[styles.checkoutItems, { color: colors.textSecondary }]}>
                {cartState.totalItems} item{cartState.totalItems !== 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.checkoutButton, { 
                backgroundColor: isPlacingOrder ? colors.textSecondary : colors.primary,
                opacity: isPlacingOrder ? 0.7 : 1
              }]}
              activeOpacity={0.8}
              onPress={handlePlaceOrder}
              disabled={isPlacingOrder}
            >
              <Text style={[styles.checkoutButtonText, { color: colors.textInverse }]}>
                {isPlacingOrder ? 'Placing Order...' : 'Place Order'}
              </Text>
              {!isPlacingOrder && (
                <IconSymbol name="arrow.right" size={20} color={colors.textInverse} />
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
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
  itemCount: {
    ...TextStyles.body,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxxl,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: Layout.borderRadius.md,
  },
  storeName: {
    ...TextStyles.bodyLarge,
    fontWeight: Typography.fontWeight.semibold,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  deliveryTime: {
    ...TextStyles.bodySmall,
  },
  cartItem: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: Layout.borderRadius.md,
    marginRight: Spacing.md,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    ...TextStyles.body,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xxs,
  },
  itemUnit: {
    ...TextStyles.caption,
    marginBottom: Spacing.xs,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemPrice: {
    ...TextStyles.priceSmall,
    marginRight: Spacing.sm,
  },
  originalPrice: {
    ...TextStyles.caption,
    textDecorationLine: 'line-through',
    marginRight: Spacing.sm,
  },
  discountBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Layout.borderRadius.xs,
  },
  discountText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  quantityContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Layout.borderRadius.sm,
    paddingHorizontal: Spacing.xs,
  },
  quantityButton: {
    padding: Spacing.xs,
  },
  quantityText: {
    ...TextStyles.body,
    fontWeight: Typography.fontWeight.semibold,
    marginHorizontal: Spacing.md,
  },
  itemTotal: {
    ...TextStyles.priceSmall,
    marginTop: Spacing.sm,
  },
  billDetails: {
    margin: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Layout.borderRadius.lg,
  },
  billTitle: {
    ...TextStyles.h5,
    marginBottom: Spacing.md,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  billLabel: {
    ...TextStyles.body,
  },
  billValue: {
    ...TextStyles.body,
    fontWeight: Typography.fontWeight.medium,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  totalLabel: {
    ...TextStyles.bodyLarge,
    fontWeight: Typography.fontWeight.semibold,
  },
  totalValue: {
    ...TextStyles.price,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderRadius: Layout.borderRadius.md,
    borderStyle: 'dashed',
  },
  addMoreText: {
    ...TextStyles.body,
    fontWeight: Typography.fontWeight.medium,
    marginLeft: Spacing.sm,
  },
  checkoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
  checkoutInfo: {
    flex: 1,
  },
  checkoutTotal: {
    ...TextStyles.price,
  },
  checkoutItems: {
    ...TextStyles.caption,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Layout.button.borderRadius,
  },
  checkoutButtonText: {
    ...TextStyles.button,
    marginRight: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxxl,
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