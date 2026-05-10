import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const colors = {
  primaryEnd: '#C084FC',
  card: '#130822',
  border: '#3B1A60',
  text: '#FFFFFF',
};

export default function HeaderPills({ points, freezeCount }: { points: number; freezeCount: number }) {
  return (
    <View style={styles.header}>
      <View style={[styles.currencyPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons size={16} name="star" color={colors.primaryEnd} />
        <Text style={[styles.currencyText, { color: colors.text }]}>{points.toLocaleString()}</Text>
      </View>
      <View style={[styles.currencyPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons size={16} name="snow" color={colors.primaryEnd} />
        <Text style={[styles.currencyText, { color: colors.text }]}>{freezeCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginBottom: 24,
    zIndex: 10,
  },
  currencyPill: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
  },
  currencyText: {
    fontSize: 14,
    fontWeight: '700',
  },
});
