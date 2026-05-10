import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { TransactionSuccess } from './TransactionSuccess';

type TransferSource = 'Saving' | 'Food' | 'Transport' | 'Utilities';

export default function TransactionScreen() {
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

  const pockets = [
    { name: 'Saving', icon: 'safe', balance: 50.00, color: '#15fabd' }, // Neon Turquoise
    { name: 'Food', icon: 'food-fork-drink', balance: 800.00, color: '#FB7185' }, // Rose/Pink
    { name: 'Transport', icon: 'car-side', balance: 200.00, color: '#60A5FA' }, // Sky Blue
    { name: 'Utilities', icon: 'lightning-bolt', balance: 120.00, color: '#FBBF24' }, // Amber
  ];

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
      if (amount === '67') {
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
          <Feather name="chevron-left" size={32} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Send Money</Text>
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
            
            <View style={styles.pocketGrid}>
              {pockets.map((pocket) => (
                <TouchableOpacity
                  key={pocket.name}
                  style={[
                    styles.pocketCard,
                    { 
                      backgroundColor: selectedSource === pocket.name ? pocket.color + '20' : 'rgba(255,255,255,0.03)', 
                      borderColor: selectedSource === pocket.name ? pocket.color : 'rgba(255,255,255,0.08)' 
                    }
                  ]}
                  onPress={() => setSelectedSource(pocket.name as TransferSource)}
                >
                  <View style={[styles.pocketIconWrapper, { backgroundColor: pocket.color }]}>
                    <MaterialCommunityIcons name={pocket.icon as any} size={20} color="#fff" />
                  </View>
                  <Text style={[styles.pocketName, { color: colors.text }]}>{pocket.name}</Text>
                  <Text style={[styles.pocketBalance, { color: colors.secondary }]}>RM {pocket.balance.toFixed(0)}</Text>
                  {selectedSource === pocket.name && (
                    <View style={[styles.pocketSelectedBadge, { backgroundColor: pocket.color }]}>
                      <Feather name="check" size={10} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
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
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'sans-serif-rounded',
    letterSpacing: -0.5,
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
    marginRight: 8,
    marginTop: 8,
    fontFamily: 'sans-serif-rounded',
  },
  heroAmountInput: {
    fontSize: 64,
    fontWeight: '900',
    minWidth: 150,
    textAlign: 'center',
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
