import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import UploadReceiptModal from './uploadReceipt';
import { useEffect } from 'react';

export default function NotificationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [aiConfirmedIds, setAiConfirmedIds] = useState<string[]>([]);
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [securityActionState, setSecurityActionState] = useState<'pending' | 'verified' | 'blocked'>('pending');
  const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);

 const [notifications, setNotifications] = useState<Notification[]>([]);
  /*
    {
      id: 7,
      type: 'anomaly_detection',
      title: 'Unusual Spending Detected',
      message: "I've detected a RM300 transaction at 'Fine Dining KL'. This is 4x higher than your usual meal spend. Can you confirm if this was you?",
      timestamp: '5 mins ago',
      icon: 'alert-decagram-outline',
      color: '#771FFF',
      isAI: true
    },
    {
      id: 0,
      type: 'tax_exemption',
      title: 'Tax Exemption Opportunity',
      message: "I've detected a RM250 spending at MPH Bookstores that qualifies for Lifestyle tax relief. Would you like to upload the receipt now for your tax filing?",
      timestamp: 'Just now',
      icon: 'file-document-edit-outline',
      color: '#771FFF',
      isAI: true
    },
    {
      id: 1,
      type: 'ai_debt_routing',
      title: 'Smart Surplus Detected',
      message: "I've spotted RM300 in safe surplus this month! Re-routing this to your GX FlexiCredit could save you RM45 in interest this month. Shall I optimize your repayment now?",
      timestamp: '2 hours ago',
      icon: 'calculator-variant',
      color: '#771FFF',
      isAI: true
    },
    {
      id: 2,
      type: 'ai_consolidation',
      title: 'Interest Savings Alert',
      message: "You're paying 18% interest on an external card. Transferring this to GX FlexiCredit at 4.9% could save you RM120/month. Ready to start the transfer?",
      timestamp: '4 hours ago',
      icon: 'bank-transfer',
      color: '#771FFF',
      isAI: true
    },
    {
      id: 3,
      type: 'ai_learning',
      title: 'Lifestyle Limit Update',
      message: "Your spending habits changed! I've drafted new limits for Food and Entertainment that better match your lifestyle. Apply these changes?",
      timestamp: '6 hours ago',
      icon: 'brain',
      color: '#771FFF',
      isAI: true
    },
    {
      id: 4,
      type: 'spending',
      title: 'Daily Spending Alert',
      message: 'You have used 85% of your daily limit for Food. Consider a home-cooked meal tonight!',
      timestamp: 'Yesterday',
      icon: 'trending-up',
      color: '#FB7185',
      route: '../modals/analysis/Food'
    },
    {
      id: 5,
      type: 'reward',
      title: 'Savings Streak Unlocked',
      message: "You've hit your no-spend goal for 5 days straight! +50 GX Points added.",
      timestamp: '2 days ago',
      icon: 'gift',
      color: '#FBBF24',
      route: '../modals/savings-streak'
    },
    {
      id: 6,
      type: 'security',
      title: 'Login Detected',
      message: 'A new login was detected on a Samsung S24 in Petaling Jaya.',
      timestamp: '3 days ago',
      icon: 'shield-check',
      color: '#34D399',
    },
  ]);*/

const mapDbNotificationToUi = (dbNotification: any) => {
  const getTimeAgo = (dateString: string) => {
    const diffInSeconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

const typeConfigs: any = {
    'anomaly_detection': { icon: 'alert-decagram-outline', color: '#771FFF', isAI: true },
    'tax_exemption': { icon: 'file-document-edit-outline', color: '#771FFF', isAI: true },
    'ai_debt_routing': { icon: 'calculator-variant', color: '#771FFF', isAI: true },
    'ai_consolidation': { icon: 'bank-transfer', color: '#771FFF', isAI: true },
    'ai_learning': { icon: 'brain', color: '#771FFF', isAI: true },
    'spending': { icon: 'trending-up', color: '#FB7185', isAI: false, route: '../modals/analysis/Food' },
    'reward': { icon: 'gift', color: '#FBBF24', isAI: false, route: '../modals/savings-streak' },
    'security': { icon: 'shield-check', color: '#34D399', isAI: false },
  };

const config = typeConfigs[dbNotification.notification_type] || 
                 { icon: 'bell-outline', color: '#771FFF', isAI: false };

  return {
    id: dbNotification.notification_id,
    type: dbNotification.notification_type.toLowerCase(),
    title: dbNotification.title,
    message: dbNotification.message,
    timestamp: getTimeAgo(dbNotification.created_at),
    icon: config.icon,      
    color: config.color,    
    isAI: config.isAI,       
    route: config.route,    
  };
};

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  icon: string;
  color: string;
  isAI: boolean;
  route?: string;
}

