/**
 * Layout System for AiSupermart
 * Consistent spacing, sizing, and layout values
 */

export const Spacing = {
  xxs: 2,   // Minimal spacing
  xs: 4,    // Tight spacing
  sm: 8,    // Small spacing
  md: 12,   // Medium spacing
  lg: 16,   // Default spacing
  xl: 20,   // Large spacing
  xxl: 24,  // Extra large
  xxxl: 32, // Huge spacing
  mega: 40, // Mega spacing
  giga: 48, // Giga spacing
};

export const Layout = {
  // Screen Layout
  screen: {
    width: 375, // Default screen width for calculations
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  
  // Container
  container: {
    maxWidth: 428, // Max width for tablets
    paddingHorizontal: Spacing.lg,
  },
  
  // Card Dimensions
  card: {
    padding: Spacing.lg,
    borderRadius: 12,
    minHeight: 80,
    gap: Spacing.md,
  },
  
  // Store Card
  storeCard: {
    height: 120,
    imageWidth: 80,
    padding: Spacing.lg,
    borderRadius: 12,
  },
  
  // Product Card
  productCard: {
    borderRadius: 8,
    padding: Spacing.md,
    imageHeight: 120,
  },
  
  // Bottom Tab
  tabBar: {
    height: 60,
    iconSize: 24,
    labelSize: 10,
    paddingBottom: 4,
  },
  
  // Header
  header: {
    height: 56,
    largeHeight: 96,
    iconSize: 24,
    paddingHorizontal: Spacing.lg,
  },
  
  // Buttons
  button: {
    height: 48,
    minWidth: 120,
    borderRadius: 8,
    paddingHorizontal: Spacing.xl,
    iconSize: 20,
  },
  
  buttonSmall: {
    height: 36,
    minWidth: 80,
    borderRadius: 6,
    paddingHorizontal: Spacing.md,
    iconSize: 16,
  },
  
  buttonLarge: {
    height: 56,
    minWidth: 160,
    borderRadius: 12,
    paddingHorizontal: Spacing.xxl,
    iconSize: 24,
  },
  
  // Floating Action Button
  fab: {
    size: 56,
    iconSize: 24,
    borderRadius: 28,
    bottom: 80, // Above tab bar
    right: Spacing.lg,
  },
  
  // Input Fields
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    fontSize: 15,
    borderWidth: 1,
  },
  
  inputLarge: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: Spacing.lg,
    fontSize: 17,
  },
  
  // Search Bar
  searchBar: {
    height: 44,
    borderRadius: 22,
    paddingHorizontal: Spacing.lg,
    iconSize: 20,
  },
  
  // Product Grid
  productGrid: {
    columns: 2,
    spacing: Spacing.md,
    aspectRatio: 0.75,
  },
  
  // Category Grid
  categoryGrid: {
    columns: 4,
    spacing: Spacing.sm,
    itemSize: 80,
    imageSize: 48,
  },
  
  // List Items
  listItem: {
    minHeight: 56,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    iconSize: 24,
  },
  
  // Divider
  divider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  
  // Badge
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    fontSize: 11,
  },
  
  // Cart Floating Bar
  cartBar: {
    height: 64,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 16,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  
  // Modal
  modal: {
    borderRadius: 16,
    padding: Spacing.xl,
    maxWidth: 340,
  },
  
  // Loading Skeleton
  skeleton: {
    borderRadius: 4,
    animationDuration: 1500,
  },
  
  // Image Sizes
  image: {
    thumbnail: 40,
    small: 60,
    medium: 80,
    large: 120,
    xlarge: 160,
    hero: 200,
    banner: 240,
  },
  
  // Icon Sizes
  icon: {
    xs: 16,   // Inline icons
    sm: 20,   // Small buttons
    md: 24,   // Default
    lg: 28,   // Large buttons
    xl: 32,   // Feature icons
    xxl: 48,  // Hero icons
  },
  
  // Border Radius
  borderRadius: {
    xs: 4,
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    xxl: 20,
    round: 9999,
  },
  
  // Shadows (Platform specific)
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 6,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

// Responsive Breakpoints
export const Breakpoints = {
  sm: 360,   // Small phones
  md: 375,   // Standard phones
  lg: 414,   // Large phones
  xl: 768,   // Tablets
};

// Animation Timings
export const Animation = {
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
  },
  
  easing: {
    in: 'ease-in',
    out: 'ease-out',
    inOut: 'ease-in-out',
  },
};

// Z-Index Layers
export const ZIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  modal: 300,
  popover: 400,
  toast: 500,
  tooltip: 600,
};