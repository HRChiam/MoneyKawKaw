import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

const { width } = Dimensions.get('window');

export default function SummaryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [activeTab, setActiveTab] = useState<'summary' | 'tax'>('summary');
  const [timeframe, setTimeframe] = useState<'month' | 'year'>('month');

  const spendingCategories = [
    { name: 'Saving', amount: 800 },
    { name: 'F&B', amount: 600 },
    { name: 'Entertainment', amount: 200 },
  ];

  const taxItems = [
    { name: 'Books', amount: 99 },
    { name: 'Medical', amount: 150 },
    { name: 'Education', amount: 200 },
  ];

  const renderSummaryTab = () => (
    <View>
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: timeframe === 'month' ? colors.primary : colors.card,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setTimeframe('month')}
        >
          <Text
            style={[
              styles.filterButtonText,
              {
                color: timeframe === 'month' ? '#fff' : colors.text,
              },
            ]}
          >
            Month
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: timeframe === 'year' ? colors.primary : colors.card,
              borderColor: colors.border,
            },
          ]}
          onPress={() => setTimeframe('year')}
        >
          <Text
            style={[
              styles.filterButtonText,
              {
                color: timeframe === 'year' ? '#fff' : colors.text,
              },
            ]}
          >
            Year
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chartsContainer}>
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Income Graph</Text>
          <View style={[styles.chartPlaceholder, { backgroundColor: colors.border }]}>
            <IconSymbol size={32} name="chart.line" color={colors.secondary} />
          </View>
        </View>

        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>Spend Graph</Text>
          <View style={[styles.chartPlaceholder, { backgroundColor: colors.border }]}>
            <IconSymbol size={32} name="chart.bar" color={colors.secondary} />
          </View>
        </View>
      </View>

      <View style={styles.listSection}>
        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: colors.text }]}>Spending Category</Text>
          <TouchableOpacity>
            <Text style={[styles.sortButton, { color: colors.primary }]}>Sort</Text>
          </TouchableOpacity>
        </View>

        {spendingCategories.map((category, index) => (
          <View
            key={index}
            style={[
              styles.categoryItem,
              { borderBottomColor: colors.border },
              index === spendingCategories.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
            <Text style={[styles.categoryAmount, { color: colors.primary }]}>RM {category.amount}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderTaxTab = () => (
    <View>
      <View style={[styles.totalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.totalLabel, { color: colors.secondary }]}>Monthly Total</Text>
        <Text style={[styles.totalAmount, { color: colors.primary }]}>RM 449</Text>
      </View>

      <View style={styles.listSection}>
        <Text style={[styles.listTitle, { color: colors.text }]}>Tax Exemption Suggestion</Text>

        {taxItems.map((item, index) => (
          <View
            key={index}
            style={[
              styles.taxItem,
              { borderBottomColor: colors.border },
              index === taxItems.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <View style={styles.taxItemLeft}>
              <Text style={[styles.taxItemName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.taxItemAmount, { color: colors.primary }]}>RM {item.amount}</Text>
            </View>
            <TouchableOpacity>
              <Text style={[styles.viewButton, { color: colors.primary }]}>View status</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      scrollEventThrottle={16}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol size={24} name="chevron.left" color={colors.text} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>Summary</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            {
              borderBottomWidth: activeTab === 'summary' ? 2 : 0,
              borderBottomColor: colors.primary,
            },
          ]}
          onPress={() => setActiveTab('summary')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'summary' ? colors.primary : colors.secondary,
              },
            ]}
          >
            Summary
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            {
              borderBottomWidth: activeTab === 'tax' ? 2 : 0,
              borderBottomColor: colors.primary,
            },
          ]}
          onPress={() => setActiveTab('tax')}
        >
          <Text
            style={[
              styles.tabText,
              {
                color: activeTab === 'tax' ? colors.primary : colors.secondary,
              },
            ]}
          >
            Tax
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContent}>
        {activeTab === 'summary' ? renderSummaryTab() : renderTaxTab()}
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
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chartsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  chartCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  chartPlaceholder: {
    height: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listSection: {
    marginBottom: 24,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  sortButton: {
    fontSize: 12,
    fontWeight: '600',
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  categoryName: {
    fontSize: 14,
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  totalLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  taxItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  taxItemLeft: {
    flex: 1,
  },
  taxItemName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  taxItemAmount: {
    fontSize: 12,
  },
  viewButton: {
    fontSize: 12,
    fontWeight: '600',
  },
});