const fetchNotifications = async () => {
  try {
    const hardcodedUserId = "de458832-a0c0-45a6-a9b3-471d4d3a6839"; 
    
    const response = await fetch(`http://localhost:8000/api/notifications/${hardcodedUserId}`);
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    const uiFormatted = data.map(mapDbNotificationToUi);
    setNotifications(uiFormatted);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    Alert.alert("Error", "Could not load notifications");
  }
};

useEffect(() => {
const USER_ID = 'de458832-a0c0-45a6-a9b3-471db31a2f7e';
const API_URL = process.env.EXPO_PUBLIC_API_URL;

fetch(`${API_URL}/api/notifications/${USER_ID}`)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log("Successfully fetched notifications:", data);
    const formatted = data.map(mapDbNotificationToUi);
    setNotifications(formatted);; 
  })
  .catch(error => {
    console.error("Error fetching notifications:", error);
  });
}, []);

  const primaryBrand = '#771FFF'; 
  const white = '#FFFFFF';

  const clearAll = () => {
    setNotifications([]);
  };

  const handleAiConfirm = (id: string, type: string) => { 
    if (type === 'tax_exemption') {
      setActiveUploadId(id);
      setIsUploadModalVisible(true);
      return;
    }

    setLoadingIds(prev => [...prev, id]);
    setTimeout(() => {
      setLoadingIds(prev => prev.filter(loadingId => loadingId !== id));
      setAiConfirmedIds(prev => [...prev, id]);
    }, 1200);
  };

  const handleReject = (id: string) => { // id: string
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleManualAdjust = (type: string) => {
    switch (type) {
      case 'ai_debt_routing':
        router.push('../modals/pockets' as any);
        break;
      case 'ai_consolidation':
        router.push('../modals/flexicredit' as any);
        break;
      case 'ai_learning':
        router.push('../modals/limit-adjustment' as any);
        break;
      default:
        router.push('../modals/limit-adjustment' as any);
    }
  };

  const handleSelectUploadOption = (option: 'camera' | 'gallery') => {
    if (activeUploadId !== null) {
      setAiConfirmedIds(prev => [...prev, activeUploadId]);
      setActiveUploadId(null);
    }
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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="bell-outline" size={24} color={colors.text} style={{ marginRight: 12 }} />
          <Text style={[styles.title, { color: colors.text }]}>Notifications</Text>
        </View>
        <TouchableOpacity style={styles.markReadBtn} onPress={clearAll}>
          <Text style={[styles.markReadText, { color: white }]}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {notifications.length > 0 ? (
          <Animated.View entering={FadeInUp.duration(600)}>
            {notifications.map((n, index) => (
              <Animated.View 
                key={n.id} 
                entering={FadeInDown.delay(index * 100).duration(600)}
                style={[
                  styles.notifCard, 
                  { 
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    borderColor: n.isAI ? (n.type === 'tax_exemption' ? n.color + '40' : primaryBrand + '40') : 'rgba(255,255,255,0.08)' 
                  }
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.iconWrapper, { backgroundColor: n.color + '20' }]}>
                    {n.isAI ? (
                      <MaterialCommunityIcons name={n.type === 'tax_exemption' ? (n.icon as any) : "robot-outline"} size={24} color={n.color} />
                    ) : (
                      <MaterialCommunityIcons name={n.icon as any} size={24} color={n.color} />
                    )}
                  </View>
                  <View style={styles.headerMain}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.notifTitle, { color: colors.text, flexShrink: 1 }]} numberOfLines={1}>
                        {n.title}
                      </Text>
                      {n.isAI && (
                        <View style={[styles.aiBadge, { backgroundColor: n.type === 'tax_exemption' ? n.color : primaryBrand }]}>
                          <Text style={styles.aiBadgeText}>AI INSIGHT</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.timeText, { color: colors.secondary }]}>{n.timestamp}</Text>
                  </View>
                </View>

                <View style={styles.messageWrapper}>
                  {n.isAI && aiConfirmedIds.includes(n.id) ? (
                    <Animated.View entering={FadeInUp} style={[styles.successState, { backgroundColor: '#15fabd20', borderColor: '#15fabd' }]}>
                      <Ionicons name="checkmark-circle" size={18} color="#15fabd" />
                      <Text style={[styles.message, { color: '#15fabd', marginLeft: 8, fontWeight: '700' }]}>
                        {n.type === 'ai_debt_routing' ? 'Optimization complete! Surplus re-routed.' : 
                         n.type === 'ai_consolidation' ? 'Transfer initiated! You saved RM120/mo.' :
                         n.type === 'tax_exemption' ? 'Receipt uploaded! Linked to tax profile.' :
                         n.type === 'anomaly_detection' ? 'Transaction verified. Thank you!' :
                         'Limits updated! Your plan is now optimized.'}
                      </Text>
                    </Animated.View>
                  ) : n.type === 'security' && securityActionState !== 'pending' ? (
                     <Animated.View entering={FadeInUp} style={[styles.successState, { 
                       backgroundColor: securityActionState === 'verified' ? '#15fabd20' : '#FB718520', 
                       borderColor: securityActionState === 'verified' ? '#15fabd' : '#FB7185' 
                     }]}>
                      <Ionicons 
                        name={securityActionState === 'verified' ? "checkmark-circle" : "shield-checkmark"}
                        size={18} 
                        color={securityActionState === 'verified' ? "#15fabd" : "#FB7185"} 
                      />
                      <Text style={[styles.message, { 
                        color: securityActionState === 'verified' ? '#15fabd' : '#FB7185', 
                        marginLeft: 8, 
                        fontWeight: '700' 
                      }]}>
                        {securityActionState === 'verified' ? 'Login verified. It was you!' : 'Account secured. Session blocked.'}
                      </Text>
                    </Animated.View>
                  ) : (
                    <Text style={[styles.message, { color: colors.text }]}>{n.message}</Text>
                  )}
                </View>

                {n.isAI ? (
                  !aiConfirmedIds.includes(n.id) && (
                    <View style={styles.actionRow}>
                      <TouchableOpacity 
                        onPress={() => handleAiConfirm(n.id, n.type)} 
                        style={styles.primaryActionWrapper}
                        disabled={loadingIds.includes(n.id)}
                      >
                        <View style={[styles.primaryAction, { backgroundColor: (n.type === 'tax_exemption' || n.type === 'anomaly_detection') ? n.color : primaryBrand, opacity: loadingIds.includes(n.id) ? 0.6 : 1 }]}>
                          <Text style={styles.actionText}>
                            {loadingIds.includes(n.id) ? 'Processing...' : (n.type === 'tax_exemption' ? 'Accept' : (n.type === 'anomaly_detection' ? "Yes, it's me" : 'Looks good!'))}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.secondaryAction, { borderColor: 'rgba(255,255,255,0.1)' }]}
                        onPress={() => (n.type === 'tax_exemption' || n.type === 'anomaly_detection') ? handleReject(n.id) : handleManualAdjust(n.type)}
                        disabled={loadingIds.includes(n.id)}
                      >
                        <Text style={[styles.secondaryActionText, { color: colors.text }]}>
                          {n.type === 'tax_exemption' ? 'Reject' : (n.type === 'anomaly_detection' ? "No, flag it" : 'Custom')}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )
                ) : n.type === 'security' ? (
                  securityActionState === 'pending' && (
                     <View style={styles.actionRow}>
                      <TouchableOpacity 
                        onPress={() => setSecurityActionState('verified')} 
                        style={styles.primaryActionWrapper}
                      >
                        <View style={[styles.primaryAction, { backgroundColor: '#34D399' }]}>
                          <Text style={styles.actionText}>Yes, it&apos;s me</Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.secondaryAction, { borderColor: '#FB7185' }]}
                        onPress={() => setSecurityActionState('blocked')}
                      >
                        <Text style={[styles.secondaryActionText, { color: '#FB7185' }]}>No, block</Text>
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
        ) : (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <MaterialCommunityIcons name="bell-off-outline" size={48} color={primaryBrand} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>All Caught Up!</Text>
            <Text style={[styles.emptySubtitle, { color: colors.secondary }]}>
              You have no new notifications. We&apos;ll let you know when something important happens.
            </Text>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <UploadReceiptModal
        isVisible={isUploadModalVisible}
        onClose={() => setIsUploadModalVisible(false)}
        onSelectOption={handleSelectUploadOption}
      />
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
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'sans-serif-rounded',
  },
  markReadBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#771fff',
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
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '900',
    fontFamily: 'sans-serif-rounded',
    marginBottom: 12,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600',
    fontFamily: 'sans-serif-rounded',
  },
});
