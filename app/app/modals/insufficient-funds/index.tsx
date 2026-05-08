import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function InsufficientFundsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleSacrificeOption = (option: string) => {
    // Handle sacrifice option logic
    alert(`Selected: ${option}`);
    router.back();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      scrollEventThrottle={16}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol size={24} name="chevron.left" color={colors.text} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Transaction</Text>
        </TouchableOpacity>
        <View style={styles.pointsContainer}>
          <Text style={[styles.points, { color: colors.primary }]}>1,357</Text>
        </View>
      </View>

      {/* Alert Container */}
      <View style={styles.alertSection}>
        <View
          style={[
            styles.alertBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.alertIconContainer}>
            <IconSymbol size={40} name="exclamationmark.triangle.fill" color={colors.error} />
          </View>
          <Text style={[styles.alertTitle, { color: colors.error }]}>Insufficient Funds</Text>
          <Text style={[styles.alertMessage, { color: colors.text }]}>
            Food pocket balance insufficient for this transaction
          </Text>
        </View>
      </View>

      {/* Actionable Alternatives */}
      <View style={styles.alternativesSection}>
        <Text style={[styles.alternativesTitle, { color: colors.text }]}>
          Would you like to:
        </Text>

        <TouchableOpacity
          style={[
            styles.alternativeButton,
            { backgroundColor: colors.primary, borderColor: colors.primaryEnd },
          ]}
          onPress={() => handleSacrificeOption('Sacrifice RM150 from Entertainment')}
        >
          <Text style={styles.alternativeButtonText}>
            Sacrifice RM150 from Entertainment
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.alternativeButton,
            { backgroundColor: colors.primary, borderColor: colors.primaryEnd },
          ]}
          onPress={() => handleSacrificeOption('Dip into Savings')}
        >
          <Text style={styles.alternativeButtonText}>
            Dip into Savings
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.cancelButton,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
          onPress={() => router.back()}
        >
          <Text style={[styles.cancelButtonText, { color: colors.text }]}>
            Cancel Transaction
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  pointsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(168, 85, 247, 0.1)',
  },
  points: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertSection: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  alertBox: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
  },
  alertIconContainer: {
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  alertMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  alternativesSection: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  alternativesTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  alternativeButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1,
  },
  alternativeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  cancelButton: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
