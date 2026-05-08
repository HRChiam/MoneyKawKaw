import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function RewardsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const streaks = [
    {
      id: 1,
      title: '7 days Savior Streak',
      icon: '🏆',
      status: 'active',
    },
    {
      id: 2,
      title: '0 days Reviewer Streak',
      icon: '📝',
      status: 'inactive',
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      scrollEventThrottle={16}
    >
      {/* Header with Currency Display */}
      <View style={styles.header}>
        <View
          style={[
            styles.currencyPill,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <IconSymbol size={20} name="star.fill" color={colors.primary} />
          <Text style={[styles.currencyText, { color: colors.primary }]}>1,357</Text>
        </View>

        <View
          style={[
            styles.currencyPill,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <IconSymbol size={20} name="snowflake" color={colors.primary} />
          <Text style={[styles.currencyText, { color: colors.primary }]}>3</Text>
        </View>
      </View>

      {/* Streak Cards */}
      <View style={styles.streakSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Streaks</Text>

        {streaks.map(streak => (
          <View
            key={streak.id}
            style={[
              styles.streakCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.streakContent}>
              <Text style={[styles.streakIcon, { opacity: streak.status === 'active' ? 1 : 0.5 }]}>
                {streak.icon}
              </Text>
              <Text
                style={[
                  styles.streakTitle,
                  {
                    color: colors.text,
                    opacity: streak.status === 'active' ? 1 : 0.6,
                  },
                ]}
              >
                {streak.title}
              </Text>
            </View>
            <View style={[styles.streakBadge, { backgroundColor: streak.status === 'active' ? colors.success : colors.error }]}>
              <Text style={styles.streakBadgeText}>{streak.status === 'active' ? '🔥' : '❌'}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.primary, borderColor: colors.primaryEnd },
          ]}
        >
          <IconSymbol size={24} name="gift.fill" color="#fff" />
          <Text style={styles.actionButtonText}>Redeem Points</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: colors.primary, borderColor: colors.primaryEnd },
          ]}
        >
          <IconSymbol size={24} name="bolt.fill" color="#fff" />
          <Text style={styles.actionButtonText}>Challenge</Text>
        </TouchableOpacity>
      </View>

      {/* Rewards List */}
      <View style={styles.rewardsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Available Rewards</Text>

        <View
          style={[
            styles.rewardItem,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.rewardContent}>
            <Text style={styles.rewardIcon}>🎁</Text>
            <View>
              <Text style={[styles.rewardName, { color: colors.text }]}>RM 50 Voucher</Text>
              <Text style={[styles.rewardCost, { color: colors.secondary }]}>500 points</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Text style={[styles.redeemText, { color: colors.primary }]}>Redeem</Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.rewardItem,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.rewardContent}>
            <Text style={styles.rewardIcon}>💳</Text>
            <View>
              <Text style={[styles.rewardName, { color: colors.text }]}>RM 100 Cashback</Text>
              <Text style={[styles.rewardCost, { color: colors.secondary }]}>1000 points</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Text style={[styles.redeemText, { color: colors.primary }]}>Redeem</Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.rewardItem,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.rewardContent}>
            <Text style={styles.rewardIcon}>⭐</Text>
            <View>
              <Text style={[styles.rewardName, { color: colors.text }]}>Premium Status</Text>
              <Text style={[styles.rewardCost, { color: colors.secondary }]}>2000 points</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Text style={[styles.redeemText, { color: colors.primary }]}>Redeem</Text>
          </TouchableOpacity>
        </View>
      </View>

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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginBottom: 24,
  },
  currencyPill: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
  },
  currencyText: {
    fontSize: 14,
    fontWeight: '600',
  },
  streakSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  streakIcon: {
    fontSize: 24,
  },
  streakTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  streakBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakBadgeText: {
    fontSize: 16,
  },
  actionSection: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  rewardsSection: {
    marginBottom: 24,
  },
  rewardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  rewardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rewardIcon: {
    fontSize: 24,
  },
  rewardName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  rewardCost: {
    fontSize: 12,
  },
  redeemText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
