import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Image, FlatList, Platform, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Layout, Spacing } from '@/constants/Layout';
import { Typography, TextStyles } from '@/constants/Typography';
import { useAppColorScheme } from '@/contexts/ThemeContext';
import { router, Head } from 'expo-router';
import ThemeToggle from '@/components/themed/ThemeToggle';
import { useRefresh, simulateDataFetch } from '@/hooks/useRefresh';
import { ApiService } from '@/services/api';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ApiStore {
  id: number;
  name: string;
  location: string;
  address: string;
  phone: string;
  // Customer-relevant fields (to be added when available from API)
  isOpen?: boolean;
  rating?: number;
  deliveryTime?: string;
  minimumOrder?: number;
  deliveryFee?: number;
  offers?: string[];
}

export default function HomeScreen() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme];
  const [apiStores, setApiStores] = useState<ApiStore[]>([]);
  const [loadingStores, setLoadingStores] = useState(true);
  const [user, setUser] = useState<any>(null);

  // Load user data from AsyncStorage
  useEffect(() => {
    loadUserData();
    fetchStores();
  }, []);

  const loadUserData = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const fetchStores = async () => {
    try {
      setLoadingStores(true);
      const response = await ApiService.stores.getAllStores();
      
      // Transform stores to show only customer-relevant information
      const customerStores = (response.stores || []).map((store: any) => ({
        id: store.id,
        name: store.name,
        location: store.location,
        address: store.address,
        phone: store.phone,
        // Add customer-relevant fields when available from API
        // For now, we'll use defaults in the render function
      }));
      
      setApiStores(customerStores);
    } catch (error) {
      console.error('Error fetching stores:', error);
    } finally {
      setLoadingStores(false);
    }
  };

  // Pull-to-refresh functionality
  const { refreshing, onRefresh } = useRefresh(async () => {
    await Promise.all([
      fetchStores(),
      loadUserData(),
      simulateDataFetch(500) // Brief delay for smooth UX
    ]);
  });

  // Helper function to format phone number for display
  const formatPhoneForDisplay = (phone: string) => {
    // Convert +914843456789 to +91-484-3456789 format
    if (phone.startsWith('+91') && phone.length === 13) {
      return `${phone.slice(0, 3)}-${phone.slice(3, 6)}-${phone.slice(6)}`;
    }
    return phone;
  };

  const renderApiStoreCard = (store: ApiStore, index: number) => {
    // Default values for customer-relevant info when not available from API
    const isOpen = store.isOpen ?? true; // Assume open if not specified
    const rating = store.rating ?? (4.0 + Math.random() * 0.8); // Random rating between 4.0-4.8
    const deliveryTime = store.deliveryTime ?? `${20 + Math.floor(Math.random() * 20)}-${35 + Math.floor(Math.random() * 15)} min`;
    const minimumOrder = store.minimumOrder ?? (80 + Math.floor(Math.random() * 40)); // 80-120
    const deliveryFee = store.deliveryFee ?? (15 + Math.floor(Math.random() * 20)); // 15-35
    
    return (
      <TouchableOpacity
        key={store.id}
        style={[styles.apiStoreCard, { 
          backgroundColor: colors.surface,
          borderColor: colors.border,
          ...Layout.shadow.sm 
        }]}
        activeOpacity={0.8}
        onPress={() => router.push(`/store/${store.id}`)}
      >
        <View style={styles.apiStoreHeader}>
          <View style={styles.apiStoreInfo}>
            <Text style={[styles.apiStoreName, { color: colors.text }]} numberOfLines={1}>
              {store.name}
            </Text>
            <Text style={[styles.apiStoreLocation, { color: colors.textSecondary }]} numberOfLines={1}>
              {store.location}
            </Text>
          </View>
          
          <View style={styles.storeMetrics}>
            <View style={[styles.ratingContainer, { backgroundColor: colors.success + '15' }]}>
              <IconSymbol name="star.fill" size={12} color={colors.success} />
              <Text style={[styles.rating, { color: colors.success }]}>
                {rating.toFixed(1)}
              </Text>
            </View>
            
            <View style={[styles.statusBadge, { 
              backgroundColor: isOpen ? colors.success + '15' : colors.error + '15' 
            }]}>
              <Text style={[styles.statusText, { 
                color: isOpen ? colors.success : colors.error 
              }]}>
                {isOpen ? 'Open' : 'Closed'}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.apiStoreDetails}>
          <View style={styles.apiStoreDetailRow}>
            <IconSymbol name="location" size={14} color={colors.textTertiary} />
            <Text style={[styles.apiStoreAddress, { color: colors.textTertiary }]} numberOfLines={2}>
              {store.address}
            </Text>
          </View>
          
          <View style={styles.deliveryInfoRow}>
            <View style={styles.deliveryInfoItem}>
              <IconSymbol name="clock" size={14} color={colors.primary} />
              <Text style={[styles.deliveryText, { color: colors.primary }]}>
                {deliveryTime}
              </Text>
            </View>
            
            <View style={styles.deliveryInfoItem}>
              <IconSymbol name="bag" size={14} color={colors.primary} />
              <Text style={[styles.deliveryText, { color: colors.primary }]}>
                ₹{minimumOrder} min order
              </Text>
            </View>
            
            <View style={styles.deliveryInfoItem}>
              <IconSymbol name="indianrupeesign" size={14} color={colors.success} />
              <Text style={[styles.deliveryText, { color: colors.success }]}>
                {deliveryFee === 0 ? 'Free delivery' : `₹${deliveryFee} delivery`}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={[styles.apiStoreFooter, { borderTopColor: colors.border }]}>
          <Text style={[styles.tapToExplore, { color: colors.textSecondary }]}>
            Tap to explore products
          </Text>
          <IconSymbol name="arrow.right" size={16} color={colors.primary} />
        </View>
      </TouchableOpacity>
    );
  };

  const renderStoreCard = ({ item: store }: { item: any }) => (
    <TouchableOpacity
      style={[styles.storeCard, { 
        backgroundColor: colors.surface,
        borderColor: colors.border,
        ...Layout.shadow.md 
      }]}
      activeOpacity={0.8}
      onPress={() => router.push(`/store/${store.id}`)}
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
      {/* Store Image with Status Overlay */}
      <View style={styles.storeImageContainer}>
        <Image 
          source={{ uri: store.logo }} 
          style={[styles.storeLogo, !store.isOpen && styles.storeLogoClosed]}
          resizeMode="cover"
          {...Platform.select({
            web: {
              draggable: false,
              onDragStart: (e: any) => e.preventDefault(),
            },
          })}
        />
        {!store.isOpen && (
          <View style={[styles.closedOverlay, { backgroundColor: colors.error + '80' }]}>
            <Text style={[styles.closedOverlayText, { color: colors.textInverse }]}>
              Closed
            </Text>
          </View>
        )}
        {store.offers.length > 0 && (
          <View style={[styles.offerBadge, { backgroundColor: colors.accent }]}>
            <Text style={[styles.offerText, { color: colors.text }]} numberOfLines={1}>
              {store.offers[0]}
            </Text>
          </View>
        )}
      </View>

      {/* Store Information */}
      <View style={styles.storeInfo}>
        <View style={styles.storeHeader}>
          <Text style={[styles.storeName, { color: colors.text }]} numberOfLines={1}>
            {store.name}
          </Text>
          <View style={[styles.ratingContainer, { backgroundColor: colors.success + '15' }]}>
            <IconSymbol name="star.fill" size={12} color={colors.success} />
            <Text style={[styles.rating, { color: colors.success }]}>
              {store.rating}
            </Text>
          </View>
        </View>
        
        <View style={styles.storeMetaRow}>
          <Text style={[styles.storeCategory, { color: colors.textSecondary }]} numberOfLines={1}>
            {store.category}
          </Text>
          <View style={styles.distanceBadge}>
            <IconSymbol name="location" size={12} color={colors.textTertiary} />
            <Text style={[styles.distanceText, { color: colors.textTertiary }]}>
              {store.distance}
            </Text>
          </View>
        </View>
        
        <View style={styles.deliveryRow}>
          <View style={styles.deliveryInfo}>
            <IconSymbol name="clock" size={14} color={colors.primary} />
            <Text style={[styles.deliveryText, { color: colors.primary }]}>
              {store.deliveryTime}
            </Text>
          </View>
          <View style={styles.deliveryFeeContainer}>
            <Text style={[styles.deliveryFee, { color: store.deliveryFee === 0 ? colors.success : colors.textSecondary }]}>
              {store.deliveryFee === 0 ? 'Free delivery' : `₹${store.deliveryFee} delivery`}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.quickActionButton, { backgroundColor: colors.primary + '10' }]}
          onPress={() => router.push(`/store/${store.id}`)}
        >
          <IconSymbol name="arrow.right" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <View style={styles.headerTop}>
          <View style={styles.locationContainer}>
            <IconSymbol name="location" size={20} color={colors.textInverse} />
            <View style={styles.locationInfo}>
              <Text style={[styles.locationLabel, { color: colors.textInverse + 'CC' }]}>
                Deliver to
              </Text>
              <Text style={[styles.locationText, { color: colors.textInverse }]}>
                Home - 560034
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            {user?.name && (
              <Text style={[styles.userName, { color: colors.textInverse }]} numberOfLines={1}>
                {user.name}
              </Text>
            )}
            <ThemeToggle />
            <TouchableOpacity style={styles.profileButton}>
              <IconSymbol name="person.circle" size={28} color={colors.textInverse} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Search Bar */}
        <TouchableOpacity 
          style={[styles.searchBar, { backgroundColor: colors.background }]}
          activeOpacity={0.8}
        >
          <IconSymbol name="magnifyingglass" size={20} color={colors.textSecondary} />
          <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
            Search for products, stores...
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.mainScrollView}
        contentContainerStyle={styles.mainScrollContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Available Stores {apiStores.length > 0 ? `(${apiStores.length})` : ''}
          </Text>
        </View>
        
        {/* Loading State */}
        {loadingStores && (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading stores...
            </Text>
          </View>
        )}
        
        {/* API Store Cards */}
        {!loadingStores && apiStores.length > 0 && (
          <View style={styles.apiStoresContainer}>
            {apiStores.map((store, index) => renderApiStoreCard(store, index))}
          </View>
        )}
        

        {/* No stores available */}
        {!loadingStores && apiStores.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              No stores available in your area
            </Text>
          </View>
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
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationInfo: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  locationLabel: {
    ...TextStyles.caption,
  },
  locationText: {
    ...TextStyles.body,
    fontWeight: Typography.fontWeight.semibold,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  userName: {
    ...TextStyles.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
    maxWidth: 100,
  },
  profileButton: {
    padding: Spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Layout.searchBar.height,
    borderRadius: Layout.searchBar.borderRadius,
    paddingHorizontal: Layout.searchBar.paddingHorizontal,
    ...Layout.shadow.sm,
  },
  searchPlaceholder: {
    ...TextStyles.body,
    marginLeft: Spacing.md,
  },
  mainScrollView: {
    flex: 1,
  },
  mainScrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Platform.select({
      web: Spacing.xxxl + 120, // More padding for web mobile to clear tab bar
      default: Spacing.xxxl + 90, // More padding for native mobile
    }),
  },
  storesContainer: {
    flex: 1,
  },

  // Loading and Empty States
  loadingContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    ...TextStyles.body,
  },
  
  // API Store Cards
  apiStoresContainer: {
    gap: Spacing.md,
  },
  apiStoreCard: {
    padding: Spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    ...Layout.shadow.sm,
  },
  apiStoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  apiStoreInfo: {
    flex: 1,
  },
  apiStoreName: {
    ...TextStyles.h5,
    marginBottom: Spacing.xs,
  },
  apiStoreLocation: {
    ...TextStyles.body,
  },
  apiStoreStatus: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.md,
  },
  apiStoreStatusText: {
    ...TextStyles.caption,
    fontWeight: Typography.fontWeight.bold,
  },
  apiStoreDetails: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  apiStoreDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  apiStoreAddress: {
    ...TextStyles.bodySmall,
    flex: 1,
    lineHeight: 18,
  },
  apiStorePhone: {
    ...TextStyles.bodySmall,
  },
  apiStoreStaff: {
    ...TextStyles.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
  },
  apiStoreFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  storeMetrics: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: Spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  statusText: {
    ...TextStyles.caption,
    fontWeight: Typography.fontWeight.bold,
    fontSize: 10,
  },
  deliveryInfoRow: {
    gap: Spacing.md,
    marginTop: Spacing.xs,
  },
  deliveryInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  tapToExplore: {
    ...TextStyles.caption,
    fontWeight: Typography.fontWeight.medium,
    fontStyle: 'italic',
  },
  
  section: {
    marginTop: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: 0, // Remove extra padding since we have container padding
  },
  sectionTitle: {
    ...TextStyles.h5,
    flex: 1,
  },
  seeAll: {
    ...TextStyles.body,
    fontWeight: Typography.fontWeight.semibold,
  },
  storeCard: {
    flexDirection: 'row',
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    marginHorizontal: Platform.select({
      web: Spacing.xs, // Add horizontal margin for web to create scroll zones
      default: 0,
    }),
    borderRadius: Layout.borderRadius.xl,
    borderWidth: 1,
    alignItems: 'flex-start',
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
  storeImageContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  storeLogo: {
    width: 80,
    height: 80,
    borderRadius: Layout.borderRadius.lg,
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
  storeLogoClosed: {
    opacity: 0.6,
  },
  closedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: Layout.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closedOverlayText: {
    ...TextStyles.caption,
    fontWeight: Typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  offerBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    maxWidth: 100,
  },
  offerText: {
    ...TextStyles.caption,
    fontWeight: Typography.fontWeight.bold,
    fontSize: 10,
    textAlign: 'center',
  },
  storeInfo: {
    flex: 1,
    paddingTop: Spacing.xs,
  },
  storeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  storeName: {
    ...TextStyles.h6,
    fontWeight: Typography.fontWeight.bold,
    flex: 1,
    marginRight: Spacing.sm,
    lineHeight: 20,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Layout.borderRadius.lg,
  },
  rating: {
    ...TextStyles.caption,
    fontWeight: Typography.fontWeight.bold,
    marginLeft: Spacing.xs,
    fontSize: 12,
  },
  storeMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  storeCategory: {
    ...TextStyles.bodySmall,
    fontWeight: Typography.fontWeight.medium,
    flex: 1,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    ...TextStyles.caption,
    marginLeft: Spacing.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deliveryText: {
    ...TextStyles.bodySmall,
    marginLeft: Spacing.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  deliveryFeeContainer: {
    alignItems: 'flex-end',
  },
  deliveryFee: {
    ...TextStyles.bodySmall,
    fontWeight: Typography.fontWeight.semibold,
  },
  actionContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  quickActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: Spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    ...TextStyles.body,
    textAlign: 'center',
  },
});
