import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function OnboardingScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [income, setIncome] = useState('');
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const expenses = ['Rent/Room', 'PTPTN', 'Car Loan', 'Insurance'];
  const personas = ['Conservative', 'Balanced', 'Aggressive'];

  const toggleExpense = (expense: string) => {
    setSelectedExpenses(prev =>
      prev.includes(expense)
        ? prev.filter(e => e !== expense)
        : [...prev, expense]
    );
  };

  const handleNext = async () => {
    if (!income || selectedExpenses.length === 0 || !selectedPersona) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(tabs)');
    }, 2000);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.primary }]}>Money Kawkaw</Text>
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
            placeholder="Enter monthly input"
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

        {/* Persona Selection */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Investment Persona</Text>
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

      {/* Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            { backgroundColor: colors.primary, borderColor: colors.primaryEnd },
          ]}
          onPress={handleNext}
          disabled={isLoading}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={[styles.loadingOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.7)' }]}>
          <View style={[styles.loadingContent, { backgroundColor: colors.card }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.text, marginTop: 16 }]}>
              Please wait setting up personalised plan.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 40,
    fontWeight: '700',
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
  },
  personaButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  personaText: {
    fontSize: 14,
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    paddingHorizontal: 32,
    paddingVertical: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
