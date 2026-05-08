import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        {/* Onboarding Screen - Initial Screen */}
        <Stack.Screen 
          name="onboarding" 
          options={{ 
            headerShown: false,
            presentation: 'fullScreenModal',
          }} 
        />
        
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Modals Group */}
        <Stack.Screen 
          name="modals/transaction" 
          options={{ 
            title: 'Transaction',
            presentation: 'modal',
          }} 
        />
        
        <Stack.Screen 
          name="modals/category/[name]" 
          options={{ 
            title: 'Category',
            presentation: 'modal',
          }} 
        />
        
        <Stack.Screen 
          name="modals/transaction-history" 
          options={{ 
            title: 'Transaction History',
            presentation: 'modal',
          }} 
        />
        
        <Stack.Screen 
          name="modals/insufficient-funds" 
          options={{ 
            title: 'Insufficient Funds',
            presentation: 'modal',
          }} 
        />
        
        <Stack.Screen 
          name="modals/summary" 
          options={{ 
            title: 'Summary',
            presentation: 'modal',
          }} 
        />
        
        <Stack.Screen 
          name="modals/flexicredit" 
          options={{ 
            title: 'FlexiCredit',
            presentation: 'modal',
          }} 
        />
        
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
