import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HeaderPills({ points, freezeCount }: { points: number; freezeCount: number }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.header}>
      <View style={[styles.currencyPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons size={16} name="star" color="#FBBF24" />
        <Text style={[styles.currencyText, { color: colors.text }]}>{points.toLocaleString()}</Text>
      </View>
      <View style={[styles.currencyPill, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons size={16} name="snow" color="#38BDF8" />
        <Text style={[styles.currencyText, { color: colors.text }]}>{freezeCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
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
