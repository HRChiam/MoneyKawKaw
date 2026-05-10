import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

export default function InsufficientFundsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { toAccount, toBank, amount, reference, selectedSource } = params;
  const shortfall = Math.max(0, Number(amount) - 20);

  const handleSacrificeOption = () => {
    // Navigate back to transaction screen with success state
    router.replace({
      pathname: './transaction',
      params: { 
        toAccount, 
        toBank, 
        amount, 
        reference, 
        selectedSource,
        isConfirmed: 'true'
      }
    });
  };

  const handleCancel = () => {
    // Navigate back to home page
    router.replace('../(tabs)/01-home');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="chevron-left" size={28} color={colors.text} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Transaction</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Status Illustration Area */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.statusArea}>
          <Image source={require('@/assets/images/orz.png')} style={{ objectFit: 'scale-down', height: 120 , marginBottom: 20 }} />
          <Text style={[styles.alertTitle, { color: colors.text }]}>Oops! Not enough funds</Text>
          <Text style={[styles.alertSubtitle, { color: colors.secondary }]}>
            Your {selectedSource} Pocket is a bit short for this transfer.
          </Text>
        </Animated.View>

        {/* The "Bridge the Gap" Card */}
        <Animated.View entering={FadeInUp.delay(300)} style={[styles.bridgeCard, { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }]}>
          <View style={styles.bridgeRow}>
            <View style={styles.bridgeLabelGroup}>
              <View style={[styles.dot, { backgroundColor: colors.secondary }]} />
              <Text style={[styles.bridgeLabel, { color: colors.secondary }]}>Total Required</Text>
            </View>
            <Text style={[styles.bridgeValue, { color: colors.text }]}>RM {Number(amount).toFixed(2)}</Text>
          </View>

          <View style={styles.bridgeRow}>
            <View style={styles.bridgeLabelGroup}>
              <View style={[styles.dot, { backgroundColor: '#15fabd' }]} />
              <Text style={[styles.bridgeLabel, { color: colors.secondary }]}>Available Balance</Text>
            </View>
            <Text style={[styles.bridgeValue, { color: '#15fabd' }]}>RM 20.00</Text>
          </View>

          <View style={[styles.separator, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />

          <View style={styles.bridgeRow}>
            <Text style={[styles.shortfallLabel, { color: colors.text }]}>Shortfall</Text>
            <View style={styles.shortfallBadge}>
              <Text style={styles.shortfallValue}>RM {shortfall.toFixed(2)}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Action Section */}
        <View style={styles.alternativesSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Here's a solution:</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSacrificeOption}
          >
            <View style={[styles.solidButton, { backgroundColor: colors.primary }]}>
              <View style={styles.buttonIcon}>
                <MaterialCommunityIcons name="lightning-bolt" size={24} color="white" />
              </View>
              <View style={styles.buttonTextContent}>
                <Text style={styles.buttonSubText}>AI Suggestion</Text>
                <Text style={styles.buttonMainText}>
                  Move RM {shortfall.toFixed(2)} from Entertainment to {selectedSource}.
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: 'rgba(255,255,255,0.1)' }]}
            onPress={handleCancel}
          >
            <Text style={[styles.cancelButtonText, { color: 'white' }]}>
              Cancel Transaction
            </Text>
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
    // paddingVertical: 6,
    borderRadius: 12,
  },
  shortfallValue: {
    color: '#F8326D',
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'sans-serif-rounded',
  },
  alternativesSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 16,
    fontFamily: 'sans-serif-rounded',
  },
  actionButton: {
    marginBottom: 16,
  },
  solidButton: {
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  buttonTextContent: {
    flex: 1,
  },
  buttonMainText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'sans-serif-rounded',
    marginBottom: 4,
  },
  buttonSubText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  cancelButton: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:'rgba(255, 255, 255, 0.15)',
    borderRadius: 24
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'sans-serif-rounded',
  },
});
