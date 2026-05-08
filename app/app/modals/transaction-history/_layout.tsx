import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const transactions = [
    {
      date: '07 May 2026',
      items: [
        { amount: -20.51, description: 'Food Purchase', category: 'Food' },
        { amount: -15.0, description: 'Transport', category: 'Transport' },
      ],
    },
    {
      date: '06 May 2026',
      items: [
        { amount: -3, description: 'Parking', category: 'Transport' },
        { amount: -4, description: 'Snack', category: 'Food' },
      ],
    },
    {
      date: '05 May 2026',
      items: [
        { amount: 4, description: 'Cashback Reward', category: 'Income' },
      ],
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      scrollEventThrottle={16}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol size={24} name="chevron.left" color={colors.text} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Transaction History</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.transactionSection}>
        {transactions.map((dayGroup, dayIndex) => (
          <View key={dayIndex} style={styles.dayGroup}>
            <Text style={[styles.dateHeader, { color: colors.secondary }]}>{dayGroup.date}</Text>

            {dayGroup.items.map((transaction, itemIndex) => (
              <View
                key={itemIndex}
                style={[
                  styles.transactionItem,
                  { borderBottomColor: colors.border },
                  itemIndex === dayGroup.items.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View style={styles.transactionLeft}>
                  <Text style={[styles.transactionDescription, { color: colors.text }]}>
                    {transaction.description}
                  </Text>
                  <Text style={[styles.transactionCategory, { color: colors.secondary }]}>
                    {transaction.category}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.transactionAmount,
                    {
                      color: transaction.amount < 0 ? colors.error : colors.success,
                    },
                  ]}
                >
                  {transaction.amount < 0 ? '-' : '+'}RM{Math.abs(transaction.amount).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>
        ))}
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
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  transactionSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  dayGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  transactionLeft: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionCategory: {
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 16,
  },
});
