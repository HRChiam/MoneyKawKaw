import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function NotificationsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const notifications = [
    {
      id: 1,
      title: 'Daily Spending Alert',
      message: 'You have spent RM 200 today',
      timestamp: '2 hours ago',
      icon: 'bell.fill',
    },
    {
      id: 2,
      title: 'Budget Reached',
      message: 'Your Food pocket is 80% full',
      timestamp: '1 day ago',
      icon: 'exclamationmark.circle.fill',
    },
    {
      id: 3,
      title: 'Reward Unlocked',
      message: 'You earned 100 points!',
      timestamp: '3 days ago',
      icon: 'star.fill',
    },
    {
      id: 4,
      title: 'Payment Due',
      message: 'Your PTPTN payment is due',
      timestamp: '5 days ago',
      icon: 'calendar.badge.exclamationmark',
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      scrollEventThrottle={16}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
      </View>

      {/* Notifications List */}
      {notifications.map((notification, index) => (
        <View
          key={notification.id}
          style={[
            styles.notificationItem,
            { backgroundColor: colors.card, borderColor: colors.border },
            index !== notifications.length - 1 && { borderBottomWidth: 1 },
          ]}
        >
          <View style={[styles.notificationIcon, { backgroundColor: colors.border }]}>
            <IconSymbol size={24} name={notification.icon as any} color={colors.primary} />
          </View>

          <View style={styles.notificationContent}>
            <Text style={[styles.notificationTitle, { color: colors.text }]}>
              {notification.title}
            </Text>
            <Text style={[styles.notificationMessage, { color: colors.secondary }]}>
              {notification.message}
            </Text>
            <Text style={[styles.notificationTime, { color: colors.secondary }]}>
              {notification.timestamp}
            </Text>
          </View>
        </View>
      ))}

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
  notificationItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 1,
    borderBottomWidth: 1,
  },
  notificationIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
    justifyContent: 'center',
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
  },
});
