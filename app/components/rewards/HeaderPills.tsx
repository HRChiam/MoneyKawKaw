import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';

export default function HeaderPills({ points, freezeCount }: { points: number; freezeCount: number }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      {/* Points Pill */}
      <View style={[styles.pillWrapper, { borderColor: colors.border }]}>
        <LinearGradient
          colors={['rgba(251, 191, 36, 0.1)', 'rgba(251, 191, 36, 0.05)']}
          style={styles.pill}
        >
          <View style={[styles.iconBox, { backgroundColor: '#FBBF24' + '20' }]}>
            <Ionicons size={14} name="star" color="#FBBF24" />
          </View>
          <View style={styles.textBox}>
            <Text style={[styles.valueText, { color: colors.text }]}>{points.toLocaleString()}</Text>
            <Text style={[styles.labelText, { color: colors.secondary }]}>PTS</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Freeze Pill */}
      <View style={[styles.pillWrapper, { borderColor: colors.border }]}>
        <LinearGradient
          colors={['rgba(56, 189, 248, 0.1)', 'rgba(56, 189, 248, 0.05)']}
          style={styles.pill}
        >
          <View style={[styles.iconBox, { backgroundColor: '#38BDF8' + '20' }]}>
            <Ionicons size={14} name="snow" color="#38BDF8" />
          </View>
          <View style={styles.textBox}>
            <Text style={[styles.valueText, { color: colors.text }]}>{freezeCount}</Text>
            <Text style={[styles.labelText, { color: colors.secondary }]}>FREEZE</Text>
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  pillWrapper: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBox: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 16,
  },
  labelText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 1,
  },
});
