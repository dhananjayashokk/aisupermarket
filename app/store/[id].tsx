import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Image, FlatList, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Layout, Spacing } from '@/constants/Layout';
import { Typography, TextStyles } from '@/constants/Typography';
import { useAppColorScheme } from '@/contexts/ThemeContext';
import { useCart } from '@/contexts/CartContext';
import { mockStores } from '@/data/mockStores';
import { mockProducts, categories } from '@/data/mockProducts';
import { useState } from 'react';

export default function StoreDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme];
  const { state: cartState, addItem, updateQuantity, getItemQuantity } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Find the store
  const store = mockStores.find(s => s.id === id);
  
  if (!store) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>Store not found</Text>
      </SafeAreaView>
    );
  }

  // Filter products by category
  const filteredProducts = selectedCategory === 'all' 
    ? mockProducts 
    : mockProducts.filter(p => p.category === selectedCategory);

  const storeCategories = [
    { id: 'all', name: 'All Items', icon: '🛍️' },
    ...categories.slice(0, 6)
  ];

  const renderCategoryTab = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        {
          backgroundColor: selectedCategory === item.id || selectedCategory === item.name 
            ? colors.primary 
            : colors.surface,
          borderColor: colors.border,
        }
      ]}
      onPress={() => setSelectedCategory(item.id === 'all' ? 'all' : item.name)}
      activeOpacity={0.7}
    >
      <Text style={styles.categoryTabEmoji}>{item.icon}</Text>
      <Text
        style={[
          styles.categoryTabText,
          {
            color: selectedCategory === item.id || selectedCategory === item.name 
              ? colors.textInverse 
              : colors.text
          }
        ]}
        numberOfLines={1}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      unit: product.unit,
      storeId: store.id,
      storeName: store.name,
    });
  };

  const renderProduct = ({ item }: { item: any }) => {
    const quantity = getItemQuantity(item.id);
    
    return (
      <TouchableOpacity
        style={[styles.productCard, { backgroundColor: colors.surface }]}
        activeOpacity={0.8}
        onPress={() => router.push(`/product/${item.id}`)}
        delayPressIn={Platform.OS === 'web' ? 150 : 0}
        delayPressOut={Platform.OS === 'web' ? 150 : 0}
        {...Platform.select({
          web: {
            onTouchStart: undefined,
            onTouchMove: undefined,
            onTouchEnd: undefined,
          },
        })}
      >
        <Image 
          source={{ uri: item.image }} 
          style={styles.productImage}
          {...Platform.select({
            web: {
              draggable: false,
              onDragStart: (e: any) => e.preventDefault(),
            },
          })}
        />
        
        {item.discount && (
          <View style={[styles.discountBadge, { backgroundColor: colors.discount }]}>
            <Text style={[styles.discountText, { color: colors.textInverse }]}>
              {item.discount}% OFF
            </Text>
          </View>
        )}

        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={[styles.productUnit, { color: colors.textSecondary }]}>
            {item.unit}
          </Text>
          
          <View style={styles.productFooter}>
            <View style={styles.priceContainer}>
              <Text style={[styles.productPrice, { color: colors.text }]}>
                ₹{item.price}
              </Text>
              {item.originalPrice && (
                <Text style={[styles.originalPrice, { color: colors.textTertiary }]}>
                  ₹{item.originalPrice}
                </Text>
              )}
            </View>
            
            {quantity === 0 ? (
              <TouchableOpacity 
                style={[styles.addButton, { backgroundColor: colors.primary }]}
                activeOpacity={0.8}
                onPress={() => handleAddToCart(item)}
              >
                <IconSymbol name="plus" size={16} color={colors.textInverse} />
              </TouchableOpacity>
            ) : (
              <View style={styles.quantityControls}>
                <TouchableOpacity 
                  style={[styles.quantityButton, { backgroundColor: colors.primary }]}
                  onPress={() => updateQuantity(item.id, quantity - 1)}
                  activeOpacity={0.8}
                >
                  <IconSymbol name="minus" size={14} color={colors.textInverse} />
                </TouchableOpacity>
                
                <Text style={[styles.quantityText, { color: colors.text }]}>
                  {quantity}
                </Text>
                
                <TouchableOpacity 
                  style={[styles.quantityButton, { backgroundColor: colors.primary }]}
                  onPress={() => updateQuantity(item.id, quantity + 1)}
                  activeOpacity={0.8}
                >
                  <IconSymbol name="plus" size={14} color={colors.textInverse} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {item.rating && (
            <View style={styles.ratingContainer}>
              <IconSymbol name="star.fill" size={12} color={colors.rating} />
              <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
                {item.rating} ({item.reviews})
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

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
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {store.name}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {store.deliveryTime} • ₹{store.deliveryFee} delivery
          </Text>
        </View>
        <TouchableOpacity style={styles.searchButton}>
          <IconSymbol name="magnifyingglass" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Store Banner */}
        <View style={styles.bannerContainer}>
          <Image 
            source={{ uri: store.banner }} 
            style={styles.bannerImage}
            resizeMode="cover"
            {...Platform.select({
              web: {
                draggable: false,
                onDragStart: (e: any) => e.preventDefault(),
              },
            })}
          />
          <View style={[styles.bannerOverlay, { backgroundColor: colors.overlay }]}>
            <View style={styles.storeDetails}>
              <Image 
                source={{ uri: store.logo }} 
                style={styles.storeLogo}
                {...Platform.select({
                  web: {
                    draggable: false,
                    onDragStart: (e: any) => e.preventDefault(),
                  },
                })}
              />
              <View style={styles.storeInfo}>
                <Text style={[styles.storeName, { color: colors.textInverse }]}>
                  {store.name}
                </Text>
                <View style={styles.storeStats}>
                  <View style={styles.statItem}>
                    <IconSymbol name="star.fill" size={16} color={colors.rating} />
                    <Text style={[styles.statText, { color: colors.textInverse }]}>
                      {store.rating}
                    </Text>
                  </View>
                  <Text style={[styles.statDivider, { color: colors.textInverse }]}>•</Text>
                  <Text style={[styles.statText, { color: colors.textInverse }]}>
                    {store.deliveryTime}
                  </Text>
                  <Text style={[styles.statDivider, { color: colors.textInverse }]}>•</Text>
                  <Text style={[styles.statText, { color: colors.textInverse }]}>
                    {store.distance}
                  </Text>
                </View>
                <Text style={[styles.storeAddress, { color: colors.textInverse + 'CC' }]}>
                  {store.address}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Store Status & Offers */}
        <View style={[styles.statusContainer, { backgroundColor: colors.surface }]}>
          <View style={styles.statusRow}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: store.isOpen ? colors.success + '20' : colors.error + '20' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: store.isOpen ? colors.success : colors.error }
              ]}>
                {store.isOpen ? 'Open' : 'Closed'}
              </Text>
            </View>
            <Text style={[styles.minOrderText, { color: colors.textSecondary }]}>
              Min order ₹{store.minOrder}
            </Text>
          </View>
          
          {store.offers.length > 0 && (
            <View style={[styles.offerContainer, { backgroundColor: colors.accent + '20' }]}>
              <IconSymbol name="gift" size={18} color={colors.accent} />
              <Text style={[styles.offerText, { color: colors.text }]}>
                {store.offers[0]}
              </Text>
            </View>
          )}
        </View>

        {/* Categories */}
        <View style={styles.categoriesContainer}>
          <FlatList
            data={storeCategories}
            renderItem={renderCategoryTab}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* Products Grid */}
        <View style={styles.productsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {selectedCategory === 'all' ? 'All Products' : selectedCategory}
            <Text style={[styles.productCount, { color: colors.textSecondary }]}>
              {' '}({filteredProducts.length} items)
            </Text>
          </Text>
          
          <FlatList
            data={filteredProducts}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.productsGrid}
            columnWrapperStyle={styles.productRow}
          />
        </View>
      </ScrollView>

      {/* Floating Cart Button */}
      {cartState.totalItems > 0 && (
        <TouchableOpacity 
          style={[styles.floatingCartButton, { 
            backgroundColor: colors.primary,
            ...Layout.shadow.lg 
          }]}
          activeOpacity={0.8}
          onPress={() => router.push('/cart')}
        >
          <IconSymbol name="cart.fill" size={24} color={colors.textInverse} />
          <View style={[styles.cartBadge, { backgroundColor: colors.cartBadge }]}>
            <Text style={[styles.cartBadgeText, { color: colors.textInverse }]}>
              {cartState.totalItems > 99 ? '99+' : cartState.totalItems}
            </Text>
          </View>
        </TouchableOpacity>
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
  searchButton: {
    padding: Spacing.xs,
  },
  bannerContainer: {
    height: 200,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    ...Platform.select({
      web: {
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitUserDrag: 'none',
        WebkitTouchCallout: 'none',
        pointerEvents: 'none',
      },
    }),
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    padding: Spacing.lg,
  },
  storeDetails: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  storeLogo: {
    width: 60,
    height: 60,
    borderRadius: Layout.borderRadius.md,
    marginRight: Spacing.md,
    borderWidth: 2,
    borderColor: 'white',
    ...Platform.select({
      web: {
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitUserDrag: 'none',
        WebkitTouchCallout: 'none',
        pointerEvents: 'none',
      },
    }),
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    ...TextStyles.h4,
    marginBottom: Spacing.xs,
  },
  storeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    ...TextStyles.bodySmall,
    marginLeft: Spacing.xxs,
  },
  statDivider: {
    ...TextStyles.bodySmall,
    marginHorizontal: Spacing.sm,
  },
  storeAddress: {
    ...TextStyles.caption,
  },
  statusContainer: {
    padding: Spacing.lg,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  statusText: {
    ...TextStyles.caption,
    fontWeight: Typography.fontWeight.semibold,
  },
  minOrderText: {
    ...TextStyles.bodySmall,
  },
  offerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Layout.borderRadius.md,
  },
  offerText: {
    ...TextStyles.body,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  categoriesContainer: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  categoriesList: {
    paddingHorizontal: Spacing.lg,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    minWidth: 100,
  },
  categoryTabEmoji: {
    fontSize: 16,
    marginRight: Spacing.xs,
  },
  categoryTabText: {
    ...TextStyles.bodySmall,
    fontWeight: Typography.fontWeight.medium,
  },
  productsContainer: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    ...TextStyles.h5,
    marginBottom: Spacing.lg,
  },
  productCount: {
    ...TextStyles.body,
    fontWeight: Typography.fontWeight.regular,
  },
  productsGrid: {
    gap: Spacing.md,
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    borderRadius: Layout.productCard.borderRadius,
    padding: Layout.productCard.padding,
    marginBottom: Spacing.md,
    ...Layout.shadow.sm,
    ...Platform.select({
      web: {
        cursor: 'pointer',
        touchAction: 'manipulation',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
      },
    }),
  },
  productImage: {
    width: '100%',
    height: Layout.productCard.imageHeight,
    borderRadius: Layout.borderRadius.sm,
    marginBottom: Spacing.sm,
    ...Platform.select({
      web: {
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        WebkitUserDrag: 'none',
        WebkitTouchCallout: 'none',
        pointerEvents: 'none',
      },
    }),
  },
  discountBadge: {
    position: 'absolute',
    top: Spacing.md,
    left: Spacing.md,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: Layout.borderRadius.xs,
  },
  discountText: {
    ...TextStyles.caption,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    ...TextStyles.body,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xxs,
    minHeight: 40,
  },
  productUnit: {
    ...TextStyles.caption,
    marginBottom: Spacing.sm,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  priceContainer: {
    flex: 1,
  },
  productPrice: {
    ...TextStyles.priceSmall,
  },
  originalPrice: {
    ...TextStyles.caption,
    textDecorationLine: 'line-through',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    ...TextStyles.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
    marginHorizontal: Spacing.sm,
    minWidth: 20,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    ...TextStyles.caption,
    marginLeft: Spacing.xxs,
  },
  floatingCartButton: {
    position: 'absolute',
    bottom: 80,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    ...TextStyles.caption,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  errorText: {
    ...TextStyles.bodyLarge,
    textAlign: 'center',
    marginTop: 100,
  },
});