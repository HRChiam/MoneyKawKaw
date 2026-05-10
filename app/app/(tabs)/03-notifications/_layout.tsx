import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function NotificationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [aiActionState, setAiActionState] = useState<'pending' | 'confirmed'>('pending');

  const labelColor = '#771FFF'; // GX Violet

  const notifications = [
    {
      id: 1,
      type: 'ai_learning',
      title: 'Monthly Insight',
      message: "Last month you spent more on food and less on entertainment. I've auto-adjusted your new Monthly Limits to match your actual lifestyle. Look good?",
      timestamp: 'Just now',
      icon: 'brain',
      color: '#771FFF',
      isAI: true
    },
    {
      id: 2,
      type: 'spending',
      title: 'Daily Spending Alert',
      message: 'You have used 85% of your daily limit for Food. Consider a home-cooked meal tonight!',
      timestamp: '2 hours ago',
      icon: 'trending-up',
      color: '#FB7185',
      route: '../modals/analysis/Food'
    },
    {
      id: 3,
      type: 'reward',
      title: 'Savings Streak Unlocked',
      message: "You've hit your no-spend goal for 5 days straight! +50 GX Points added.",
      timestamp: 'Yesterday',
      icon: 'gift',
      color: '#FBBF24',
      route: '../modals/savings-streak'
    },
    {
      id: 4,
      type: 'security',
      title: 'Login Detected',
      message: 'A new login was detected on a Samsung S24 in Petaling Jaya.',
      timestamp: '2 days ago',
      icon: 'shield-check',
      color: '#34D399',
    },
  ];

  const handleAiConfirm = () => {
    setAiActionState('confirmed');
    // In a real app, this would trigger a backend update
  };

  const handleManualAdjust = () => {
    router.push('../modals/limit-adjustment' as any);
  };

  const handleViewDetails = (route?: string) => {
    if (route) {
      router.push(route as any);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
        <TouchableOpacity>
          <Text style={[styles.clearText, { color: labelColor }]}>Mark all as read</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {notifications.map((n, index) => (
          <Animated.View 
            key={n.id} 
            entering={FadeInDown.delay(index * 100).duration(500)}
            style={[
              styles.notificationCard, 
              { backgroundColor: colors.card, borderColor: colors.border },
              n.isAI && { borderColor: labelColor + '50', borderWidth: 1.5 }
            ]}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.iconBox, { backgroundColor: n.color + '15' }]}>
                {n.isAI ? (
                  <MaterialCommunityIcons name="robot" size={22} color={n.color} />
                ) : (
                  <MaterialCommunityIcons name={n.icon as any} size={22} color={n.color} />
                )}
              </View>
              <View style={styles.headerText}>
                <View style={styles.titleRow}>
                  <Text style={[styles.notifTitle, { color: colors.text }]}>{n.title}</Text>
                  {n.isAI && (
                    <View style={[styles.aiBadge, { backgroundColor: labelColor }]}>
                      <Text style={styles.aiBadgeText}>AI INSIGHT</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.timeText, { color: colors.secondary }]}>{n.timestamp}</Text>
              </View>
            </View>

            <View style={styles.messageContent}>
              {n.isAI && aiActionState === 'confirmed' ? (
                <Animated.View entering={FadeInDown} style={[styles.confirmedBox, { backgroundColor: colors.success + '10', borderColor: colors.success }]}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                  <Text style={[styles.message, { color: colors.success, marginLeft: 8, fontWeight: '700' }]}>
                    Perfect! I've updated your limits to match your lifestyle.
                  </Text>
                </Animated.View>
              ) : (
                <Text style={[styles.message, { color: colors.text }]}>{n.message}</Text>
              )}
            </View>

            {n.isAI ? (
              aiActionState === 'pending' && (
                <View style={styles.aiActions}>
                  <TouchableOpacity 
                    style={[styles.aiBtn, { backgroundColor: labelColor }]}
                    onPress={handleAiConfirm}
                  >
                    <Text style={styles.aiBtnText}>Look good!</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.aiBtnSecondary, { borderColor: colors.border }]}
                    onPress={handleManualAdjust}
                  >
                    <Text style={[styles.aiBtnSecondaryText, { color: colors.text }]}>Adjust manually</Text>
                  </TouchableOpacity>
                </View>
              )
            ) : (
              <TouchableOpacity 
                style={styles.viewMore}
                onPress={() => handleViewDetails(n.route)}
              >
                <Text style={[styles.viewMoreText, { color: n.color }]}>View details</Text>
                <Feather name="chevron-right" size={14} color={n.color} />
              </TouchableOpacity>
            )}
          </Animated.View>
        ))}
        
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
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  clearText: {
    fontSize: 13,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  notificationCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  aiBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  aiBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  messageContent: {
    marginBottom: 16,
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '500',
  },
  confirmedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  aiActions: {
    flexDirection: 'row',
    gap: 12,
  },
  aiBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  aiBtnSecondary: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBtnSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
  },
  viewMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewMoreText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
