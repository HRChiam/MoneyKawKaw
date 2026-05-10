import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, withTiming, Easing, useAnimatedStyle } from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GradientText } from '@/components/gradient-text';

type OnboardingStep = 'logo' | 'income-expenses' | 'persona' | 'loading';

export default function OnboardingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('logo');
  const [income, setIncome] = useState('');
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  // New state to hold the monetary value for each selected expense
  const [expenseAmounts, setExpenseAmounts] = useState<Record<string, string>>({});
  
  const logoOpacity = useSharedValue(0);

  const expenses = ['Room Rental', 'PTPTN', 'Car Loan', 'Insurance', 'Groceries', 'Utilities', 'Other'];
  const personas = ['Conservative', 'Balanced', 'Aggressive'];

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
    };
  });

  useEffect(() => {
    if (currentStep === 'logo') {
      logoOpacity.value = withTiming(1, {
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
      });
      
      const timer = setTimeout(() => {
        setCurrentStep('income-expenses');
      }, 4000); // slightly faster transition
      return () => clearTimeout(timer);
    }
  }, [currentStep, logoOpacity]);

  useEffect(() => {
    if (currentStep === 'loading') {
      const timer = setTimeout(() => {
        router.replace('../(tabs)/01-home');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, router]);

  const toggleExpense = (expense: string) => {
    setSelectedExpenses(prev => {
      if (prev.includes(expense)) {
        // Clean up the amount if the user deselects the expense
        const newAmounts = { ...expenseAmounts };
        delete newAmounts[expense];
        setExpenseAmounts(newAmounts);
        return prev.filter(e => e !== expense);
      }
      return [...prev, expense];
    });
  };

  const updateExpenseAmount = (expense: string, amount: string) => {
    setExpenseAmounts(prev => ({ ...prev, [expense]: amount }));
  };

  const handleIncomeExpensesNext = () => {
    if (!income || selectedExpenses.length === 0) {
      alert('Please fill in your income and select at least one expense.');
      return;
    }

    // Validate that all selected expenses have an entered amount
    const hasEmptyAmounts = selectedExpenses.some(
      expense => !expenseAmounts[expense] || expenseAmounts[expense].trim() === ''
    );

    if (hasEmptyAmounts) {
      alert('Please enter an amount for all your selected expenses.');
      return;
    }

    setCurrentStep('persona');
  };

  const handlePersonaNext = () => {
    if (!selectedPersona) {
      alert('Please select an investment persona.');
      return;
    }
    setCurrentStep('loading');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {currentStep === 'logo' && (
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <GradientText style={styles.logoTitle}>MoneyKawKaw</GradientText>
        </Animated.View>
      )}

      {currentStep === 'income-expenses' && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <GradientText style={styles.title}>MoneyKawKaw</GradientText>
            <Text style={[styles.subtitle, { color: colors.secondary }]}>Let&apos;s set up your financial baseline</Text>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Monthly Income</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.currencyPrefix, { color: colors.text }]}>RM</Text>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="0.00"
                placeholderTextColor={colors.secondary}
                value={income}
                onChangeText={setIncome}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>What are your fixed expenses?</Text>
            <View style={styles.chipContainer}>
              {expenses.map(expense => (
                <TouchableOpacity
                  key={expense}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selectedExpenses.includes(expense) ? colors.primary : colors.card,
                      borderColor: selectedExpenses.includes(expense) ? colors.primaryEnd : colors.border,
                    },
                  ]}
                  onPress={() => toggleExpense(expense)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      { color: selectedExpenses.includes(expense) ? '#fff' : colors.text },
                    ]}
                  >
                    {expense}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Dynamic Amount Inputs */}
          {selectedExpenses.length > 0 && (
            <Animated.View style={styles.dynamicInputsContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Enter Amounts</Text>
              {selectedExpenses.map(expense => (
                <View key={`input-${expense}`} style={styles.expenseAmountRow}>
                  <Text style={[styles.expenseAmountLabel, { color: colors.text }]}>{expense}</Text>
                  <View style={[styles.expenseInputWrapper, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <Text style={[styles.currencyPrefixSmall, { color: colors.secondary }]}>RM</Text>
                    <TextInput
                      style={[styles.expenseInput, { color: colors.text }]}
                      placeholder="0.00"
                      placeholderTextColor={colors.secondary}
                      value={expenseAmounts[expense] || ''}
                      onChangeText={(text) => updateExpenseAmount(expense, text)}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
              ))}
            </Animated.View>
          )}

          <View style={{ height: 40 }} />
          
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.nextButton, { backgroundColor: colors.primary }]}
              onPress={handleIncomeExpensesNext}
            >
              <Text style={styles.nextButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {currentStep === 'persona' && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          scrollEventThrottle={16}
        >
          <View style={styles.header}>
            <GradientText style={styles.title}>MoneyKawKaw</GradientText>
          </View>

          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Investment Persona</Text>
            <Text style={[styles.description, { color: colors.secondary }]}>
              Choose your approach to growing your wealth
            </Text>
            <View style={styles.personaContainer}>
              {personas.map(persona => (
                <TouchableOpacity
                  key={persona}
                  style={[
                    styles.personaButton,
                    {
                      backgroundColor: selectedPersona === persona ? colors.primary : colors.card,
                      borderColor: selectedPersona === persona ? colors.primaryEnd : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedPersona(persona)}
                >
                  <Text
                    style={[
                      styles.personaText,
                      { color: selectedPersona === persona ? '#fff' : colors.text },
                    ]}
                  >
                    {persona}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {currentStep === 'persona' && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.nextButton, { backgroundColor: colors.primary }]}
            onPress={handlePersonaNext}
          >
            <Text style={styles.nextButtonText}>Finish Setup</Text>
          </TouchableOpacity>
        </View>
      )}

      {currentStep === 'loading' && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text, marginTop: 24 }]}>
            Crunching the numbers...{"\n"}Setting up your custom plan.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTitle: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    fontWeight: '500',
  },
  description: {
    fontSize: 15,
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 60,
  },
  currencyPrefix: {
    fontSize: 20,
    fontWeight: '600',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    height: '100%',
    textAlign: 'right',
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
  },
  dynamicInputsContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(0,0,0,0.02)', // Subtle background to separate it
    padding: 16,
    borderRadius: 16,
  },
  expenseAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  expenseAmountLabel: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  expenseInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    width: 140, // Fixed width for clean alignment
  },
  currencyPrefixSmall: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  expenseInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    height: '100%',
    textAlign: 'right',
  },
  personaContainer: {
    gap: 12,
    marginTop: 16,
  },
  personaButton: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'flex-start',
    borderWidth: 1,
  },
  personaText: {
    fontSize: 18,
    fontWeight: '700',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  nextButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: '600',
    lineHeight: 28,
  },
});