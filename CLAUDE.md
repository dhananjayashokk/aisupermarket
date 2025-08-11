# AiSupermart - Project Context for Claude

## Project Overview
AiSupermart is an Indian supermarket aggregator mobile app built with React Native and Expo. The app allows users to browse and order from multiple local supermarkets with features similar to Blinkit/Instamart.

## Tech Stack
- **Framework**: React Native with Expo SDK 53
- **Navigation**: expo-router (file-based routing)
- **Styling**: StyleSheet with theme support (light/dark modes)
- **State Management**: React Context + Hooks
- **TypeScript**: Enabled for type safety

## Design Philosophy
- **Indian Market Aesthetic**: Warm colors inspired by local markets
- **Minimal & Modern**: Clean UI with focus on usability
- **Performance First**: Optimized for fast loading on all devices
- **Theme Support**: Complete dark/light mode implementation

## Color Palette
### Brand Colors - Kerala Green Inspired
- Primary Kerala Green: #2E7D32 (Light) / #4CAF50 (Dark) - Represents Kerala's lush forests
- Secondary Coral: #FF8A65 (Light) / #FFAB91 (Dark) - Complements the green beautifully  
- Bright Yellow: #FFD54F (Light) / #FFE082 (Dark) - Accent color for highlights

## Key Features
1. Phone number authentication with OTP
2. Location-based store discovery
3. Category-wise product browsing
4. Real-time cart management
5. Order tracking with map view
6. Multiple payment options
7. Order history and reorder
8. Dark/light theme support

## Current Implementation Status
- Basic Expo project structure set up
- Tab navigation configured
- Theme system partially implemented
- Mock data structure defined

## Development Guidelines
1. **Always maintain theme consistency** - Every component should support both themes
2. **Use TypeScript strictly** - No 'any' types unless absolutely necessary
3. **Follow component composition** - Small, reusable components
4. **Optimize images** - Use appropriate sizes and lazy loading
5. **Test on both iOS and Android** - Ensure cross-platform compatibility
6. **Use Indian context** - Prices in ₹, Indian phone formats, local store names
7. **Implement proper loading states** - Never show blank screens
8. **Handle errors gracefully** - User-friendly error messages

## File Naming Conventions
- **Screens**: PascalCase (e.g., `HomeScreen.tsx`)
- **Components**: PascalCase (e.g., `ProductCard.tsx`)
- **Utilities**: camelCase (e.g., `formatPrice.ts`)
- **Constants**: UPPER_SNAKE_CASE for values, PascalCase for files
- **Hooks**: camelCase starting with 'use' (e.g., `useCart.ts`)

## Testing Approach
- Test critical user flows
- Ensure theme switching works smoothly
- Verify cart calculations
- Test on different screen sizes
- Check offline behavior

## Performance Targets
- App launch: < 2 seconds
- Screen transitions: < 300ms
- Image loading: Progressive with placeholders
- Search results: < 500ms
- Cart updates: Instant (optimistic updates)

## Accessibility Requirements
- Minimum touch target: 44x44 points
- Color contrast: WCAG AA compliance
- Screen reader support
- Font scaling support
- RTL language ready (future)

## API Structure (Mocked)
All API responses follow this structure:
```typescript
{
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
```

## Important Notes
- Currently using mock data (no real backend)
- All images are placeholders
- Prices are in Indian Rupees (₹)
- Delivery times are simulated
- Map functionality requires additional setup

## Next Steps Priority
1. Complete theme implementation
2. Build core screens (Home, Store, Products, Cart)
3. Implement cart state management
4. Add authentication flow
5. Create order tracking
6. Polish UI and animations

## Common Commands
```bash
npm start          # Start Expo development server
npm run ios        # Run on iOS simulator
npm run android    # Run on Android emulator
npm run web        # Run in web browser
npm run lint       # Run ESLint
```

## Useful Resources
- Expo Router Docs: https://docs.expo.dev/router/introduction/
- React Native: https://reactnative.dev/docs/getting-started
- Indian UX Patterns: Consider local payment methods, phone-first auth