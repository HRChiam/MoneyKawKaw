import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import Animated, { useSharedValue, withTiming, Easing, useAnimatedStyle, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GradientText } from '@/components/gradient-text';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { MOCK_USER_ID, useFinancial } from '@/context/FinancialContext';

type OnboardingStep = 'logo' | 'income-expenses' | 'persona' | 'loading';

export default function OnboardingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('logo');
  const [income, setIncome] = useState('');
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [expenseAmounts, setExpenseAmounts] = useState<Record<string, string>>({});

  const logoOpacity = useSharedValue(0);

  const expenses = ['Rental/House Loan', 'PTPTN', 'Car Loan', 'Insurance', 'Other Loan'];
  const personas = [
    {
      name: 'Conservative',
      desc: 'Prioritize security and reliable saving for emergencies',
      icon: 'shield-check'
    },
    {
      name: 'Balanced',
      desc: 'A steady approach to saving for both needs and future goals',
      icon: 'scale-balance'
    },
    {
      name: 'Aggressive',
      desc: 'Maximize your saving potential with high efficiency',
      icon: 'rocket-launch'
    }
  ];

  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [{ scale: 0.8 + (logoOpacity.value * 0.2) }]
    };
  });

  useEffect(() => {
    if (currentStep === 'logo') {
      logoOpacity.value = withTiming(1, {
        duration: 2000,
        easing: Easing.out(Easing.exp),
      });

      const timer = setTimeout(() => {
        setCurrentStep('income-expenses');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, logoOpacity]);

  const toggleExpense = (expense: string) => {
    setSelectedExpenses(prev => {
      if (prev.includes(expense)) {
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
    const hasEmptyAmounts = selectedExpenses.some(expense => !expenseAmounts[expense]);
    if (hasEmptyAmounts) {
      alert('Please enter an amount for all your selected expenses.');
      return;
    }
    setCurrentStep('persona');
  };

  const { refreshAllData } = useFinancial();

  const handlePersonaNext = async () => {
    if (!selectedPersona) return;

    try {
      setCurrentStep('loading');

      const apiBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';

      const res = await fetch(`${apiBaseUrl}/api/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: MOCK_USER_ID,
          monthly_income: parseFloat(income),
          fixed_expenses: expenseAmounts,
          savings_mode: selectedPersona.toLowerCase() // Sends conservative, balanced, or aggressive mapping keys
        })
      });

      if (res.ok) {
        await refreshAllData();
        router.replace('../(tabs)/01-home');
      } else {
        setCurrentStep('persona');
        alert("Failed to build baseline calculation maps on server backend layer asset tracking nodes.");
      }
    } catch (err) {
      console.error(err);
      setCurrentStep('persona');
    }
  };

  if (currentStep === 'logo') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <GradientText style={styles.logoTitle}>MoneyKawKaw</GradientText>
          <Text style={[styles.logoTagline, { color: colors.secondary }]}>Your Wealth, Your Rules.</Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Progress Indicator */}
      <View style={styles.progressBarRow}>
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <View style={[styles.progressFill, {
            backgroundColor: '#771FFF',
            width: currentStep === 'income-expenses' ? '50%' : '100%'
          }]} />
        </View>
      </View>

      {currentStep === 'income-expenses' && (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInUp.duration(600)}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Financial Profile</Text>
              <Text style={[styles.subtitle, { color: colors.secondary }]}>Let&apos;s set up your monthly baseline</Text>
            </View>

            <View style={styles.glassSection}>
              <Text style={[styles.inputLabel, { color: colors.secondary }]}>MONTHLY INCOME</Text>
              <View style={styles.mainInputRow}>
                <Text style={[styles.currencyPrefix, { color: colors.text }]}>RM</Text>
                <TextInput
                  style={[styles.mainInput, { color: colors.text }]}
                  placeholder="0.00"
                  placeholderTextColor="rgba(255,255,255,0.15)"
                  value={income}
                  onChangeText={setIncome}
                  keyboardType="decimal-pad"
                  autoFocus
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.inputLabel, { color: colors.secondary }]}>MONTHLY FIXED EXPENSES</Text>
              <View style={styles.chipContainer}>
                {expenses.map(expense => {
                  const isSelected = selectedExpenses.includes(expense);
                  return (
                    <TouchableOpacity
                      key={expense}
                      style={[
                        styles.chip,
                        { backgroundColor: isSelected ? '#771FFF' : 'rgba(255,255,255,0.05)' }
                      ]}
                      onPress={() => toggleExpense(expense)}
                    >
                      <Text style={[styles.chipText, { color: isSelected ? '#fff' : colors.secondary }]}>
                        {expense}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {selectedExpenses.length > 0 && (
              <Animated.View entering={FadeInDown} style={styles.dynamicSection}>
                <Text style={[styles.inputLabel, { color: colors.secondary }]}>ENTER AMOUNTS</Text>
                {selectedExpenses.map(expense => (
                  <View key={`input-${expense}`} style={styles.expenseRow}>
                    <Text style={[styles.expenseName, { color: colors.text }]}>{expense}</Text>
                    <View style={styles.smallInputWrapper}>
                      <Text style={[styles.currencyPrefixSmall, { color: colors.secondary }]}>RM</Text>
                      <TextInput
                        style={[styles.smallInput, { color: colors.text }]}
                        placeholder="0"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        value={expenseAmounts[expense] || ''}
                        onChangeText={(text) => updateExpenseAmount(expense, text)}
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </View>
                ))}
              </Animated.View>
            )}
          </Animated.View>
          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      {currentStep === 'persona' && (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Animated.View entering={FadeInUp.duration(600)}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Saving Style</Text>
              <Text style={[styles.subtitle, { color: colors.secondary }]}>Choose how you want to grow</Text>
            </View>

            <View style={styles.personaList}>
              {personas.map(p => {
                const isSelected = selectedPersona === p.name;
                return (
                  <TouchableOpacity
                    key={p.name}
                    activeOpacity={0.8}
                    style={[
                      styles.personaCard,
                      {
                        backgroundColor: isSelected ? 'rgba(119, 31, 255, 0.15)' : 'rgba(255,255,255,0.03)',
                        borderColor: isSelected ? '#771FFF' : 'transparent',
                        borderWidth: isSelected ? 2 : 0
                      }
                    ]}
                    onPress={() => setSelectedPersona(p.name)}
                  >
                    <View style={[styles.personaIconBg, { backgroundColor: isSelected ? '#771FFF' : 'rgba(255,255,255,0.05)' }]}>
                      <MaterialCommunityIcons name={p.icon as any} size={24} color={isSelected ? '#fff' : colors.secondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.personaName, { color: isSelected ? '#fff' : colors.text }]}>{p.name}</Text>
                      <Text style={[styles.personaDesc, { color: colors.secondary }]}>{p.desc}</Text>
                    </View>
                    {isSelected && <Feather name="check-circle" size={20} color="#771FFF" />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
          <View style={{ height: 120 }} />
        </ScrollView>
      )}

      {currentStep !== 'loading' && (
        <View style={[styles.fixedFooter, { backgroundColor: colors.background }]}>
          <TouchableOpacity
            onPress={currentStep === 'income-expenses' ? handleIncomeExpensesNext : handlePersonaNext}
            style={styles.primaryBtnWrapper}
          >
            <LinearGradient
              colors={['#771FFF', '#F8326D']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryBtn}
            >
              <Text style={styles.primaryBtnText}>
                {currentStep === 'income-expenses' ? 'Continue' : 'Finish Setup'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {currentStep === 'loading' && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#771FFF" />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Generating your wealth plan...
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
    fontWeight: '900',
    fontFamily: 'sans-serif-rounded',
    letterSpacing: -1,
  },
  logoTagline: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    fontFamily: 'sans-serif-rounded',
  },
  progressBarRow: {
    paddingHorizontal: 24,
    paddingTop: 12, // Reduced from 60/40 as SafeArea handles notch
    marginBottom: 20,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  scrollContent: {
    flexGrow: 1, // Allow content to fill space dynamically
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    fontFamily: 'sans-serif-rounded',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'sans-serif-rounded',
    marginTop: 8,
  },
  glassSection: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 32,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 16,
    fontFamily: 'sans-serif-rounded',
  },
  mainInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currencyPrefix: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'sans-serif-rounded',
    marginRight: 12,
  },
  mainInput: {
    fontSize: 36,
    fontWeight: '900',
    fontFamily: 'sans-serif-rounded',
    flex: 1,
  },
  section: {
    marginBottom: 32,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 100,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'sans-serif-rounded',
  },
  dynamicSection: {
    marginTop: 8,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  expenseName: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'sans-serif-rounded',
  },
  smallInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  currencyPrefixSmall: {
    fontSize: 14,
    fontWeight: '700',
    marginRight: 4,
  },
  smallInput: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: 'sans-serif-rounded',
    width: 80,
    textAlign: 'right',
  },
  personaList: {
    gap: 16,
  },
  personaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    gap: 16,
  },
  personaIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personaName: {
    fontSize: 18,
    fontWeight: '800',
    fontFamily: 'sans-serif-rounded',
    marginBottom: 4,
  },
  personaDesc: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'sans-serif-rounded',
    lineHeight: 20,
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    backgroundColor: '#0C0121', // Solid background matching theme
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  primaryBtnWrapper: {
    width: '100%',
  },
  primaryBtn: {
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'sans-serif-rounded',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 20,
    fontWeight: '800',
    fontFamily: 'sans-serif-rounded',
    textAlign: 'center',
    marginTop: 32,
    lineHeight: 28,
  },
});