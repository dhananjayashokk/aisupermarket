import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Image, FlatList, Platform, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Layout, Spacing } from '@/constants/Layout';
import { Typography, TextStyles } from '@/constants/Typography';
import { useAppColorScheme } from '@/contexts/ThemeContext';
import { useCart } from '@/contexts/CartContext';
import { useState, useEffect } from 'react';
import { useRefresh, simulateDataFetch } from '@/hooks/useRefresh';
import { ApiService } from '@/services/api';

// Helper function to get local product images
const getProductImage = (productName: string, productUrl?: string) => {
  // Mapping of product names to local image files
  const imageMap: { [key: string]: any } = {
    'Amul Butter 500g': require('@/assets/images/products/amul-butter.jpg'),
    'Amul Curd 200g': require('@/assets/images/products/amul-curd.jpg'),
    'Britannia Good Day 150g': require('@/assets/images/products/britannia-good-day.jpg'),
    'Farm Fresh Eggs 12pcs': require('@/assets/images/products/farm-fresh-eggs.jpg'),
    // Add more mappings as you add more images
  };

  // First try to use local image if it exists
  if (imageMap[productName]) {
    return { source: imageMap[productName], exists: true };
  }

  // Then try to use the product_url from API if it exists
  if (productUrl) {
    return { source: { uri: productUrl }, exists: true };
  }

  // No image available
  return { source: null, exists: false };
};

// Helper function to format variant attributes
const formatVariantAttributes = (product: any) => {
  // First check if there's a direct formattedVariantAttributes field (most reliable)
  if (product.formattedVariantAttributes) {
    return product.formattedVariantAttributes;
  }

  // Fallback: Check variantCombination.attributeDetails for detailed info
  if (product.variantCombination?.attributeDetails && Array.isArray(product.variantCombination.attributeDetails)) {
    const attributes = product.variantCombination.attributeDetails.map((attr: any) => {
      if (attr.optionName && attr.valueName) {
        return `${attr.optionName}: ${attr.valueName}`;
      }
      return attr.valueName || attr.value;
    }).filter(Boolean);
    
    return attributes.length > 0 ? attributes.join(' • ') : null;
  }

  return null;
};

