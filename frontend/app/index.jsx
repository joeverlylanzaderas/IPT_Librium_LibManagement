// app/index.jsx
import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';

export default function Index() {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (isLoading || hasRedirected) return;

    const redirect = async () => {
      if (!isAuthenticated) {
        await router.replace('/(auth)/login');
      } else {
        const role = user?.role;
        if (role === 'admin' || role === 'librarian') {
          await router.replace('/(admin)/');
        } else {
          await router.replace('/(member)/');
        }
      }
      setHasRedirected(true);
    };

    // Use a small delay to ensure everything is mounted
    const timer = setTimeout(redirect, 50);
    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, user]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 20 }}>Loading...</Text>
    </View>
  );
}