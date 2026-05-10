import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

type TransferSource = 'Main' | 'Saving' | 'Food' | 'Transport' | 'Utilities';

export default function TransactionScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [toAccount, setToAccount] = useState('');
  const [toBank, setToBank] = useState('GXBank');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [selectedSource, setSelectedSource] = useState<TransferSource | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const banks = ['GXBank', 'Maybank', 'CIMB Bank', 'Public Bank', 'RHB Bank'];
  const [showBankPicker, setShowBankPicker] = useState(false);

  const pockets = [
    { name: 'Saving', icon: 'safe', balance: 50.00, color: '#A78BFA' }, // Purple
    { name: 'Food', icon: 'food-fork-drink', balance: 800.00, color: '#FB7185' }, // Rose/Pink
    { name: 'Transport', icon: 'car-side', balance: 200.00, color: '#60A5FA' }, // Sky Blue
    { name: 'Utilities', icon: 'lightning-bolt', balance: 120.00, color: '#FBBF24' }, // Amber
  ];

  const quickAmounts = ['10', '50', '100', '200'];

  // All labels unified to Purple
  const labelColor = '#A78BFA'; 

  // Permanent icon colors
  const iconPalette = {
    recipient: '#A78BFA', // Purple
    amount: '#FBBF24',    // Amber
    source: '#34D399',    // Emerald
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
      setIsConfirmed(true);
    }, 2000);
  };

  const handleDone = () => {
    router.back();
  };

  if (isConfirmed) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Animated.View 
          entering={FadeInDown.duration(600)}
          style={styles.successContainer}
        >
          <View style={[styles.successIconWrapper, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="checkmark-circle" size={100} color={colors.success} />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Transfer Successful!</Text>
          
          <View style={[styles.receiptCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.receiptRow}>
              <Text style={[styles.receiptLabel, { color: colors.secondary }]}>Amount</Text>
              <Text style={[styles.receiptValue, { color: iconPalette.amount }]}>RM {parseFloat(amount).toFixed(2)}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={[styles.receiptLabel, { color: colors.secondary }]}>To Account</Text>
              <Text style={[styles.receiptValue, { color: colors.text }]}>{toAccount}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={[styles.receiptLabel, { color: colors.secondary }]}>Bank</Text>
              <Text style={[styles.receiptValue, { color: colors.text }]}>{toBank}</Text>
            </View>
            <View style={styles.receiptRow}>
              <Text style={[styles.receiptLabel, { color: colors.secondary }]}>From</Text>
              <Text style={[styles.receiptValue, { color: iconPalette.source }]}>{selectedSource} {selectedSource === 'Main' ? 'Account' : 'Pocket'}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.doneButton, { backgroundColor: colors.primary }]}
            onPress={handleDone}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
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
        <Text style={[styles.title, { color: colors.text }]}>Transaction</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.delay(100).duration(500)}>
          
          {/* Recipient Details Section */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: labelColor }]}>TO RECIPIENT</Text>
            
            <TouchableOpacity 
              style={[styles.bankSelector, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowBankPicker(!showBankPicker)}
            >
              <View style={styles.bankInfo}>
                <View style={[styles.iconCircle, { backgroundColor: iconPalette.recipient + '20' }]}>
                  <MaterialCommunityIcons name="bank" size={20} color={iconPalette.recipient} />
                </View>
                <Text style={[styles.bankName, { color: colors.text }]}>{toBank}</Text>
              </View>
              <Feather name={showBankPicker ? "chevron-up" : "chevron-down"} size={20} color={colors.secondary} />
            </TouchableOpacity>

            {showBankPicker && (
              <View style={[styles.bankPickerList, { backgroundColor: colors.card, borderColor: colors.border }]}>
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

            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
              <Feather name="hash" size={18} color={iconPalette.recipient} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Account Number"
                placeholderTextColor={colors.secondary}
                value={toAccount}
                onChangeText={setToAccount}
                keyboardType="number-pad"
              />
            </View>
          </View>

          {/* Amount Section */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: labelColor }]}>AMOUNT</Text>
            <View style={[styles.amountInputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.currencyPrefix, { color: labelColor }]}>RM</Text>
              <TextInput
                style={[styles.amountInput, { color: colors.text }]}
                placeholder="0.00"
                placeholderTextColor={colors.secondary}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={styles.quickAmountRow}>
              {quickAmounts.map(val => (
                <TouchableOpacity 
                  key={val}
                  style={[styles.quickAmountBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => setAmount(val)}
                >
                  <Text style={[styles.quickAmountText, { color: labelColor }]}>RM{val}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Source Account Selection */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: labelColor }]}>FROM SOURCE</Text>
            
            <TouchableOpacity
              style={[
                styles.mainAccountSource,
                { 
                  backgroundColor: colors.card, 
                  borderColor: selectedSource === 'Main' ? iconPalette.source : colors.border 
                }
              ]}
              onPress={() => setSelectedSource('Main')}
            >
              <View style={styles.sourceInfo}>
                <View style={[styles.iconCircle, { backgroundColor: iconPalette.source }]}>
                  <Ionicons name="wallet" size={22} color="#fff" />
                </View>
                <View>
                  <Text style={[styles.sourceName, { color: colors.text }]}>Main Account</Text>
                  <Text style={[styles.sourceBalance, { color: colors.secondary }]}>Available: RM 0.00</Text>
                </View>
              </View>
              {selectedSource === 'Main' && (
                <View style={[styles.selectedBadge, { backgroundColor: iconPalette.source }]}>
                  <Feather name="check" size={12} color="#fff" />
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.pocketHeaderRow}>
              <Text style={[styles.label, { color: labelColor }]}>OR FROM POCKETS</Text>
            </View>
            
            <View style={styles.pocketGrid}>
              {pockets.map((pocket) => (
                <TouchableOpacity
                  key={pocket.name}
                  style={[
                    styles.pocketCard,
                    { 
                      backgroundColor: colors.card, 
                      borderColor: selectedSource === pocket.name ? pocket.color : colors.border 
                    }
                  ]}
                  onPress={() => setSelectedSource(pocket.name as TransferSource)}
                >
                  <View style={[
                    styles.pocketIconWrapper, 
                    { backgroundColor: pocket.color + '20' }
                  ]}>
                    <MaterialCommunityIcons 
                      name={pocket.icon as any} 
                      size={24} 
                      color={pocket.color} 
                    />
                  </View>
                  <Text style={[
                    styles.pocketName, 
                    { color: colors.text }
                  ]}>
                    {pocket.name}
                  </Text>
                  <Text style={[styles.pocketBalance, { color: colors.secondary }]}>
                    RM {pocket.balance.toFixed(0)}
                  </Text>
                  {selectedSource === pocket.name && (
                    <View style={[styles.selectedBadge, { backgroundColor: pocket.color }]}>
                      <Feather name="check" size={12} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Reference Section */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: labelColor }]}>REFERENCE (OPTIONAL)</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="file-text" size={18} color={iconPalette.reference} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Transaction reference"
                placeholderTextColor={colors.secondary}
                value={reference}
                onChangeText={setReference}
              />
            </View>
          </View>

        </Animated.View>
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            { 
              backgroundColor: (!toAccount || !amount || !selectedSource) ? colors.border : colors.primary,
              opacity: (!toAccount || !amount || !selectedSource) ? 0.6 : 1
            }
          ]}
          onPress={handleConfirm}
          disabled={isLoading || !toAccount || !amount || !selectedSource}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Transfer</Text>
          )}
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  section: {
    marginBottom: 28,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  bankSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '700',
  },
  bankPickerList: {
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 4,
    overflow: 'hidden',
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
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  amountInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 80,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 20,
  },
  currencyPrefix: {
    fontSize: 24,
    fontWeight: '800',
    marginRight: 12,
  },
  amountInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '800',
  },
  quickAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  quickAmountBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickAmountText: {
    fontSize: 14,
    fontWeight: '700',
  },
  mainAccountSource: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  sourceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  sourceBalance: {
    fontSize: 12,
    fontWeight: '500',
  },
  pocketHeaderRow: {
    marginBottom: 12,
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
    borderWidth: 1,
    position: 'relative',
  },
  pocketIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  pocketName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  pocketBalance: {
    fontSize: 12,
    fontWeight: '600',
  },
  selectedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
  },
  confirmButton: {
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  successIconWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 24,
    textAlign: 'center',
  },
  receiptCard: {
    width: '100%',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 32,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  receiptLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  receiptValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  doneButton: {
    width: '100%',
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
});