export default function StoreDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme];
  const { state: cartState, addItem, updateQuantity, getItemQuantity } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Fetch products for this store
  useEffect(() => {
    if (id) {
      fetchStoreProducts();
    }
  }, [id]);

  const fetchStoreProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await ApiService.products.getStoreProducts({
        // We can add store-specific filters here if needed
        limit: 100
      });
      
      if (response.products) {
        console.log('📋 API Response - Total products:', response.products.length);
        
        // Log first few products to understand structure
        response.products.slice(0, 3).forEach((product, index) => {
          console.log(`Product ${index + 1}: ${product.name}`);
          if (product.attributeDetails) {
            console.log('  - attributeDetails:', product.attributeDetails);
            if (product.attributeDetails.variantCombination) {
              console.log('  - variantCombination:', product.attributeDetails.variantCombination);
            }
          } else {
            console.log('  - No attributeDetails found');
          }
        });
        
        setProducts(response.products);
      }
      
      // Use categories directly from API response
      console.log('API Response categories:', response.categories);
      if (response.categories) {
        const categoriesWithIcons = response.categories.map((category: any) => ({
          id: category.id,
          name: category.name,
          icon: getCategoryIcon(category.name)
        }));
        console.log('Processed categories with icons:', categoriesWithIcons);
        setCategories(categoriesWithIcons);
      } else {
        console.log('No categories found in API response');
      }
    } catch (error) {
      console.error('Error fetching store products:', error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Helper function to get category icons
  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: string } = {
      'beverages': '🥤',
      'dairy': '🥛',
      'dairy & bakery': '🥛',
      'bakery': '🍞',
      'snacks': '🍿',
      'groceries': '🛒',
      'groceries & staples': '🛒',
      'staples': '🌾',
      'fruits': '🍎',
      'vegetables': '🥕',
      'fresh produce': '🥬',
      'produce': '🥬',
      'meat': '🥩',
      'seafood': '🐟',
      'frozen': '🧊',
      'personal care': '🧴',
      'household': '🧽',
      'home care': '🧽',
      'baby care': '👶',
      'health': '💊',
      'electronics': '📱'
    };
    return iconMap[categoryName.toLowerCase()] || '🛍️';
  };

  // Pull-to-refresh functionality
  const { refreshing, onRefresh } = useRefresh(async () => {
    await fetchStoreProducts();
    await simulateDataFetch(500);
  });

  // Temporary store object - will be fetched from API later
  const store = {
    id: id,
    name: 'Store',
    deliveryTime: '20-30 min',
    deliveryFee: 20,
  };

  // Filter products by category
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.categoryName === selectedCategory);

  const storeCategories = [
    { id: 'all', name: 'All Items', icon: '🛒' },
    ...categories
  ];
  
  // Debug: log the final categories array
  if (storeCategories.length !== (categories.length + 1)) {
    console.log('Categories state:', categories);
    console.log('Final storeCategories:', storeCategories);
  }

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
    const imageInfo = getProductImage(product.name, product.image_url || product.product_url || product.variant?.images?.primary);
    
    // Get image URL for cart - use placeholder if no image exists
    let imageUrl = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop';
    if (imageInfo.exists && imageInfo.source?.uri) {
      imageUrl = imageInfo.source.uri;
    }
    
    addItem({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: imageUrl,
      category: product.categoryName,
      unit: product.unit || 'piece',
      storeId: store.id,
      storeName: store.name,
    });
  };

  const renderProduct = ({ item }: { item: any }) => {
    const quantity = getItemQuantity(item.id);
    const imageInfo = getProductImage(item.name, item.image_url || item.product_url || item.variant?.images?.primary);
    
    // Debug: Log product structure to see variant info
    if (item.formattedVariantAttributes || item.variantCombination) {
      console.log('Product with variant:', item.name);
      console.log('- formattedVariantAttributes:', item.formattedVariantAttributes);
      console.log('- variantCombination:', item.variantCombination);
      console.log('- Formatted result:', formatVariantAttributes(item));
    }
    
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
        {imageInfo.exists ? (
          <Image 
            source={imageInfo.source}
            style={styles.productImage}
            {...Platform.select({
              web: {
                draggable: false,
                onDragStart: (e: any) => e.preventDefault(),
              },
            })}
          />
        ) : (
          <View style={[styles.productImage, styles.placeholderImage, { backgroundColor: colors.divider }]}>
            <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>📦</Text>
          </View>
        )}
        
        {item.discount && (
          <View style={[styles.discountBadge, { backgroundColor: colors.discount }]}>
            <Text style={[styles.discountText, { color: colors.textInverse }]}>
              {item.discount}% OFF
            </Text>
          </View>
        )}
        

        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: colors.text }]}>
            {item.name}
          </Text>
          {formatVariantAttributes(item) && (
            <Text style={[styles.productVariant, { color: colors.textSecondary }]}>
              {formatVariantAttributes(item)}
            </Text>
          )}
          <Text style={[styles.productUnit, { color: colors.textSecondary }]}>
            {item.unit || 'piece'}
          </Text>
          
          <View style={styles.productFooter}>
            <View style={styles.priceContainer}>
              <Text style={[styles.productPrice, { color: colors.text }]}>
                ₹{parseFloat(item.price).toFixed(2)}
              </Text>
              {item.mrp && parseFloat(item.mrp) > parseFloat(item.price) && (
                <Text style={[styles.originalPrice, { color: colors.textTertiary }]}>
                  ₹{parseFloat(item.mrp).toFixed(2)}
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

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >


        {/* Main Content Area with Sidebar Layout */}
        <View style={styles.mainContent}>
          {/* Categories Sidebar */}
          <View style={[styles.categoriesSidebar, { backgroundColor: colors.surface }]}>
            <ScrollView showsVerticalScrollIndicator={false} style={styles.categoriesList}>
              {storeCategories.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.categoryItem,
                    {
                      backgroundColor: selectedCategory === item.id || selectedCategory === item.name 
                        ? colors.primary + '20' 
                        : 'transparent',
                      borderColor: selectedCategory === item.id || selectedCategory === item.name 
                        ? colors.primary 
                        : 'transparent',
                    }
                  ]}
                  onPress={() => setSelectedCategory(item.id === 'all' ? 'all' : item.name)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryIcon}>{item.icon}</Text>
                  <Text
                    style={[
                      styles.categoryName,
                      {
                        color: selectedCategory === item.id || selectedCategory === item.name 
                          ? colors.primary 
                          : colors.text,
                        fontWeight: selectedCategory === item.id || selectedCategory === item.name 
                          ? Typography.fontWeight.semibold 
                          : Typography.fontWeight.regular
                      }
                    ]}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Products Area */}
          <View style={styles.productsContainer}>
            <View style={styles.productsHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {selectedCategory === 'all' ? 'All Products' : selectedCategory}
              </Text>
              <Text style={[styles.productCount, { color: colors.textSecondary }]}>
                {filteredProducts.length} items
              </Text>
            </View>
            
            {loadingProducts ? (
              <View style={styles.loadingContainer}>
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Loading products...
                </Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false} style={styles.productsScrollView}>
                <View style={styles.productsGrid}>
                  {filteredProducts.map((product, index) => {
                    // Create rows of 2 products each
                    if (index % 2 === 0) {
                      const nextProduct = filteredProducts[index + 1];
                      return (
                        <View key={`row-${index}`} style={styles.productRow}>
                          {renderProduct({ item: product })}
                          {nextProduct && renderProduct({ item: nextProduct })}
                        </View>
                      );
                    }
                    return null; // Skip odd indices as they're handled by the previous even index
                  })}
                </View>
              </ScrollView>
            )}
          </View>
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
  // New Sidebar Layout Styles
  mainContent: {
    flexDirection: 'row',
    flex: 1,
  },
  categoriesSidebar: {
    width: 100,
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
    paddingVertical: Spacing.md,
  },
  categoriesList: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    marginHorizontal: 4,
    marginBottom: Spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    borderWidth: 1,
    minHeight: 40,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 6,
    width: 18,
    textAlign: 'center',
  },
  categoryName: {
    ...TextStyles.bodySmall,
    fontSize: Typography.fontSize.xs,
    flex: 1,
    lineHeight: 14,
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  productsScrollView: {
    flex: 1,
  },
  sectionTitle: {
    ...TextStyles.h5,
    flex: 1,
  },
  productCount: {
    ...TextStyles.bodySmall,
    fontWeight: Typography.fontWeight.medium,
  },
  productsGrid: {
    flex: 1,
  },
  productRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
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
    lineHeight: 18,
    flexWrap: 'wrap',
  },
  productVariant: {
    ...TextStyles.caption,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.regular,
    fontStyle: 'italic',
    marginBottom: Spacing.xxs,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  loadingText: {
    ...TextStyles.body,
    textAlign: 'center',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
  },
});
