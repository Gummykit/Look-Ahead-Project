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

  // Show loading screen while auth state is being checked
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#0066CC" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          // Show app screens when logged in
          <>
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
          </>
        ) : (
          // Show login screen when not logged in (this is now the home screen)
          <Stack.Screen 
            name="login" 
            options={{ headerShown: false }} 
          />
        )}
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
