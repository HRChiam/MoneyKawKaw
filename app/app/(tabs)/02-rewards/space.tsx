import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import GxSpaceRoom from '@/components/rewards/GxSpaceRoom';
import HeaderPills from '@/components/rewards/HeaderPills';
import { useRewards } from '@/components/rewards/context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';

export default function SpaceScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { points, setPoints } = useRewards();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Dynamic Background Glow */}
      <View style={styles.glowContainer}>
        <LinearGradient
          colors={[colors.primary + '30', 'transparent']}
          style={styles.glow}
        />
      </View>

      {/* Header Container */}
      <View style={styles.headerContainer}>
        {/* Main Row: Back Button & Title */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Feather name="chevron-left" size={32} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>MoneyKawKaw Space</Text>
        </View>

        {/* Second Row: Balances below Back Button */}
        <View style={styles.balanceRow}>
          <HeaderPills points={points} freezeCount={3} />
        </View>
      </View>

      {/* Room Wrapper - Must have flex: 1 to ensure children fill space */}
      <View style={styles.roomWrapper}>
        <GxSpaceRoom points={points} setPoints={setPoints} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    paddingTop: 20,
  },
  glowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    zIndex: -1,
  },
  glow: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 16, // Increased space
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900', 
    letterSpacing: -0.5,
    fontFamily: 'sans-serif-rounded',
  },
  balanceRow: {
    flexDirection: 'row',
  },
  roomWrapper: {
    flex: 1, // Restore flex: 1 to ensure store sheet is visible at bottom
    marginTop: -80, 
    zIndex: 5,
  },
});
