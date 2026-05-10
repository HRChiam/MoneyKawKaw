import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function SavingsStreakScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const labelColor = '#771FFF';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Savings Streak</Text>
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.duration(600)} style={styles.placeholderContainer}>
          <View style={[styles.iconCircle, { backgroundColor: '#FBBF24' + '20' }]}>
            <Feather name="award" size={60} color="#FBBF24" />
          </View>
          <Text style={[styles.placeholderTitle, { color: colors.text }]}>Consistent Saver!</Text>
          <Text style={[styles.placeholderSub, { color: colors.secondary }]}>
            You&apos;ve maintained your savings streak for 5 days. Keep it up to unlock more GX Points and exclusive rewards!
          </Text>
          
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.label, { color: labelColor }]}>NEXT MILESTONE</Text>
            <Text style={[styles.milestoneText, { color: colors.text }]}>
              Reach 7 days to earn a <Text style={{ color: '#FBBF24', fontWeight: '800' }}>Golden Multiplier</Text> on your next deposit.
            </Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800' },
  content: { flex: 1, paddingHorizontal: 20, justifyContent: 'center' },
  placeholderContainer: { alignItems: 'center' },
  iconCircle: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
  placeholderTitle: { fontSize: 28, fontWeight: '800', marginBottom: 12 },
  placeholderSub: { fontSize: 16, textAlign: 'center', lineHeight: 24, marginBottom: 40 },
  card: { width: '100%', padding: 24, borderRadius: 24, borderWidth: 1 },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 12 },
  milestoneText: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
});
