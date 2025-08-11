import React from 'react';
import { StyleSheet, View, Animated } from 'react-native';
import { useAppColorScheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Layout, Spacing } from '@/constants/Layout';
import { useEffect, useRef } from 'react';

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({ width, height, borderRadius = 4, style }: SkeletonProps) {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme];
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: colors.border,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <View style={[styles.productCard, { width: '48%' }]}>
      <Skeleton width="100%" height={120} borderRadius={8} />
      <View style={styles.productInfo}>
        <Skeleton width="100%" height={16} style={{ marginBottom: 8 }} />
        <Skeleton width="60%" height={12} style={{ marginBottom: 8 }} />
        <View style={styles.priceRow}>
          <Skeleton width="40%" height={18} />
          <Skeleton width={32} height={32} borderRadius={16} />
        </View>
      </View>
    </View>
  );
}

export function StoreCardSkeleton() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.storeCard, { backgroundColor: colors.surface }]}>
      <Skeleton width={80} height={80} borderRadius={12} />
      <View style={styles.storeInfo}>
        <Skeleton width="60%" height={18} style={{ marginBottom: 4 }} />
        <Skeleton width="40%" height={14} style={{ marginBottom: 8 }} />
        <Skeleton width="80%" height={12} style={{ marginBottom: 4 }} />
        <Skeleton width="50%" height={12} />
      </View>
      <Skeleton width={60} height={24} borderRadius={12} />
    </View>
  );
}

export function OrderCardSkeleton() {
  const colorScheme = useAppColorScheme();
  const colors = Colors[colorScheme];

  return (
    <View style={[styles.orderCard, { backgroundColor: colors.surface }]}>
      <View style={styles.orderHeader}>
        <Skeleton width={60} height={60} borderRadius={8} />
        <View style={styles.orderInfo}>
          <Skeleton width="70%" height={18} style={{ marginBottom: 4 }} />
          <Skeleton width="50%" height={14} style={{ marginBottom: 8 }} />
          <Skeleton width="90%" height={12} />
        </View>
      </View>
      <View style={[styles.orderFooter, { borderTopColor: colors.divider }]}>
        <Skeleton width={60} height={20} borderRadius={10} />
        <View>
          <Skeleton width={60} height={18} style={{ marginBottom: 4 }} />
          <Skeleton width={50} height={14} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  productCard: {
    padding: Layout.productCard.padding,
    marginBottom: Spacing.md,
  },
  productInfo: {
    marginTop: Spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeCard: {
    flexDirection: 'row',
    padding: Layout.storeCard.padding,
    marginBottom: Spacing.md,
    borderRadius: Layout.storeCard.borderRadius,
    alignItems: 'flex-start',
    ...Layout.shadow.md,
  },
  storeInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  orderCard: {
    borderRadius: Layout.card.borderRadius,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Layout.shadow.md,
  },
  orderHeader: {
    flexDirection: 'row',
    padding: Layout.card.padding,
  },
  orderInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.card.padding,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
});