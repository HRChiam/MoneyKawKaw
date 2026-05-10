import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function NotificationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [aiActionState, setAiActionState] = useState<'pending' | 'confirmed'>('pending');

  const primaryBrand = '#771FFF'; // GX Violet

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
      {/* Header - Fixed */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Inbox</Text>
        <TouchableOpacity style={styles.markReadBtn}>
          <Text style={[styles.markReadText, { color: primaryBrand }]}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View entering={FadeInUp.duration(600)}>
          {notifications.map((n, index) => (
            <Animated.View 
              key={n.id} 
              entering={FadeInDown.delay(index * 100).duration(600)}
              style={[
                styles.notifCard, 
                { 
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  borderColor: n.isAI ? primaryBrand + '40' : 'rgba(255,255,255,0.08)' 
                }
              ]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrapper, { backgroundColor: n.color + '20' }]}>
                  {n.isAI ? (
                    <MaterialCommunityIcons name="robot-outline" size={24} color={n.color} />
                  ) : (
                    <MaterialCommunityIcons name={n.icon as any} size={24} color={n.color} />
                  )}
                </View>
                <View style={styles.headerMain}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.notifTitle, { color: colors.text }]}>{n.title}</Text>
                    {n.isAI && (
                      <LinearGradient
                        colors={[primaryBrand, '#F8326D']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.aiBadge}
                      >
                        <Text style={styles.aiBadgeText}>AI INSIGHT</Text>
                      </LinearGradient>
                    )}
                  </View>
                  <Text style={[styles.timeText, { color: colors.secondary }]}>{n.timestamp}</Text>
                </View>
              </View>

              <View style={styles.messageWrapper}>
                {n.isAI && aiActionState === 'confirmed' ? (
                  <Animated.View entering={FadeInUp} style={[styles.successState, { backgroundColor: '#15fabd20', borderColor: '#15fabd' }]}>
                    <Ionicons name="checkmark-circle" size={18} color="#15fabd" />
                    <Text style={[styles.message, { color: '#15fabd', marginLeft: 8, fontWeight: '700' }]}>
                      Updated! Your limits are now optimized.
                    </Text>
                  </Animated.View>
                ) : (
                  <Text style={[styles.message, { color: colors.text }]}>{n.message}</Text>
                )}
              </View>

              {n.isAI ? (
                aiActionState === 'pending' && (
                  <View style={styles.actionRow}>
                    <TouchableOpacity onPress={handleAiConfirm} style={styles.primaryActionWrapper}>
                      <LinearGradient
                        colors={[primaryBrand, '#F8326D']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.primaryAction}
                      >
                        <Text style={styles.actionText}>Look good!</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.secondaryAction, { borderColor: 'rgba(255,255,255,0.1)' }]}
                      onPress={handleManualAdjust}
                    >
                      <Text style={[styles.secondaryActionText, { color: colors.text }]}>Custom</Text>
                    </TouchableOpacity>
                  </View>
                )
              ) : (
                n.route && (
                  <TouchableOpacity 
                    style={styles.detailsBtn}
                    onPress={() => handleViewDetails(n.route)}
                  >
                    <Text style={[styles.detailsText, { color: n.color }]}>View Details</Text>
                    <Feather name="chevron-right" size={16} color={n.color} />
                  </TouchableOpacity>
                )
              )}
            </Animated.View>
          ))}
        </Animated.View>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'sans-serif-rounded',
    letterSpacing: -0.5,
  },
  markReadBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  markReadText: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'sans-serif-rounded',
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
  notifCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconWrapper: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerMain: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'sans-serif-rounded',
  },
  aiBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  aiBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
    fontFamily: 'sans-serif-rounded',
    letterSpacing: 0.5,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'sans-serif-rounded',
  },
  messageWrapper: {
    marginBottom: 20,
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '600',
    fontFamily: 'sans-serif-rounded',
  },
  successState: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryActionWrapper: {
    flex: 2,
  },
  primaryAction: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'sans-serif-rounded',
  },
  secondaryAction: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'sans-serif-rounded',
  },
  detailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailsText: {
    fontSize: 13,
    fontWeight: '800',
    fontFamily: 'sans-serif-rounded',
  },
});
