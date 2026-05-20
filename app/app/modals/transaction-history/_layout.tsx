import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

type SortOrder = 'Latest' | 'Oldest' | 'Highest' | 'Lowest';
type Period = 'All Time' | 'Today' | 'Last 7 Days' | 'This Month';

interface TransactionApiItem {
  transaction_id: string;
  amount: number;
  counterparty_name: string;
  transaction_type: string;
  tax_relief_detected: boolean;
  tax_category?: string | null;
  reference?: string | null;
  status?: string | null;
  is_warning_triggered?: boolean;
  signed_amount?: number | null;
  transaction_time?: string | null;
  created_at?: string | null;
}

interface TransactionViewItem {
  id: string;
  amount: number;
  signedAmount: number;
  description: string;
  category: string;
  time: string;
  date: string;
  dateLabel: string;
  status: string;
  taxReliefDetected: boolean;
  taxCategory: string | null;
  warningTriggered: boolean;
}

interface TransactionGroup {
  date: string;
  items: TransactionViewItem[];
  total: number;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
const USER_ID = 'de458832-a0c0-45a6-a9b3-471db31a2f7e';

const formatDisplayType = (value: string) => {
  return value
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const inferSignedAmount = (amount: number, transactionType: string) => {
  const normalizedType = transactionType.toLowerCase();
  const inflowMarkers = ['income', 'credit', 'deposit', 'refund', 'salary', 'bonus', 'received', 'receive', 'top up', 'topup', 'top_up'];
  const outflowMarkers = ['expense', 'debit', 'payment', 'purchase', 'withdraw', 'transfer out', 'transfer_out', 'repayment', 'bill', 'loan'];

  if (inflowMarkers.some((marker) => normalizedType.includes(marker))) {
    return Math.abs(amount);
  }

  if (outflowMarkers.some((marker) => normalizedType.includes(marker))) {
    return -Math.abs(amount);
  }

  return amount >= 0 ? -Math.abs(amount) : amount;
};

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

const formatDateLabel = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfTransactionDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((startOfToday.getTime() - startOfTransactionDay.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Today, ${date.getDate()} ${date.toLocaleString('en-US', { month: 'short' })}`;
  }

  if (diffDays === 1) {
    return `Yesterday, ${date.getDate()} ${date.toLocaleString('en-US', { month: 'short' })}`;
  }

  return `${date.getDate()} ${date.toLocaleString('en-US', { month: 'short' })} ${date.getFullYear()}`;
};

export default function TransactionHistoryScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('All Time');
  const [sortOrder, setSortOrder] = useState<SortOrder>('Latest');
  const [activeDropdown, setActiveDropdown] = useState<'period' | 'sort' | null>(null);
  const [transactions, setTransactions] = useState<TransactionViewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const periods: Period[] = ['All Time', 'Today', 'Last 7 Days', 'This Month'];
  const sortOptions: SortOrder[] = ['Latest', 'Oldest', 'Highest', 'Lowest'];

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${API_BASE_URL}/api/user/${USER_ID}/transactions?limit=50`);
        if (!response.ok) {
          throw new Error(`Failed to fetch transactions: ${response.statusText}`);
        }

        const data: { transactions: TransactionApiItem[] } = await response.json();
        const mappedTransactions = (data.transactions || []).map((transaction) => {
          const timestamp = transaction.transaction_time || transaction.created_at || new Date().toISOString();
          const signedAmount = typeof transaction.signed_amount === 'number'
            ? transaction.signed_amount
            : inferSignedAmount(transaction.amount, transaction.transaction_type);

          return {
            id: transaction.transaction_id,
            amount: transaction.amount,
            signedAmount,
            description: transaction.counterparty_name || transaction.reference || 'Transaction',
            category: formatDisplayType(transaction.transaction_type || 'Unknown'),
            time: formatTimestamp(timestamp),
            date: timestamp,
            dateLabel: formatDateLabel(timestamp),
            status: transaction.status || 'completed',
            taxReliefDetected: Boolean(transaction.tax_relief_detected),
            taxCategory: transaction.tax_category || null,
            warningTriggered: Boolean(transaction.is_warning_triggered),
          };
        });

        setTransactions(mappedTransactions);
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Unknown error');
        console.error('Failed to fetch transactions:', fetchError);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(transactions.map((transaction) => transaction.category)));
    return ['All', ...uniqueCategories];
  }, [transactions]);

  useEffect(() => {
    if (selectedCategory !== 'All' && !categories.includes(selectedCategory)) {
      setSelectedCategory('All');
    }
  }, [categories, selectedCategory]);

  const parseDate = (dateString: string) => {
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const processedTransactions = useMemo(() => {
    const now = new Date();

    const filtered = transactions.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.description.toLowerCase().includes(searchQuery.toLowerCase())
        || item.category.toLowerCase().includes(searchQuery.toLowerCase())
        || item.status.toLowerCase().includes(searchQuery.toLowerCase())
        || (item.taxCategory ? item.taxCategory.toLowerCase().includes(searchQuery.toLowerCase()) : false);

      const transactionDate = parseDate(item.date);
      if (!transactionDate) {
        return matchesCategory && matchesSearch;
      }

      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const startOfTransactionDay = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate());
      const diffDays = Math.round((startOfToday.getTime() - startOfTransactionDay.getTime()) / (1000 * 60 * 60 * 24));

      let matchesPeriod = true;
      if (selectedPeriod === 'Today') matchesPeriod = diffDays === 0;
      else if (selectedPeriod === 'Last 7 Days') matchesPeriod = diffDays >= 0 && diffDays <= 7;
      else if (selectedPeriod === 'This Month') {
        matchesPeriod = transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear();
      }

      return matchesCategory && matchesSearch && matchesPeriod;
    });

    return filtered.sort((a, b) => {
      const timeA = a.date;
      const timeB = b.date;

      if (sortOrder === 'Latest') return timeB.localeCompare(timeA);
      if (sortOrder === 'Oldest') return timeA.localeCompare(timeB);
      if (sortOrder === 'Highest') return b.signedAmount - a.signedAmount;
      if (sortOrder === 'Lowest') return a.signedAmount - b.signedAmount;
      return 0;
    });
  }, [transactions, selectedCategory, selectedPeriod, searchQuery, sortOrder]);

  const groupedTransactions = useMemo<TransactionGroup[]>(() => {
    if (sortOrder === 'Highest' || sortOrder === 'Lowest') {
      const total = processedTransactions.reduce((accumulator, transaction) => accumulator + transaction.signedAmount, 0);
      return [{ date: 'Sorted by Amount', items: processedTransactions, total }];
    }

    const groups: TransactionGroup[] = [];
    processedTransactions.forEach((transaction) => {
      const group = groups.find((entry) => entry.date === transaction.dateLabel);
      if (group) {
        group.items.push(transaction);
        group.total += transaction.signedAmount;
      } else {
        groups.push({ date: transaction.dateLabel, items: [transaction], total: transaction.signedAmount });
      }
    });

    return groups;
  }, [processedTransactions, sortOrder]);

  const getCategoryIcon = (category: string) => {
    const normalized = category.toLowerCase();
    if (normalized.includes('income') || normalized.includes('credit') || normalized.includes('deposit') || normalized.includes('refund')) {
      return <Ionicons name="wallet-outline" size={20} color={colors.success} />;
    }
    if (normalized.includes('transfer')) {
      return <MaterialCommunityIcons name="swap-horizontal" size={20} color={colors.primary} />;
    }
    if (normalized.includes('tax')) {
      return <MaterialCommunityIcons name="receipt-text-outline" size={20} color={colors.warning} />;
    }
    if (normalized.includes('expense') || normalized.includes('debit') || normalized.includes('payment') || normalized.includes('purchase') || normalized.includes('bill')) {
      return <Feather name="arrow-up-right" size={18} color={colors.primary} />;
    }
    return <Feather name="list" size={18} color={colors.primary} />;
  };

  const getIconBackground = (category: string, amount: number) => {
    const normalized = category.toLowerCase();
    if (normalized.includes('income') || amount > 0) return colors.success + '15';
    if (normalized.includes('tax')) return colors.warning + '18';
    return colors.primary + '10';
  };

  const toggleDropdown = (type: 'period' | 'sort') => {
    setActiveDropdown(activeDropdown === type ? null : type);
  };

  const renderLoadingState = () => (
    <View style={styles.stateContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.stateTitle, { color: colors.text }]}>Loading transaction history</Text>
      <Text style={[styles.stateSubtitle, { color: colors.secondary }]}>Fetching the latest entries from the backend.</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.stateContainer}>
      <MaterialCommunityIcons name="database-off" size={48} color={colors.secondary + '60'} />
      <Text style={[styles.stateTitle, { color: colors.text }]}>Unable to load transactions</Text>
      <Text style={[styles.stateSubtitle, { color: colors.secondary }]}>{error || 'Please try again.'}</Text>
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: colors.primary }]}
        onPress={() => {
          setLoading(true);
          setError(null);
          fetch(`${API_BASE_URL}/api/user/${USER_ID}/transactions?limit=50`)
            .then((response) => {
              if (!response.ok) {
                throw new Error(`Failed to fetch transactions: ${response.statusText}`);
              }
              return response.json();
            })
            .then((data: { transactions: TransactionApiItem[] }) => {
              const mappedTransactions = (data.transactions || []).map((transaction) => {
                const timestamp = transaction.transaction_time || transaction.created_at || new Date().toISOString();
                const signedAmount = typeof transaction.signed_amount === 'number'
                  ? transaction.signed_amount
                  : inferSignedAmount(transaction.amount, transaction.transaction_type);

                return {
                  id: transaction.transaction_id,
                  amount: transaction.amount,
                  signedAmount,
                  description: transaction.counterparty_name || transaction.reference || 'Transaction',
                  category: formatDisplayType(transaction.transaction_type || 'Unknown'),
                  time: formatTimestamp(timestamp),
                  date: timestamp,
                  dateLabel: formatDateLabel(timestamp),
                  status: transaction.status || 'completed',
                  taxReliefDetected: Boolean(transaction.tax_relief_detected),
                  taxCategory: transaction.tax_category || null,
                  warningTriggered: Boolean(transaction.is_warning_triggered),
                };
              });

              setTransactions(mappedTransactions);
            })
            .catch((retryError) => {
              setError(retryError instanceof Error ? retryError.message : 'Unknown error');
            })
            .finally(() => {
              setLoading(false);
            });
        }}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderLoadingState()}
      </View>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {renderErrorState()}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          <View style={styles.searchSection}>
            <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="search" size={20} color={colors.secondary} style={{ marginRight: 12 }} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search merchants, types, or notes"
                placeholderTextColor={colors.secondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <View style={[styles.filterSection, { backgroundColor: colors.background }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  style={[
                    styles.filterChip,
                    {
                      backgroundColor: selectedCategory === category ? colors.primary : colors.card,
                      borderColor: selectedCategory === category ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.filterChipText, { color: selectedCategory === category ? '#fff' : colors.text }]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.dropdownRow}>
            <TouchableOpacity
              style={[styles.dropdownButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => toggleDropdown('period')}
            >
              <Text style={[styles.dropdownButtonText, { color: colors.text }]}>{selectedPeriod}</Text>
              <Feather name={activeDropdown === 'period' ? 'chevron-up' : 'chevron-down'} size={16} color={colors.secondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dropdownButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => toggleDropdown('sort')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Feather name="list" size={14} color={colors.primary} />
                <Text style={[styles.dropdownButtonText, { color: colors.text }]}>{sortOrder}</Text>
              </View>
              <Feather name={activeDropdown === 'sort' ? 'chevron-up' : 'chevron-down'} size={16} color={colors.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.listContainer}>
            {groupedTransactions.length > 0 ? (
              groupedTransactions.map((dayGroup, groupIndex) => (
                <View key={`${dayGroup.date}-${groupIndex}`} style={styles.dayGroup}>
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
                            itemIndex < dayGroup.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border },
                          ]}
                        >
                          <View style={styles.itemLeft}>
                            <View style={[styles.iconWrapper, { backgroundColor: getIconBackground(item.category, item.signedAmount) }]}>
                              {getCategoryIcon(item.category)}
                            </View>
                            <View style={styles.textGroup}>
                              <Text style={[styles.description, { color: colors.text }]} numberOfLines={1}>
                                {item.description}
                              </Text>
                              <Text style={[styles.metaText, { color: colors.secondary }]}>
                                {item.time} • {item.category}
                                {item.taxCategory ? ` • ${item.taxCategory}` : ''}
                              </Text>
                            </View>
                          </View>

                          <View style={styles.itemRight}>
                            <Text style={[styles.amountText, { color: item.signedAmount > 0 ? colors.success : colors.text }]}>
                              {item.signedAmount > 0 ? '+' : ''}RM {Math.abs(item.signedAmount).toFixed(2)}
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

        {activeDropdown === 'period' && (
          <View style={[styles.dropdownMenu, { backgroundColor: colors.card, left: 20, top: 185 }]}> 
            {periods.map((period) => (
              <TouchableOpacity
                key={period}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedPeriod(period);
                  setActiveDropdown(null);
                }}
              >
                <Text style={[styles.dropdownItemText, { color: selectedPeriod === period ? colors.primary : colors.text }]}>
                  {period}
                </Text>
                {selectedPeriod === period && <Feather name="check" size={16} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeDropdown === 'sort' && (
          <View style={[styles.dropdownMenu, { backgroundColor: colors.card, right: 20, top: 185 }]}> 
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.dropdownItem}
                onPress={() => {
                  setSortOrder(option);
                  setActiveDropdown(null);
                }}
              >
                <Text style={[styles.dropdownItemText, { color: sortOrder === option ? colors.primary : colors.text }]}>
                  {option}
                </Text>
                {sortOrder === option && <Feather name="check" size={16} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        )}

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
  listContainer: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  dayGroup: {
    marginBottom: 24,
  },
  dateHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateHeader: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dateTotal: {
    fontSize: 13,
    fontWeight: '800',
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
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  stateTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  stateSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
});
