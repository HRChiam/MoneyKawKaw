import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function LimitAdjustmentScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [income, setIncome] = useState('5000');
  const [expenseAmounts, setExpenseAmounts] = useState<Record<string, string>>({
    'Room Rental': '1200',
    'PTPTN': '200',
    'Car Loan': '800',
    'Insurance': '300',
    'Groceries': '600',
    'Utilities': '250',
    'Other': '0'
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const labelColor = '#A78BFA';

  const updateExpenseAmount = (expense: string, amount: string) => {
    setExpenseAmounts(prev => ({ ...prev, [expense]: amount }));
  };

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setIsSuccess(true);
      
      // Auto-back after showing success
      setTimeout(() => {
        router.back();
      }, 1500);
    }, 1000);
  };

  if (isSuccess) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Animated.View entering={FadeInUp} style={styles.successWrapper}>
          <View style={[styles.successIcon, { backgroundColor: '#34D39920' }]}>
            <Feather name="check" size={48} color="#34D399" />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Limits Updated!</Text>
          <Text style={[styles.successSubtitle, { color: colors.secondary }]}>
            Your daily "Safe to Spend" has been recalculated.
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="x" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Adjust Limits</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(500)}>
          <View style={styles.section}>
            <Text style={[styles.label, { color: labelColor }]}>MONTHLY INCOME</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.currencyPrefix, { color: labelColor }]}>RM</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={income}
                onChangeText={setIncome}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: labelColor }]}>FIXED EXPENSES</Text>
            {Object.keys(expenseAmounts).map(expense => (
              <View key={expense} style={styles.expenseRow}>
                <Text style={[styles.expenseName, { color: colors.text }]}>{expense}</Text>
                <View style={[styles.smallInputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.currencyPrefixSmall, { color: colors.secondary }]}>RM</Text>
                  <TextInput
                    style={[styles.smallInput, { color: colors.text }]}
                    value={expenseAmounts[expense]}
                    onChangeText={(text) => updateExpenseAmount(expense, text)}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.card + '50', borderColor: colors.border }]}>
            <Feather name="info" size={20} color={labelColor} />
            <Text style={[styles.infoText, { color: colors.secondary }]}>
              Changing these values will recalculate your "Safe to Spend" daily limit.
            </Text>
          </View>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: labelColor }, isSaving && { opacity: 0.8 }]}
          onPress={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Adjustments</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: { justifyContent: 'center', alignItems: 'center', padding: 40 },
  successWrapper: { alignItems: 'center' },
  successIcon: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successTitle: { fontSize: 28, fontWeight: '800', marginBottom: 12, textAlign: 'center' },
  successSubtitle: { fontSize: 16, textAlign: 'center', lineHeight: 24, fontWeight: '500' },
  headerRow: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  section: { marginBottom: 32 },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 16 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 64, borderRadius: 20, borderWidth: 1, paddingHorizontal: 20 },
  currencyPrefix: { fontSize: 20, fontWeight: '700', marginRight: 12 },
  input: { flex: 1, fontSize: 24, fontWeight: '800', textAlign: 'right' },
  expenseRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  expenseName: { fontSize: 16, fontWeight: '600' },
  smallInputWrapper: { flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, width: 140 },
  currencyPrefixSmall: { fontSize: 14, fontWeight: '600', marginRight: 8 },
  smallInput: { flex: 1, fontSize: 16, fontWeight: '700', textAlign: 'right' },
  infoCard: { flexDirection: 'row', padding: 20, borderRadius: 20, borderWidth: 1, gap: 16, alignItems: 'center' },
  infoText: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '500' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  saveButton: { height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: '800' },
});
