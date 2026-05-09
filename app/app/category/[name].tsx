import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather, Ionicons } from '@expo/vector-icons';

export default function CategoryScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Mock transaction data
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

  // Get balance based on category name
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{name}</Text>
        <View style={{ width: 40 }} /> {/* Spacer to perfectly center the title */}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} scrollEventThrottle={16}>
        {/* Balance Indicator (Styled like the Main Account Cards) */}
        <View style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
          <View style={styles.cardTopRow}>
            <Text style={styles.balanceLabel}>Pocket Balance</Text>
            <Ionicons name="folder-open-outline" size={24} color="rgba(255,255,255,0.8)" />
          </View>
          <Text style={styles.balanceAmount} numberOfLines={1} adjustsFontSizeToFit>
            <Text style={styles.currencyPrefix}>RM </Text>
            {balance.toFixed(2)}
          </Text>
        </View>

        {/* Transactions */}
        <View style={styles.transactionSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>

          {transactions.map((dayGroup, dayIndex) => (
            <View key={dayIndex} style={styles.dayGroup}>
              <Text style={[styles.dateHeader, { color: colors.secondary }]}>{dayGroup.date}</Text>

              <View style={[styles.transactionBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
                      <View style={[styles.transactionIcon, { backgroundColor: colors.background }]}>
                        <Feather name="shopping-bag" size={18} color={colors.primary} />
                      </View>
                      <Text style={[styles.transactionDescription, { color: colors.text }]}>
                        {transaction.description}
                      </Text>
                    </View>
                    <Text style={[styles.transactionAmount, { color: colors.text }]}>
                      - RM {Math.abs(transaction.amount).toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  balanceCard: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 32,
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 16,
    fontWeight: '600',
  },
  currencyPrefix: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 20,
    fontWeight: '600',
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -1,
  },
  transactionSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  dayGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  transactionBlock: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionDescription: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
});