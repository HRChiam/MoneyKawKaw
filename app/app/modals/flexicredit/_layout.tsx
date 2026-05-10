import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Dimensions, DimensionValue } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import Slider from '@react-native-community/slider';
import Svg, { Path } from 'react-native-svg'; 
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { IconSymbol } from '@/components/ui/icon-symbol';

const { width } = Dimensions.get('window');

export default function FlexiCreditScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [creditAmount, setCreditAmount] = useState('1000');
  const [interestRateInput, setInterestRateInput] = useState('18');
  const [monthlyPayment, setMonthlyPayment] = useState(50);
  const [hasInteracted, setHasInteracted] = useState(false);

  const parsedAmount = parseInt(creditAmount) || 0;
  const parsedRate = (parseFloat(interestRateInput) || 0) / 100; 
  const minPayment = Math.max(parsedAmount * 0.05, 50); 
  const maxPayment = parsedAmount > minPayment ? parsedAmount : minPayment + 100;
  
  useEffect(() => {
    if (monthlyPayment < minPayment) {
      setMonthlyPayment(minPayment);
    }
  }, [parsedAmount, minPayment]);

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
    alert(`Success! Applied for RM${creditAmount} at ${interestRateInput}% p.a.`);
    router.back();
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} scrollEventThrottle={16}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol size={24} name="chevron.left" color={colors.text} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>FlexiCredit</Text>
        </TouchableOpacity>
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
                <View style={[styles.inputContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <TextInput
                        style={[styles.amountInput, { color: colors.text, textAlign: 'right' }]}
                        value={interestRateInput}
                        onChangeText={setInterestRateInput}
                        keyboardType="numeric"
                        placeholder="18"
                    />
                    <Text style={[styles.currencyPrefix, { color: colors.secondary, marginLeft: 4, marginRight: 0 }]}>%</Text>
                </View>
            </View>
        </View>
      </View>

      {/* ACT 7: THE COMBO CHART SIMULATOR */}
      <View style={[styles.chartContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>AI Simulator</Text>
            <IconSymbol size={20} name="sparkles" color={colors.primary} />
        </View>

        {/* --- DYNAMIC SVG COMBO GRAPH --- */}
        <View style={styles.graphWrapper}>
            <View style={{ width: BAR_DISTANCE + BAR_WIDTH, flexDirection: 'row', justifyContent: 'space-between' }}>
                
                {/* 1. Left Column (Payment) */}
                <View style={styles.barGroup}>
                    <Text style={[styles.barLabelTop, {color: colors.text}]}>RM {Math.floor(monthlyPayment)}</Text>
                    <View style={[styles.barTrack, {backgroundColor: colorScheme === 'dark' ? '#333' : '#f3f4f6', height: CHART_TRACK_HEIGHT, width: BAR_WIDTH}]}>
                        <View style={[styles.barFill, { height: paymentHeight, backgroundColor: colors.primary }]} />
                    </View>
                    <Text style={[styles.barLabelBottom, {color: colors.secondary}]}>Pay/Month</Text>
                </View>

                {/* 2. The Smooth Extended SVG Line */}
                <View style={{ position: 'absolute', top: 24, left: -OVERHANG, right: -OVERHANG, height: CHART_TRACK_HEIGHT, zIndex: 10 }} pointerEvents="none">
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

                {/* 3. Right Column (Interest) */}
                <View style={styles.barGroup}>
                    <Text style={[styles.barLabelTop, {color: colors.text}]}>RM {interest}</Text>
                    <View style={[styles.barTrack, {backgroundColor: colorScheme === 'dark' ? '#333' : '#f3f4f6', height: CHART_TRACK_HEIGHT, width: BAR_WIDTH}]}>
                        <View style={[styles.barFill, { height: interestHeight, backgroundColor: months > 24 ? '#ef4444' : '#f97316' }]} />
                    </View>
                    <Text style={[styles.barLabelBottom, {color: colors.secondary}]}>Interest</Text>
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
            { backgroundColor: hasInteracted ? colors.primary : 'transparent', borderColor: hasInteracted ? colors.primaryEnd : colors.border }
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
  header: { paddingHorizontal: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#333' },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: '600' },
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
  barGroup: { alignItems: 'center', zIndex: 1 },
  barTrack: { borderRadius: 8, justifyContent: 'flex-end', overflow: 'hidden', marginVertical: 8 },
  barFill: { width: '100%', borderRadius: 8 },
  barLabelTop: { fontSize: 14, fontWeight: '800' },
  barLabelBottom: { fontSize: 12, fontWeight: '600' },

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
  }
});