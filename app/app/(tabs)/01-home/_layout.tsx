import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather, AntDesign, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  // This would ideally come from a global state/context later
  const pockets = [
    { id: 1, name: 'Saving', balance: 50 },
    { id: 2, name: 'Food', balance: 800 },
    { id: 3, name: 'Transport', balance: 200 },
  ];

  const mainAccountBalance = 0.00; // Hardcoded to 0 per instructions
  const pocketsTotal = pockets.reduce((s, p) => s + p.balance, 0);
  
  const spent = 180; // Current mock spent
  const limit = 200;
  const spendingProgress = spent / limit;

  // Traffic light logic with GX-inspired sophisticated shades
  const getTrafficColor = () => {
    if (spendingProgress < 0.5) return '#15fabd'; // GX Neon Turquoise (Safe)
    if (spendingProgress < 0.8) return '#FBBF24'; // Vibrant Amber (Warning)
    return '#F8326D'; // GX Radical Red (Danger)
  };

  const trafficColor = getTrafficColor();

  // Helper to mask all numbers including dots
  const formatBalance = (amount: string | number) => {
    return isBalanceVisible ? amount.toString() : '••••••';
  };

  // Helper to add commas to large numbers (e.g. 10000 -> 10,000.00)
  const formatCurrency = (amount: number) => {
    return amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleTransfer = () => router.push('../modals/transaction' as any);
  const handleExploreCredit = () => router.push('../modals/flexicredit' as any);
  const handleInsights = () => router.push('../modals/summary' as any);
  const handleTransactionHistory = () => router.push('../modals/transaction-history' as any);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greetingSub, { color: colors.secondary }]}>{getGreeting()},</Text>
          <Text style={[styles.greeting, { color: colors.text }]}>Xuan Wei</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            onPress={() => setIsBalanceVisible(!isBalanceVisible)}
            style={styles.visibilityBtn}
          >
            <Feather name={isBalanceVisible ? "eye" : "eye-off"} size={22} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.profileBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="user" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Daily Spending Widget - High Impact Dark Redesign */}
      <View style={[styles.spendingWidgetContainer, { shadowColor: trafficColor }]}>
        <LinearGradient
          colors={['rgba(0,0,0,0.85)', 'rgba(0,0,0,0.5)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.spendingWidget, { borderColor: trafficColor + '60' }]}
        >
          <View style={styles.spendingHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={[styles.statusPulse, { backgroundColor: trafficColor }]} />
              <Text style={[styles.spendingLabel, { color: trafficColor, fontWeight: '800' }]}>DAILY LIMIT</Text>
            </View>
            <View style={[styles.percentageBadge, { backgroundColor: trafficColor + '20' }]}>
              <Text style={[styles.percentageText, { color: trafficColor }]}>{Math.round(spendingProgress * 100)}%</Text>
            </View>
          </View>

          <View style={styles.amountDisplay}>
            <Text style={[styles.mainSpentAmount, { color: colors.text }]}>
              <Text style={styles.currencySymbol}>RM</Text> {formatBalance(spent)}
            </Text>
            <Text style={[styles.limitTotal, { color: colors.secondary }]}>
              of RM {formatBalance(limit)}
            </Text>
          </View>

          <View style={[styles.spendingBarContainer, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
            <LinearGradient
              colors={[trafficColor + '80', trafficColor]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.spendingProgress, { width: `${Math.min(spendingProgress * 100, 100)}%` }]}
            />
          </View>
          
          <Text style={[styles.statusMessage, { color: trafficColor }]}>
            {spendingProgress < 0.5 ? 'Looking good! You\'re well within your limit.' : 
             spendingProgress < 0.8 ? 'Careful! You\'re approaching your limit.' : 
             'Attention! You\'ve nearly exhausted your limit.'}
          </Text>
        </LinearGradient>
      </View>

      {/* Quick Action Icons */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleTransfer}>
          <View style={[styles.actionIconBg, { backgroundColor: colors.primary + '15' }]}>
            <Feather name="send" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.actionLabel, { color: colors.text }]}>Transfer</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleExploreCredit}>
          <View style={[styles.actionIconBg, { backgroundColor: colors.primary + '15' }]}>
            <AntDesign name="credit-card" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.actionLabel, { color: colors.text }]}>Credit</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={handleInsights}>
          <View style={[styles.actionIconBg, { backgroundColor: colors.primary + '15' }]}>
            <MaterialIcons name="insights" size={24} color={colors.primary} />
          </View>
          <Text style={[styles.actionLabel, { color: colors.text }]}>Insights</Text>
        </TouchableOpacity>
      </View>

      {/* Accounts Summary Cards (Side by Side) */}
      <View style={styles.accountsContainer}>
        {/* Main Account (Left) */}
        <TouchableOpacity
          style={[styles.mainAccountCard, { backgroundColor: colors.primary }]}
          activeOpacity={0.9}
        >
          <View style={styles.cardTopRow}>
            <Text style={styles.cardLabelWhite}>Main</Text>
            <Ionicons name="wallet-outline" size={20} color="rgba(255,255,255,0.8)" />
          </View>
          {/* Use numberOfLines={1} to force a single line, and adjustsFontSizeToFit to shrink if too long */}
          <Text style={styles.cardAmountWhite} numberOfLines={1} adjustsFontSizeToFit>
            <Text style={styles.currencyPrefixWhite}>RM </Text>
            {formatBalance(formatCurrency(mainAccountBalance))}
          </Text>
          <Text style={styles.cardSubTextWhite}>Available</Text>
        </TouchableOpacity>

        {/* Pockets Overview (Right) */}
        <TouchableOpacity
          style={[styles.pocketsOverviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.8}
          onPress={() => router.push('../modals/pockets' as any)}
        >
          <View style={styles.cardTopRow}>
            <Text style={[styles.cardLabel, { color: colors.secondary }]}>Pockets</Text>
            <Feather name="layers" size={20} color={colors.primary} />
          </View>
          {/* Prevent wrapping and allow shrinking */}
          <Text style={[styles.cardAmount, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>
            <Text style={styles.currencyPrefix}>RM </Text>
            {formatBalance(formatCurrency(pocketsTotal))}
          </Text>
          <View style={styles.viewPocketsBtn}>
            <Text style={[styles.viewPocketsText, { color: colors.primary }]}>Manage</Text>
            <Feather name="chevron-right" size={16} color={colors.primary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Transaction History Button */}
      <TouchableOpacity 
        style={[styles.historyButton, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={handleTransactionHistory}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Feather name="clock" size={20} color={colors.primary} />
          <Text style={[styles.historyButtonText, { color: colors.text }]}>Transaction History</Text>
        </View>
        <Feather name="chevron-right" size={20} color={colors.secondary} />
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  visibilityBtn: {
    padding: 8,
  },
  greetingSub: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  profileBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spendingWidgetContainer: {
    marginBottom: 24,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  spendingWidget: {
    borderRadius: 28,
    padding: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
  },
  spendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusPulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  spendingLabel: {
    fontSize: 14,
    letterSpacing: 1.2,
  },
  percentageBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '800',
  },
  amountDisplay: {
    marginTop: 8,
    marginBottom: 20,
  },
  mainSpentAmount: {
    fontSize: 42,
    fontWeight: '900',
    letterSpacing: -1,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
  },
  limitTotal: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: -4,
  },
  spendingBarContainer: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 16,
  },
  spendingProgress: {
    height: '100%',
    borderRadius: 6,
  },
  statusMessage: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  accountsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  mainAccountCard: {
    flex: 1, 
    borderRadius: 20,
    padding: 20, 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden', // Keeps scaling neat inside the border
  },
  pocketsOverviewCard: {
    flex: 1, 
    borderRadius: 20,
    padding: 20, 
    borderWidth: 1,
    justifyContent: 'space-between', 
    overflow: 'hidden',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardLabelWhite: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14, 
    fontWeight: '600',
  },
  currencyPrefixWhite: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '600',
  },
  cardAmountWhite: {
    color: '#fff',
    fontSize: 26, // Base size, will scale down if too long
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  cardSubTextWhite: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13, 
  },
  cardLabel: {
    fontSize: 14, 
    fontWeight: '600',
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardAmount: {
    fontSize: 26, // Base size, will scale down if too long
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  viewPocketsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewPocketsText: {
    fontSize: 14, 
    fontWeight: '700',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  historyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
