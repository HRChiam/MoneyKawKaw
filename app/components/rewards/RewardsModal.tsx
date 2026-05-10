import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Modal } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';

export default function RewardsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const rewards = [
    { id: 1, name: 'KFC RM 20 Voucher', cost: 200, logo: require('@/assets/images/kfc_logo.png'), category: 'Food' },
    { id: 2, name: 'ZUS RM 10 Voucher', cost: 100, logo: require('@/assets/images/zus_logo.png'), category: 'Beverage' },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <View style={styles.dragHandle} />
          
          <View style={styles.modalHeader}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>Redeem Rewards</Text>
              <Text style={[styles.subtitle, { color: colors.secondary }]}>Turn your points into real treats</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={colors.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {rewards.map(reward => (
              <TouchableOpacity 
                key={reward.id} 
                activeOpacity={0.8}
                style={[styles.rewardItem, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={styles.rewardContent}>
                  <View style={styles.logoWrapper}>
                    <Image source={reward.logo} style={styles.rewardLogo} resizeMode="contain" />
                  </View>
                  <View style={styles.rewardInfo}>
                    <Text style={[styles.category, { color: colors.accent }]}>{reward.category}</Text>
                    <Text style={[styles.rewardName, { color: colors.text }]}>{reward.name}</Text>
                    <View style={styles.costContainer}>
                      <Ionicons name="star" size={14} color="#FBBF24" />
                      <Text style={[styles.rewardCost, { color: colors.secondary }]}>{reward.cost} points</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.redeemButton, { backgroundColor: colors.primary }]}
                >
                  <Text style={styles.redeemText}>Redeem</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
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
    height: '75%', 
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
    marginBottom: 32 
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
  scrollContent: {
    paddingBottom: 40,
  },
  rewardItem: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderRadius: 24, 
    padding: 16, 
    marginBottom: 16, 
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  rewardContent: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  logoWrapper: { 
    width: 60, 
    height: 60, 
    borderRadius: 18, 
    backgroundColor: '#FFFFFF',
    alignItems: 'center', 
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardLogo: { 
    width: 40, 
    height: 40 
  },
  rewardInfo: {
    marginLeft: 16,
    flex: 1,
  },
  category: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  rewardName: { 
    fontSize: 16, 
    fontWeight: '700', 
    marginBottom: 6 
  },
  costContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rewardCost: { 
    fontSize: 13, 
    fontWeight: '600' 
  },
  redeemButton: { 
    paddingHorizontal: 20, 
    paddingVertical: 10, 
    borderRadius: 16,
  },
  redeemText: { 
    fontSize: 14, 
    fontWeight: '800', 
    color: '#FFFFFF' 
  },
});
