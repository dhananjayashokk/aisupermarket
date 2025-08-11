# AiSupermart Design System

## Design Principles
1. **Clarity First** - Information hierarchy and readability
2. **Indian Context** - Familiar patterns for Indian users
3. **Speed Matters** - Quick interactions and fast loading
4. **Accessibility** - Inclusive design for all users
5. **Consistency** - Unified experience across screens

## Color System

### Light Theme
```typescript
const lightColors = {
  // Primary Brand Colors
  primary: '#FF8C42',         // Warm Orange - CTAs, active states
  primaryLight: '#FFB380',    // Light orange - hover states
  primaryDark: '#E56B20',     // Dark orange - pressed states
  
  // Secondary Colors
  secondary: '#4CAF50',       // Fresh Green - success, positive
  secondaryLight: '#81C784',  // Light green
  secondaryDark: '#388E3C',   // Dark green
  
  // Accent Colors
  accent: '#FFD54F',          // Bright Yellow - highlights
  accentLight: '#FFECB3',     // Light yellow
  accentDark: '#FFC107',      // Dark yellow
  
  // Base Colors
  background: '#FFFFFF',      // Main background
  surface: '#F8F9FA',         // Card background
  elevated: '#FFFFFF',        // Elevated surfaces
  
  // Text Colors
  text: '#1A1A1A',           // Primary text
  textSecondary: '#666666',   // Secondary text
  textTertiary: '#999999',    // Disabled/hint text
  textInverse: '#FFFFFF',     // Text on dark backgrounds
  
  // UI Elements
  border: '#E0E0E0',         // Default borders
  divider: '#F0F0F0',        // Divider lines
  overlay: 'rgba(0,0,0,0.3)', // Modal overlays
  
  // Semantic Colors
  success: '#4CAF50',        // Success states
  error: '#F44336',          // Error states
  warning: '#FF9800',        // Warning states
  info: '#2196F3',           // Info states
  
  // Special
  cartBadge: '#FF5252',      // Cart notification
  rating: '#FFC107',         // Star ratings
  discount: '#FF6B6B',       // Discount badges
}
```

### Dark Theme
```typescript
const darkColors = {
  // Primary Brand Colors
  primary: '#FFA366',         // Softer Orange for dark mode
  primaryLight: '#FFB88C',    
  primaryDark: '#FF8C42',     
  
  // Secondary Colors
  secondary: '#66BB6A',       // Softer Green
  secondaryLight: '#81C784',  
  secondaryDark: '#4CAF50',   
  
  // Accent Colors
  accent: '#FFE082',          // Softer Yellow
  accentLight: '#FFF3B3',     
  accentDark: '#FFD54F',      
  
  // Base Colors
  background: '#121212',      // Main background
  surface: '#1E1E1E',        // Card background
  elevated: '#2C2C2C',       // Elevated surfaces
  
  // Text Colors
  text: '#FFFFFF',           // Primary text
  textSecondary: '#B3B3B3',  // Secondary text
  textTertiary: '#808080',   // Disabled/hint text
  textInverse: '#1A1A1A',    // Text on light backgrounds
  
  // UI Elements
  border: '#3A3A3A',         // Default borders
  divider: '#2A2A2A',        // Divider lines
  overlay: 'rgba(0,0,0,0.6)', // Modal overlays
  
  // Semantic Colors
  success: '#66BB6A',        
  error: '#EF5350',          
  warning: '#FFB74D',        
  info: '#42A5F5',           
  
  // Special
  cartBadge: '#FF6B6B',      
  rating: '#FFD54F',         
  discount: '#FF8080',       
}
```

## Typography

```typescript
const typography = {
  // Font Families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    mono: 'SpaceMono',
  },
  
  // Font Sizes
  fontSize: {
    xs: 11,      // Captions, labels
    sm: 13,      // Secondary text
    base: 15,    // Body text
    md: 17,      // Subheadings
    lg: 20,      // Headings
    xl: 24,      // Large headings
    xxl: 32,     // Display text
    xxxl: 40,    // Hero text
  },
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
    loose: 2,
  },
  
  // Font Weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
}
```

## Spacing System

```typescript
const spacing = {
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
}
```

## Layout System

