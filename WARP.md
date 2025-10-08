# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
```bash
npm install                    # Install dependencies
npm start                     # Start Expo development server with QR code
npm run android              # Launch on Android emulator/device
npm run ios                  # Launch on iOS simulator/device  
npm run web                  # Run in web browser (localhost:8081)
```

### Code Quality
```bash
npm run lint                 # Run ESLint with Expo configuration
```

### Project Reset
```bash
npm run reset-project        # Move example code to app-example/, create blank app/
```

### Testing Individual Platforms
```bash
npx expo start --android --clear-cache    # Android with cache clear
npx expo start --ios --clear-cache        # iOS with cache clear
npx expo start --tunnel                   # Use tunnel for external device testing
```

## Architecture Overview

### Tech Stack
- **Framework**: React Native with Expo SDK 53
- **Navigation**: Expo Router (file-based routing)
- **Language**: TypeScript with strict mode enabled
- **State Management**: React Context API + useReducer pattern
- **Styling**: StyleSheet with comprehensive theme system
- **Platform**: iOS, Android, and Web (with Vercel deployment)

### Project Structure Pattern
This is a **supermarket aggregator mobile app** (similar to Blinkit/Instamart) with Indian market focus:

```
app/                         # Expo Router screens (file-based routing)
├── (tabs)/                  # Bottom tab navigation
├── (auth)/                  # Authentication stack (planned)  
├── store/[id].tsx          # Dynamic store details
├── product/[id].tsx        # Product detail pages
└── category/[id].tsx       # Category listings

components/
├── themed/                  # Theme-aware reusable components
├── ui/                     # Platform-specific UI components
└── [feature]/              # Feature-specific components

contexts/                    # Global state management
├── ThemeContext.tsx        # Light/dark/system theme switching
└── CartContext.tsx         # Shopping cart state

constants/
├── Colors.ts               # Kerala-inspired green color palette
├── Typography.ts           # Font scale and styles
└── Layout.ts               # Spacing and layout constants
```

### Key Architectural Patterns

#### Theme System
The app uses a sophisticated 3-mode theme system:
- **Colors.ts**: Kerala-inspired green palette (`#2E7D32` primary) with complete light/dark variants
- **ThemeContext**: Supports 'light', 'dark', and 'system' preferences
- **Themed Components**: All UI components are theme-aware via `useAppColorScheme()`

#### Navigation Architecture
```
Root Layout (ThemeProvider + CartProvider)
  └── Stack Navigator
      ├── (tabs) - Bottom tabs with cart badge
      │   ├── index (Home/Stores)
      │   ├── orders (Order history)
      │   ├── cart (Shopping cart)
      │   └── profile (User profile)
      └── Modal/Stack screens
          ├── store/[id] (Store details)
          ├── product/[id] (Product details)
          └── category/[id] (Category browsing)
```

#### State Management Pattern
- **Global State**: Context providers for theme, cart, and auth
- **Local State**: Component-level with hooks
- **Cart Logic**: useReducer pattern in CartContext with optimistic updates
- **Data Flow**: Mock data in `data/` directory, future API integration planned

### Development Guidelines

#### Theme Consistency
- Every component must support both light and dark themes
- Use `useAppColorScheme()` and `Colors[colorScheme]` pattern
- Test theme switching during development

#### TypeScript Usage
- Strict mode enabled - no `any` types unless absolutely necessary
- Path mapping configured: `@/*` resolves to root directory
- Type definitions in dedicated `types/` directory

#### Indian Market Context
- All prices display in Indian Rupees (₹)
- Phone number authentication (OTP-based)
- Local store names and categories
- Kerala-inspired green color scheme representing local markets

#### Component Patterns
```typescript
// Theme-aware component pattern
const MyComponent = () => {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme];
  
  return (
    <ThemedView style={{ backgroundColor: colors.surface }}>
      <ThemedText style={{ color: colors.text }}>Content</ThemedText>
    </ThemedView>
  );
};
```

### File Organization

#### Screen Components
- Use PascalCase: `HomeScreen.tsx`
- Place in appropriate `app/` directory following Expo Router conventions
- Dynamic routes use brackets: `store/[id].tsx`

#### Reusable Components
- **Theme components** (`components/themed/`): `ThemedView`, `ThemedText`, `ThemedButton`
- **UI components** (`components/ui/`): Platform-specific implementations
- **Feature components**: Group by feature (cart/, auth/, store/)

#### Data and Utilities
- **Mock data** (`data/`): `mockStores.ts`, `mockProducts.ts`
- **Utils** (`utils/`): Formatters, validators, storage helpers
- **Constants**: Colors, typography, layout values

### Platform-Specific Considerations

#### Expo Configuration
- **New Architecture**: Enabled for performance (Fabric + TurboModules)
- **Universal App**: iOS, Android, and Web deployment
- **Edge-to-Edge**: Android edge-to-edge UI enabled
- **Tab Support**: iPad/tablet optimized

#### Deployment
- **Web**: Vercel deployment with SPA routing
- **Mobile**: EAS Build ready (though not configured in package.json)
- **Development**: Expo Go compatible for quick testing

### Performance Optimization
- Image lazy loading planned
- Optimistic UI updates for cart operations  
- Theme switching without flicker
- Platform-specific optimizations (iOS haptics, Android edge-to-edge)

### Context from CLAUDE.md
- Kerala green inspired color palette with warm coral secondary
- Indian market focus with local context (₹, phone auth, store names)
- Performance targets: App launch <2s, screen transitions <300ms
- Accessibility: WCAG AA compliance, 44x44 touch targets
- Mock API structure with consistent response format