import React, { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Image 
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons'; 
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import HeaderPills from '@/components/rewards/HeaderPills';
import RewardsModal from '@/components/rewards/RewardsModal';
import ChallengesModal, { Challenge } from '@/components/rewards/ChallengesModal';
import { useRewards } from '@/components/rewards/context';

export default function RewardsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { points, streak, freezeStreaks } = useRewards();
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showChallengesModal, setShowChallengesModal] = useState(false);

  const streaks = [
    { 
      id: 1, 
      title: 'Savior Streak', 
      description: `7 days under daily limit`,
      image: require('../../../assets/images/savior_streak_badge.png'), 
      status: 'active',
      badgeColor: colors.success,
      onPress: () => {} // Navigation removed from badge
    },
    { 
      id: 2, 
      title: 'Reviewer Streak', 
      description: '0 days checking AI insights',
      image: require('../../../assets/images/reviewer_streak_badge.png'), 
      status: 'inactive',
      badgeColor: colors.secondary,
      onPress: () => {}
    },
  ];

  const challenges: Challenge[] = [
    { id: 1, title: 'No-Spend Day', desc: 'Spend RM 0 on discretionary items for 24 hours.', reward: 50, icon: 'wallet', status: 'completed', progress: 100, category: 'Daily' },
    { id: 2, title: 'Coffee Fast', desc: 'Skip buying outside coffee for 3 consecutive days.', reward: 100, icon: 'cafe', status: 'in_progress', progress: 66, category: 'Daily' },
    { id: 3, title: 'Cook at Home', desc: 'Keep your Food Pocket expenses under RM 20 today.', reward: 80, icon: 'restaurant', status: 'new', progress: 0, category: 'Daily' },
    { id: 4, title: 'Savings Sprint', desc: 'Manually transfer RM 50 to your Savings Pocket.', reward: 150, icon: 'trending-up', status: 'new', progress: 0, category: 'Special' },
    { id: 5, title: 'Investment Intro', desc: 'Read 3 articles about safe investing in the AI tab.', reward: 250, icon: 'bulb', status: 'in_progress', progress: 33, category: 'Special' },
  ];

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      {/* Header - Updated */}
      <View style={styles.header}>
        <View style={{ width: '100%' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="gift" size={24} color={colors.text} style={{ marginRight: 12 }} />
            <Text style={{ fontSize: 20, fontWeight: '800', color: colors.text, fontFamily: 'sans-serif-rounded' }}>Reward</Text>
          </View>
          <HeaderPills points={points} freezeCount={freezeStreaks} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Saving Streak Card - Dedicated Box moved from Home */}
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/02-rewards/streak')}
          activeOpacity={0.8}
          style={[styles.streakCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={[styles.streakIconCircle, { backgroundColor: 'rgba(255, 215, 0, 0.15)' }]}>
            <Ionicons name="flame" size={24} color="#FFD700" />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={[styles.streakCardTitle, { color: colors.text }]}>Saving Streak</Text>
            <Text style={[styles.streakCardSub, { color: colors.secondary }]}>You&rsquo;ve stayed on track for {streak} days!</Text>
          </View>
          <View style={styles.streakCardCount}>
            <Text style={styles.streakCardCountText}>{streak}</Text>
            <Text style={styles.streakCardDaysText}>DAYS</Text>
          </View>
        </TouchableOpacity>

        {/* MoneyKawKaw Space Button - Restored Design */}
        <TouchableOpacity 
          onPress={() => router.push('/(tabs)/02-rewards/space')}
          activeOpacity={0.9}
          style={styles.spaceButtonContainer}
        >
          <LinearGradient
            colors={[colors.primary, colors.accent]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.spaceButton}
          >
            <View style={styles.spaceButtonContent}>
              <View style={styles.iconCircle}>
                <Ionicons name="planet-outline" size={32} color="#FFFFFF" />
              </View>
              <View style={{ marginLeft: 16, flex: 1 }}>
                <Text style={styles.spaceButtonTitle}>MoneyKawKaw Space</Text>
                <Text style={styles.spaceButtonSub}>Your digital sanctuary awaits</Text>
              </View>
              <View style={styles.arrowCircle}>
                <Feather name="chevron-right" size={24} color="#FFFFFF" />
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.badgeSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Badges</Text>
          <View style={styles.streakGrid}>
            {streaks.map(streakItem => (
              <View 
                key={streakItem.id} 
                style={[styles.largeStreakCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.badgeDisplayArea}>
                  <View style={[styles.badgeGlow, { backgroundColor: streakItem.status === 'active' ? streakItem.badgeColor + '30' : 'transparent' }]}>
                    <Image 
                      source={streakItem.image} 
                      style={[
                        styles.badgeImage, 
                        { opacity: streakItem.status === 'active' ? 1 : 0.4 } 
                      ]} 
                      resizeMode="contain" 
                    />
                  </View>
                  {streakItem.status === 'inactive' && (
                    <View style={[styles.inProgressTag, { backgroundColor: colors.border }]}>
                      <Text style={[styles.inProgressText, { color: colors.secondary }]}>In progress</Text>
                    </View>
                  )}
                </View>
                <View style={styles.streakTextArea}>
                  <Text style={[styles.badgeTitle, { color: colors.text }]}>{streakItem.title}</Text>
                  <Text style={[styles.badgeDescription, { color: colors.secondary }]}>{streakItem.description}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actionSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Rewards & Challenges</Text>
          
          <TouchableOpacity 
            onPress={() => setShowRewardsModal(true)} 
            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.actionIconBg, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons size={24} name="gift-outline" color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={[styles.actionButtonTitle, { color: colors.text }]}>Redeem Points</Text>
              <Text style={[styles.actionButtonSub, { color: colors.secondary }]}>Explore deals and vouchers</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.secondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setShowChallengesModal(true)} 
            style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.actionIconBg, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons size={24} name="flash-outline" color={colors.primary} />
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={[styles.actionButtonTitle, { color: colors.text }]}>Take a Challenge</Text>
              <Text style={[styles.actionButtonSub, { color: colors.secondary }]}>Earn massive point boosts</Text>
            </View>
            <Feather name="chevron-right" size={20} color={colors.secondary} />
          </TouchableOpacity>
        </View>
        
        <View style={{ height: 100 }} /> 
      </ScrollView>

      {/* MODALS */}
      <RewardsModal visible={showRewardsModal} onClose={() => setShowRewardsModal(false)} />
      <ChallengesModal visible={showChallengesModal} onClose={() => setShowChallengesModal(false)} challenges={challenges} />

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { 
    flex: 1, 
    paddingTop: 20 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 20, 
    marginBottom: 24
  },
  content: { 
    paddingHorizontal: 20
  },
  spaceButtonContainer: {
    marginBottom: 20,
    borderRadius: 24,
    width: '100%',
    alignSelf: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  spaceButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: 24, 
    borderRadius: 24, 
  },
  spaceButtonContent: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spaceButtonTitle: { 
    fontSize: 20, 
    fontWeight: '800', 
    color: '#FFFFFF' 
  },
  spaceButtonSub: { 
    fontSize: 14, 
    marginTop: 2,
    color: 'rgba(255, 255, 255, 0.8)' 
  },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  streakIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  streakCardSub: {
    fontSize: 12,
  },
  streakCardCount: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.1)',
  },
  streakCardCountText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFD700',
  },
  streakCardDaysText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFD700',
    marginTop: -4,
  },
  badgeSection: { 
    marginBottom: 32 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: '700', 
    marginBottom: 14 
  },
  streakGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  largeStreakCard: { 
    flex: 1,
    height: 200, 
    borderRadius: 24, 
    padding: 16, 
    borderWidth: 1, 
    justifyContent: 'space-between' 
  },
  badgeDisplayArea: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    position: 'relative' 
  },
  badgeGlow: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  badgeImage: { 
    width: 107, 
    height: 107 
  },
  inProgressTag: { 
    position: 'absolute', 
    bottom: -5, 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 8, 
    transform: [{ rotate: '-5deg' }] 
  },
  inProgressText: { 
    fontSize: 10, 
    fontWeight: '700', 
    textTransform: 'uppercase' 
  },
  streakTextArea: { 
    marginTop: 12, 
    alignItems: 'center' 
  },
  badgeTitle: { 
    fontSize: 14, 
    fontWeight: '700', 
    textAlign: 'center', 
    marginBottom: 4 
  },
  badgeDescription: { 
    fontSize: 11, 
    textAlign: 'center' 
  },
  actionSection: { 
    flexDirection: 'column', 
    gap: 12, 
    marginBottom: 24 
  },
  actionButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 18, 
    borderRadius: 20, 
    borderWidth: 1 
  },
  actionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonTitle: { 
    fontSize: 16, 
    fontWeight: '700', 
    marginBottom: 2 
  },
  actionButtonSub: { 
    fontSize: 13 
  },
});
