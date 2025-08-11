import { useState, useCallback } from 'react';

/**
 * Custom hook for managing pull-to-refresh functionality
 * @param refreshCallback - Async function to execute when refreshing
 * @param minRefreshTime - Minimum time to show refresh indicator (default: 1000ms)
 * @returns Object containing refreshing state and onRefresh callback
 */
export function useRefresh(
  refreshCallback: () => Promise<void>,
  minRefreshTime: number = 1000
) {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    if (refreshing) return; // Prevent multiple simultaneous refreshes

    setRefreshing(true);
    
    try {
      // Start both the refresh callback and minimum time Promise
      await Promise.all([
        refreshCallback(),
        new Promise(resolve => setTimeout(resolve, minRefreshTime))
      ]);
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [refreshCallback, refreshing, minRefreshTime]);

  return {
    refreshing,
    onRefresh,
  };
}

/**
 * Simulates data loading delay for demo purposes
 * In a real app, this would be replaced with actual API calls
 */
export const simulateDataFetch = (delay: number = 800): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
};