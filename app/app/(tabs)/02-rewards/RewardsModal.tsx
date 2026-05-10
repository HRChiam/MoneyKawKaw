import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const colors = { primaryEnd: '#C084FC', card: '#130822', border: '#3B1A60', text: '#FFFFFF', secondary: '#A78BFA' };

export default function RewardsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  if (!visible) return null;
  return (
    <View style={modalStyles.modalOverlay}>
      <View style={[modalStyles.modalContent, { backgroundColor: '#1C0D33', borderColor: colors.border }]}>
        <View style={modalStyles.modalHeader}>
          <Text style={[modalStyles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Available Rewards</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: colors.primaryEnd, fontWeight: '600', fontSize: 16 }}>Close</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[modalStyles.rewardItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={modalStyles.rewardContent}>
              <View style={[modalStyles.iconContainer, { backgroundColor: '#FFFFFF' }]}> 
                <Image source={require('@/assets/images/kfc_logo.png')} style={modalStyles.rewardLogo} resizeMode="contain" />
              </View>
              <View>
                <Text style={[modalStyles.rewardName, { color: colors.text }]}>KFC RM 20 Voucher</Text>
                <Text style={[modalStyles.rewardCost, { color: colors.secondary }]}>200 points</Text>
              </View>
            </View>
            <TouchableOpacity style={[modalStyles.redeemButton, { backgroundColor: 'transparent', borderColor: colors.primaryEnd, borderWidth: 1 }]}>
              <Text style={[modalStyles.redeemText, { color: colors.primaryEnd }]}>Redeem</Text>
            </TouchableOpacity>
          </View>

          <View style={[modalStyles.rewardItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={modalStyles.rewardContent}>
              <View style={[modalStyles.iconContainer, { backgroundColor: '#FFFFFF' }]}>
                <Image source={require('@/assets/images/zus_logo.png')} style={modalStyles.rewardLogo} resizeMode="contain" />
              </View>
              <View>
                <Text style={[modalStyles.rewardName, { color: colors.text }]}>ZUS RM 10 Voucher</Text>
                <Text style={[modalStyles.rewardCost, { color: colors.secondary }]}>100 points</Text>
              </View>
            </View>
            <TouchableOpacity style={[modalStyles.redeemButton, { backgroundColor: 'transparent', borderColor: colors.primaryEnd, borderWidth: 1 }]}>
              <Text style={[modalStyles.redeemText, { color: colors.primaryEnd }]}>Redeem</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const modalStyles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { height: '60%', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, borderTopWidth: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  rewardItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  rewardContent: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  iconContainer: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  rewardName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  rewardCost: { fontSize: 13, fontWeight: '500' },
  redeemButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  redeemText: { fontSize: 13, fontWeight: '700' },
  rewardLogo: { width: 32, height: 32 },
});
