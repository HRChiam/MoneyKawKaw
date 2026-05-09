import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

type Category = 'All' | 'Food' | 'Transport' | 'Shopping' | 'Income' | 'Utilities';

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');

  const categories: Category[] = ['All', 'Food', 'Transport', 'Shopping', 'Income', 'Utilities'];

  const transactions = [
    {
      date: 'Today, 10 May',
      items: [
        { id: '1', amount: -12.50, description: 'Mamak Ali Restoran', category: 'Food', time: '12:45 PM' },
        { id: '2', amount: -8.00, description: 'GrabRide - Home to Office', category: 'Transport', time: '08:30 AM' },
      ],
    },
    {
      date: 'Yesterday, 09 May',
      items: [
        { id: '3', amount: -150.00, description: 'Shopee Malaysia', category: 'Shopping', time: '11:20 PM' },
        { id: '4', amount: 2500.00, description: 'Salary Credit', category: 'Income', time: '10:00 AM' },
        { id: '5', amount: -45.20, description: 'Village Grocer', category: 'Food', time: '09:15 AM' },
      ],
    },
    {
      date: '08 May 2026',
      items: [
        { id: '6', amount: -120.00, description: 'TNB - Electricity Bill', category: 'Utilities', time: '02:00 PM' },
        { id: '7', amount: -15.50, description: 'Starbucks Coffee', category: 'Food', time: '10:30 AM' },
      ],
    },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Food': return <MaterialCommunityIcons name="food" size={20} color={colors.primary} />;
      case 'Transport': return <MaterialCommunityIcons name="car" size={20} color={colors.primary} />;
      case 'Shopping': return <Feather name="shopping-bag" size={18} color={colors.primary} />;
      case 'Income': return <Ionicons name="wallet-outline" size={20} color={colors.success} />;
      case 'Utilities': return <Feather name="zap" size={18} color={colors.primary} />;
      default: return <Feather name="list" size={18} color={colors.primary} />;
    }
  };

  const getIconBackground = (category: string) => {
    if (category === 'Income') return colors.success + '15';
    return colors.primary + '10';
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Transaction History</Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[1]}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Search Bar */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="search" size={20} color={colors.secondary} style={{ marginRight: 12 }} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search merchants or categories"
              placeholderTextColor={colors.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Categories Filter (Sticky Header Index 1) */}
        <View style={[styles.filterSection, { backgroundColor: colors.background }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.filterChip,
                  { 
                    backgroundColor: selectedCategory === cat ? colors.primary : colors.card,
                    borderColor: selectedCategory === cat ? colors.primary : colors.border
                  }
                ]}
              >
                <Text style={[
                  styles.filterChipText, 
                  { color: selectedCategory === cat ? '#fff' : colors.text }
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Transaction Groups */}
        <View style={styles.listContainer}>
          {transactions.map((dayGroup, groupIndex) => (
            <View key={groupIndex} style={styles.dayGroup}>
              <Text style={[styles.dateHeader, { color: colors.secondary }]}>{dayGroup.date}</Text>
              
              <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {dayGroup.items.map((item, itemIndex) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={[
                      styles.transactionItem, 
                      itemIndex < dayGroup.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }
                    ]}
                  >
                    <View style={styles.itemLeft}>
                      <View style={[styles.iconWrapper, { backgroundColor: getIconBackground(item.category) }]}>
                        {getCategoryIcon(item.category)}
                      </View>
                      <View style={styles.textGroup}>
                        <Text style={[styles.description, { color: colors.text }]} numberOfLines={1}>
                          {item.description}
                        </Text>
                        <Text style={[styles.metaText, { color: colors.secondary }]}>
                          {item.time} • {item.category}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.itemRight}>
                      <Text style={[
                        styles.amountText, 
                        { color: item.amount > 0 ? colors.success : colors.text }
                      ]}>
                        {item.amount > 0 ? '+' : ''}RM {Math.abs(item.amount).toFixed(2)}
                      </Text>
                      <Feather name="chevron-right" size={16} color={colors.border} style={{ marginLeft: 4 }} />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  filterSection: {
    paddingVertical: 12,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  dayGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  groupCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textGroup: {
    flex: 1,
  },
  description: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    gap: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
