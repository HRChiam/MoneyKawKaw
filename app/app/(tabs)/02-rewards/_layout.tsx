import { Stack } from 'expo-router';
import { RewardsProvider } from '@/components/rewards/context';

export default function RewardsLayout() {
  return (
    <RewardsProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="space" />
      </Stack>
    </RewardsProvider>
  );
}
