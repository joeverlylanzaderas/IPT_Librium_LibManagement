// app/_layout.jsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { useAuthStore } from '../src/store/authStore';
import LoadingOverlay from '../src/components/LoadingOverlay';

export default function RootLayout() {
  const { isLoading, restoreSession } = useAuthStore();

  // Load custom fonts
  const [fontsLoaded, fontsError] = useFonts({
    'AllrounderMonumentTest-Book': require('../assets/fonts/AllrounderMonumentTest-Book.ttf'),
    'AllrounderMonumentTest-Medium': require('../assets/fonts/AllrounderMonumentTest-Medium.ttf'),
    'AllrounderMonumentTest-Regular': require('../assets/fonts/AllrounderMonumentTest-Regular.ttf'),
    'LibreBaskerville-Bold': require('../assets/fonts/LibreBaskerville-Bold.ttf'),
    'LibreBaskerville-BoldItalic': require('../assets/fonts/LibreBaskerville-BoldItalic.ttf'),
    'LibreBaskerville-Italic': require('../assets/fonts/LibreBaskerville-Italic.ttf'),
    'LibreBaskerville-Medium': require('../assets/fonts/LibreBaskerville-Medium.ttf'),
    'LibreBaskerville-MediumItalic': require('../assets/fonts/LibreBaskerville-MediumItalic.ttf'),
    'LibreBaskerville-Regular': require('../assets/fonts/LibreBaskerville-Regular.ttf'),
    'LibreBaskerville-SemiBold': require('../assets/fonts/LibreBaskerville-SemiBold.ttf'),
    'LibreBaskerville-SemiBoldItalic': require('../assets/fonts/LibreBaskerville-SemiBoldItalic.ttf'),
  });

  // Only restore session, no navigation here
  useEffect(() => {
    restoreSession();
  }, []);

  // Show loading while fonts are being loaded
  if (!fontsLoaded && !fontsError) {
    return <LoadingOverlay visible={true} message="Loading fonts..." />;
  }

  if (isLoading) {
    return <LoadingOverlay visible={true} message="Starting up..." />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
    </Stack>
  );
}