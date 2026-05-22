import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, DimensionValue } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import Svg, { Path } from 'react-native-svg'; 
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Feather, Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function FlexiCreditScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  // GXBank Palette
  const GXB_PURPLE = '#0C012B'; 
  const GXB_TEAL = '#15FABD'; 
  const GXB_WHITE = '#FFFFFF';
  const GXB_PINK = '#FF00A8';
  const GXB_ORANGE = '#F59E0B';
  const GXB_BAR_PURPLE = '#771fff';

  const [creditAmount, setCreditAmount] = useState('');
  const [interestRateInput, setInterestRateInput] = useState('');
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [monthlyPayment, setMonthlyPayment] = useState(500);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

const parsedAmount = creditAmount === '' ? 1000 : (parseInt(creditAmount) || 0);
  
  const FIXED_RATE = 6.45;
  const parsedRate = FIXED_RATE / 100;

  // --- LOGIC FIX: CALCULATE INTEREST FIRST ---
  const firstMonthInterest = (parsedAmount * parsedRate) / 12;
  
  // Update: Max payment must include the interest to clear in 1 month
  const minPayment = Math.max(parsedAmount * 0.05, 50); 
  const maxPayment = parsedAmount + firstMonthInterest; 
  
  useEffect(() => {
    if (parsedAmount > 0 && monthlyPayment < minPayment) {
      setMonthlyPayment(minPayment);
    }
  }, [parsedAmount, minPayment, monthlyPayment]);

  const generateSimulatorData = () => {
    if (parsedAmount === 0 || parsedRate === 0) return { months: 0, interest: '0', maxInterest: 1 };
    
    // Calculate months: monthlyPayment pays interest first, then principal
    // Formula: Remaining = Previous * (1 + rate/12) - Payment
    let remaining = parsedAmount;
    let monthsToClear = 0;
    let totalInterestPaid = 0;

    while (remaining > 0 && monthsToClear < 120) { // Cap at 10 years
        let interestThisMonth = (remaining * parsedRate) / 12;
        totalInterestPaid += interestThisMonth;
        remaining = remaining + interestThisMonth - monthlyPayment;
        monthsToClear++;
    }

    return {
      months: monthsToClear,
      interest: totalInterestPaid.toFixed(2),
      maxInterest: (parsedAmount * parsedRate * (parsedAmount / minPayment)) / 12,
    };
  };

  const { months, interest, maxInterest } = generateSimulatorData();
  const actualInterestPortion = Math.min(monthlyPayment, firstMonthInterest); 
  const actualPrincipalPortion = monthlyPayment - actualInterestPortion;
  const interestRatio = monthlyPayment > 0 ? (actualInterestPortion / monthlyPayment) * 100 : 0;
  const principalRatio = monthlyPayment > 0 ? (actualPrincipalPortion / monthlyPayment) * 100 : 0;

  // Chart UI Logic
  const CHART_TRACK_HEIGHT = 160; 
  const BAR_DISTANCE = 160; 
  const BAR_WIDTH = 34;
  const OVERHANG = 30; 

  const pPercent = Math.min(Math.max((monthlyPayment / (maxPayment || 1)) * 100, 5), 100);
  const iPercent = Math.min(Math.max((Number(interest) / (maxInterest || 1)) * 100, 5), 100);

  const leftTopY = CHART_TRACK_HEIGHT - (CHART_TRACK_HEIGHT * (pPercent / 100));
  const rightTopY = CHART_TRACK_HEIGHT - (CHART_TRACK_HEIGHT * (iPercent / 100));
  const leftX = OVERHANG + (BAR_WIDTH / 2);
  const rightX = leftX + BAR_DISTANCE;
  const totalSvgWidth = rightX + (BAR_WIDTH / 2) + OVERHANG;

  const curvedLinePath = `M 0 ${leftTopY} L ${leftX} ${leftTopY} C ${leftX + BAR_DISTANCE/2} ${leftTopY}, ${leftX + BAR_DISTANCE/2} ${rightTopY}, ${rightX} ${rightTopY} L ${totalSvgWidth} ${rightTopY}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 🎯 UNIFIED STANDARD ADAPTIVE TOP BAR HEADER */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          FlexiCredit
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} scrollEventThrottle={16} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={[styles.infoBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="information-circle" size={20} color={GXB_BAR_PURPLE} style={{ marginRight: 10, marginTop: 1 }} />
            <Text style={[styles.infoText, { color: colors.text }]}>
              Enter your details below to calculate your monthly repayment instantly.
            </Text>
          </View>
        </View>
        
        {/* Input Parameters Reference Bar */}
        <View style={styles.section}>
          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Credit Amount</Text>
              <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.currencyPrefix, { color: colors.secondary }]}>RM</Text>
                <TextInput
                  style={[styles.amountInput, { color: colors.text }]}
                  value={creditAmount}
                  onChangeText={setCreditAmount}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor={colorScheme === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)'}
                />
              </View>
            </View>

            <View style={styles.inputHalf}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Interest Rate</Text>
              {/* 🚀 FIXED: Added styles.rateInputContainer to align elements to the far sides */}
              <View style={[styles.inputContainer, styles.rateInputContainer, { backgroundColor: colors.card, borderColor: colors.border, opacity: 0.85 }]}>
                <Text style={[styles.staticRateText, { color: colors.text }]}>
                  {FIXED_RATE.toFixed(2)}
                </Text>
                <Text style={[styles.currencyPrefix, { color: colors.secondary }]}>% p.a.</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Visual Graph Dashboard Card Wrapper */}
        <View style={[styles.chartContainer, { backgroundColor: GXB_PURPLE, borderColor: 'rgba(21, 250, 189, 0.2)' }]}>
          <View style={styles.chartHeader}>
            <Text style={[styles.chartTitle, { color: GXB_WHITE }]}>Credit Simulator Engine</Text>
            <IconSymbol size={20} name="sparkles" color={GXB_TEAL} />
          </View>

          {/* Render Vector Graph Output */}
          <View style={styles.graphWrapper}>
            <View style={{ width: BAR_DISTANCE + BAR_WIDTH, flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={[styles.barGroup, { zIndex: 10 }]}>
                <Text style={[styles.barLabelTop, { color: GXB_WHITE }]}>RM {monthlyPayment.toFixed(2)}</Text>
                <View style={[styles.barTrack, { backgroundColor: 'rgba(255,255,255,0.1)', height: CHART_TRACK_HEIGHT, width: BAR_WIDTH }]}>
                  <View style={[styles.barFill, { height: `${pPercent}%`, overflow: 'hidden' }]}>
                    <View style={{ height: `${interestRatio}%`, backgroundColor: GXB_ORANGE, width: '100%' }} />
                    <View style={{ height: `${principalRatio}%`, backgroundColor: GXB_BAR_PURPLE, width: '100%' }} />
                  </View>
                </View>
                <Text style={[styles.barLabelBottom, { color: 'rgba(255,255,255,0.5)' }]}>Pay/Month</Text>
              </View>

              <View style={{ position: 'absolute', top: 24, left: -OVERHANG, right: -OVERHANG, height: CHART_TRACK_HEIGHT, zIndex: 20 }} pointerEvents="none">
                <Svg height="100%" width="100%" viewBox={`0 0 ${totalSvgWidth} ${CHART_TRACK_HEIGHT}`}>
                  <Path d={curvedLinePath} fill="none" stroke={GXB_BAR_PURPLE} strokeWidth="2" strokeLinecap="round" opacity={0.2} />
                </Svg>
              </View>

              <View style={[styles.barGroup, { zIndex: 1 }]}>
                <Text style={[styles.barLabelTop, { color: GXB_WHITE }]}>RM {interest}</Text>
                <View style={[styles.barTrack, { backgroundColor: 'rgba(255,255,255,0.1)', height: CHART_TRACK_HEIGHT, width: BAR_WIDTH }]}>
                  <View style={[styles.barFill, { height: `${iPercent}%`, backgroundColor: GXB_ORANGE }]} />
                </View>
                <Text style={[styles.barLabelBottom, { color: 'rgba(255,255,255,0.5)' }]}>Total Interest</Text>
              </View>
            </View>
          </View>

          {/* Timeframe Progress Tracking Banner */}
          <View style={[styles.statusBadge, { backgroundColor: months > 24 ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', borderColor: months > 24 ? GXB_ORANGE : '#10B981', borderWidth: 1 }]}>
            <Text style={{ fontSize: 15, color: months > 24 ? GXB_ORANGE : '#10B981', fontWeight: '900', textAlign: 'center', fontFamily: 'sans-serif-rounded' }}>
              {months > 24 ? `⚠️ Slow Velocity: Clearing in ${months} months` : `✨ Fast Track Vector: Clearing in ${months} months`}
            </Text>
          </View>

          {/* Repayment Dynamic Slider Metric Controller */}
          <View style={styles.sliderValueContainer}>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: '800', marginBottom: 6, letterSpacing: 1, fontFamily: 'sans-serif-rounded' }}>MONTHLY REPAYMENT AMOUNT</Text>
            <Text style={[styles.sliderHeroText, { color: GXB_TEAL }]}>
              RM {Math.floor(monthlyPayment).toLocaleString()}<Text style={{ fontSize: 16, color: GXB_WHITE }}> / month</Text>
            </Text>
          </View>

          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={minPayment}
            maximumValue={maxPayment}
            step={10}
            value={monthlyPayment}
            onValueChange={(val) => { setMonthlyPayment(val); setHasInteracted(true); }}
            minimumTrackTintColor={GXB_TEAL}
            maximumTrackTintColor="rgba(255,255,255,0.2)"
            thumbTintColor={GXB_TEAL}
          />

          {/* Sub-Card Breakdown Details Section */}
          <View style={[styles.breakdownContainer, { backgroundColor: 'rgba(0,0,0,0.3)', marginTop: 24 }]}>
            <Text style={[styles.breakdownTitle, { color: 'rgba(255,255,255,0.4)' }]}>REPAYMENT VOLUMETRIC SPLIT</Text>

            {/* 🚀 ROW 1: PRINCIPAL */}
            <View style={styles.breakdownRow}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.indicatorDot, { backgroundColor: GXB_BAR_PURPLE }]} />
                <Text style={[styles.breakdownLabel, { color: GXB_WHITE }]}>Principal Portion</Text>
              </View>
              <Text style={[styles.breakdownValue, { color: GXB_WHITE }]}>RM {actualPrincipalPortion.toFixed(2)}</Text>
            </View>

            {/* 🚀 ROW 2: INTEREST */}
            <View style={[styles.breakdownRow, { marginBottom: 0 }]}>
              <View style={styles.breakdownLeft}>
                <View style={[styles.indicatorDot, { backgroundColor: GXB_ORANGE }]} />
                <Text style={[styles.breakdownLabel, { color: GXB_WHITE }]}>Interest</Text>
              </View>
              <Text style={[styles.breakdownValue, { color: GXB_ORANGE }]}>RM{actualInterestPortion.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={[styles.applyButton, { backgroundColor: GXB_BAR_PURPLE }]}>
            <Text style={[styles.applyButtonText, { color: GXB_WHITE }]}>Review & Submit Application</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    flex: 1,
    fontFamily: 'sans-serif-rounded',
  },
  infoBanner: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    fontFamily: 'sans-serif-rounded',
  },
  section: { paddingHorizontal: 16, marginVertical: 8 },
  inputRow: { flexDirection: 'row', gap: 12 },
  inputHalf: { flex: 1 },
  inputLabel: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 56,
  },
  rateInputContainer: { justifyContent: 'space-between' },
  currencyPrefix: { fontSize: 16, fontWeight: '700', marginRight: 4 },
  amountInput: { flex: 1, fontSize: 16, fontWeight: '600', fontFamily: 'sans-serif-rounded', paddingVertical: 0 },
  chartContainer: { marginHorizontal: 16, marginVertical: 12, borderRadius: 24, padding: 20, borderWidth: 1.5 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  chartTitle: { fontSize: 18, fontWeight: '800' },
  graphWrapper: { alignItems: 'center', marginBottom: 24 },
  barGroup: { alignItems: 'center' }, 
  barTrack: { borderRadius: 10, justifyContent: 'flex-end', marginVertical: 8 },
  barFill: { width: '100%', borderRadius: 10 },
  barLabelTop: { fontSize: 14, fontWeight: '800' },
  barLabelBottom: { fontSize: 12, fontWeight: '700' },
  breakdownContainer: {
    borderRadius: 18,
    padding: 20,          
  },
  breakdownTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 16,    
    fontFamily: 'sans-serif-rounded'
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 14 
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12     
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'sans-serif-rounded'
  },
  breakdownValue: {
    fontSize: 15,
    fontWeight: '800',
    fontFamily: 'sans-serif-rounded',
    textAlign: 'right'   
  },
  staticRateText: { fontSize: 16, fontWeight: '700', fontFamily: 'sans-serif-rounded' }, // 🚀 FIXED: ADDED TO STYLESHEET MATRIX
  statusBadge: { paddingVertical: 12, borderRadius: 16, marginBottom: 24 },
  sliderValueContainer: { alignItems: 'center', marginBottom: 12 },
  sliderHeroText: { fontSize: 32, fontWeight: '900' },
  applyButton: { paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  applyButtonText: { fontSize: 16, fontWeight: '900' },
});