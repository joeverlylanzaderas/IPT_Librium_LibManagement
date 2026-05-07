// app/_layout.jsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import LoadingOverlay from '../src/components/LoadingOverlay';

export default function RootLayout() {
  const { isLoading, restoreSession } = useAuthStore();

  // Only restore session, no navigation here
  useEffect(() => {
    restoreSession();
  }, []);

  if (isLoading) {
    return <LoadingOverlay visible={true} message="Starting up..." />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
    </Stack>
  );
}