```typescript
const layout = {
  // Screen Padding
  screenPadding: 16,
  
  // Card Dimensions
  card: {
    padding: 16,
    borderRadius: 12,
    minHeight: 80,
  },
  
  // Bottom Tab
  tabBar: {
    height: 60,
    iconSize: 24,
  },
  
  // Header
  header: {
    height: 56,
    largeHeight: 96,
  },
  
  // Buttons
  button: {
    height: 48,
    minWidth: 120,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  
  // Input Fields
  input: {
    height: 48,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  
  // Product Grid
  productGrid: {
    columns: 2,
    spacing: 12,
    aspectRatio: 0.75,
  },
}
```

## Shadow System

### Light Theme Shadows
```typescript
const lightShadows = {
  none: {},
  
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
}
```

### Dark Theme Shadows
```typescript
const darkShadows = {
  // Less prominent shadows in dark mode
  // Using elevation through color instead
  none: {},
  sm: { elevation: 2 },
  md: { elevation: 4 },
  lg: { elevation: 6 },
  xl: { elevation: 8 },
}
```

## Component Styles

### Buttons
```typescript
// Primary Button
{
  backgroundColor: colors.primary,
  color: colors.textInverse,
  height: 48,
  borderRadius: 8,
  paddingHorizontal: 20,
}

// Secondary Button
{
  backgroundColor: 'transparent',
  borderWidth: 1,
  borderColor: colors.primary,
  color: colors.primary,
}

// Text Button
{
  backgroundColor: 'transparent',
  color: colors.primary,
  textDecoration: 'underline',
}
```

### Cards
```typescript
// Store Card
{
  backgroundColor: colors.surface,
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  ...shadows.md,
}

// Product Card
{
  backgroundColor: colors.elevated,
  borderRadius: 8,
  padding: 12,
  ...shadows.sm,
}
```

### Input Fields
```typescript
{
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 8,
  paddingHorizontal: 12,
  height: 48,
  fontSize: typography.fontSize.base,
}
```

## Icons

### Icon Sizes
```typescript
const iconSizes = {
  xs: 16,   // Inline icons
  sm: 20,   // Small buttons
  md: 24,   // Default
  lg: 28,   // Large buttons
  xl: 32,   // Feature icons
  xxl: 48,  // Hero icons
}
```

### Common Icons
- Home: 'home'
- Cart: 'shopping-cart'
- Orders: 'receipt'
- Profile: 'person'
- Search: 'search'
- Filter: 'filter-list'
- Location: 'location-on'
- Back: 'arrow-back'
- Add: 'add'
- Remove: 'remove'
- Star: 'star'
- Clock: 'access-time'

## Animation Guidelines

### Timing
```typescript
const animation = {
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
    spring: 'spring',
  },
}
```

### Common Animations
- **Page Transitions**: 300ms slide
- **Modal Open**: 200ms fade + scale
- **Button Press**: 100ms scale
- **Loading**: Continuous rotation
- **Skeleton**: Shimmer effect

## Responsive Design

### Breakpoints
```typescript
const breakpoints = {
  sm: 360,   // Small phones
  md: 375,   // Standard phones
  lg: 414,   // Large phones
  xl: 768,   // Tablets
}
```

### Adaptive Layouts
- **Product Grid**: 2 columns on phones, 3 on tablets
- **Store Cards**: Full width on all devices
- **Text Scaling**: Support system font size
- **Touch Targets**: Minimum 44x44 points

## Accessibility

### Requirements
- **Color Contrast**: WCAG AA (4.5:1 for normal text)
- **Touch Targets**: Minimum 44x44 points
- **Focus Indicators**: Visible keyboard navigation
- **Screen Readers**: Proper labels and hints
- **Reduced Motion**: Respect system preferences

### Implementation
```typescript
// Accessible Button
<TouchableOpacity
  accessible={true}
  accessibilityLabel="Add to cart"
  accessibilityHint="Double tap to add this item to your cart"
  accessibilityRole="button"
>
```

## Best Practices

### Do's
- Use semantic colors (success, error, etc.)
- Maintain consistent spacing
- Follow platform guidelines
- Test on real devices
- Support both themes

### Don'ts
- Don't hardcode colors
- Avoid inline styles
- Don't ignore accessibility
- Avoid heavy shadows in dark mode
- Don't mix spacing values

## Theme Testing Checklist
- [ ] All text readable in both themes
- [ ] Images have proper overlays
- [ ] Shadows appropriate for theme
- [ ] Smooth theme transitions
- [ ] Status bar matches theme
- [ ] Navigation bar matches theme
- [ ] Input fields clearly visible
- [ ] Error states distinguishable
- [ ] Loading states visible
- [ ] Empty states styled properly