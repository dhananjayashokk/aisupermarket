/**
 * AiSupermart Color System
 * Kerala-inspired green palette representing the state's lush greenery
 * Complete light/dark theme support with authentic local market feel
 */

export const Colors = {
  light: {
    // Primary Brand Colors - Kerala Green Inspired
    primary: '#2E7D32',         // Kerala Forest Green - CTAs, active states
    primaryLight: '#4CAF50',    // Light Kerala Green - hover states  
    primaryDark: '#1B5E20',     // Deep Kerala Green - pressed states
    
    // Secondary Colors
    secondary: '#FF8A65',       // Warm Coral - complements Kerala green
    secondaryLight: '#FFAB91',  // Light coral
    secondaryDark: '#FF5722',   // Vibrant coral
    
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
    success: '#2E7D32',        // Success states - Kerala Green
    error: '#F44336',          // Error states
    warning: '#FF9800',        // Warning states
    info: '#2196F3',           // Info states
    
    // Special
    cartBadge: '#FF5252',      // Cart notification
    rating: '#FFC107',         // Star ratings
    discount: '#FF6B6B',       // Discount badges
    
    // Legacy (for compatibility)
    tint: '#2E7D32',
    icon: '#666666',
    tabIconDefault: '#999999',
    tabIconSelected: '#2E7D32',
  },
  dark: {
    // Primary Brand Colors - Kerala Green for Dark Mode
    primary: '#4CAF50',         // Brighter Kerala Green for dark mode visibility
    primaryLight: '#66BB6A',    // Light Kerala Green
    primaryDark: '#2E7D32',     // Forest Kerala Green     
    
    // Secondary Colors  
    secondary: '#FFAB91',       // Soft Coral for dark mode
    secondaryLight: '#FFCC80',  // Light coral
    secondaryDark: '#FF8A65',   // Warm coral   
    
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
    success: '#4CAF50',        // Kerala Green for dark mode        
    error: '#EF5350',          
    warning: '#FFB74D',        
    info: '#42A5F5',           
    
    // Special
    cartBadge: '#FF6B6B',      
    rating: '#FFD54F',         
    discount: '#FF8080',       
    
    // Legacy (for compatibility)
    tint: '#4CAF50',
    icon: '#B3B3B3',
    tabIconDefault: '#808080',
    tabIconSelected: '#4CAF50',
  },
};
