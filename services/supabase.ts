import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Supabase configuration (from .env.local)
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://vifafrkwcmsyjrfjfxbn.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpZmFmcmt3Y21zeWpyZmpmeGJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5MzQ4OTgsImV4cCI6MjA3NTUxMDg5OH0.oyG5FJf87E0rQNH_mMC5um46FdIku6ohlrSSLEkelns';

// Create a custom storage adapter for web
const createWebStorage = () => {
  return {
    getItem: (key: string) => {
      if (typeof window === 'undefined') return null;
      return window.localStorage.getItem(key);
    },
    setItem: (key: string, value: string) => {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(key, value);
    },
    removeItem: (key: string) => {
      if (typeof window === 'undefined') return;
      window.localStorage.removeItem(key);
    },
  };
};

// Use web storage for web platform, AsyncStorage for native
const storage = Platform.OS === 'web' ? createWebStorage() : AsyncStorage;

// Create Supabase client with platform-specific storage for session persistence
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: storage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Realtime channel types
export type RealtimeOrderUpdate = {
  id: number;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  subtotal: string;
  deliveryCharge: string;
  totalAmount: string;
  deliverySlot: string;
  specialInstructions: string;
  updatedAt: string;
};

// Helper function to subscribe to order updates
export const subscribeToOrder = (
  orderId: number,
  callback: (payload: any) => void
) => {
  const channel = supabase
    .channel(`order-${orderId}`)
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'online_orders',
        filter: `id=eq.${orderId}`,
      },
      callback
    )
    .subscribe();

  return channel;
};

// Helper function to unsubscribe from order updates
export const unsubscribeFromOrder = async (channel: any) => {
  await supabase.removeChannel(channel);
};

export default supabase;
