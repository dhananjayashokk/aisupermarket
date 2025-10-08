import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { Loading } from '@/components/Loading';

export default function IndexScreen() {
  const { state } = useAuth();

  // Show loading while checking authentication status
  if (state.isLoading) {
    return <Loading />;
  }

  // Redirect based on authentication status
  if (state.isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/auth/login" />;
  }
}