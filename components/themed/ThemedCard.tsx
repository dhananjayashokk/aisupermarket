import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { useAppColorScheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Layout } from '@/constants/Layout';

interface ThemedCardProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  elevated?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function ThemedCard({ 
  children, 
  style, 
  elevated = true,
  padding = 'md' 
}: ThemedCardProps) {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme];

  const paddingValue = {
    none: 0,
    sm: Layout.card.padding / 2,
    md: Layout.card.padding,
    lg: Layout.card.padding * 1.5,
  }[padding];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          padding: paddingValue,
          ...(elevated ? Layout.shadow.md : {}),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Layout.card.borderRadius,
  },
});