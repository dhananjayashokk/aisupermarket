import StoreFiltersBar from "@/components/StoreFiltersBar";
import StoreSearchBar from "@/components/StoreSearchBar";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { Layout, Spacing } from "@/constants/Layout";
import { TextStyles, Typography } from "@/constants/Typography";
import { useCart } from "@/contexts/CartContext";
import { useAppColorScheme } from "@/contexts/ThemeContext";
import { simulateDataFetch, useRefresh } from "@/hooks/useRefresh";
import { ApiService } from "@/services/api";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Helper function to get product images from API
const getProductImage = (imageUrl?: string) => {
  // Use the image_url from API if it exists
  if (imageUrl && imageUrl.trim() !== "") {
    // Replace 127.0.0.1 with localhost for better browser compatibility
    const normalizedUrl = imageUrl.replace("127.0.0.1", "localhost");
    console.log("Image URL normalized:", normalizedUrl);
    return { source: { uri: normalizedUrl }, exists: true };
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
  if (
    product.variantCombination?.attributeDetails &&
    Array.isArray(product.variantCombination.attributeDetails)
  ) {
    const attributes = product.variantCombination.attributeDetails
      .map((attr: any) => {
        if (attr.optionName && attr.valueName) {
          return `${attr.optionName}: ${attr.valueName}`;
        }
        return attr.valueName || attr.value;
      })
      .filter(Boolean);

    return attributes.length > 0 ? attributes.join(" • ") : null;
  }

  return null;
};

export default function StoreDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme];
  const {
    state: cartState,
    addItem,
    updateQuantity,
    getItemQuantity,
  } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<number>>(
    new Set()
  );
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [previouslyBoughtProducts, setPreviouslyBoughtProducts] = useState<
    any[]
  >([]);
  const [loadingPreviouslyBought, setLoadingPreviouslyBought] = useState(false);
  const [previouslyBoughtSortBy, setPreviouslyBoughtSortBy] = useState<
    "last_purchased" | "frequency" | "name"
  >("last_purchased");
  const [previouslyBoughtPage, setPreviouslyBoughtPage] = useState(1);
  const [previouslyBoughtTotal, setPreviouslyBoughtTotal] = useState(0);

  // Fetch products for this store
  useEffect(() => {
    if (id) {
      fetchStoreProducts();
    }
  }, [id]);

  // Fetch previously bought products when category is selected
  useEffect(() => {
    if (
      selectedCategory === "previously_bought" &&
      previouslyBoughtProducts.length === 0
    ) {
      fetchPreviouslyBought(1, previouslyBoughtSortBy);
    }
  }, [selectedCategory]);

  const fetchStoreProducts = async () => {
    try {
      setLoadingProducts(true);
      const response = await ApiService.products.getStoreProducts({
        // We can add store-specific filters here if needed
        limit: 100,
      });

      if (response.products) {
        console.log(
          "📋 API Response - Total products:",
          response.products.length
        );

        // Log first few products to understand structure and image URLs
        response.products.slice(0, 3).forEach((product, index) => {
          console.log(`Product ${index + 1}: ${product.name}`);
          console.log(`  - image_url: ${product.image_url}`);
          if (product.attributeDetails) {
            console.log("  - attributeDetails:", product.attributeDetails);
            if (product.attributeDetails.variantCombination) {
              console.log(
                "  - variantCombination:",
                product.attributeDetails.variantCombination
              );
            }
          } else {
            console.log("  - No attributeDetails found");
          }
        });

        setProducts(response.products);
      }

      // Use categories directly from API response
      console.log("API Response categories:", response.categories);
      if (response.categories) {
        const categoriesWithIcons = response.categories.map(
          (category: any) => ({
            id: category.id,
            name: category.name,
            icon: getCategoryIcon(category.name),
          })
        );
        console.log("Processed categories with icons:", categoriesWithIcons);
        setCategories(categoriesWithIcons);
      } else {
        console.log("No categories found in API response");
      }
    } catch (error) {
      console.error("Error fetching store products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch previously bought products
  const fetchPreviouslyBought = async (
    page = 1,
    sortBy = previouslyBoughtSortBy
  ) => {
    try {
      setLoadingPreviouslyBought(true);
      const response = await ApiService.products.getPreviouslyBought({
        storeId: parseInt(id as string),
        page,
        limit: 20,
        sortBy,
      });

      if (response.success && response.data) {
        console.log("Previously bought products:", response.data.length);

        // Transform the data to match our product format
        const transformedProducts = response.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.currentPrice,
          mrp: item.mrp,
          image_url: item.image,
          categoryName: item.category?.name,
          unit: item.hasVariants ? "variant" : "piece",
          brand: item.brand,
          isAvailable: item.isAvailable,
          // Purchase history data
          purchaseHistory: {
            lastPurchased: item.purchaseHistory.lastPurchased,
            totalQuantity: item.purchaseHistory.totalQuantity,
            purchaseCount: item.purchaseHistory.purchaseCount,
            avgPurchasePrice: item.avgPurchasePrice,
          },
          // Additional fields for UI
          isPreviouslyBought: true,
        }));

        if (page === 1) {
          setPreviouslyBoughtProducts(transformedProducts);
        } else {
          setPreviouslyBoughtProducts((prev) => [
            ...prev,
            ...transformedProducts,
          ]);
        }

        setPreviouslyBoughtTotal(
          response.pagination?.total || transformedProducts.length
        );
        setPreviouslyBoughtPage(page);
        setPreviouslyBoughtSortBy(sortBy);
      }
    } catch (error) {
      console.error("Error fetching previously bought products:", error);
    } finally {
      setLoadingPreviouslyBought(false);
    }
  };

  // Helper function to get category icons
  const getCategoryIcon = (categoryName: string) => {
    const iconMap: { [key: string]: string } = {
      beverages: "🥤",
      dairy: "🥛",
      "dairy & bakery": "🥛",
      bakery: "🍞",
      snacks: "🍿",
      "chips & wafers": "🥔",
      "bhujia & mixtures": "🥜",
      "namkeen snacks": "🥨",
      nachos: "🌮",
      "healthy snacks": "🥗",
      groceries: "🛒",
      "groceries & staples": "🛒",
      staples: "🌾",
      fruits: "🍎",
      vegetables: "🥕",
      "fresh produce": "🥬",
      produce: "🥬",
      meat: "🥩",
      seafood: "🐟",
      frozen: "🧊",
      "personal care": "🧴",
      household: "🧽",
      "home care": "🧽",
      "baby care": "👶",
      health: "💊",
      electronics: "📱",
    };
    return iconMap[categoryName.toLowerCase()] || "🛍️";
  };

  // Pull-to-refresh functionality
  const { refreshing, onRefresh } = useRefresh(async () => {
    await fetchStoreProducts();
    await simulateDataFetch(500);
  });

  // Temporary store object - will be fetched from API later
  const store = {
    id: id,
    name: "Store",
    deliveryTime: "20-30 min",
    deliveryFee: 20,
  };

  // Filter products by category and search query
  const filteredProducts =
    selectedCategory === "previously_bought"
      ? previouslyBoughtProducts.filter((p) => {
          const matchesSearch =
            !searchQuery ||
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.description &&
              p.description.toLowerCase().includes(searchQuery.toLowerCase()));
          return matchesSearch;
        })
      : products.filter((p) => {
          const matchesCategory =
            selectedCategory === "all" || p.categoryName === selectedCategory;
          const matchesSearch =
            !searchQuery ||
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.description &&
              p.description.toLowerCase().includes(searchQuery.toLowerCase()));
          return matchesCategory && matchesSearch;
        });

  const storeCategories = [
    { id: "all", name: "All Items", icon: "🛒" },
    ...categories,
  ];

  // Debug: log the final categories array
  if (storeCategories.length !== categories.length + 1) {
    console.log("Categories state:", categories);
    console.log("Final storeCategories:", storeCategories);
  }

  const renderCategoryTab = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.categoryTab,
        {
          backgroundColor:
            selectedCategory === item.id || selectedCategory === item.name
              ? colors.primary
              : colors.surface,
          borderColor: colors.border,
        },
      ]}
      onPress={() => setSelectedCategory(item.id === "all" ? "all" : item.name)}
      activeOpacity={0.7}
    >
      <Text style={styles.categoryTabEmoji}>{item.icon}</Text>
      <Text
        style={[
          styles.categoryTabText,
          {
            color:
              selectedCategory === item.id || selectedCategory === item.name
                ? colors.textInverse
                : colors.text,
          },
        ]}
        numberOfLines={1}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const handleAddToCart = (product: any) => {
    const imageInfo = getProductImage(product.image_url);

    // Get image URL for cart - use placeholder if no image exists
    let imageUrl =
      "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop";
    if (imageInfo.exists && imageInfo.source?.uri) {
      imageUrl = imageInfo.source.uri;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: imageUrl,
      category: product.categoryName,
      unit: product.unit || "piece",
      storeId: store.id,
      storeName: store.name,
    });
  };

  const handleImageError = (productId: number) => {
    setImageLoadErrors((prev) => new Set(prev).add(productId));
  };

  const renderProduct = ({
    item,
    showOptions = false,
  }: {
    item: any;
    showOptions?: boolean;
  }) => {
    const quantity = getItemQuantity(item.id);
    const imageInfo = getProductImage(item.image_url);
    const hasImageError = imageLoadErrors.has(item.id);
    const isBestseller = item.isBestseller || Math.random() > 0.7; // Mock bestseller status
    const hasDiscount =
      item.discount ||
      (item.mrp && parseFloat(item.mrp) > parseFloat(item.price));

    // Format purchase history info
    const formatLastPurchased = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInDays = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffInDays === 0) return "Today";
      if (diffInDays === 1) return "Yesterday";
      if (diffInDays < 7) return `${diffInDays} days ago`;
      if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
      return `${Math.floor(diffInDays / 30)} months ago`;
    };

    return (
      <TouchableOpacity
        style={[
          styles.productCard,
          {
            backgroundColor: colors.surface,
            opacity: item.isAvailable === false ? 0.6 : 1,
          },
        ]}
        activeOpacity={0.8}
        onPress={() =>
          item.isAvailable !== false && router.push(`/product/${item.id}`)
        }
        disabled={item.isAvailable === false}
        delayPressIn={Platform.OS === "web" ? 150 : 0}
        delayPressOut={Platform.OS === "web" ? 150 : 0}
        {...Platform.select({
          web: {
            onTouchStart: undefined,
            onTouchMove: undefined,
            onTouchEnd: undefined,
          },
        })}
      >
        {/* Bestseller Badge */}
        {isBestseller && (
          <View
            style={[
              styles.bestsellerBadge,
              { backgroundColor: colors.warning },
            ]}
          >
            <Text style={[styles.bestsellerText, { color: colors.text }]}>
              Bestseller
            </Text>
          </View>
        )}

        {imageInfo.exists && !hasImageError ? (
          <Image
            source={imageInfo.source}
            style={styles.productImage}
            onError={(error) => {
              console.error(`Failed to load image for ${item.name}:`, {
                url: item.image_url,
                error: error.nativeEvent,
              });
              handleImageError(item.id);
            }}
            {...Platform.select({
              web: {
                draggable: false,
                onDragStart: (e: any) => e.preventDefault(),
              },
            })}
          />
        ) : (
          <View
            style={[
              styles.productImage,
              styles.placeholderImage,
              { backgroundColor: colors.divider },
            ]}
          >
            <Text
              style={[styles.placeholderText, { color: colors.textSecondary }]}
            >
              📦
            </Text>
          </View>
        )}

        <View style={styles.productInfo}>
          <Text style={[styles.productName, { color: colors.text }]}>
            {item.name}
          </Text>
          {formatVariantAttributes(item) && (
            <Text
              style={[styles.productVariant, { color: colors.textSecondary }]}
            >
              {formatVariantAttributes(item)}
            </Text>
          )}

          {/* Show purchase history for previously bought items */}
          {item.isPreviouslyBought && item.purchaseHistory && (
            <View style={styles.purchaseHistoryContainer}>
              <Text
                style={[styles.purchaseHistoryText, { color: colors.primary }]}
              >
                🕐 {formatLastPurchased(item.purchaseHistory.lastPurchased)}
              </Text>
              <Text
                style={[
                  styles.purchaseHistoryText,
                  { color: colors.textSecondary },
                ]}
              >
                Bought {item.purchaseHistory.purchaseCount}x
              </Text>
            </View>
          )}

          <Text style={[styles.productUnit, { color: colors.textSecondary }]}>
            {item.unit || "piece"}
          </Text>

          <View style={styles.priceContainer}>
            <Text
              style={[styles.productPrice, { color: colors.text }]}
              numberOfLines={1}
            >
              ₹{parseFloat(item.price).toFixed(2)}
            </Text>
            {item.mrp && parseFloat(item.mrp) > parseFloat(item.price) && (
              <Text
                style={[styles.originalPrice, { color: colors.textTertiary }]}
                numberOfLines={1}
              >
                ₹{parseFloat(item.mrp).toFixed(2)}
              </Text>
            )}
          </View>

          <View style={styles.productFooter}>
            {quantity === 0 ? (
              <TouchableOpacity
                style={[
                  styles.addButton,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.success,
                    borderWidth: 1.5,
                  },
                ]}
                activeOpacity={0.8}
                onPress={() => handleAddToCart(item)}
              >
                <Text style={[styles.addButtonText, { color: colors.success }]}>
                  ADD
                </Text>
                {showOptions && (
                  <Text
                    style={[styles.optionsText, { color: colors.textTertiary }]}
                  >
                    {item.options || "2 options"}
                  </Text>
                )}
              </TouchableOpacity>
            ) : (
              <View
                style={[
                  styles.quantityControls,
                  {
                    backgroundColor: colors.success,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, quantity - 1)}
                  activeOpacity={0.8}
                >
                  <IconSymbol
                    name="minus"
                    size={14}
                    color={colors.textInverse}
                  />
                </TouchableOpacity>

                <Text
                  style={[styles.quantityText, { color: colors.textInverse }]}
                >
                  {quantity}
                </Text>

                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.id, quantity + 1)}
                  activeOpacity={0.8}
                >
                  <IconSymbol
                    name="plus"
                    size={14}
                    color={colors.textInverse}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {item.rating && (
            <View style={styles.ratingContainer}>
              <IconSymbol name="star.fill" size={12} color={colors.rating} />
              <Text
                style={[styles.ratingText, { color: colors.textSecondary }]}
              >
                {item.rating} ({item.reviews})
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Search Bar or Regular Header */}
      {showSearch ? (
        <StoreSearchBar
          onSearch={(query) => setSearchQuery(query)}
          onClose={() => setShowSearch(false)}
          placeholder="Search for atta, dal, coke and more"
        />
      ) : (
        <>
          {/* Header */}
          <View
            style={[
              styles.header,
              {
                backgroundColor: colors.background,
                borderBottomColor: colors.divider,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => {
                console.log("Back button pressed on store page");
                try {
                  if (router.canGoBack()) {
                    router.back();
                  } else {
                    // Fallback to home if no history
                    router.push("/(tabs)/");
                  }
                } catch (error) {
                  console.error("Navigation error:", error);
                  router.push("/(tabs)/");
                }
              }}
              activeOpacity={0.7}
            >
              <IconSymbol name="arrow.left" size={24} color={colors.text} />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text
                style={[styles.headerTitle, { color: colors.text }]}
                numberOfLines={1}
              >
                {store.name}
              </Text>
              <Text
                style={[styles.headerSubtitle, { color: colors.textSecondary }]}
              >
                {store.deliveryTime} • ₹{store.deliveryFee} delivery
              </Text>
            </View>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => setShowSearch(true)}
            >
              <IconSymbol
                name="magnifyingglass"
                size={24}
                color={colors.text}
              />
            </TouchableOpacity>
          </View>

          {/* Filters Bar */}
          <StoreFiltersBar
            onFilterPress={() => console.log("Filters pressed")}
            onSortPress={() => console.log("Sort pressed")}
            onBrandPress={() => console.log("Brand pressed")}
          />
        </>
      )}

      {/* Main Content Area with Fixed Sidebar Layout */}
      <View style={styles.mainContent}>
        {/* Categories Sidebar - Fixed */}
        <View
          style={[
            styles.categoriesSidebar,
            {
              backgroundColor: colors.surface,
              borderRightColor: colors.divider,
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.categoriesList}
          >
            {/* Previously Bought Section */}
            <TouchableOpacity
              style={[
                styles.previouslyBoughtItem,
                {
                  borderLeftColor:
                    selectedCategory === "previously_bought"
                      ? colors.success
                      : "transparent",
                },
              ]}
              activeOpacity={0.7}
              onPress={() => setSelectedCategory("previously_bought")}
            >
              <View
                style={[
                  styles.previouslyBoughtIcon,
                  { backgroundColor: colors.success + "15" },
                ]}
              >
                <IconSymbol name="cart" size={18} color={colors.success} />
              </View>
              <Text
                style={[
                  styles.previouslyBoughtText,
                  {
                    color:
                      selectedCategory === "previously_bought"
                        ? colors.success
                        : colors.text,
                    fontWeight:
                      selectedCategory === "previously_bought"
                        ? Typography.fontWeight.semibold
                        : Typography.fontWeight.medium,
                  },
                ]}
              >
                Previously{"\n"}Bought
              </Text>
            </TouchableOpacity>

            {/* Category Items */}
            {loadingProducts ? (
              // Skeleton loader for categories
              <>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <View
                    key={`skeleton-${item}`}
                    style={[
                      styles.categoryItemSkeleton,
                      { backgroundColor: colors.border + "40" },
                    ]}
                  />
                ))}
              </>
            ) : (
              storeCategories.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.categoryItem,
                    {
                      borderLeftColor:
                        selectedCategory === item.id ||
                        selectedCategory === item.name
                          ? colors.primary
                          : "transparent",
                    },
                  ]}
                  onPress={() =>
                    setSelectedCategory(item.id === "all" ? "all" : item.name)
                  }
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      {
                        backgroundColor:
                          selectedCategory === item.id ||
                          selectedCategory === item.name
                            ? colors.primary + "15"
                            : colors.background,
                      },
                    ]}
                  >
                    <Text style={{ fontSize: 20 }}>{item.icon}</Text>
                  </View>
                  <Text
                    style={[
                      styles.categoryName,
                      {
                        color:
                          selectedCategory === item.id ||
                          selectedCategory === item.name
                            ? colors.primary
                            : colors.textSecondary,
                        fontWeight:
                          selectedCategory === item.id ||
                          selectedCategory === item.name
                            ? Typography.fontWeight.semibold
                            : Typography.fontWeight.regular,
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        {/* Products Area - Scrollable */}
        <View style={styles.productsContainer}>
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
            <View style={styles.productsHeader}>
              <View style={styles.headerLeft}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {selectedCategory === "all"
                    ? "All Products"
                    : selectedCategory === "previously_bought"
                    ? "Previously Bought"
                    : selectedCategory}
                </Text>
                <Text
                  style={[styles.productCount, { color: colors.textSecondary }]}
                >
                  {filteredProducts.length} items
                </Text>
              </View>

              {/* Sorting dropdown for Previously Bought */}
              {selectedCategory === "previously_bought" && (
                <View style={styles.sortingContainer}>
                  <TouchableOpacity
                    style={[styles.sortButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                    activeOpacity={0.7}
                    onPress={() => {
                      // Cycle through sort options
                      const sortOptions: Array<'last_purchased' | 'frequency' | 'name'> = ['last_purchased', 'frequency', 'name'];
                      const currentIndex = sortOptions.indexOf(previouslyBoughtSortBy);
                      const nextIndex = (currentIndex + 1) % sortOptions.length;
                      const nextSort = sortOptions[nextIndex];
                      fetchPreviouslyBought(1, nextSort);
                    }}
                  >
                    <IconSymbol name="arrow.up.arrow.down" size={14} color={colors.primary} />
                    <Text style={[styles.sortButtonText, { color: colors.primary }]}>
                      {previouslyBoughtSortBy === 'last_purchased' && 'Recent'}
                      {previouslyBoughtSortBy === 'frequency' && 'Most Bought'}
                      {previouslyBoughtSortBy === 'name' && 'A-Z'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {(selectedCategory === "previously_bought" ? loadingPreviouslyBought : loadingProducts) ? (
              <View style={styles.loadingContainer}>
                <Text
                  style={[styles.loadingText, { color: colors.textSecondary }]}
                >
                  {selectedCategory === "previously_bought"
                    ? "Loading your previously bought items..."
                    : "Loading products..."}
                </Text>
              </View>
            ) : filteredProducts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  {selectedCategory === "previously_bought"
                    ? "No previously bought items found"
                    : "No products found in this category"}
                </Text>
              </View>
            ) : (
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
            )}
          </ScrollView>
        </View>
      </View>

      {/* Floating Cart Button */}
      {cartState.totalItems > 0 && (
        <TouchableOpacity
          style={[
            styles.floatingCartButton,
            {
              backgroundColor: colors.primary,
              ...Layout.shadow.lg,
            },
          ]}
          activeOpacity={0.8}
          onPress={() => router.push("/cart")}
        >
          <IconSymbol name="cart.fill" size={24} color={colors.textInverse} />
          <View
            style={[styles.cartBadge, { backgroundColor: colors.cartBadge }]}
          >
            <Text style={[styles.cartBadgeText, { color: colors.textInverse }]}>
              {cartState.totalItems > 99 ? "99+" : cartState.totalItems}
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
    flexDirection: "row",
    alignItems: "center",
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
  previouslyBoughtItem: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    marginHorizontal: Spacing.xs,
    marginBottom: Spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: "transparent",
    minHeight: 70,
  },
  previouslyBoughtIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  previouslyBoughtText: {
    ...TextStyles.caption,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 13,
    fontWeight: Typography.fontWeight.medium,
    maxWidth: 70,
  },
  // New Sidebar Layout Styles
  mainContent: {
    flexDirection: "row",
    flex: 1,
  },
  categoriesSidebar: {
    width: 90,
    borderRightWidth: 1,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  categoriesList: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xs,
    marginHorizontal: Spacing.xs,
    borderLeftWidth: 3,
    borderLeftColor: "transparent",
    minHeight: 70,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  categoryName: {
    ...TextStyles.caption,
    fontSize: 11,
    textAlign: "center",
    lineHeight: 13,
    maxWidth: 70,
  },
  categoryItemSkeleton: {
    height: 70,
    marginHorizontal: Spacing.xs,
    marginBottom: Spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    opacity: 0.3,
  },
  productsContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  productsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
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
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  productCard: {
    width: "48%",
    borderRadius: Layout.productCard.borderRadius,
    padding: Layout.productCard.padding,
    marginBottom: Spacing.md,
    ...Layout.shadow.sm,
    position: "relative",
    ...Platform.select({
      web: {
        cursor: "pointer",
        touchAction: "manipulation",
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        WebkitTapHighlightColor: "transparent",
      },
    }),
  },
  bestsellerBadge: {
    position: "absolute",
    top: Spacing.xs,
    left: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Layout.borderRadius.xs,
    zIndex: 1,
  },
  bestsellerText: {
    ...TextStyles.caption,
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
  },
  productImage: {
    width: "100%",
    height: Layout.productCard.imageHeight,
    borderRadius: Layout.borderRadius.sm,
    marginBottom: Spacing.sm,
    ...Platform.select({
      web: {
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        WebkitUserDrag: "none",
        WebkitTouchCallout: "none",
        pointerEvents: "none",
      },
    }),
  },
  discountBadge: {
    position: "absolute",
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
    minHeight: 140,
    justifyContent: "space-between",
  },
  productName: {
    ...TextStyles.body,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.xxs,
    lineHeight: 18,
    flexWrap: "wrap",
    minHeight: 36,
  },
  productVariant: {
    ...TextStyles.caption,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.regular,
    fontStyle: "italic",
    marginBottom: Spacing.xxs,
    minHeight: 16,
  },
  productUnit: {
    ...TextStyles.caption,
    marginBottom: Spacing.sm,
    minHeight: 14,
  },
  productFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  priceContainer: {
    marginBottom: Spacing.sm,
    minHeight: 40,
    justifyContent: "flex-start",
  },
  productPrice: {
    ...TextStyles.priceSmall,
    flexShrink: 0,
    marginBottom: Spacing.xxs,
  },
  originalPrice: {
    ...TextStyles.caption,
    textDecorationLine: "line-through",
    marginBottom: Spacing.xxs,
  },
  deliveryInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: Spacing.sm,
  },
  deliveryText: {
    ...TextStyles.caption,
    fontSize: 10,
    fontWeight: Typography.fontWeight.semibold,
  },
  addButton: {
    width: "100%",
    height: 32,
    borderRadius: Layout.borderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  addButtonText: {
    ...TextStyles.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 0.5,
  },
  optionsText: {
    ...TextStyles.caption,
    fontSize: 9,
    marginTop: 2,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Layout.borderRadius.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 4,
    flexShrink: 0,
  },
  quantityButton: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    ...TextStyles.bodySmall,
    fontWeight: Typography.fontWeight.bold,
    marginHorizontal: Spacing.sm,
    minWidth: 16,
    textAlign: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    ...TextStyles.caption,
    marginLeft: Spacing.xxs,
  },
  floatingCartButton: {
    position: "absolute",
    bottom: 80,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    ...TextStyles.caption,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  errorText: {
    ...TextStyles.bodyLarge,
    textAlign: "center",
    marginTop: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  loadingText: {
    ...TextStyles.body,
    textAlign: "center",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 32,
  },
  purchaseHistoryContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginVertical: Spacing.xs,
  },
  purchaseHistoryText: {
    ...TextStyles.caption,
    fontSize: 11,
  },
  headerLeft: {
    flex: 1,
  },
  sortingContainer: {
    justifyContent: "center",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  sortButtonText: {
    ...TextStyles.bodySmall,
    fontWeight: Typography.fontWeight.medium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing.xxxl,
  },
  emptyText: {
    ...TextStyles.body,
    textAlign: "center",
  },
});
