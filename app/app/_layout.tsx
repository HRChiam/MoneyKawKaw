import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { 
  Inter_400Regular, 
  Inter_600SemiBold, 
  Inter_700Bold, 
  Inter_900Black 
} from '@expo-google-fonts/inter';
import { 
  Poppins_400Regular, 
  Poppins_600SemiBold, 
  Poppins_700Bold, 
  Poppins_900Black 
} from '@expo-google-fonts/poppins';
import { 
  Feather, 
  MaterialCommunityIcons, 
  Ionicons, 
  AntDesign, 
  MaterialIcons 
} from '@expo/vector-icons';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { FinancialProvider } from '@/context/FinancialContext';
import { RewardsProvider } from '@/components/rewards/context';
import TaxEligibilityModalWatcher from '@/components/TaxEligibilityModalWatcher';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [loaded, error] = useFonts({
    ...Feather.font,
    ...MaterialCommunityIcons.font,
    ...Ionicons.font,
    ...AntDesign.font,
    ...MaterialIcons.font,
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black,
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_900Black,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
    <RewardsProvider>
    <FinancialProvider>
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
            animation: 'fade',
          }} 
        />
        
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Modals Group */}
        <Stack.Screen 
          name="modals" 
          options={{ 
            headerShown: false,
          }} 
        />
        
        {/* Category Group */}
        <Stack.Screen 
          name="category" 
          options={{ 
            headerShown: false,
          }} 
        />
      </Stack>
      <TaxEligibilityModalWatcher />
      <StatusBar style="auto" />
    </ThemeProvider>
    </FinancialProvider>
    </RewardsProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
});
