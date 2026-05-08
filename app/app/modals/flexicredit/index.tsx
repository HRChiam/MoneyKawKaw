import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

const { width } = Dimensions.get('window');

export default function FlexiCreditScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [creditAmount, setCreditAmount] = useState('1000');

  const handleApplyNow = () => {
    alert(`Applied for FlexiCredit: RM${creditAmount}`);
    router.back();
  };

  const generateChartData = () => {
    const amount = parseInt(creditAmount) || 1000;
    return {
      creditValue: (amount * 0.95).toFixed(0),
      interestValue: (amount * 0.15).toFixed(0),
    };
  };

  const chartData = generateChartData();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      scrollEventThrottle={16}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol size={24} name="chevron.left" color={colors.text} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>FlexiCredit</Text>
        </TouchableOpacity>
      </View>

      {/* Credit Amount Input */}
      <View style={styles.section}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>Select credit amount</Text>
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.currencyPrefix, { color: colors.secondary }]}>RM</Text>
          <TextInput
            style={[styles.amountInput, { color: colors.text }]}
            value={creditAmount}
            onChangeText={setCreditAmount}
            keyboardType="numeric"
            placeholder="1000"
            placeholderTextColor={colors.secondary}
          />
        </View>
      </View>

      {/* Simulator Chart */}
      <View
        style={[
          styles.chartContainer,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.chartTitle, { color: colors.text }]}>Simulator</Text>

        <View style={styles.chartContent}>
          {/* Y-Axis Label */}
          <View style={styles.yAxisContainer}>
            <Text style={[styles.yAxisLabel, { color: colors.secondary }]}>Credit Amount</Text>
            <Text style={[styles.yAxisLabelSecond, { color: colors.secondary }]}>Interest</Text>
          </View>

          {/* Chart Bars */}
          <View style={styles.barsContainer}>
            {/* Credit Bar */}
            <View style={styles.barGroup}>
              <View
                style={[
                  styles.bar,
                  {
                    height: '70%',
                    backgroundColor: colors.primary,
                  },
                ]}
              />
              <Text style={[styles.barLabel, { color: colors.text }]}>
                RM{chartData.creditValue}
              </Text>
            </View>

            {/* Interest Line */}
            <View style={styles.barGroup}>
              <View
                style={[
                  styles.interestLine,
                  {
                    height: '40%',
                    borderBottomWidth: 3,
                    borderBottomColor: colors.primaryEnd,
                  },
                ]}
              />
              <Text style={[styles.barLabel, { color: colors.text }]}>
                RM{chartData.interestValue}
              </Text>
            </View>
          </View>

          {/* X-Axis Label */}
          <Text style={[styles.xAxisLabel, { color: colors.secondary }]}>Pay by Month</Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <View
          style={[
            styles.descriptionBox,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.descriptionText, { color: colors.text }]}>
            FlexiCredit is a flexible credit facility that allows you to borrow up to the approved
            limit. Interest is calculated daily based on the outstanding balance. Minimum payment is
            required each month.
          </Text>
        </View>
      </View>

      {/* Apply Now Button */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[
            styles.applyButton,
            { backgroundColor: colors.primary, borderColor: colors.primaryEnd },
          ]}
          onPress={handleApplyNow}
        >
          <Text style={styles.applyButtonText}>Apply Now</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
  },
  chartContainer: {
    marginHorizontal: 16,
    marginVertical: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 180,
  },
  yAxisContainer: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 12,
    height: '100%',
  },
  yAxisLabel: {
    fontSize: 11,
  },
  yAxisLabelSecond: {
    fontSize: 11,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  barGroup: {
    alignItems: 'center',
  },
  bar: {
    width: 30,
    borderRadius: 4,
    marginBottom: 8,
  },
  interestLine: {
    width: 30,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  xAxisLabel: {
    fontSize: 11,
    paddingLeft: 12,
  },
  descriptionBox: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  descriptionText: {
    fontSize: 13,
    lineHeight: 20,
  },
  applyButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
