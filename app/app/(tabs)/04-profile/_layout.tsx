import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const menuItems = [
    {
      id: 1,
      title: 'Account Settings',
      icon: 'gear' as any,
    },
    {
      id: 2,
      title: 'Payment Methods',
      icon: 'creditcard.fill' as any,
    },
    {
      id: 3,
      title: 'Savings Goals',
      icon: 'target' as any,
    },
    {
      id: 4,
      title: 'Security',
      icon: 'lock.fill' as any,
    },
    {
      id: 5,
      title: 'Help & Support',
      icon: 'questionmark.circle.fill' as any,
    },
    {
      id: 6,
      title: 'About',
      icon: 'info.circle.fill' as any,
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      scrollEventThrottle={16}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
      </View>

      {/* User Info Card */}
      <View style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>XW</Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={[styles.userName, { color: colors.text }]}>Xuan Wei</Text>
          <Text style={[styles.userEmail, { color: colors.secondary }]}>xw@example.com</Text>
          <View style={styles.memberBadge}>
            <Text style={styles.memberBadgeText}>Member Since 2026</Text>
          </View>
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View
          style={[
            styles.statItem,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <IconSymbol size={24} name="chart.line.uptrend.xyaxis" color={colors.primary} />
          <Text style={[styles.statLabel, { color: colors.secondary }]}>Total Saved</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>RM 5,250</Text>
        </View>

        <View
          style={[
            styles.statItem,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <IconSymbol size={24} name="star.fill" color={colors.primary} />
          <Text style={[styles.statLabel, { color: colors.secondary }]}>Points Earned</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>1,357</Text>
        </View>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.menuItem,
              { borderBottomColor: colors.border },
              index === menuItems.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIcon, { backgroundColor: colors.border }]}>
                <IconSymbol size={20} name={item.icon} color={colors.primary} />
              </View>
              <Text style={[styles.menuTitle, { color: colors.text }]}>{item.title}</Text>
            </View>
            <IconSymbol size={20} name="chevron.right" color={colors.secondary} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <TouchableOpacity
          style={[
            styles.logoutButton,
            { backgroundColor: colors.error, borderColor: colors.error },
          ]}
        >
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  userCard: {
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  memberBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
  },
  memberBadgeText: {
    fontSize: 12,
    color: '#771fff',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  menuSection: {
    marginHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  logoutSection: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  logoutButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
