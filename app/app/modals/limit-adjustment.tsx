import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useState, useEffect, useMemo } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { useFinancial, MOCK_USER_ID } from '@/context/FinancialContext';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';

export default function LimitAdjustmentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { income: ctxIncome, pockets, updateSalary, updatePocketLimit, refreshAllData } = useFinancial();

  const [income, setLocalIncome] = useState(ctxIncome.toString());
  const [pocketLimits, setLocalPocketLimits] = useState<Record<string, string>>({});
  const [isFetchingForecast, setIsFetchingForecast] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const labelColor = '#771FFF';

  // Initialize with current pocket limits
  useEffect(() => {
    if (pockets.length > 0 && Object.keys(pocketLimits).length === 0) {
      const initialLimits: Record<string, string> = {};
      pockets.forEach(p => {
        initialLimits[p.id] = p.monthlyLimit.toString();
      });
      setLocalPocketLimits(initialLimits);
    }
  }, [pockets]);

  // Fetch forecast if requested via params
  useEffect(() => {
    if (params.source === 'forecast') {
      fetchForecast();
    }
  }, [params.source]);

  const fetchForecast = async () => {
    setIsFetchingForecast(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/${MOCK_USER_ID}/lifestyle-forecast`);
      if (res.ok) {
        const data = await res.json();
        const suggested = data.pocket_allocations || {};
        const savingsLocked = data.savings_locked || 0;
        
        const newLimits: Record<string, string> = { ...pocketLimits };
        
        // Map suggested amounts to pocket IDs
        pockets.forEach(p => {
          if (p.name === 'Savings') {
            newLimits[p.id] = savingsLocked.toString();
          } else if (suggested[p.id] !== undefined) {
            newLimits[p.id] = suggested[p.id].toString();
          }
        });
        
        setLocalPocketLimits(newLimits);
      }
    } catch (error) {
      console.error("Failed to fetch lifestyle forecast:", error);
    } finally {
      setIsFetchingForecast(false);
    }
  };

  const updatePocketAmount = (id: string, amount: string) => {
    setLocalPocketLimits(prev => ({ ...prev, [id]: amount }));
  };

  const totalAllocated = useMemo(() => {
    return Object.values(pocketLimits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  }, [pocketLimits]);

  const remainingBudget = useMemo(() => {
    return (parseFloat(income) || 0) - totalAllocated;
  }, [income, totalAllocated]);

  const isOverBudget = remainingBudget < -0.01; // Small threshold for float precision

  const handleSave = async () => {
    if (isOverBudget) {
      Alert.alert("Budget Error", "Total allocated limits cannot exceed your monthly income.");
      return;
    }

    setIsSaving(true);
    
    try {
      // 1. Update salary if changed
      if (parseFloat(income) !== ctxIncome) {
        await updateSalary(Number(income));
      }
      
      // 2. Update each pocket limit
      const updatePromises = Object.entries(pocketLimits).map(([id, amount]) => {
        const pocket = pockets.find(p => p.id === id);
        if (pocket && pocket.monthlyLimit !== parseFloat(amount)) {
          return updatePocketLimit(id, Number(amount));
        }
        return Promise.resolve(true);
      });
      
      await Promise.all(updatePromises);
      await refreshAllData();
      
      setIsSuccess(true);
      setTimeout(() => {
        router.back();
      }, 1500);
    } catch (error) {
      console.error("Failed to update financial constraints:", error);
      Alert.alert("Error", "Failed to save adjustments. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isSuccess) {
    return (
      <View style={[styles.centerContent, { backgroundColor: colors.background, flex: 1 }]}>
        <Animated.View entering={FadeInUp} style={styles.successWrapper}>
          <View style={[styles.successIcon, { backgroundColor: '#34D39920' }]}>
            <Feather name="check" size={48} color="#34D399" />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Limits Updated!</Text>
          <Text style={[styles.successSubtitle, { color: colors.secondary }]}>
            Your daily &quot;Safe to Spend&quot; has been recalculated.
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
        <TouchableOpacity 
          onPress={fetchForecast} 
          style={styles.forecastButton}
          disabled={isFetchingForecast}
        >
          {isFetchingForecast ? (
            <ActivityIndicator size="small" color={labelColor} />
          ) : (
            <Feather name="zap" size={20} color={labelColor} />
          )}
        </TouchableOpacity>
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
                onChangeText={setLocalIncome}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.label, { color: labelColor }]}>POCKET LIMITS</Text>
              <Text style={[styles.remainingText, { color: isOverBudget ? '#FB7185' : colors.secondary }]}>
                {isOverBudget ? 'Over by ' : 'Remaining: '} 
                RM{Math.abs(remainingBudget).toFixed(2)}
              </Text>
            </View>
            
            {pockets.map(pocket => (
              <View key={pocket.id} style={styles.expenseRow}>
                <View style={styles.pocketInfo}>
                  <Text style={[styles.expenseName, { color: colors.text }]}>{pocket.name}</Text>
                  {pocket.isFixed && <Text style={styles.fixedBadge}>FIXED</Text>}
                </View>
                <View style={[styles.smallInputWrapper, { backgroundColor: colors.card, borderColor: isOverBudget ? '#FB7185' : colors.border }]}>
                  <Text style={[styles.currencyPrefixSmall, { color: colors.secondary }]}>RM</Text>
                  <TextInput
                    style={[styles.smallInput, { color: colors.text }]}
                    value={pocketLimits[pocket.id]}
                    onChangeText={(text) => updatePocketAmount(pocket.id, text)}
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>
            ))}
          </View>

          <View style={[styles.infoCard, { backgroundColor: colors.card + '50', borderColor: colors.border }]}>
            <Feather name="info" size={20} color={labelColor} />
            <Text style={[styles.infoText, { color: colors.secondary }]}>
              Total allocated: RM{totalAllocated.toFixed(2)}. This must not exceed your monthly income.
            </Text>
          </View>
        </Animated.View>

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[
            styles.saveButton, 
            { backgroundColor: labelColor }, 
            (isSaving || isOverBudget) && { opacity: 0.6 }
          ]}
          onPress={handleSave}
          disabled={isSaving || isOverBudget}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isOverBudget ? 'Over Budget' : 'Save Adjustments'}
            </Text>
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
  headerRow: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  forecastButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800' },
  scrollContent: { paddingHorizontal: 20, paddingTop: 20 },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  label: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5 },
  remainingText: { fontSize: 12, fontWeight: '700' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', height: 64, borderRadius: 20, borderWidth: 1, paddingHorizontal: 20, marginTop: 12 },
  currencyPrefix: { fontSize: 20, fontWeight: '700', marginRight: 12 },
  input: { flex: 1, fontSize: 24, fontWeight: '800', textAlign: 'right' },
  expenseRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  pocketInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  expenseName: { fontSize: 16, fontWeight: '600' },
  fixedBadge: { fontSize: 9, fontWeight: '800', backgroundColor: '#E5E7EB', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  smallInputWrapper: { flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, width: 140 },
  currencyPrefixSmall: { fontSize: 14, fontWeight: '600', marginRight: 8 },
  smallInput: { flex: 1, fontSize: 16, fontWeight: '700', textAlign: 'right' },
  infoCard: { flexDirection: 'row', padding: 20, borderRadius: 20, borderWidth: 1, gap: 16, alignItems: 'center' },
  infoText: { flex: 1, fontSize: 14, lineHeight: 20, fontWeight: '500' },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  saveButton: { height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: '800' },
});
