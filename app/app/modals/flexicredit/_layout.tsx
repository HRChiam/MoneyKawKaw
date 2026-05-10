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
  
  const [creditAmount, setCreditAmount] = useState('1000');
  const [interestRateInput] = useState('6.45');
  const [monthlyPayment, setMonthlyPayment] = useState(50);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  const parsedAmount = parseInt(creditAmount) || 0;
  const parsedRate = (parseFloat(interestRateInput) || 0) / 100; 
  const minPayment = Math.max(parsedAmount * 0.05, 50); 
  const maxPayment = parsedAmount > minPayment ? parsedAmount : minPayment + 100;
  
  useEffect(() => {
    if (monthlyPayment < minPayment) {
      setMonthlyPayment(minPayment);
    }
  }, [parsedAmount, minPayment, monthlyPayment]);

  const generateSimulatorData = () => {
    if (parsedAmount === 0 || parsedRate === 0) return { months: 0, interest: 0, maxInterest: 1 };
    
    const monthsToClear = Math.ceil(parsedAmount / monthlyPayment);
    const totalInterest = (parsedAmount * parsedRate * monthsToClear) / 12;

    const maxMonths = Math.ceil(parsedAmount / minPayment);
    const maxInterest = (parsedAmount * parsedRate * maxMonths) / 12;

    return {
      months: monthsToClear,
      interest: totalInterest.toFixed(0),
      maxInterest: maxInterest > 0 ? maxInterest : 1,
    };
  };

  const { months, interest, maxInterest } = generateSimulatorData();

  // --- STACKED BAR MATH ---
  const firstMonthInterest = (parsedAmount * parsedRate) / 12;
  const actualInterestPortion = Math.min(monthlyPayment, firstMonthInterest); 
  const actualPrincipalPortion = monthlyPayment - actualInterestPortion;

  const interestRatio = (actualInterestPortion / monthlyPayment) * 100;
  const principalRatio = (actualPrincipalPortion / monthlyPayment) * 100;

  // --- CHART DIMENSIONS & MATH ---
  const CHART_TRACK_HEIGHT = 160; 
  const BAR_DISTANCE = 160; 
  const BAR_WIDTH = 32;
  const OVERHANG = 30; 

  const pPercent = Math.max((monthlyPayment / maxPayment) * 100, 5);
  const iPercent = Math.max((Number(interest) / maxInterest) * 100, 5);

  const paymentHeight: DimensionValue = `${pPercent}%`;
  const interestHeight: DimensionValue = `${iPercent}%`;

  const leftTopY = CHART_TRACK_HEIGHT - (CHART_TRACK_HEIGHT * (pPercent / 100));
  const rightTopY = CHART_TRACK_HEIGHT - (CHART_TRACK_HEIGHT * (iPercent / 100));
  
  const leftX = OVERHANG + (BAR_WIDTH / 2);
  const rightX = leftX + BAR_DISTANCE;
  const totalSvgWidth = rightX + (BAR_WIDTH / 2) + OVERHANG;

  const curvedLinePath = `
    M 0 ${leftTopY} 
    L ${leftX} ${leftTopY} 
    C ${leftX + BAR_DISTANCE/2} ${leftTopY}, 
      ${leftX + BAR_DISTANCE/2} ${rightTopY}, 
      ${rightX} ${rightTopY} 
    L ${totalSvgWidth} ${rightTopY}
  `;

  const handleApplyNow = () => {
    setIsApplied(true);
    // Auto-close or navigate after showing success
    setTimeout(() => {
      router.back();
    }, 2500);
  };

  if (isApplied) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
        <Animated.View entering={FadeInDown.duration(600)} style={styles.successWrapper}>
          <View style={[styles.successIcon, { backgroundColor: '#15fabd20' }]}>
            <Ionicons name="checkmark-circle" size={100} color="#15fabd" />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Application Submitted!</Text>
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
             <View style={styles.summaryRow}>
               <Text style={[styles.summaryLabel, { color: colors.secondary }]}>Amount</Text>
               <Text style={[styles.summaryValue, { color: colors.text }]}>RM {parseFloat(creditAmount).toFixed(2)}</Text>
             </View>
             <View style={styles.summaryRow}>
               <Text style={[styles.summaryLabel, { color: colors.secondary }]}>Interest Rate</Text>
               <Text style={[styles.summaryValue, { color: colors.text }]}>{interestRateInput}% p.a.</Text>
             </View>
          </View>
          <Text style={[styles.successSubtitle, { color: colors.secondary }]}>
            We&apos;re processing your application. You&apos;ll receive a notification shortly.
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} scrollEventThrottle={16}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>FlexiCredit</Text>
      </View>

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
                        placeholder="1000"
                    />
                </View>
            </View>
            <View style={styles.inputHalf}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Interest Rate</Text>
                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border, opacity: 0.7 }]}>
                    <TextInput
                        style={[styles.amountInput, { color: colors.text, textAlign: 'right' }]}
                        value={interestRateInput}
                        editable={false}
                    />
                    <Text style={[styles.currencyPrefix, { color: colors.secondary, marginLeft: 4, marginRight: 0 }]}>%</Text>
                </View>
                <Text style={{ fontSize: 10, color: colors.secondary, marginTop: 6, fontStyle: 'italic' }}>
                    *changed based on credit score
                </Text>
            </View>
        </View>
      </View>

      <View style={[styles.chartContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Credit Simulator</Text>
            <IconSymbol size={20} name="sparkles" color={colors.primary} />
        </View>

        <View style={styles.graphWrapper}>
            <View style={{ width: BAR_DISTANCE + BAR_WIDTH, flexDirection: 'row', justifyContent: 'space-between' }}>
                
                {/* 1. Left Column (STACKED: Payment) */}
                <View style={[styles.barGroup, { zIndex: 10, elevation: 10 }]}>
                    <Text style={[styles.barLabelTop, {color: colors.text}]}>RM {Math.floor(monthlyPayment)}</Text>
                    
                    <TouchableOpacity 
                        activeOpacity={0.9} 
                        onPress={() => setShowBreakdown(!showBreakdown)}
                        style={[styles.barTrack, {backgroundColor: colorScheme === 'dark' ? '#333' : '#f3f4f6', height: CHART_TRACK_HEIGHT, width: BAR_WIDTH}]}
                    >
                        <View style={[styles.barFill, { height: paymentHeight, overflow: 'hidden' }]}>
                            <View style={{ height: `${interestRatio}%`, backgroundColor: '#ec4899', width: '100%' }} />
                            <View style={{ height: `${principalRatio}%`, backgroundColor: '#8b5cf6', width: '100%' }} />
                        </View>
                    </TouchableOpacity>

                    <Text style={[styles.barLabelBottom, {color: colors.secondary}]}>Pay/Month</Text>
                    <Text style={{fontSize: 10, color: colors.primary, marginTop: 2}}>(Tap Bar)</Text>

                    {showBreakdown && (
                        <View style={[styles.tooltipOverlay, { backgroundColor: colors.text }]}>
                            <View style={styles.tooltipRow}>
                                <View style={[styles.tooltipDot, { backgroundColor: '#8b5cf6' }]} />
                                <Text style={[styles.tooltipText, { color: colors.background }]}>Loan: RM {actualPrincipalPortion.toFixed(0)}</Text>
                            </View>
                            <View style={styles.tooltipRow}>
                                <View style={[styles.tooltipDot, { backgroundColor: '#ec4899' }]} />
                                <Text style={[styles.tooltipText, { color: colors.background }]}>Interest: RM {actualInterestPortion.toFixed(0)}</Text>
                            </View>
                            <View style={styles.tooltipArrow} />
                        </View>
                    )}
                </View>

                {/* 2. The Smooth Extended SVG Line (Solid) - PUSHED TO THE FRONT */}
                <View style={{ position: 'absolute', top: 24, left: -OVERHANG, right: -OVERHANG, height: CHART_TRACK_HEIGHT, zIndex: 20, elevation: 20 }} pointerEvents="none">
                    <Svg height="100%" width="100%" viewBox={`0 0 ${totalSvgWidth} ${CHART_TRACK_HEIGHT}`}>
                        <Path 
                            d={curvedLinePath} 
                            fill="none" 
                            stroke={colors.text} 
                            strokeWidth="1.5" 
                            strokeLinecap="round"
                        />
                    </Svg>
                </View>

                {/* 3. Right Column (Interest Pile) */}
                <View style={[styles.barGroup, { zIndex: 1, elevation: 1 }]}>
                    <Text style={[styles.barLabelTop, {color: colors.text}]}>RM {interest}</Text>
                    <View style={[styles.barTrack, {backgroundColor: colorScheme === 'dark' ? '#333' : '#f3f4f6', height: CHART_TRACK_HEIGHT, width: BAR_WIDTH}]}>
                        <View style={[styles.barFill, { height: interestHeight, backgroundColor: months > 24 ? '#ef4444' : '#f97316' }]} />
                    </View>
                    <Text style={[styles.barLabelBottom, {color: colors.secondary}]}>Total Interest</Text>
                    <View style={{ height: 14, marginTop: 2 }} /> 
                </View>

            </View>
        </View>

        <Text style={{ textAlign: 'center', fontSize: 13, color: months > 24 ? '#ef4444' : '#16a34a', fontWeight: '600', marginBottom: 24 }}>
            {months > 24 ? `⚠️ This will take ${months} months to clear.` : `✨ Great! You will clear this in just ${months} months.`}
        </Text>

        <View style={styles.sliderValueContainer}>
            <Text style={{ fontSize: 13, color: colors.secondary, fontWeight: '600' }}>You choose to pay:</Text>
            <Text style={[styles.sliderHeroText, { color: colors.primary }]}>
                RM {Math.floor(monthlyPayment)} <Text style={{fontSize: 16, color: colors.text, fontWeight: '600'}}>/ month</Text>
            </Text>
        </View>

        <Slider
          style={{ width: '100%', height: 40 }}
          minimumValue={minPayment}
          maximumValue={maxPayment}
          step={10}
          value={monthlyPayment}
          onValueChange={(val) => {
            setMonthlyPayment(val);
            setHasInteracted(true); 
            setShowBreakdown(false); 
          }}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
        />
        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: -5, marginBottom: 10}}>
            <Text style={{fontSize: 12, color: colors.secondary}}>Min: RM{minPayment}</Text>
            <Text style={{fontSize: 12, color: colors.secondary}}>Max: RM{parsedAmount}</Text>
        </View>
      </View>

      <View style={styles.section}>
        {!hasInteracted && (
            <Text style={{fontSize: 12, color: '#f97316', textAlign: 'center', marginBottom: 12, fontStyle: 'italic'}}>
                *Adjust the repayment slider above to see the impact before applying.
            </Text>
        )}
        <TouchableOpacity
          style={[
            styles.applyButton,
            { backgroundColor: hasInteracted ? colors.primary : 'transparent', borderColor: hasInteracted ? colors.primary : colors.border }
          ]}
          onPress={handleApplyNow}
          disabled={!hasInteracted}
        >
          <Text style={[styles.applyButtonText, { color: hasInteracted ? '#fff' : colors.secondary }]}>
            I Understand, Apply Now
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
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
  section: { paddingHorizontal: 16, marginVertical: 16 },
  
  inputRow: { flexDirection: 'row', gap: 12 },
  inputHalf: { flex: 1 },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  currencyPrefix: { fontSize: 16, fontWeight: '600', marginRight: 8 },
  amountInput: { flex: 1, fontSize: 16 },
  
  chartContainer: { marginHorizontal: 16, marginVertical: 16, borderRadius: 12, padding: 16, borderWidth: 1 },
  chartTitle: { fontSize: 18, fontWeight: '800' },
  applyButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  applyButtonText: { fontSize: 14, fontWeight: '600' },
  
  graphWrapper: { alignItems: 'center', marginBottom: 16 },
  barGroup: { alignItems: 'center' }, 
  barTrack: { borderRadius: 8, justifyContent: 'flex-end', marginVertical: 8 },
  barFill: { width: '100%', borderRadius: 8 },
  barLabelTop: { fontSize: 14, fontWeight: '800' },
  barLabelBottom: { fontSize: 12, fontWeight: '600' },

  tooltipOverlay: {
    position: 'absolute',
    top: 50,
    left: 45,
    padding: 10,
    borderRadius: 8,
    width: 140,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  tooltipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  tooltipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  tooltipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tooltipArrow: {
    position: 'absolute',
    left: -6,
    top: 15,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 6,
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: '#fff', 
  },

  sliderValueContainer: {
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.02)', 
    paddingVertical: 12,
    borderRadius: 12,
  },
  sliderHeroText: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 4,
  },
  /* Success View Styles */
  centerContent: { 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 24 
  },
  successWrapper: { 
    width: '100%', 
    alignItems: 'center' 
  },
  successIcon: { 
    width: 140, 
    height: 140, 
    borderRadius: 70, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 32 
  },
  successTitle: { 
    fontSize: 28, 
    fontWeight: '900', 
    marginBottom: 24, 
    textAlign: 'center',
    fontFamily: 'sans-serif-rounded',
  },
  summaryCard: {
    width: '100%',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 32,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '700',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  successSubtitle: { 
    fontSize: 15, 
    textAlign: 'center', 
    lineHeight: 22, 
    fontWeight: '500',
    paddingHorizontal: 20,
  },
});