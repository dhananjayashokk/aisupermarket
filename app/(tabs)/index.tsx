import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Image, FlatList, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Layout, Spacing } from '@/constants/Layout';
import { Typography, TextStyles } from '@/constants/Typography';
import { useAppColorScheme } from '@/contexts/ThemeContext';
import { mockStores, Store } from '@/data/mockStores';
import { router } from 'expo-router';
import ThemeToggle from '@/components/themed/ThemeToggle';

export default function HomeScreen() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme];

  const renderStoreCard = ({ item: store }: { item: Store }) => (
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <SafeAreaView style={[styles.headerContainer, { backgroundColor: colors.primary }]}>
        <View style={[styles.header, { backgroundColor: colors.primary }]}>
          <View style={styles.headerTop}>
            <View style={styles.locationContainer}>
              <IconSymbol name="location" size={20} color={colors.textInverse} />
              <View>
                <Text style={[styles.locationLabel, { color: colors.textInverse + 'CC' }]}>
                  Deliver to
                </Text>
                <Text style={[styles.locationText, { color: colors.textInverse }]}>
                  Home - 560034
                </Text>
              </View>
            </View>
            <View style={styles.headerActions}>
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
      </SafeAreaView>

      {/* Main Content */}
      <FlatList
        data={mockStores}
        renderItem={renderStoreCard}
        keyExtractor={(item) => item.id}
        style={styles.mainList}
        contentContainerStyle={styles.mainListContent}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        {...Platform.select({
          web: {
            onTouchStart: undefined, // Allow native touch handling on web
            nestedScrollEnabled: false,
          },
        })}
        ListHeaderComponent={
          <View>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Nearby Stores
              </Text>
              <TouchableOpacity>
                <Text style={[styles.seeAll, { color: colors.primary }]}>
                  See All
                </Text>
              </TouchableOpacity>
            </View>
            {Platform.OS === 'web' && <View style={styles.scrollZone} />}
          </View>
        }
        ListHeaderComponentStyle={styles.listHeader}
        ItemSeparatorComponent={() => (
          Platform.OS === 'web' ? <View style={styles.scrollZone} /> : null
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...Platform.select({
      web: {
        minHeight: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
      },
    }),
  },
  headerContainer: {
    zIndex: 10,
    ...Platform.select({
      web: {
        position: 'relative',
        flexShrink: 0,
      },
    }),
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
  },
  locationLabel: {
    ...TextStyles.caption,
    marginLeft: Spacing.sm,
  },
  locationText: {
    ...TextStyles.body,
    fontWeight: Typography.fontWeight.semibold,
    marginLeft: Spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
  mainList: {
    flex: 1,
    ...Platform.select({
      web: {
        minHeight: '100vh',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      },
    }),
  },
  mainListContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Platform.select({
      web: Spacing.xxxl + 120, // More padding for web mobile to clear tab bar
      default: Spacing.xxxl + 90, // More padding for native mobile
    }),
    ...Platform.select({
      web: {
        minHeight: 'calc(100vh - 140px)', // Subtract header height
        paddingTop: Spacing.md, // Add some top padding for easier scroll start
      },
    }),
  },
  listHeader: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  scrollZone: {
    height: Spacing.sm,
    width: '100%',
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
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
});
