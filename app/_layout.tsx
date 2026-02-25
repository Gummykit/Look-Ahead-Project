import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { ActivityIndicator, View } from 'react-native';

export const unstable_settings = {
  anchor: 'login',  // Changed: Login is the default/root screen
};

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isLoggedIn, isLoading } = useAuth();

  console.log('🟣 [Layout] RootLayoutNav rendered - isLoggedIn:', isLoggedIn, 'isLoading:', isLoading);

  // Show loading screen while auth state is being checked (treat undefined as loading)
  if (isLoading !== false) {
    console.log('🟣 [Layout] Still loading, showing spinner');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  console.log('🟣 [Layout] Auth state ready - isLoggedIn:', isLoggedIn);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack 
        screenOptions={{ headerShown: false }}
        // Key the stack to force re-render when auth state changes
        key={isLoggedIn ? 'authenticated' : 'unauthenticated'}
        // Set initial route based on auth state
        initialRouteName={isLoggedIn ? 'index' : 'login'}
      >
        {/* Always define all screens - expo-router requires static registration */}
        <Stack.Screen 
          name="login" 
          options={{ 
            headerShown: false,
          }} 
        />
        <Stack.Screen 
          name="index" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="create-project" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="editor" 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="(tabs)" 
          options={{ headerShown: false }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
