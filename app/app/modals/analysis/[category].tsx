import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function AnalysisScreen() {
  const router = useRouter();
  const { category } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const labelColor = '#771FFF'; // GX Violet

  const pocketThemes: { [key: string]: { color: string; icon: string } } = {
    Saving: { color: '#771FFF', icon: 'safe' },
    Food: { color: '#FB7185', icon: 'food-fork-drink' },
    Transport: { color: '#60A5FA', icon: 'car-side' },
    Utilities: { color: '#FBBF24', icon: 'lightning-bolt' },
  };

  const theme = pocketThemes[category as string] || { color: labelColor, icon: 'folder-outline' };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Standard Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>{category} Analysis</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(600)}>
          {/* Insights Card */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.label, { color: labelColor }]}>MONTHLY INSIGHT</Text>
            <Text style={[styles.insightText, { color: colors.text }]}>
              You've used <Text style={{ color: theme.color, fontWeight: '800' }}>85%</Text> of your {category} limit this month. 
              Based on your current pace, you might exceed it by RM 45.00.
            </Text>
          </View>

          {/* Graph Section */}
          <View style={[styles.graphCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.graphHeader}>
              <Text style={[styles.label, { color: labelColor, marginBottom: 0 }]}>SPENDING TREND</Text>
              <Text style={[styles.graphSub, { color: colors.secondary }]}>LAST 7 DAYS</Text>
            </View>
            
            <View style={styles.chartContainer}>
              <View style={styles.barsRow}>
                {[45, 60, 30, 85, 40, 75, 55].map((value, i) => (
                  <View key={i} style={styles.barWrapper}>
                    <Animated.View 
                      entering={FadeInDown.delay(i * 100).duration(600)}
                      style={[
                        styles.bar, 
                        { 
                          height: value * 1.5, 
                          backgroundColor: i === 3 ? theme.color : theme.color + '40',
                          borderRadius: 8
                        }
                      ]} 
                    />
                    <Text style={[styles.barLabel, { color: colors.secondary }]}>
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}
                    </Text>
                  </View>
                ))}
              </View>
              {/* Y-Axis Line */}
              <View style={[styles.yAxis, { backgroundColor: colors.border }]} />
            </View>

            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: theme.color }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Above average</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.dot, { backgroundColor: theme.color + '40' }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Normal</Text>
              </View>
            </View>
          </View>

          {/* Breakdown Section */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: labelColor }]}>TOP MERCHANTS</Text>
            <View style={[styles.breakdownList, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.listItem}>
                <Text style={[styles.itemText, { color: colors.text }]}>Village Grocer</Text>
                <Text style={[styles.itemAmount, { color: colors.text }]}>RM 120.00</Text>
              </View>
              <View style={[styles.listItem, { borderTopWidth: 1, borderTopColor: colors.border }]}>
                <Text style={[styles.itemText, { color: colors.text }]}>Mamak Ali Restoran</Text>
                <Text style={[styles.itemAmount, { color: colors.text }]}>RM 85.20</Text>
              </View>
            </View>
          </View>
        </Animated.View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  card: { padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 16 },
  insightText: { fontSize: 16, lineHeight: 26, fontWeight: '500' },
  graphCard: { padding: 24, borderRadius: 24, borderWidth: 1, marginBottom: 24 },
  graphHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  graphSub: { fontSize: 11, fontWeight: '700' },
  chartContainer: { height: 160, justifyContent: 'flex-end', paddingBottom: 20 },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: 4 },
  barWrapper: { alignItems: 'center', gap: 8 },
  bar: { width: 28 },
  barLabel: { fontSize: 10, fontWeight: '700' },
  yAxis: { height: 1, width: '100%', position: 'absolute', bottom: 32 },
  legendRow: { flexDirection: 'row', gap: 20, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11, fontWeight: '600' },
  section: { marginBottom: 24 },
  breakdownList: { borderRadius: 20, borderWidth: 1, overflow: 'hidden' },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  itemText: { fontSize: 15, fontWeight: '600' },
  itemAmount: { fontSize: 15, fontWeight: '800' },
});
