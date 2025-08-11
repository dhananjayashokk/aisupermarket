import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Spacing } from '@/constants/Layout';

export default function ThemeToggle({ size = 24, color }: { size?: number; color?: string }) {
  const { colorScheme, themePreference, toggleTheme } = useTheme();
  const colors = Colors[colorScheme];

  const getIcon = () => {
    switch (themePreference) {
      case 'light': return 'sun.max.fill';
      case 'dark': return 'moon.fill';
      case 'system': return 'circle.lefthalf.filled';
      default: return 'circle.lefthalf.filled';
    }
  };

  return (
    <TouchableOpacity
      style={styles.toggle}
      onPress={toggleTheme}
      activeOpacity={0.7}
    >
      <IconSymbol 
        name={getIcon()} 
        size={size} 
        color={color || colors.textInverse} 
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  toggle: {
    padding: Spacing.xs,
  },
});