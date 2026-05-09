import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Feather from '@expo/vector-icons/Feather';
import AntDesign from '@expo/vector-icons/AntDesign';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const pockets = [
    { id: 1, name: 'Saving', balance: 50 },
    { id: 2, name: 'Food', balance: 800 },
    { id: 3, name: 'Transport', balance: 200 },
  ];

  const handleTransfer = () => {
    router.push('/modals/transaction');
  };

  const handleExploreCredit = () => {
    router.push('/modals/flexicredit');
  };

  const handleInsights = () => {
    router.push('/modals/summary');
  };

  const handleTransactionHistory = () => {
    router.push('/modals/transaction-history');
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      scrollEventThrottle={16}
    >
      {/* Header with Greeting */}
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.text }]}>Hello xw</Text>
      </View>

      {/* Daily Spending Widget */}
      <View style={[styles.spendingWidget, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.spendingLabel, { color: colors.text }]}>Today's spent</Text>
        <Text style={[styles.spendingAmount, { color: colors.primary }]}>RM0/200</Text>
        <View style={[
          styles.spendingBar,
          { backgroundColor: colors.border }
        ]}>
          <View 
            style={[
              styles.spendingProgress,
              { 
                width: '0%',
                backgroundColor: colors.primaryEnd 
              }
            ]} 
          />
        </View>
      </View>

      {/* Quick Action Icons */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleTransfer}
        >
          <Feather name="send" size={32} color={colors.primary} />
          <Text style={[styles.actionLabel, { color: colors.text }]}>Transfer</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleExploreCredit}
        >
          <AntDesign name="credit-card" size={32} color={colors.primary} />
          <Text style={[styles.actionLabel, { color: colors.text }]}>Explore Credit</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={handleInsights}
        >
          <MaterialIcons name="insights" size={32} color={colors.primary} />
          <Text style={[styles.actionLabel, { color: colors.text }]}>Insights</Text>
        </TouchableOpacity>
      </View>

      {/* Pockets Section */}
      <View style={styles.pocketsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Pockets</Text>
        
        <View style={styles.pocketsGrid}>
          {pockets.map((pocket, index) => (
            <TouchableOpacity
              key={pocket.id}
              style={[
                styles.pocketCard,
                { 
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
                (index + 1) % 2 === 0 && { marginLeft: 8 },
              ]}
              onPress={() => router.push(`/category/${pocket.name}`)}
            >
              <Text style={[styles.pocketName, { color: colors.text }]}>{pocket.name}</Text>
              <Text style={[styles.pocketBalance, { color: colors.primary }]}>RM {pocket.balance}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Transaction History Button */}
      <TouchableOpacity 
        style={[styles.historyButton, { backgroundColor: colors.primary, borderColor: colors.primaryEnd }]}
        onPress={handleTransactionHistory}
      >
        <Text style={[styles.historyButtonText, { color: '#fff' }]}>Transaction History</Text>
      </TouchableOpacity>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
  },
  spendingWidget: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  spendingLabel: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
  },
  spendingAmount: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
  },
  spendingBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  spendingProgress: {
    height: '100%',
    borderRadius: 4,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
  },
  pocketsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  pocketsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pocketCard: {
    flex: 1,
    minWidth: (width - 40) / 2,
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  pocketName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  pocketBalance: {
    fontSize: 20,
    fontWeight: '700',
  },
  historyButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
  },
  historyButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
