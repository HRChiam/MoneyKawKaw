import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export default function InsufficientFundsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const { toAccount, toBank, amount, reference, selectedSource } = params;

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
    router.navigate('../(tabs)/01-home');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollContent}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Transaction</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.alertContainer}>
        <View style={styles.alertIconWrapper}>
          <FontAwesome5 name="sad-tear" size={60} color="#ffffff" />
        </View>
        <Text style={[styles.alertTitle, { color: '#cb184e' }]}>Insufficient Funds</Text>
      </View>

      <View style={[styles.receiptCard, { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }]}>
        <View style={styles.receiptCol}>
          <Text style={[styles.receiptLabel, { color: colors.secondary }]}>Amount to Transfer</Text>
          <Text style={[styles.receiptValue, { color: colors.text, fontSize: 30 }]}>RM {amount}</Text>
        </View>
        <View style={[styles.receiptCol, { marginTop: 20 }]}>
          <Text style={[styles.receiptLabel, { color: colors.secondary }]}>{selectedSource} Pocket Balance</Text>
          <Text style={[styles.receiptValue, { color: '#cb184e', fontSize: 30 }]}>RM 20</Text>
        </View>
      </View>

      <View style={styles.alternativesSection}>
        <Text style={[styles.alternativesTitle, { color: colors.text }]}>
          Would you like to:
        </Text>

        <TouchableOpacity
          style={styles.sacrificeButtonWrapper}
          onPress={handleSacrificeOption}
        >
          <LinearGradient
            colors={['#771FFF', '#F8326D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <MaterialCommunityIcons name="star-four-points" size={24} color="white" style={{marginRight:10}} />
            <Text style={styles.sacrificeButtonText}>
              Move RM{Number(amount)-20} from Entertainment Pocket to {selectedSource} Pocket
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.cancelButton,
            { backgroundColor: 'rgba(168, 148, 148, 0.12)', borderColor: 'rgba(255,255,255,0.1)' },
          ]}
          onPress={handleCancel}
        >
          <Text style={[styles.cancelButtonText, { color: colors.text }]}>
            Cancel Transaction
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'sans-serif-rounded',
  },
  alertContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  alertIconWrapper: {
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'sans-serif-rounded',
    letterSpacing: -0.5,
  },
  receiptCard: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 32,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
   receiptCol: {
    flexDirection: 'column',
  },
  receiptLabel: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'sans-serif-rounded',
  },
  receiptValue: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'sans-serif-rounded',
  },
  alternativesSection: {
    paddingHorizontal: 20,
  },
  alternativesTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 20,
    fontFamily: 'sans-serif-rounded',
  },
  sacrificeButtonWrapper: {
    width: '100%',
    marginBottom: 12,
  },
  gradientButton: {
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    flexDirection: 'row',
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  sacrificeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'sans-serif-rounded',
    textAlign: 'left',
  },
  cancelButton: {
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'sans-serif-rounded',
  },
});
