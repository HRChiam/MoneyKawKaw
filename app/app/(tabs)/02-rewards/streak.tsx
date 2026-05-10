import React from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRewards } from '@/components/rewards/context';

const { width } = Dimensions.get('window');

export default function StreakScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { streak, freezeStreaks } = useRewards();

  // Mock data for the current month's streak calendar
  const daysInMonth = 31;
  const currentDay = 12; // FIXED: May 12th as today
  
  // Dynamic streak days: tally with the streak number ending today
  const streakDays = Array.from({ length: streak }, (_, i) => currentDay - i).filter(d => d > 0);
  const frozenDays: number[] = []; 

  const renderCalendar = () => {
    const cells = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const isStreak = streakDays.includes(i);
      const isFrozen = frozenDays.includes(i);
      const isToday = i === currentDay;
      
      cells.push(
        <View key={i} style={styles.calendarCell}>
          <View 
            style={[
              styles.dayCircle, 
              { 
                backgroundColor: isFrozen ? '#38BDF820' : isStreak ? colors.success + '20' : 'transparent',
                borderColor: isToday ? colors.primary : isStreak ? colors.success : colors.border,
                borderWidth: isToday ? 2 : 1,
              }
            ]}
          >
            {isFrozen ? (
              <Ionicons name="snow" size={16} color="#38BDF8" />
            ) : isStreak ? (
              <Ionicons name="checkmark" size={16} color={colors.success} />
            ) : (
              <Text style={[styles.dayText, { color: colors.secondary }]}>{i}</Text>
            )}
          </View>
          {isToday && <Text style={[styles.todayLabel, { color: colors.primary }]}>Today</Text>}
        </View>
      );
    }
    return cells;
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      {/* Header aligned with Transaction History */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>My Streak</Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        
        {/* Streak Hero Card */}
        <LinearGradient
          colors={[colors.primary, colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.streakHero}
        >
          <View style={styles.heroContent}>
            <View style={styles.streakCountBox}>
              <Text style={styles.streakNumber}>{streak}</Text>
              <Text style={styles.streakLabel}>Day Streak</Text>
            </View>
            <View style={styles.streakIconContainer}>
              <MaterialCommunityIcons name="fire" size={80} color="#FFD700" />
            </View>
          </View>
          <View style={styles.streakProgressContainer}>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${(streak % 7) / 7 * 100}%` }]} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <Text style={styles.progressText}>{7 - (streak % 7)} days until next reward!</Text>
              <Text style={[styles.progressText, { color: '#FFD700' }]}>+100 Points</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Milestone Rewards Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Milestone Rewards</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.milestoneScroll}>
          {[
            { days: 7, points: 100, bonus: 'Freeze' },
            { days: 14, points: 250, bonus: 'Freeze' },
            { days: 21, points: 500, bonus: 'Freeze' },
            { days: 30, points: 1200, bonus: 'Master Badge' },
          ].map((m, idx) => (
            <View 
              key={idx} 
              style={[
                styles.milestoneCard, 
                { 
                  backgroundColor: streak >= m.days ? colors.primary + '20' : colors.card,
                  borderColor: streak >= m.days ? colors.primary : colors.border
                }
              ]}
            >
              <View style={[styles.milestoneIcon, { backgroundColor: streak >= m.days ? colors.primary : colors.secondary + '20' }]}>
                <Ionicons name={streak >= m.days ? "checkmark" : "gift"} size={20} color={streak >= m.days ? "#FFF" : colors.secondary} />
              </View>
              <Text style={[styles.milestoneDays, { color: colors.text }]}>{m.days} Days</Text>
              <Text style={[styles.milestonePoints, { color: colors.primary }]}>+{m.points} Pts</Text>
              {m.bonus && <Text style={[styles.milestoneBonus, { color: colors.secondary }]}>+ {m.bonus}</Text>}
            </View>
          ))}
        </ScrollView>

        {/* Info Section */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 20 }]}>
          <View style={styles.infoRow}>
            <View style={[styles.infoIconBox, { backgroundColor: '#38BDF820' }]}>
              <Ionicons name="snow" size={24} color="#38BDF8" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>{freezeStreaks} Freeze Streaks Available</Text>
              <Text style={[styles.infoSub, { color: colors.secondary }]}>Use a freeze to keep your streak alive when you miss a day.</Text>
            </View>
          </View>
        </View>

        {/* Calendar Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>May 2026</Text>
          <View style={styles.renewBadge}>
            <Text style={styles.renewText}>Renews Monthly</Text>
          </View>
        </View>

        <View style={styles.calendarGrid}>
          {renderCalendar()}
        </View>

        {/* Rules Section */}
        <View style={styles.rulesContainer}>
          <Text style={[styles.rulesTitle, { color: colors.text }]}>How it works</Text>
          
          <View style={styles.ruleItem}>
            <View style={[styles.ruleIcon, { backgroundColor: colors.success + '20' }]}>
              <Ionicons name="flash" size={18} color={colors.success} />
            </View>
            <Text style={[styles.ruleText, { color: colors.secondary }]}>
              Stay under your <Text style={{ fontWeight: '700', color: colors.text }}>Daily Limit</Text> to keep your streak going.
            </Text>
          </View>

          <View style={styles.ruleItem}>
            <View style={[styles.ruleIcon, { backgroundColor: '#38BDF820' }]}>
              <Ionicons name="gift" size={18} color="#38BDF8" />
            </View>
            <Text style={[styles.ruleText, { color: colors.secondary }]}>
              Earn <Text style={{ fontWeight: '700', color: colors.text }}>1 Freeze Streak</Text> for every 7-day milestone you reach.
            </Text>
          </View>

          <View style={styles.ruleItem}>
            <View style={[styles.ruleIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="refresh" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.ruleText, { color: colors.secondary }]}>
              Streaks and achievements <Text style={{ fontWeight: '700', color: colors.text }}>renew every month</Text> for fresh rewards.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { 
    flex: 1, 
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
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
  content: { 
    paddingHorizontal: 20
  },
  streakHero: {
    borderRadius: 28,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  streakCountBox: {
    flex: 1,
  },
  streakNumber: {
    fontSize: 56,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 60,
  },
  streakLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  streakIconContainer: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakProgressContainer: {
    width: '100%',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  infoCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  infoSub: {
    fontSize: 12,
    lineHeight: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  renewBadge: {
    backgroundColor: '#6366F120',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  renewText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6366F1',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 10,
    marginBottom: 32,
  },
  calendarCell: {
    width: (width - 40 - 60) / 7, 
    alignItems: 'center',
    marginBottom: 8,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  todayLabel: {
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  rulesContainer: {
    marginBottom: 20,
  },
  rulesTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingRight: 20,
  },
  ruleIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  ruleText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
  milestoneScroll: {
    paddingRight: 20,
    gap: 12,
    marginBottom: 24,
  },
  milestoneCard: {
    width: 120,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  milestoneDays: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  milestonePoints: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 2,
  },
  milestoneBonus: {
    fontSize: 10,
    fontWeight: '700',
  },
});
