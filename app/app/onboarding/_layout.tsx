import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type OnboardingStep = 'logo' | 'income-expenses' | 'persona' | 'loading';

export default function OnboardingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [currentStep, setCurrentStep] = useState<OnboardingStep>('logo');
  const [income, setIncome] = useState('');
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);

  const expenses = ['Room Rental', 'PTPTN', 'Car Loan', 'Insurance'];
  const personas = ['Conservative', 'Balanced', 'Aggressive'];

  // Auto-transition from logo screen after 2 seconds
  useEffect(() => {
    if (currentStep === 'logo') {
      const timer = setTimeout(() => {
        setCurrentStep('income-expenses');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  // Auto-transition from loading screen after 3 seconds
  useEffect(() => {
    if (currentStep === 'loading') {
      const timer = setTimeout(() => {
        router.replace('/(tabs)/01-home');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, router]);

  const toggleExpense = (expense: string) => {
    setSelectedExpenses(prev =>
      prev.includes(expense)
        ? prev.filter(e => e !== expense)
        : [...prev, expense]
    );
  };

  const handleIncomeExpensesNext = () => {
    if (!income || selectedExpenses.length === 0) {
      alert('Please fill in all fields');
      return;
    }
    setCurrentStep('persona');
  };

  const handlePersonaNext = () => {
    if (!selectedPersona) {
      alert('Please select a persona');
      return;
    }
    setCurrentStep('loading');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {currentStep === 'logo' && (
        // Screen 1: Logo Screen
        <View style={styles.logoContainer}>
          <Text style={[styles.logoTitle, { color: colors.primary }]}>MoneyKawKaw</Text>
        </View>
      )}

      {currentStep === 'income-expenses' && (
        // Screen 2: Income & Expenses Screen
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          scrollEventThrottle={16}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.primary }]}>MoneyKawKaw</Text>
          </View>

          {/* Income Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Monthly Income</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              placeholder="Enter your estimated monthly income"
              placeholderTextColor={colors.secondary}
              value={income}
              onChangeText={setIncome}
              keyboardType="numeric"
            />
          </View>

          {/* Fixed Expenses */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Fixed Expenses</Text>
            <View style={styles.chipContainer}>
              {expenses.map(expense => (
                <TouchableOpacity
                  key={expense}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: selectedExpenses.includes(expense)
                        ? colors.primary
                        : colors.card,
                      borderColor: selectedExpenses.includes(expense)
                        ? colors.primaryEnd
                        : colors.border,
                    },
                  ]}
                  onPress={() => toggleExpense(expense)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: selectedExpenses.includes(expense) ? '#fff' : colors.text,
                      },
                    ]}
                  >
                    {expense}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ height: 40 }} />
          
          {/* Next Button */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.nextButton,
                { backgroundColor: colors.primary, borderColor: colors.primaryEnd },
              ]}
              onPress={handleIncomeExpensesNext}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        
      )}

      {currentStep === 'persona' && (
        // Screen 3: Persona Selection Screen
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          scrollEventThrottle={16}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.primary }]}>Money Kawkaw</Text>
          </View>

          {/* Persona Selection */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.text }]}>Investment Persona</Text>
            <Text style={[styles.description, { color: colors.secondary }]}>
              Choose your investment strategy
            </Text>
            <View style={styles.personaContainer}>
              {personas.map(persona => (
                <TouchableOpacity
                  key={persona}
                  style={[
                    styles.personaButton,
                    {
                      backgroundColor: selectedPersona === persona
                        ? colors.primary
                        : colors.card,
                      borderColor: selectedPersona === persona
                        ? colors.primaryEnd
                        : colors.border,
                    },
                  ]}
                  onPress={() => setSelectedPersona(persona)}
                >
                  <Text
                    style={[
                      styles.personaText,
                      {
                        color: selectedPersona === persona ? '#fff' : colors.text,
                      },
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
        /* Next Button for Persona Screen */
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.nextButton,
              { backgroundColor: colors.primary, borderColor: colors.primaryEnd },
            ]}
            onPress={handlePersonaNext}
          >
            <Text style={styles.nextButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}

      {currentStep === 'loading' && (
        // Screen 4: Loading Screen
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text, marginTop: 24 }]}>
            Please wait setting up personalised plan.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTitle: {
    fontSize: 48,
    fontWeight: '700',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    marginTop: 8,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  personaContainer: {
    gap: 12,
    marginTop: 16,
  },
  personaButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  personaText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  nextButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});
