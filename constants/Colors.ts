/**
 * AiSupermart Color System
 * Indian market-inspired palette with complete light/dark theme support
 */

export const Colors = {
  light: {
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
    
    // Legacy (for compatibility)
    tint: '#FF8C42',
    icon: '#666666',
    tabIconDefault: '#999999',
    tabIconSelected: '#FF8C42',
  },
  dark: {
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
    
    // Legacy (for compatibility)
    tint: '#FFA366',
    icon: '#B3B3B3',
    tabIconDefault: '#808080',
    tabIconSelected: '#FFA366',
  },
};
