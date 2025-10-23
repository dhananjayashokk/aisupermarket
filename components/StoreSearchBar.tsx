import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Platform } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { Layout, Spacing } from '@/constants/Layout';
import { Typography, TextStyles } from '@/constants/Typography';
import { useAppColorScheme } from '@/contexts/ThemeContext';

interface StoreSearchBarProps {
  onSearch?: (query: string) => void;
  onClose?: () => void;
  placeholder?: string;
}

export default function StoreSearchBar({ onSearch, onClose, placeholder = "Search for atta, dal, coke and more" }: StoreSearchBarProps) {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme];
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query);
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onSearch) {
      onSearch('');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
        activeOpacity={0.7}
      >
        <IconSymbol name="xmark.circle.fill" size={24} color={colors.textSecondary} />
      </TouchableOpacity>

      <View style={[styles.searchContainer, { backgroundColor: colors.background }]}>
        <IconSymbol name="magnifyingglass" size={18} color={colors.textTertiary} />

        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          autoFocus
        />

        {query.length > 0 && (
          <TouchableOpacity onPress={handleClear} activeOpacity={0.7}>
            <IconSymbol name="xmark.circle.fill" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.voiceButton}
          activeOpacity={0.7}
        >
          <IconSymbol name="mic" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  closeButton: {
    marginRight: Spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Layout.borderRadius.lg,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...TextStyles.body,
    paddingVertical: Platform.OS === 'ios' ? 4 : 2,
  },
  voiceButton: {
    paddingLeft: Spacing.sm,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(0,0,0,0.1)',
  },
});