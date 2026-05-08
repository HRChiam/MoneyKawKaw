import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function CategoryScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const transactions = [
    {
      date: '07 May 2026',
      items: [
        { amount: -20.51, description: 'Grocery Store' },
        { amount: -15.0, description: 'Restaurant' },
      ],
    },
    {
      date: '06 May 2026',
      items: [
        { amount: -3, description: 'Coffee' },
        { amount: -4, description: 'Snack' },
      ],
    },
  ];

  const getCategoryBalance = () => {
    const balances: { [key: string]: number } = {
      Saving: 50,
      Food: 800,
      Transport: 200,
    };
    return balances[name as string] || 0;
  };

  const balance = getCategoryBalance();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      scrollEventThrottle={16}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol size={24} name="chevron.left" color={colors.text} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>{name}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.balanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.balanceLabel, { color: colors.secondary }]}>Balance Remaining</Text>
        <Text style={[styles.balanceAmount, { color: colors.primary }]}>RM {balance}</Text>
      </View>

      <View style={styles.transactionSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Transactions</Text>

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
                <View>
                  <Text style={[styles.transactionDescription, { color: colors.text }]}>
                    {transaction.description}
                  </Text>
                </View>
                <Text style={[styles.transactionAmount, { color: colors.error }]}>
                  RM{Math.abs(transaction.amount).toFixed(2)}
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
  balanceCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
  },
  transactionSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
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
  transactionDescription: {
    fontSize: 16,
    fontWeight: '500',
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
});
