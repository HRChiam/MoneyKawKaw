import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { TransactionSuccess } from './TransactionSuccess';

import { useFinancial } from '@/context/FinancialContext';

type TransferSource = 'Saving' | 'F&B' | 'Transport' | 'Loan' | 'Groceries' | 'Entertainment';

export default function TransactionScreen() {
  const { pockets } = useFinancial();
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [toAccount, setToAccount] = useState((params.toAccount as string) || '');
  const [toBank, setToBank] = useState((params.toBank as string) || 'GXBank');
  const [amount, setAmount] = useState((params.amount as string) || '');
  const [reference, setReference] = useState((params.reference as string) || '');
  const [selectedSource, setSelectedSource] = useState<TransferSource | null>((params.selectedSource as TransferSource) || null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(params.isConfirmed === 'true');

  // Update state if params change (e.g. coming back from insufficient funds)
  useEffect(() => {
    if (params.isConfirmed === 'true') {
      setIsConfirmed(true);
      if (params.amount) setAmount(params.amount as string);
      if (params.toAccount) setToAccount(params.toAccount as string);
      if (params.toBank) setToBank(params.toBank as string);
      if (params.selectedSource) setSelectedSource(params.selectedSource as TransferSource);
    }
  }, [params]);

  const banks = ['GXBank', 'Maybank', 'CIMB Bank', 'Public Bank', 'RHB Bank'];
  const [showBankPicker, setShowBankPicker] = useState(false);
  const [showSourcePicker, setShowSourcePicker] = useState(false);

  const quickAmounts = ['10', '50', '100', '200'];

  // GX Violet for primary actions
  const primaryBrand = '#771FFF'; 
  
  // Permanent icon colors
  const iconPalette = {
    recipient: '#15fabd', // Neon Turquoise
    amount: '#FBBF24',    // Amber
    source: '#771FFF',    // GX Violet
    reference: '#60A5FA', // Sky Blue
  };

  const handleConfirm = async () => {
    if (!toAccount || !amount || !selectedSource) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // mock failed transaction (insufficient funds)
      if (amount === '1000') {
        router.push({
          pathname: './insufficient-funds',
          params: { toAccount, toBank, amount, reference, selectedSource }
        });
      } else {
        setIsConfirmed(true);
      }
    }, 2000);
  };

  const handleDone = () => {
    router.back();
  };

  if (isConfirmed) {
    return (
      <TransactionSuccess 
        amount={amount}
        toAccount={toAccount}
        toBank={toBank}
        selectedSource={selectedSource}
        onDone={handleDone}
        colors={colors}
        primaryBrand={primaryBrand}
      />
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Transfer</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(100).duration(500)}>
          
          {/* Amount Hero Section */}
          <View style={styles.heroSection}>
            <Text style={[styles.heroLabel, { color: colors.secondary }]}>YOU ARE SENDING</Text>
            <View style={styles.amountInputRow}>
              <Text style={[styles.heroCurrency, { color: colors.text }]}>RM</Text>
              <TextInput
                style={[styles.heroAmountInput, { color: colors.text }]}
                placeholder="0.00"
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>
            <View style={styles.quickAmountRow}>
              {quickAmounts.map(val => (
                <TouchableOpacity 
                  key={val}
                  style={[styles.quickAmountBtn, { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)' }]}
                  onPress={() => setAmount(val)}
                >
                  <Text style={[styles.quickAmountText, { color: colors.text }]}>RM{val}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recipient Section */}
          <View style={styles.glassSection}>
            <Text style={[styles.sectionLabel, { color: colors.secondary }]}>TO RECIPIENT</Text>
            
            <TouchableOpacity 
              style={[styles.glassItem, { borderColor: showBankPicker ? primaryBrand : 'rgba(255,255,255,0.1)' }]}
              onPress={() => setShowBankPicker(!showBankPicker)}
            >
              <View style={styles.itemInfo}>
                <View style={[styles.itemIconCircle, { backgroundColor: iconPalette.recipient + '20' }]}>
                  <MaterialCommunityIcons name="bank" size={20} color={iconPalette.recipient} />
                </View>
                <View>
                  <Text style={[styles.itemSubtitle, { color: colors.secondary }]}>Bank</Text>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>{toBank}</Text>
                </View>
              </View>
              <Feather name={showBankPicker ? "chevron-up" : "chevron-down"} size={20} color={colors.secondary} />
            </TouchableOpacity>

            {showBankPicker && (
              <View style={styles.bankPickerList}>
                {banks.map(bank => (
                  <TouchableOpacity 
                    key={bank} 
                    style={styles.bankItem}
                    onPress={() => {
                      setToBank(bank);
                      setShowBankPicker(false);
                    }}
                  >
                    <Text style={[styles.bankItemText, { color: colors.text }]}>{bank}</Text>
                    {toBank === bank && <Feather name="check" size={16} color={iconPalette.recipient} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <View style={[styles.glassInputWrapper, { marginTop: 16 }]}>
              <View style={[styles.itemIconCircle, { backgroundColor: primaryBrand + '20' }]}>
                <Feather name="hash" size={18} color={primaryBrand} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemSubtitle, { color: colors.secondary }]}>Account Number</Text>
                <TextInput
                  style={[styles.glassInput, { color: colors.text }]}
                  placeholder="Enter account number"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={toAccount}
                  onChangeText={setToAccount}
                  keyboardType="number-pad"
                />
              </View>
            </View>
          </View>

          {/* Source Account Selection */}
          <View style={styles.glassSection}>
            <Text style={[styles.sectionLabel, { color: colors.secondary }]}>FROM SOURCE (POCKETS)</Text>
            
            <TouchableOpacity 
              style={[styles.glassItem, { borderColor: showSourcePicker ? primaryBrand : 'rgba(255,255,255,0.1)' }]}
              onPress={() => setShowSourcePicker(!showSourcePicker)}
            >
              <View style={styles.itemInfo}>
                {selectedSource ? (
                  <>
                    <View style={[styles.itemIconCircle, { backgroundColor: pockets.find(p => p.name === selectedSource)?.color + '20' }]}>
                      <MaterialCommunityIcons 
                        name={pockets.find(p => p.name === selectedSource)?.icon as any} 
                        size={20} 
                        color={pockets.find(p => p.name === selectedSource)?.color} 
                      />
                    </View>
                    <View style={{ flex: 1, paddingRight: 16 }}>
                      <Text style={[styles.itemSubtitle, { color: colors.secondary }]}>Selected Pocket</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={[styles.itemTitle, { color: colors.text }]}>{selectedSource}</Text>
                        <Text style={[styles.itemTitle, { color: colors.secondary, fontSize: 14, fontWeight: '600' }]}>RM {pockets.find(p => p.name === selectedSource)?.balance.toFixed(2)}</Text>
                      </View>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={[styles.itemIconCircle, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                      <MaterialCommunityIcons name="wallet-outline" size={20} color={colors.secondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.itemSubtitle, { color: colors.secondary }]}>Source</Text>
                      <Text style={[styles.itemTitle, { color: colors.text, opacity: 0.5 }]}>Choose a pocket</Text>
                    </View>
                  </>
                )}
              </View>
              <Feather name={showSourcePicker ? "chevron-up" : "chevron-down"} size={20} color={colors.secondary} />
            </TouchableOpacity>

            {showSourcePicker && (
              <View style={styles.bankPickerList}>
                {pockets.map(pocket => (
                  <TouchableOpacity 
                    key={pocket.name} 
                    style={styles.bankItem}
                    onPress={() => {
                      setSelectedSource(pocket.name as TransferSource);
                      setShowSourcePicker(false);
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={[styles.miniPocketIcon, { backgroundColor: pocket.color }]}>
                        <MaterialCommunityIcons name={pocket.icon as any} size={14} color="#fff" />
                      </View>
                      <Text style={[styles.bankItemText, { color: colors.text }]}>{pocket.name}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <Text style={{ color: colors.secondary, fontSize: 14, fontWeight: '700' }}>RM {pocket.balance.toFixed(2)}</Text>
                      <MaterialCommunityIcons 
                        name={selectedSource === pocket.name ? "radiobox-marked" : "radiobox-blank"} 
                        size={20} 
                        color={selectedSource === pocket.name ? primaryBrand : colors.secondary + '40'} 
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Reference Section */}
          <View style={styles.glassSection}>
            <View style={styles.glassInputWrapper}>
              <View style={[styles.itemIconCircle, { backgroundColor: iconPalette.reference + '20' }]}>
                <Feather name="file-text" size={18} color={iconPalette.reference} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.itemSubtitle, { color: colors.secondary }]}>Reference (Optional)</Text>
                <TextInput
                  style={[styles.glassInput, { color: colors.text }]}
                  placeholder="What's this for?"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={reference}
                  onChangeText={setReference}
                />
              </View>
            </View>
          </View>

        </Animated.View>
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Footer - Fixed at bottom */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: 'rgba(255,255,255,0.08)' }]}>
        <TouchableOpacity
          onPress={handleConfirm}
          disabled={isLoading || !toAccount || !amount || !selectedSource}
          style={styles.confirmButtonWrapper}
        >
          <LinearGradient
            colors={(!toAccount || !amount || !selectedSource) ? ['#3f3751', '#3f3751'] : ['#771FFF', '#F8326D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.gradientButton, { opacity: (!toAccount || !amount || !selectedSource) ? 0.6 : 1 }]}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.confirmButtonText}>Confirm Transfer</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'sans-serif-rounded',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
    paddingVertical: 20,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 16,
    fontFamily: 'sans-serif-rounded',
  },
  amountInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCurrency: {
    fontSize: 32,
    fontWeight: '700',
    marginRight: 4,
    fontFamily: 'sans-serif-rounded',
  },
  heroAmountInput: {
    fontSize: 32,
    fontWeight: '900',
    textAlign: 'left',
    fontFamily: 'sans-serif-rounded',
  },
  quickAmountRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    gap: 10,
  },
  quickAmountBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 100,
    borderWidth: 1,
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'sans-serif-rounded',
  },
  glassSection: {
    marginBottom: 24,
    padding: 20,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 16,
    fontFamily: 'sans-serif-rounded',
  },
  glassItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
  },
  itemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  itemSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
    fontFamily: 'sans-serif-rounded',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'sans-serif-rounded',
  },
  bankPickerList: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  bankItemText: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'sans-serif-rounded',
  },
  miniPocketIcon: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  glassInput: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'sans-serif-rounded',
    paddingVertical: 8,
    minHeight: 44,
  },
  pocketGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  pocketCard: {
    width: '48%',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    position: 'relative',
  },
  pocketIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  pocketName: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'sans-serif-rounded',
    marginBottom: 4,
  },
  pocketBalance: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'sans-serif-rounded',
  },
  pocketSelectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    backgroundColor: '#0C0121', // Match fixed grounded background
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  confirmButtonWrapper: {
    width: '100%',
  },
  gradientButton: {
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'sans-serif-rounded',
  },
});
