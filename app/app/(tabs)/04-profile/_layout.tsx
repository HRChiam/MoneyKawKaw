import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather, MaterialCommunityIcons} from '@expo/vector-icons';
import Animated, { FadeInDown} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';

interface UserProfile {
  user_id: string;
  username: string;
  email?: string;
  savings_mode: string;
  monthly_income: number;
  payday: number;
  main_balance: number;
  current_streak: number;
  reward_points: number;
  created_at?: string;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TODO: Replace with actual user_id from auth context/storage
  const USER_ID = 'de458832-a0c0-45a6-a9b3-471db31a2f7e';

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/user/${USER_ID}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch user profile: ${response.statusText}`);
        }
        const data = await response.json();
        setUserProfile(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Failed to fetch user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const gxPurple = '#771fff'; // GX Violet
  const gxPink = '#f8326d';

  // Show loading state
  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={gxPurple} />
      </View>
    );
  }

  // Show error state
  if (error || !userProfile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Error loading profile</Text>
        <Text style={{ color: colors.secondary, marginTop: 12 }}>{error || 'User profile not found'}</Text>
      </View>
    );
  }

  // Format the username initials for avatar
  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const menuSections = [
    {
      title: 'ACCOUNT',
      items: [
        { id: 1, title: 'Personal Information', icon: 'user', type: 'feather', color: gxPurple },
        { id: 2, title: 'Payment Methods', icon: 'credit-card', type: 'feather', color: gxPurple },
        { id: 3, title: 'Transaction History', icon: 'file-text', type: 'feather', color: gxPurple, route: '../modals/transaction-history' },
      ]
    },
    {
      title: 'PREFERENCES',
      items: [
        { id: 4, title: 'Notifications', icon: 'bell', type: 'feather', color: gxPurple },
        { id: 5, title: 'Security & Privacy', icon: 'shield', type: 'feather', color: gxPurple },
        { id: 6, title: 'App Theme', icon: 'moon', type: 'feather', color: gxPurple },
      ]
    },
    {
      title: 'SUPPORT',
      items: [
        { id: 7, title: 'Help Center', icon: 'help-circle', type: 'feather', color: gxPurple },
        { id: 8, title: 'Terms of Service', icon: 'info', type: 'feather', color: gxPurple },
      ]
    }
  ];

  const handlePress = (route?: string) => {
    if (route) {
      router.push(route as any);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Header */}
      <View style={styles.headerRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Feather name="user" size={24} color={colors.text} style={{ marginRight: 12 }} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        </View>
        <TouchableOpacity style={[styles.settingsBtn, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="settings" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Animated.View entering={FadeInDown.duration(600)}>
          {/* User Hero Section with Gradient */}
          <LinearGradient
            colors={[gxPurple, gxPink]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroContent}>
              <View style={styles.avatarWrapper}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(userProfile.username)}</Text>
                </View>
                <TouchableOpacity style={styles.editAvatarBtn}>
                  <Feather name="camera" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.heroText}>
                <Text style={styles.userName}>{userProfile.username}</Text>
                <Text style={styles.userEmail}>{userProfile.email || 'No email'}</Text>
                <View style={styles.tierBadge}>
                  <MaterialCommunityIcons name="fire" size={12} color="#fff" />
                  <Text style={styles.tierText}>{userProfile.current_streak} day streak</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: '#ffffff' }]}>{userProfile.reward_points.toLocaleString()}</Text>
              <Text style={[styles.statLabel, { color: colors.secondary }]}>GX Points</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: '#ffffff' }]}>₱{userProfile.main_balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
              <Text style={[styles.statLabel, { color: colors.secondary }]}>Balance</Text>
            </View>
          </View>

          {/* Menu Sections */}
          {menuSections.map((section, sIdx) => (
            <View key={section.title} style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.secondary }]}>{section.title}</Text>
              <View style={[styles.menuList, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {section.items.map((item, iIdx) => (
                  <TouchableOpacity 
                    key={item.id}
                    style={[
                      styles.menuItem,
                      iIdx !== section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                    ]}
                    onPress={() => handlePress(item.route)}
                  >
                    <View style={styles.menuLeft}>
                      <View style={[styles.iconBox, { backgroundColor: item.color + '15' }]}>
                        <Feather name={item.icon as any} size={18} color={item.color} />
                      </View>
                      <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
                    </View>
                    <Feather name="chevron-right" size={16} color={colors.secondary} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          {/* Logout */}
          <TouchableOpacity style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={[styles.versionText, { color: colors.secondary }]}>Version 1.2.0 (42)</Text>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  settingsBtn: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 20 },
  heroCard: { borderRadius: 28, padding: 24, marginBottom: 24 },
  heroContent: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 72, height: 72, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  editAvatarBtn: { position: 'absolute', bottom: -4, right: -4, width: 28, height: 28, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.3)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  heroText: { flex: 1 },
  userName: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 2 },
  userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '500', marginBottom: 10 },
  tierBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tierText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statBox: { flex: 1, borderRadius: 20, padding: 16, borderWidth: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  statLabel: { fontSize: 12, fontWeight: '600' },
  section: { marginBottom: 24 },
  sectionLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 12, marginLeft: 4 },
  menuList: { borderRadius: 24, borderWidth: 1, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  menuTitle: { fontSize: 15, fontWeight: '600' },
  logoutBtn: { marginTop: 8, height: 56, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  logoutText: { color: '#FB7185', fontSize: 16, fontWeight: '700' },
  versionText: { textAlign: 'center', fontSize: 12, fontWeight: '500', marginTop: 16, marginBottom: 8 },
});
