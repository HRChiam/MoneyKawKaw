import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, Dimensions } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export type MissionStatus = 'new' | 'in_progress' | 'completed';

export interface Challenge {
  id: number;
  title: string;
  desc: string;
  reward: number;
  icon: string;
  status: MissionStatus;
  progress: number;
  category: 'Daily' | 'Special';
}

export default function ChallengesModal({ visible, onClose, challenges }: { visible: boolean; onClose: () => void; challenges: Challenge[] }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [activeTab, setActiveTab] = useState<'Daily' | 'Special'>('Daily');

  if (!visible) return null;

  const filteredChallenges = challenges.filter(c => c.category === activeTab);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.dragHandle} />
          
          <View style={styles.modalHeader}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>Missions</Text>
              <Text style={[styles.subtitle, { color: colors.secondary }]}>Complete tasks to earn bonus points</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.secondary} />
            </TouchableOpacity>
          </View>

          {/* TAB BAR */}
          <View style={[styles.tabBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TouchableOpacity 
              onPress={() => setActiveTab('Daily')}
              style={[styles.tab, activeTab === 'Daily' && { backgroundColor: colors.background }]}
            >
              <Text style={[styles.tabText, { color: activeTab === 'Daily' ? colors.primary : colors.secondary }]}>Daily</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => setActiveTab('Special')}
              style={[styles.tab, activeTab === 'Special' && { backgroundColor: colors.background }]}
            >
              <Text style={[styles.tabText, { color: activeTab === 'Special' ? colors.primary : colors.secondary }]}>Special</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {filteredChallenges.map(challenge => (
              <View key={challenge.id} style={styles.cardContainer}>
                {challenge.status === 'completed' && (
                  <LinearGradient
                    colors={[colors.primary + '20', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <TouchableOpacity 
                  activeOpacity={0.9}
                  style={[
                    styles.challengeCard, 
                    { backgroundColor: colors.card, borderColor: challenge.status === 'completed' ? colors.primary : colors.border }
                  ]}
                >
                  <View style={styles.challengeHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.primary + '15' }]}>
                      <Ionicons name={challenge.icon as any} size={24} color={colors.primary} />
                    </View>
                    <View style={[
                      styles.pointsBadge, 
                      { backgroundColor: challenge.status === 'completed' ? colors.primary : colors.accent }
                    ]}>
                      {challenge.status === 'completed' && <Ionicons name="star" size={14} color="#FFFFFF" style={{ marginRight: 4 }} />}
                      <Text style={[styles.pointsText, { color: '#FFFFFF' }]}>
                        +{challenge.reward} Pts
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.challengeInfo}>
                    <Text style={[styles.challengeTitle, { color: colors.text }]}>{challenge.title}</Text>
                    <Text style={[styles.challengeDesc, { color: '#FFFFFF', opacity: 0.8 }]}>{challenge.desc}</Text>
                  </View>

                  <View style={[styles.progressBarContainer, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                    <View style={[
                      styles.progressBar, 
                      { backgroundColor: challenge.status === 'completed' ? colors.primary : colors.accent, width: `${challenge.progress}%` }
                    ]} />
                  </View>
                  
                  <View style={styles.challengeFooter}>
                    <Text style={[styles.progressText, { color: '#FFFFFF' }]}>{challenge.progress}% Complete</Text>
                    
                    {challenge.status === 'completed' ? (
                      <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primary }]}>
                        <Text style={styles.actionBtnTextPrimary}>Claim Reward</Text>
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity style={styles.startBtn}>
                        <Text style={[styles.startBtnText, { color: '#FFFFFF' }]}>
                          {challenge.status === 'in_progress' ? 'Continue' : 'Start Mission'}
                        </Text>
                        <Feather name="arrow-right" size={14} color="#FFFFFF" />
                      </TouchableOpacity>
                    )}
                  </View>
                </TouchableOpacity>
              </View>
            ))}
            {filteredChallenges.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="sparkles-outline" size={48} color={colors.border} />
                <Text style={[styles.emptyText, { color: colors.secondary }]}>All {activeTab} missions completed!</Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.85)', 
    justifyContent: 'flex-end' 
  },
  modalContent: { 
    height: '85%', 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32, 
    padding: 24, 
    borderTopWidth: 1,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start', 
    marginBottom: 24 
  },
  title: { 
    fontSize: 24, 
    fontWeight: '800', 
    letterSpacing: -0.5 
  },
  subtitle: { 
    fontSize: 14, 
    marginTop: 4 
  },
  closeBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tabBar: {
    flexDirection: 'row',
    padding: 6,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  cardContainer: {
    marginBottom: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  challengeCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointsBadge: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '800',
  },
  challengeInfo: {
    marginBottom: 20,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  challengeDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  challengeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  startBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  actionBtn: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
  },
  actionBtnTextPrimary: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
  },
});
