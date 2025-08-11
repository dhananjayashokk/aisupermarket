import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';

type ColorScheme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  colorScheme: 'light' | 'dark';
  themePreference: ColorScheme;
  setThemePreference: (theme: ColorScheme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useSystemColorScheme();
  const [themePreference, setThemePreferenceState] = useState<ColorScheme>('light');

  // Determine the actual color scheme based on preference
  const colorScheme: 'light' | 'dark' = 
    themePreference === 'system' 
      ? systemColorScheme ?? 'light'
      : themePreference === 'dark' 
      ? 'dark' 
      : 'light';

  const setThemePreference = (theme: ColorScheme) => {
    setThemePreferenceState(theme);
    // In a real app, you would save to AsyncStorage here
    console.log('Theme preference changed to:', theme);
  };

  const toggleTheme = () => {
    const newTheme: ColorScheme = 
      themePreference === 'light' ? 'dark' : 
      themePreference === 'dark' ? 'system' : 
      'light';
    setThemePreference(newTheme);
  };

  const value: ThemeContextType = {
    colorScheme,
    themePreference,
    setThemePreference,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Helper hook for backward compatibility
export function useAppColorScheme(): 'light' | 'dark' {
  const { colorScheme } = useTheme();
  return colorScheme;
}