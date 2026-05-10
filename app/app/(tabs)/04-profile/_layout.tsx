import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

export default function ProfileScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const labelColor = '#A78BFA'; // Signature Lavender
  const darkLavender = '#7C3AED';

  const menuSections = [
    {
      title: 'ACCOUNT',
      items: [
        { id: 1, title: 'Personal Information', icon: 'user', type: 'feather', color: labelColor },
        { id: 2, title: 'Payment Methods', icon: 'credit-card', type: 'feather', color: labelColor },
        { id: 3, title: 'Transaction History', icon: 'file-text', type: 'feather', color: labelColor, route: '../modals/transaction-history' },
      ]
    },
    {
      title: 'PREFERENCES',
      items: [
        { id: 4, title: 'Notifications', icon: 'bell', type: 'feather', color: labelColor },
        { id: 5, title: 'Security & Privacy', icon: 'shield', type: 'feather', color: labelColor },
        { id: 6, title: 'App Theme', icon: 'moon', type: 'feather', color: labelColor },
      ]
    },
    {
      title: 'SUPPORT',
      items: [
        { id: 7, title: 'Help Center', icon: 'help-circle', type: 'feather', color: labelColor },
        { id: 8, title: 'Terms of Service', icon: 'info', type: 'feather', color: labelColor },
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
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
            colors={[labelColor, darkLavender]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroContent}>
              <View style={styles.avatarWrapper}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>XW</Text>
                </View>
                <TouchableOpacity style={styles.editAvatarBtn}>
                  <Feather name="camera" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
              
              <View style={styles.heroText}>
                <Text style={styles.userName}>Xuan Wei</Text>
                <Text style={styles.userEmail}>xw@example.com</Text>
                <View style={styles.tierBadge}>
                  <MaterialCommunityIcons name="crown" size={12} color="#fff" />
                  <Text style={styles.tierText}>Premium Member</Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Quick Stats */}
          <View style={styles.statsRow}>
            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: labelColor }]}>1,357</Text>
              <Text style={[styles.statLabel, { color: colors.secondary }]}>GX Points</Text>
            </View>
            <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.statValue, { color: labelColor }]}>5.2k</Text>
              <Text style={[styles.statLabel, { color: colors.secondary }]}>Total Saved</Text>
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
  headerTitle: { fontSize: 24, fontWeight: '800' },
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
