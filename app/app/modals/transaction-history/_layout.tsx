import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

type Category = 'All' | 'Food' | 'Transport' | 'Shopping' | 'Income' | 'Utilities';
type SortOrder = 'Latest' | 'Oldest' | 'Highest' | 'Lowest';
type Period = 'All Time' | 'Today' | 'Last 7 Days' | 'This Month';

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('All Time');
  const [sortOrder, setSortOrder] = useState<SortOrder>('Latest');
  const [activeDropdown, setActiveDropdown] = useState<'period' | 'sort' | null>(null);

  const categories: Category[] = ['All', 'Food', 'Transport', 'Shopping', 'Income', 'Utilities'];
  const periods: Period[] = ['All Time', 'Today', 'Last 7 Days', 'This Month'];
  const sortOptions: SortOrder[] = ['Latest', 'Oldest', 'Highest', 'Lowest'];

  // Helper to parse "12:45 PM" into "12:45" (24h)
  const parseTime = (timeStr: string) => {
    const [time, modifier] = timeStr.split(' ');
    let [hours, minutes] = time.split(':');
    let h = parseInt(hours, 10);
    if (h === 12) h = 0;
    if (modifier === 'PM') h += 12;
    return `${h.toString().padStart(2, '0')}:${minutes}:00`;
  };

  // Flattened transaction data for easier processing
  const rawTransactions = useMemo(() => [
    { id: '1', amount: -12.50, description: 'Mamak Ali Restoran', category: 'Food', time: '12:45 PM', date: '2026-05-12', dateLabel: 'Today, 12 May' },
    { id: '2', amount: -8.00, description: 'GrabRide - Home to Office', category: 'Transport', time: '08:30 AM', date: '2026-05-12', dateLabel: 'Today, 12 May' },
    { id: '3', amount: -150.00, description: 'Shopee Malaysia', category: 'Shopping', time: '11:20 PM', date: '2026-05-11', dateLabel: 'Yesterday, 11 May' },
    { id: '4', amount: 2500.00, description: 'Salary Credit', category: 'Income', time: '10:00 AM', date: '2026-05-11', dateLabel: 'Yesterday, 11 May' },
    { id: '5', amount: -45.20, description: 'Village Grocer', category: 'Food', time: '09:15 AM', date: '2026-05-11', dateLabel: 'Yesterday, 11 May' },
    { id: '6', amount: -120.00, description: 'TNB - Electricity Bill', category: 'Utilities', time: '02:00 PM', date: '2026-05-10', dateLabel: '10 May 2026' },
    { id: '7', amount: -15.50, description: 'Starbucks Coffee', category: 'Food', time: '10:30 AM', date: '2026-05-10', dateLabel: '10 May 2026' },
  ], []);

  // Filter and Sort logic
  const processedTransactions = useMemo(() => {
    let filtered = rawTransactions.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Period filtering logic
      const transDate = new Date(item.date);
      const now = new Date('2026-05-12'); // Reference date FIXED
      const diffDays = (now.getTime() - transDate.getTime()) / (1000 * 3600 * 24);
      
      let matchesPeriod = true;
      if (selectedPeriod === 'Today') matchesPeriod = diffDays === 0;
      else if (selectedPeriod === 'Last 7 Days') matchesPeriod = diffDays <= 7;
      else if (selectedPeriod === 'This Month') matchesPeriod = transDate.getMonth() === now.getMonth();

      return matchesCategory && matchesSearch && matchesPeriod;
    });

    // Advanced Sort (Date + Time)
    return filtered.sort((a, b) => {
      const timeA = `${a.date}T${parseTime(a.time)}`;
      const timeB = `${b.date}T${parseTime(b.time)}`;
      
      if (sortOrder === 'Latest') return timeB.localeCompare(timeA);
      if (sortOrder === 'Oldest') return timeA.localeCompare(timeB);
      if (sortOrder === 'Highest') return b.amount - a.amount;
      if (sortOrder === 'Lowest') return a.amount - b.amount;
      return 0;
    });
  }, [rawTransactions, selectedCategory, selectedPeriod, searchQuery, sortOrder]);

  // Regroup by date for UI if sorting by date, otherwise show flat list
  const groupedTransactions = useMemo(() => {
    if (sortOrder === 'Highest' || sortOrder === 'Lowest') {
      const total = processedTransactions.reduce((acc, curr) => acc + curr.amount, 0);
      return [{ date: 'Sorted by Amount', items: processedTransactions, total }];
    }

    const groups: { date: string, items: typeof rawTransactions, total: number }[] = [];
    processedTransactions.forEach(item => {
      const group = groups.find(g => g.date === item.dateLabel);
      if (group) {
        group.items.push(item);
        group.total += item.amount;
      } else {
        groups.push({ date: item.dateLabel, items: [item], total: item.amount });
      }
    });
    return groups;
  }, [processedTransactions, sortOrder]);

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

  const toggleDropdown = (type: 'period' | 'sort') => {
    setActiveDropdown(activeDropdown === type ? null : type);
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

      <View style={{ flex: 1 }}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[1]}
          contentContainerStyle={{ paddingBottom: 40 }}
          onScroll={() => setActiveDropdown(null)}
          scrollEventThrottle={16}
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

          {/* Dropdown Control Row */}
          <View style={styles.dropdownRow}>
            <TouchableOpacity 
              style={[styles.dropdownButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => toggleDropdown('period')}
            >
              <Text style={[styles.dropdownButtonText, { color: colors.text }]}>{selectedPeriod}</Text>
              <Feather name={activeDropdown === 'period' ? "chevron-up" : "chevron-down"} size={16} color={colors.secondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.dropdownButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => toggleDropdown('sort')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="list" size={14} color={colors.primary} />
                <Text style={[styles.dropdownButtonText, { color: colors.text }]}>{sortOrder}</Text>
              </View>
              <Feather name={activeDropdown === 'sort' ? "chevron-up" : "chevron-down"} size={16} color={colors.secondary} />
            </TouchableOpacity>
          </View>

          {/* Transaction Groups */}
          <View style={styles.listContainer}>
            {groupedTransactions.length > 0 ? (
              groupedTransactions.map((dayGroup, groupIndex) => (
                <View key={groupIndex} style={styles.dayGroup}>
                  <View style={styles.dateHeaderRow}>
                    <Text style={[styles.dateHeader, { color: colors.secondary }]}>{dayGroup.date}</Text>
                    <Text style={[styles.dateTotal, { color: dayGroup.total > 0 ? colors.success : colors.text }]}>
                      {dayGroup.total > 0 ? '+' : ''}RM {Math.abs(dayGroup.total).toFixed(2)}
                    </Text>
                  </View>
                  
                  <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    {dayGroup.items.map((item, itemIndex) => (
                      <Animated.View key={item.id} entering={FadeInDown.delay(itemIndex * 50)}>
                        <TouchableOpacity 
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
                      </Animated.View>
                    ))}
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="database-off" size={48} color={colors.secondary + '40'} />
                <Text style={[styles.emptyStateText, { color: colors.secondary }]}>No transactions found</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Dropdown Menus (Absolute Overlay) */}
        {activeDropdown === 'period' && (
          <View style={[styles.dropdownMenu, { backgroundColor: colors.card, left: 20, top: 185 }]}>
            {periods.map((p) => (
              <TouchableOpacity 
                key={p} 
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedPeriod(p);
                  setActiveDropdown(null);
                }}
              >
                <Text style={[styles.dropdownItemText, { color: selectedPeriod === p ? colors.primary : colors.text }]}>
                  {p}
                </Text>
                {selectedPeriod === p && <Feather name="check" size={16} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeDropdown === 'sort' && (
          <View style={[styles.dropdownMenu, { backgroundColor: colors.card, right: 20, top: 185 }]}>
            {sortOptions.map((o) => (
              <TouchableOpacity 
                key={o} 
                style={styles.dropdownItem}
                onPress={() => {
                  setSortOrder(o);
                  setActiveDropdown(null);
                }}
              >
                <Text style={[styles.dropdownItemText, { color: sortOrder === o ? colors.primary : colors.text }]}>
                  {o}
                </Text>
                {sortOrder === o && <Feather name="check" size={16} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Backdrop for closing dropdown */}
        {activeDropdown && (
          <TouchableOpacity 
            style={styles.backdrop} 
            activeOpacity={1} 
            onPress={() => setActiveDropdown(null)} 
          />
        )}
      </View>
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
    marginBottom: 8,
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
  sortSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sortLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginRight: 12,
  },
  sortScroll: {
    gap: 8,
  },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  sortChipText: {
    fontSize: 13,
    fontWeight: '700',
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
  dropdownRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
    zIndex: 10,
  },
  dropdownButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
  },
  dropdownButtonText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'sans-serif-rounded',
  },
  dropdownMenu: {
    position: 'absolute',
    width: 160,
    borderRadius: 16,
    padding: 8,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  dropdownItemText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'sans-serif-rounded',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 900,
  },
  dateHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateTotal: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: 'sans-serif-rounded',
  },
});
