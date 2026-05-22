import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

function firstParam(value: string | string[] | undefined, fallback = ''): string {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }
  return value ?? fallback;
}

export default function InsufficientFundsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const toAccount = firstParam(params.toAccount);
  const toBank = firstParam(params.toBank);
  const amount = firstParam(params.amount);
  const reference = firstParam(params.reference);
  const selectedSource = firstParam(params.selectedSource);
  const availableBalance = Number(firstParam(params.availableBalance));
  const requestedAmount = Number(amount || '0');
  const shortfall = Math.max(0, requestedAmount - availableBalance);

  const handleSacrificeOption = () => {
    router.replace({
      pathname: './transaction',
      params: {
        toAccount,
        toBank,
        amount,
        reference,
        selectedSource,
        isConfirmed: 'true',
      },
    });
  };

  const handleCancel = () => {
    router.replace('../(tabs)/01-home');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Transaction</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.delay(100)} style={styles.statusArea}>
          <Image source={require('@/assets/images/orz.png')} style={{ objectFit: 'scale-down', height: 120, marginBottom: 20 }} />
          <Text style={[styles.alertTitle, { color: colors.text }]}>Oops! Not enough funds</Text>
          <Text style={[styles.alertSubtitle, { color: colors.secondary }]}>
            Your {selectedSource} Pocket is a bit short for this transfer.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300)} style={[styles.bridgeCard, { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }]}>
          <View style={styles.bridgeRow}>
            <View style={styles.bridgeLabelGroup}>
              <View style={[styles.dot, { backgroundColor: colors.secondary }]} />
              <Text style={[styles.bridgeLabel, { color: colors.secondary }]}>Total Required</Text>
            </View>
            <View style={styles.valueContainer}>
              <Text style={[styles.bridgeValue, { color: colors.text }]}>RM {requestedAmount.toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.bridgeRow}>
            <View style={styles.bridgeLabelGroup}>
              <View style={[styles.dot, { backgroundColor: '#15fabd' }]} />
              <Text style={[styles.bridgeLabel, { color: colors.secondary }]}>Available Balance</Text>
            </View>
            <View style={styles.valueContainer}>
              <Text style={[styles.bridgeValue, { color: '#15fabd' }]}>RM {availableBalance.toFixed(2)}</Text>
            </View>
          </View>

          <View style={[styles.separator, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />

          <View style={styles.bridgeRow}>
            <View style={styles.bridgeLabelGroup}>
              <Text style={[styles.shortfallLabel, { color: colors.text }]}>Shortfall</Text>
            </View>
            <View style={styles.valueContainer}>
              <View style={styles.shortfallBadge}>
                <Text style={styles.shortfallValue}>RM {shortfall.toFixed(2)}</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        <View style={styles.alternativesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Here&apos;s a solution:</Text>

          <TouchableOpacity style={styles.actionButton} onPress={handleSacrificeOption}>
            <View style={[styles.solidButton, { backgroundColor: colors.primary }]}>
              <View style={styles.buttonIcon}>
                <MaterialCommunityIcons name="lightning-bolt" size={24} color="white" />
              </View>
              <View style={styles.buttonTextContent}>
                <Text style={styles.buttonSubText}>AI Suggestion</Text>
                <Text style={styles.buttonMainText}>
                  Move RM {shortfall.toFixed(2)} from Savings to {selectedSource}.
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: 'rgba(255,255,255,0.1)' }]}
            onPress={handleCancel}
          >
            <Text style={[styles.cancelButtonText, { color: 'white' }]}>Cancel Transaction</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 12,
    paddingVertical: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'sans-serif-rounded',
  },
  statusArea: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 32,
  },
  alertTitle: {
    fontSize: 24,
    fontWeight: '900',
    fontFamily: 'sans-serif-rounded',
    marginBottom: 8,
    textAlign: 'center',
  },
  alertSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  bridgeCard: {
    padding: 24,
    borderRadius: 28,
    borderWidth: 1.5,
    marginBottom: 32,
  },
  bridgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bridgeLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  bridgeLabel: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'sans-serif-rounded',
  },
  valueContainer: {
    minWidth: 120,
    alignItems: 'flex-start',
  },
  bridgeValue: {
    fontSize: 22,
    fontWeight: '800',
    fontFamily: 'sans-serif-rounded',
  },
  separator: {
    height: 1,
    marginVertical: 16,
  },
  shortfallLabel: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'sans-serif-rounded',
  },
  shortfallBadge: {
    backgroundColor: '#cb184e20',
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  shortfallValue: {
    color: '#ff8ea1',
    fontSize: 15,
    fontWeight: '800',
  },
  alternativesSection: {
    gap: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'sans-serif-rounded',
  },
  actionButton: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  solidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 24,
  },
  buttonIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  buttonTextContent: {
    flex: 1,
  },
  buttonSubText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  buttonMainText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
  },
  cancelButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 22,
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
});