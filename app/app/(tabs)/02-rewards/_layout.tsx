import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  Animated, 
  PanResponder, 
  Dimensions,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import GxSpaceRoom from './GxSpaceRoom';

// Forcing the dark purple theme to match the screenshot
const colors = {
  text: '#FFFFFF',
  background: '#1C0D33', 
  primary: '#9333EA', 
  primaryEnd: '#C084FC',
  secondary: '#A78BFA', 
  success: '#10B981', 
  card: '#130822', 
  border: '#3B1A60', 
};

const WINDOW_HEIGHT = Dimensions.get('window').height;
const TOP_POSITION = 100; 
const MIDDLE_POSITION = WINDOW_HEIGHT * 0.5; 
const BOTTOM_POSITION = WINDOW_HEIGHT * 0.85; 

export default function RewardsScreen() {
  const [points, setPoints] = useState(1357);
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  
  // --- NEW STATE: Challenge Modal ---
  const [showChallengesModal, setShowChallengesModal] = useState(false);
  
  const panY = useRef(new Animated.Value(MIDDLE_POSITION)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: (evt, gestureState) => {
        return Math.abs(gestureState.dy) > 10;
      },
      onPanResponderGrant: () => {
        panY.extractOffset(); 
      },
      onPanResponderMove: Animated.event(
        [null, { dy: panY }],
        { useNativeDriver: false } 
      ),
      onPanResponderRelease: (e, gestureState) => {
        panY.flattenOffset();
        
        let destination = MIDDLE_POSITION;
        if (gestureState.vy < -0.5 || gestureState.dy < -100) {
          destination = TOP_POSITION; 
        } else if (gestureState.vy > 0.5 || gestureState.dy > 100) {
          destination = BOTTOM_POSITION; 
        }

        Animated.spring(panY, {
          toValue: destination,
          useNativeDriver: false,
          bounciness: 0,
        }).start();
      },
    })
  ).current;

  // The Badge Data Structure
  const streaks = [
    { 
      id: 1, 
      title: 'Savior Streak', 
      description: '7 days under daily limit',
      iconName: 'shield-checkmark', 
      status: 'active',
      badgeColor: colors.success
    },
    { 
      id: 2, 
      title: 'Reviewer Streak', 
      description: '0 days checking AI insights',
      iconName: 'eye', 
      status: 'inactive',
      badgeColor: colors.secondary
    },
  ];

  // --- NEW DATA: Challenges List ---
  const challenges = [
    { id: 1, title: 'No-Spend Day', desc: 'Spend RM 0 on discretionary items for 24 hours.', reward: 50, icon: 'wallet' },
    { id: 2, title: 'Coffee Fast', desc: 'Skip buying outside coffee for 3 consecutive days.', reward: 100, icon: 'cafe' },
    { id: 3, title: 'Cook at Home', desc: 'Keep your Food Pocket expenses under RM 20 today.', reward: 80, icon: 'restaurant' },
    { id: 4, title: 'Savings Sprint', desc: 'Manually transfer RM 50 to your Savings Pocket.', reward: 150, icon: 'trending-up' },
  ];

  return (
    <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
      
      {/* LAYER 1: THE GX SPACE (BACKGROUND) */}
      <View style={styles.gxSpaceContainer}>
        <View style={styles.header}>
          <View style={[styles.currencyPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons size={16} name="star" color={colors.primaryEnd} />
            <Text style={[styles.currencyText, { color: colors.text }]}>{points.toLocaleString()}</Text>
          </View>
          <View style={[styles.currencyPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons size={16} name="snow" color={colors.primaryEnd} />
            <Text style={[styles.currencyText, { color: colors.text }]}>3</Text>
          </View>
        </View>

        <View style={styles.gxSpacePlaceholder}>
          <GxSpaceRoom points={points} setPoints={setPoints} />
        </View>
      </View>

      {/* LAYER 2: THE REWARDS PANEL (FOREGROUND) */}
      <Animated.View 
        style={[
          styles.slidingPanel, 
          { 
            backgroundColor: colors.background,
            borderColor: colors.border,
            transform: [{ translateY: panY }] 
          }
        ]}
      >
        <View {...panResponder.panHandlers} style={styles.dragHandleArea}>
          <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />
        </View>

        <ScrollView style={styles.panelContent} showsVerticalScrollIndicator={false}>
          <View style={styles.streakSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Badges</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
              {streaks.map(streak => (
                <View
                  key={streak.id}
                  style={[
                    styles.largeStreakCard,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                >
                  <View style={styles.badgeDisplayArea}>
                    <View style={[
                      styles.badgeGlow, 
                      { backgroundColor: streak.status === 'active' ? streak.badgeColor + '30' : 'transparent' }
                    ]}>
                      <Ionicons 
                        name={streak.iconName as any} 
                        size={48} 
                        color={streak.status === 'active' ? streak.badgeColor : colors.secondary} 
                      />
                    </View>
                    
                    {streak.status === 'inactive' && (
                      <View style={[styles.inProgressTag, { backgroundColor: colors.border }]}>
                        <Text style={[styles.inProgressText, { color: colors.secondary }]}>In progress</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.streakTextArea}>
                    <Text style={[styles.streakTitle, { color: colors.text }]}>
                      {streak.title}
                    </Text>
                    <Text style={[styles.streakDescription, { color: colors.secondary }]}>
                      {streak.description}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.actionSection}>
            <TouchableOpacity
              onPress={() => setShowRewardsModal(true)}
              style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Ionicons size={24} name="gift-outline" color={colors.primaryEnd} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.actionButtonTitle}>Redeem Points</Text>
                <Text style={[styles.actionButtonSub, { color: colors.secondary }]}>Explore deals and vouchers</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowChallengesModal(true)} // <-- Open Challenges Modal
              style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <Ionicons size={24} name="flash-outline" color={colors.primaryEnd} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.actionButtonTitle}>Take a Challenge</Text>
                <Text style={[styles.actionButtonSub, { color: colors.secondary }]}>Earn massive point boosts</Text>
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={{ height: 100 }} /> 
        </ScrollView>
      </Animated.View>

      {/* LAYER 3A: THE REWARDS MODAL */}
      <Modal
        visible={showRewardsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRewardsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Available Rewards</Text>
              <TouchableOpacity onPress={() => setShowRewardsModal(false)}>
                <Text style={{ color: colors.primaryEnd, fontWeight: '600', fontSize: 16 }}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Reward Item 1: KFC */}
              <View style={[styles.rewardItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.rewardContent}>
                  <View style={[styles.iconContainer, { backgroundColor: '#FFFFFF' }]}> 
                    <Image 
                      source={require('@/assets/images/kfc_logo.png')} 
                      style={styles.rewardLogo} 
                      resizeMode="contain"
                    />
                  </View>
                  <View>
                    <Text style={[styles.rewardName, { color: colors.text }]}>KFC RM 20 Voucher</Text>
                    <Text style={[styles.rewardCost, { color: colors.secondary }]}>200 points</Text>
                  </View>
                </View>
                <TouchableOpacity style={[styles.redeemButton, { backgroundColor: 'transparent', borderColor: colors.primaryEnd, borderWidth: 1 }]}>
                  <Text style={[styles.redeemText, { color: colors.primaryEnd }]}>Redeem</Text>
                </TouchableOpacity>
              </View>

              {/* Reward Item 2: ZUS Coffee */}
              <View style={[styles.rewardItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.rewardContent}>
                  <View style={[styles.iconContainer, { backgroundColor: '#FFFFFF' }]}>
                    <Image 
                      source={require('@/assets/images/zus_logo.png')} 
                      style={styles.rewardLogo} 
                      resizeMode="contain"
                    />
                  </View>
                  <View>
                    <Text style={[styles.rewardName, { color: colors.text }]}>ZUS RM 10 Voucher</Text>
                    <Text style={[styles.rewardCost, { color: colors.secondary }]}>100 points</Text>
                  </View>
                </View>
                <TouchableOpacity style={[styles.redeemButton, { backgroundColor: 'transparent', borderColor: colors.primaryEnd, borderWidth: 1 }]}>
                  <Text style={[styles.redeemText, { color: colors.primaryEnd }]}>Redeem</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* LAYER 3B: THE CHALLENGES MODAL */}
      <Modal
        visible={showChallengesModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowChallengesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Active Challenges</Text>
              <TouchableOpacity onPress={() => setShowChallengesModal(false)}>
                <Text style={{ color: colors.primaryEnd, fontWeight: '600', fontSize: 16 }}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {challenges.map(challenge => (
                <View key={challenge.id} style={[styles.rewardItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.rewardContent}>
                    <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
                      <Ionicons name={challenge.icon as any} size={24} color={colors.primaryEnd} />
                    </View>
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text style={[styles.rewardName, { color: colors.text }]}>{challenge.title}</Text>
                      <Text style={[styles.challengeDesc, { color: colors.secondary }]} numberOfLines={2}>{challenge.desc}</Text>
                    </View>
                  </View>
                  
                  {/* Points Badge */}
                  <View style={[styles.pointsBadge, { backgroundColor: colors.primary + '30' }]}>
                    <Text style={[styles.pointsBadgeText, { color: colors.primaryEnd }]}>+{challenge.reward}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  gxSpaceContainer: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: 60, 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 24,
    zIndex: 10,
    paddingHorizontal: 16,
  },
  gxSpacePlaceholder: {
    flex: 1,
    paddingBottom: 150, 
  },
  currencyPill: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20, 
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
  },
  currencyText: {
    fontSize: 14,
    fontWeight: '700', 
  },
  slidingPanel: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: WINDOW_HEIGHT,
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32,
    borderTopWidth: 1, 
  },
  dragHandleArea: {
    width: '100%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragHandle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    opacity: 0.8,
  },
  panelContent: {
    paddingHorizontal: 16,
  },
  streakSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  largeStreakCard: {
    width: 160, 
    height: 200, 
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    justifyContent: 'space-between',
  },
  badgeDisplayArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeGlow: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inProgressTag: {
    position: 'absolute',
    bottom: -5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    transform: [{ rotate: '-5deg' }], 
  },
  inProgressText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  streakTextArea: {
    marginTop: 12,
    alignItems: 'center',
  },
  streakTitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
  },
  streakDescription: {
    fontSize: 11,
    textAlign: 'center',
  },
  actionSection: {
    flexDirection: 'column', 
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  actionButtonTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  actionButtonSub: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '60%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    borderTopWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rewardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  rewardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  rewardCost: {
    fontSize: 13,
    fontWeight: '500',
  },
  redeemButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20, 
  },
  redeemText: {
    fontSize: 13,
    fontWeight: '700',
  },
  rewardLogo: {
    width: 32,
    height: 32,
  },
  challengeDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  pointsBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  pointsBadgeText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
});