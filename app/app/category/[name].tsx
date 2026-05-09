import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function CategoryScreen() {
  const router = useRouter();
  const { name } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const labelColor = '#A78BFA'; // Signature Lavender

  // Theme mapping for each pocket
  const pocketThemes: { [key: string]: { color: string; icon: string } } = {
    Saving: { color: '#A78BFA', icon: 'safe' },
    Food: { color: '#FB7185', icon: 'food-fork-drink' },
    Transport: { color: '#60A5FA', icon: 'car-side' },
    Utilities: { color: '#FBBF24', icon: 'lightning-bolt' },
  };

  const theme = pocketThemes[name as string] || { color: labelColor, icon: 'folder-outline' };

  // Mock transaction data
  const transactions = [
    {
      date: 'Today, 10 May',
      items: [
        { amount: -20.51, description: 'Village Grocer', time: '02:30 PM' },
        { amount: -15.0, description: 'Mamak Ali Restoran', time: '12:45 PM' },
      ],
    },
    {
      date: 'Yesterday, 09 May',
      items: [
        { amount: -3.00, description: 'Family Mart', time: '11:20 PM' },
        { amount: -4.50, description: 'Tealive', time: '04:15 PM' },
      ],
    },
  ];

  const getCategoryBalance = () => {
    const balances: { [key: string]: number } = {
      Saving: 50,
      Food: 800,
      Transport: 200,
      Utilities: 120,
    };
    return balances[name as string] || 0;
  };

  const balance = getCategoryBalance();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header - Standardized with arrow-left */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{name}</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Mature Balance Card */}
        <Animated.View 
          entering={FadeInDown.duration(600)}
          style={[styles.balanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.balanceLabel, { color: labelColor }]}>POCKET BALANCE</Text>
            <View style={[styles.iconBox, { backgroundColor: theme.color + '20' }]}>
              <MaterialCommunityIcons name={theme.icon as any} size={24} color={theme.color} />
            </View>
          </View>
          <Text style={[styles.balanceAmount, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>
            <Text style={{ fontSize: 24, fontWeight: '600', color: theme.color }}>RM </Text>
            {balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
        </Animated.View>

        {/* Transactions Section */}
        <View style={styles.transactionSection}>
          <Text style={[styles.sectionLabel, { color: labelColor }]}>RECENT TRANSACTIONS</Text>

          {transactions.map((dayGroup, dayIndex) => (
            <View key={dayIndex} style={styles.dayGroup}>
              <Text style={[styles.dateHeader, { color: colors.secondary }]}>{dayGroup.date}</Text>

              <View style={[styles.transactionBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {dayGroup.items.map((transaction, itemIndex) => (
                  <View
                    key={itemIndex}
                    style={[
                      styles.transactionItem,
                      itemIndex < dayGroup.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                    ]}
                  >
                    <View style={styles.itemLeft}>
                      <View style={[styles.miniIconBox, { backgroundColor: theme.color + '15' }]}>
                        <MaterialCommunityIcons name={theme.icon as any} size={18} color={theme.color} />
                      </View>
                      <View>
                        <Text style={[styles.description, { color: colors.text }]}>
                          {transaction.description}
                        </Text>
                        <Text style={[styles.timeText, { color: colors.secondary }]}>
                          {transaction.time}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.amountText, { color: colors.text }]}>
                      -RM {Math.abs(transaction.amount).toFixed(2)}
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
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  balanceCard: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 32,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  balanceLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1,
  },
  transactionSection: {},
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  dayGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 13,
    fontWeight: '700',
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
    padding: 16,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  miniIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
