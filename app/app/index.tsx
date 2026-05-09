// app/index.tsx
import { Text, View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text>Welcome to the App!</Text>
      <Pressable onPress={() => router.push('../onboarding')}>
        <Text style={{ color: 'blue' }}>Go to Onboarding</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});