import { Stack } from 'expo-router';

export default function ModalsLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
      }}
    >
      <Stack.Screen name="transaction" options={{ title: 'Transaction' }} />
      <Stack.Screen name="transaction-history" options={{ title: 'Transaction History' }} />
      <Stack.Screen name="insufficient-funds" options={{ title: 'Insufficient Funds' }} />
      <Stack.Screen name="summary" options={{ title: 'Summary' }} />
      <Stack.Screen name="flexicredit" options={{ title: 'FlexiCredit' }} />
    </Stack>
  );
}
