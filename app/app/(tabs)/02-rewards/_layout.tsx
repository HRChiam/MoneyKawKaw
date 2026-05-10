import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  PanResponder, 
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

// Make sure your imports match your new separated folder structure!
import GxSpaceRoom from './GxSpaceRoom'; // Assuming this imports the combined Logic+View
import HeaderPills from './HeaderPills';
import RewardsModal from './RewardsModal';
import ChallengesModal from './ChallengesModal';

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
  const [showChallengesModal, setShowChallengesModal] = useState(false);
  
  // The master animation value tracking the user's thumb
  const panY = useRef(new Animated.Value(MIDDLE_POSITION)).current;

  // --- NEW: GLOBAL ROOM INTERPOLATIONS ---
  // When panY is at BOTTOM (panel hidden) -> Room is normal size (1)
  // When panY is at MIDDLE (panel half) -> Room shrinks to 0.85
  // When panY is at TOP (panel full) -> Room shrinks to 0.7
  const globalRoomScale = panY.interpolate({
    inputRange: [TOP_POSITION, MIDDLE_POSITION, BOTTOM_POSITION],
    outputRange: [0.3, 0.7, 1],
    extrapolate: 'clamp',
  });

  // When panY goes up, the room is pushed higher up the screen (-150px)
  const globalRoomTranslateY = panY.interpolate({
    inputRange: [TOP_POSITION, MIDDLE_POSITION, BOTTOM_POSITION],
    outputRange: [-700, -400, 0],
    extrapolate: 'clamp',
  });

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

  const streaks = [
    { id: 1, title: 'Savior Streak', description: '7 days under daily limit', iconName: 'shield-checkmark', status: 'active', badgeColor: colors.success },
    { id: 2, title: 'Reviewer Streak', description: '0 days checking AI insights', iconName: 'eye', status: 'inactive', badgeColor: colors.secondary },
  ];

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
        {/* Assumes you created a HeaderPills component as referenced in your code */}
        <HeaderPills points={points} freezeCount={3} />
        
        {/* --- NEW: WRAPPED GX SPACE IN ANIMATED VIEW --- */}
        <Animated.View 
          style={[
            styles.gxSpacePlaceholder,
            { transform: [{ scale: globalRoomScale }, { translateY: globalRoomTranslateY }] }
          ]}
        >
          <GxSpaceRoom points={points} setPoints={setPoints} />
        </Animated.View>
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
                <View key={streak.id} style={[styles.largeStreakCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.badgeDisplayArea}>
                    <View style={[styles.badgeGlow, { backgroundColor: streak.status === 'active' ? streak.badgeColor + '30' : 'transparent' }]}>
                      <Ionicons name={streak.iconName as any} size={48} color={streak.status === 'active' ? streak.badgeColor : colors.secondary} />
                    </View>
                    {streak.status === 'inactive' && (
                      <View style={[styles.inProgressTag, { backgroundColor: colors.border }]}>
                        <Text style={[styles.inProgressText, { color: colors.secondary }]}>In progress</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.streakTextArea}>
                    <Text style={[styles.streakTitle, { color: colors.text }]}>{streak.title}</Text>
                    <Text style={[styles.streakDescription, { color: colors.secondary }]}>{streak.description}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          <View style={styles.actionSection}>
            <TouchableOpacity onPress={() => setShowRewardsModal(true)} style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons size={24} name="gift-outline" color={colors.primaryEnd} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.actionButtonTitle}>Redeem Points</Text>
                <Text style={[styles.actionButtonSub, { color: colors.secondary }]}>Explore deals and vouchers</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setShowChallengesModal(true)} style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
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

      {/* LAYER 3: MODALS */}
      <RewardsModal visible={showRewardsModal} onClose={() => setShowRewardsModal(false)} />
      <ChallengesModal visible={showChallengesModal} onClose={() => setShowChallengesModal(false)} challenges={challenges} />

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  gxSpaceContainer: { ...StyleSheet.absoluteFillObject, paddingTop: 60 },
  // Notice we removed flex:1 from the placeholder so it scales accurately from the center!
  gxSpacePlaceholder: { width: '100%', height: '100%', paddingBottom: 150 },
  slidingPanel: { position: 'absolute', left: 0, right: 0, top: 0, height: WINDOW_HEIGHT, borderTopLeftRadius: 32, borderTopRightRadius: 32, borderTopWidth: 1 },
  dragHandleArea: { width: '100%', height: 40, alignItems: 'center', justifyContent: 'center' },
  dragHandle: { width: 48, height: 4, borderRadius: 2, opacity: 0.8 },
  panelContent: { paddingHorizontal: 16 },
  streakSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  largeStreakCard: { width: 160, height: 200, borderRadius: 20, padding: 16, borderWidth: 1, justifyContent: 'space-between' },
  badgeDisplayArea: { flex: 1, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  badgeGlow: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center' },
  inProgressTag: { position: 'absolute', bottom: -5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, transform: [{ rotate: '-5deg' }] },
  inProgressText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  streakTextArea: { marginTop: 12, alignItems: 'center' },
  streakTitle: { fontSize: 14, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  streakDescription: { fontSize: 11, textAlign: 'center' },
  actionSection: { flexDirection: 'column', gap: 12, marginBottom: 24 },
  actionButton: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
  actionButtonTitle: { fontSize: 15, fontWeight: '700', color: '#ffffff', marginBottom: 4 },
  actionButtonSub: { fontSize: 12 },
});