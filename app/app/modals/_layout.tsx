import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerShown: false,
      }}
    >
      <Stack.Screen name="transaction" options={{ title: 'Transaction' }} />
      <Stack.Screen name="transaction-history" options={{ title: 'Transaction History' }} />
      <Stack.Screen name="insufficient-funds" options={{ title: 'Insufficient Funds' }} />
      <Stack.Screen name="summary" options={{ title: 'Summary' }} />
      <Stack.Screen name="flexicredit" options={{ title: 'FlexiCredit' }} />
      <Stack.Screen name="analysis/[category]" options={{ title: 'Analysis' }} />
      <Stack.Screen name="savings-streak" options={{ title: 'Savings Streak' }} />
      <Stack.Screen name="limit-adjustment" options={{ title: 'Adjust Limits' }} />
    </Stack>
  );
}
