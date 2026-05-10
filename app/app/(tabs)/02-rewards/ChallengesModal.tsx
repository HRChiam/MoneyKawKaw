import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const colors = { primaryEnd: '#C084FC', card: '#130822', border: '#3B1A60', text: '#FFFFFF', secondary: '#A78BFA' };

export default function ChallengesModal({ visible, onClose, challenges }: { visible: boolean; onClose: () => void; challenges: any[] }) {
  if (!visible) return null;
  return (
    <View style={styles.modalOverlay}>
      <View style={[styles.modalContent, { backgroundColor: '#1C0D33', borderColor: colors.border }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>Active Challenges</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: colors.primaryEnd, fontWeight: '600', fontSize: 16 }}>Close</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {challenges.map(challenge => (
            <View key={challenge.id} style={[styles.rewardItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.rewardContent}>
                <View style={[styles.iconContainer, { backgroundColor: colors.primaryEnd + '20' }]}>
                  <Ionicons name={challenge.icon as any} size={24} color={colors.primaryEnd} />
                </View>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={[styles.rewardName, { color: colors.text }]}>{challenge.title}</Text>
                  <Text style={[styles.challengeDesc, { color: colors.secondary }]} numberOfLines={2}>{challenge.desc}</Text>
                </View>
              </View>
              <View style={[styles.pointsBadge, { backgroundColor: colors.primaryEnd + '30' }]}>
                <Text style={[styles.pointsBadgeText, { color: colors.primaryEnd }]}>+{challenge.reward}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { height: '60%', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, borderTopWidth: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  rewardItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  rewardContent: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
  iconContainer: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  rewardName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  challengeDesc: { fontSize: 11, lineHeight: 16 },
  pointsBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  pointsBadgeText: { fontSize: 13, fontWeight: 'bold' },
});
