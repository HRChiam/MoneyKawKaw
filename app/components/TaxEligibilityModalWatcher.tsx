import { useEffect, useRef, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MOCK_USER_ID } from '@/context/FinancialContext';

type EligibleTransaction = {
  transaction_id: string;
  counterparty_name?: string;
  amount?: number;
  tax_category?: string | null;
  tax_relief_detected?: boolean;
};

type TransactionsResponse = {
  transactions?: EligibleTransaction[];
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';
const POLLING_MS = 8000;

export default function TaxEligibilityModalWatcher() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [queue, setQueue] = useState<EligibleTransaction[]>([]);
  const seenIdsRef = useRef<Set<string>>(new Set());
  const initializedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const pollTaxEligibleTransactions = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/user/${MOCK_USER_ID}/transactions?limit=20`
        );

        if (!response.ok) {
          return;
        }

        const data: TransactionsResponse = await response.json();
        const transactions = Array.isArray(data.transactions) ? data.transactions : [];

        const eligibleTransactions = transactions.filter((tx) =>
          Boolean(tx.tax_relief_detected)
        );

        // Baseline existing eligible rows on first poll so users only see fresh background detections.
        if (!initializedRef.current) {
          eligibleTransactions.forEach((tx) => {
            if (tx.transaction_id) {
              seenIdsRef.current.add(String(tx.transaction_id));
            }
          });
          initializedRef.current = true;
          return;
        }

        const newlyEligible = eligibleTransactions.filter((tx) => {
          const id = String(tx.transaction_id);
          return id && !seenIdsRef.current.has(id);
        });

        if (!newlyEligible.length || !isMounted) {
          return;
        }

        newlyEligible.forEach((tx) => {
          seenIdsRef.current.add(String(tx.transaction_id));
        });

        setQueue((prev) => [...prev, ...newlyEligible]);
      } catch {
        // Silent fail: background polling should not disrupt user flow.
      }
    };

    pollTaxEligibleTransactions();
    const interval = setInterval(pollTaxEligibleTransactions, POLLING_MS);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const activeItem = queue[0];

  const handleViewNotifications = () => {
    setQueue((prev) => prev.slice(1));
    router.push('/(tabs)/03-notifications' as any);
  };

  if (!activeItem) {
    return null;
  }

  const merchant = activeItem.counterparty_name || 'a recent transaction';
  const amount = typeof activeItem.amount === 'number' ? `RM ${activeItem.amount.toFixed(2)}` : null;
  const category = activeItem.tax_category && activeItem.tax_category !== 'N/A'
    ? activeItem.tax_category
    : 'Tax relief category';

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.overlay}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.background,
              borderColor: '#771FFF55',
            },
          ]}
        >
          <View style={styles.iconWrap}>
            <MaterialCommunityIcons
              name="file-document-check-outline"
              size={34}
              color="#771FFF"
            />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>Tax Exemption Opportunity</Text>
          <Text style={[styles.message, { color: colors.secondary }]}> 
            {amount ? `${amount} at ${merchant} may be eligible under ${category}.` : `A transaction at ${merchant} may be eligible under ${category}.`}
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleViewNotifications}
            activeOpacity={0.9}
          >
            <Text style={styles.primaryButtonText}>View In Notifications</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
  },
  iconWrap: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#771FFF20',
    marginBottom: 14,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 18,
  },
  primaryButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#771FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
    letterSpacing: 0.2,
  },
});
