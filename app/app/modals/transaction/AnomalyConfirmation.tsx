import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFinancial } from '@/context/FinancialContext';
import { TransactionSuccess } from './TransactionSuccess';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';
const MOCK_USER_ID = 'de458832-a0c0-45a6-a9b3-471db31a2f7e';

function firstParam(value: string | string[] | undefined, fallback = ''): string {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }
  return value ?? fallback;
}

export default function AnomalyConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { refreshAllData } = useFinancial();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const amount = firstParam(params.amount);
  const toAccount = firstParam(params.toAccount);
  const toBank = firstParam(params.toBank, 'GXBank');
  const reference = firstParam(params.reference);
  const merchantName = firstParam(params.merchantName);
  const selectedSource = firstParam(params.selectedSource);
  const pocketId = firstParam(params.pocketId);
  const userId = firstParam(params.userId, MOCK_USER_ID);
  const message = firstParam(
    params.message,
    'This transaction was flagged for anomaly review.'
  );
  const availableBalance = firstParam(params.availableBalance, '0');

  const primaryBrand = '#771FFF';
  const handleProceed = async () => {
    if (!amount || !selectedSource || !pocketId) {
      alert('Missing transaction details');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          pocket_id: pocketId,
          amount: parseFloat(amount),
          transaction_type: 'EXPENSE',
          counterparty_name: merchantName || toBank,
          reference,
          confirm_anomaly: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 400 && String(errorData.detail || '').toLowerCase().includes('insufficient funds')) {
          router.push({
            pathname: '../insufficient-funds',
            params: {
              toAccount,
              toBank,
              amount,
              reference,
              selectedSource,
              availableBalance,
            },
          });
          return;
        }
        throw new Error(errorData.detail || 'Failed to save transaction');
      }

      await refreshAllData();
      setShowSuccess(true);
    } catch (error: any) {
      console.error('Confirmed transaction failed:', error);
      alert(`Transaction failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (showSuccess) {
    return (
      <TransactionSuccess
        amount={amount}
        toAccount={toAccount}
        toBank={toBank}
        selectedSource={selectedSource || null}
        onDone={() => router.back()}
        colors={colors}
        primaryBrand={primaryBrand}
      />
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View entering={FadeInDown.duration(450)} style={styles.headerRow}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Confirm Transaction</Text>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeInUp.delay(80).duration(500)} style={styles.headerContainer}>
          <Text style={[styles.subTitle, { color: colors.secondary }]}>WE PAUSED THIS PAYMENT 😔</Text>
          <Text style={[styles.idk, { color: '#d9796d' }]}>Attempted charge of RM{parseFloat(amount || '0').toFixed(2)} at {merchantName || toBank}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{message}</Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(160).duration(500)} style={[styles.summaryCard, { borderColor: 'rgba(255,255,255,0.08)' }]}>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.secondary }]}>Amount</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>RM {parseFloat(amount || '0').toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.secondary }]}>Recipient</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{merchantName || toBank}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.secondary }]}>Source</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>{selectedSource} Pocket</Text>
          </View>
          {reference ? (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.secondary }]}>Reference</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{reference}</Text>
            </View>
          ) : null}
        </Animated.View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleProceed}
          disabled={isSubmitting}
          style={[styles.primaryButton, { backgroundColor: primaryBrand, opacity: isSubmitting ? 0.75 : 1 }]}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Proceed Anyway</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCancel} style={[styles.secondaryButton, { borderColor: 'rgba(255,255,255,0.12)' }]}>
          <Text style={[styles.secondaryButtonText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
    fontFamily: 'sans-serif-rounded',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 140,
  },
  headerContainer: {
    paddingVertical: 12,
    marginBottom: 24,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontFamily: 'sans-serif-rounded',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    lineHeight: 40,
    fontWeight: '900',
    letterSpacing: -1,
    fontFamily: 'sans-serif-rounded',
  },
  idk: {
    fontSize: 20,
    lineHeight: 40,
    fontWeight: '900',
    letterSpacing: -1,
    fontFamily: 'sans-serif-rounded',
  },
  summaryCard: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'sans-serif-rounded',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '900',
    fontFamily: 'sans-serif-rounded',
    textAlign: 'right',
    flex: 1,
    paddingLeft: 16,
  },
  footer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    gap: 12,
  },
  primaryButton: {
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.24,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '900',
    fontFamily: 'sans-serif-rounded',
  },
  secondaryButton: {
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'sans-serif-rounded',
  },
});
