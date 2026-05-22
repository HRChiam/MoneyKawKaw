import { Stack } from 'expo-router';

export default function TransactionLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Transfer' }} />
      <Stack.Screen name="AnomalyConfirmation" options={{ title: 'Confirm Transaction' }} />
    </Stack>
  );
}
