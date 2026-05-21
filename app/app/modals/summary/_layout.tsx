import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Image, Modal } from 'react-native';
import { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path, Circle } from 'react-native-svg';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather, Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function SummaryScreen() {
  const router = useRouter();
  const { tab } = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [activeTab, setActiveTab] = useState<'summary' | 'tax'>((tab as any) || 'summary');
  const [timeframe, setTimeframe] = useState<'month' | 'prev_month' | 'year' | 'prev_year'>('month');
  const [activePicker, setActivePicker] = useState<'month' | 'year' | null>(null);
  const [taxCategoryFilter, setTaxCategoryFilter] = useState<string>('All Categories');
  const [taxPickerVisible, setTaxPickerVisible] = useState(false);
  const [activePoint, setActivePoint] = useState<number | null>(null); 
  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null); 
  const [viewingReceipt, setViewingReceipt] = useState<{ name: string; amount: number } | null>(null);

  const scrollRef = useRef<ScrollView>(null);

  const taxExemptions = [
    { name: 'Tech / Lifestyle', amount: 1200, date: '12 May 2026' }, 
    { name: 'Medical', amount: 150, date: '05 May 2026' }, 
    { name: 'Education', amount: 200, date: '28 Apr 2026' }
  ];

  const taxCategories = ['All Categories', 'Tech / Lifestyle', 'Medical', 'Education'];

  const filteredExemptions = useMemo(() => {
    if (taxCategoryFilter === 'All Categories') return taxExemptions;
    return taxExemptions.filter(item => item.name === taxCategoryFilter);
  }, [taxCategoryFilter]);

  const monthLabels: Record<string, string> = {
    month: "May 2026 (Current)",
    prev_month: "April 2026 (Prev)"
  };

  const yearLabels: Record<string, string> = {
    year: "2026 (Current)",
    prev_year: "2025 (Prev)"
  };

  const data = {
    month: {
      periodLabel: "May 2026",
      trend: [ 
        { label: 'W1', value: 450, budget: 500 }, 
        { label: 'W2', value: 820, budget: 500 }, 
        { label: 'W3', value: 300, budget: 500 }, 
        { label: 'W4', value: 600, budget: 500 }  
      ],
      categories: [
        { name: 'Saving', amount: 1200, color: '#15fabd' },
        { name: 'Loan', amount: 1000, color: '#FBBF24' },
        { name: 'F&B', amount: 600, color: '#FB7185' },
        { name: 'Groceries', amount: 500, color: '#34D399' },
        { name: 'Transport', amount: 350, color: '#60A5FA' },
        { name: 'Entertainment', amount: 400, color: '#F472B6' },
      ]
    },
    prev_month: {
      periodLabel: "April 2026",
      trend: [ 
        { label: 'W1', value: 400, budget: 500 }, 
        { label: 'W2', value: 480, budget: 500 }, 
        { label: 'W3', value: 600, budget: 500 }, 
        { label: 'W4', value: 420, budget: 500 }  
      ],
      categories: [
        { name: 'Saving', amount: 1000, color: '#15fabd' },
        { name: 'Loan', amount: 1000, color: '#FBBF24' },
        { name: 'F&B', amount: 750, color: '#FB7185' },
        { name: 'Groceries', amount: 480, color: '#34D399' },
        { name: 'Transport', amount: 320, color: '#60A5FA' },
        { name: 'Entertainment', amount: 250, color: '#F472B6' },
      ]
    },
    year: {
      periodLabel: "2026",
      trend: [ 
        { label: 'Jan', value: 3200, budget: 3500 }, 
        { label: 'Feb', value: 2800, budget: 3500 }, 
        { label: 'Mar', value: 3800, budget: 3500 }, 
        { label: 'Apr', value: 2900, budget: 3500 }, 
        { label: 'May', value: 3100, budget: 3500 }, 
        { label: 'Jun', value: null, budget: 3500 }, 
        { label: 'Jul', value: null, budget: 3500 }, 
        { label: 'Aug', value: null, budget: 3500 }, 
        { label: 'Sep', value: null, budget: 3500 }, 
        { label: 'Oct', value: null, budget: 3500 }, 
        { label: 'Nov', value: null, budget: 3500 }, 
        { label: 'Dec', value: null, budget: 3500 } 
      ],
      categories: [
        { name: 'Saving', amount: 3200, color: '#A78BFA' },
        { name: 'F&B', amount: 2400, color: '#FB7185' },
        { name: 'Entertainment', amount: 800, color: '#60A5FA' },
      ]
    },
    prev_year: {
      periodLabel: "2025",
      trend: [ 
        { label: 'Jan', value: 3000, budget: 3200 }, 
        { label: 'Feb', value: 2900, budget: 3200 }, 
        { label: 'Mar', value: 3100, budget: 3200 }, 
        { label: 'Apr', value: 3300, budget: 3200 }, 
        { label: 'May', value: 3000, budget: 3200 }, 
        { label: 'Jun', value: 3200, budget: 3200 }, 
        { label: 'Jul', value: 3400, budget: 3200 }, 
        { label: 'Aug', value: 3100, budget: 3200 }, 
        { label: 'Sep', value: 2900, budget: 3200 }, 
        { label: 'Oct', value: 3000, budget: 3200 }, 
        { label: 'Nov', value: 3500, budget: 3200 }, 
        { label: 'Dec', value: 3800, budget: 3200 } 
      ],
      categories: [
        { name: 'Saving', amount: 35000, color: '#A78BFA' },
        { name: 'F&B', amount: 28000, color: '#FB7185' },
        { name: 'Entertainment', amount: 10000, color: '#60A5FA' },
      ]
    }
  };

  const currentData = data[timeframe];
  const validTrends = currentData.trend.filter(d => d.value !== null) as {label: string, value: number, budget: number}[];
  const maxSpend = Math.max(...validTrends.map(d => d.value));
  const minSpend = Math.min(...validTrends.map(d => d.value)) * 0.5; 
  
  const CHART_HEIGHT = 140;
  const VIEWPORT_WIDTH = width - 64; 
  const CHART_WIDTH = (timeframe === 'year' || timeframe === 'prev_year') ? VIEWPORT_WIDTH * 2 : VIEWPORT_WIDTH; 

  const generateSpendLine = () => {
    const points = currentData.trend
      .map((val, index) => {
        if (val.value === null) return null;
        const x = (index / (currentData.trend.length - 1)) * CHART_WIDTH;
        const y = CHART_HEIGHT - ((val.value - minSpend) / (maxSpend - minSpend)) * CHART_HEIGHT;
        return `${x},${y}`;
      })
      .filter(p => p !== null);
    return `M ${points.join(' L ')}`;
  };

  const totalCategorySpend = currentData.categories.reduce((sum, cat) => sum + cat.amount, 0);

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  const pieSlices = useMemo(() => {
    let accumulatedAngle = 0;
    return currentData.categories.map((cat) => {
      const percentage = cat.amount / totalCategorySpend;
      const sliceAngle = percentage * 360;
      
      const startAngle = accumulatedAngle;
      const endAngle = accumulatedAngle + sliceAngle;
      accumulatedAngle += sliceAngle;
      const R_NORMAL = 50;
      const R_ACTIVE = 56;
      
      const startNormal = polarToCartesian(60, 60, R_NORMAL, startAngle);
      const endNormal = polarToCartesian(60, 60, R_NORMAL, endAngle);
      
      const startActive = polarToCartesian(60, 60, R_ACTIVE, startAngle);
      const endActive = polarToCartesian(60, 60, R_ACTIVE, endAngle);

      const largeArcFlag = sliceAngle > 180 ? '1' : '0';
      const dNormal = sliceAngle > 359.9 
        ? `M 60 ${60 - R_NORMAL} A ${R_NORMAL} ${R_NORMAL} 0 1 1 59.9 ${60 - R_NORMAL} Z`
        : `M 60 60 L ${startNormal.x} ${startNormal.y} A ${R_NORMAL} ${R_NORMAL} 0 ${largeArcFlag} 1 ${endNormal.x} ${endNormal.y} Z`;

      const dActive = sliceAngle > 359.9 
        ? `M 60 ${60 - R_ACTIVE} A ${R_ACTIVE} ${R_ACTIVE} 0 1 1 59.9 ${60 - R_ACTIVE} Z`
        : `M 60 60 L ${startActive.x} ${startActive.y} A ${R_ACTIVE} ${R_ACTIVE} 0 ${largeArcFlag} 1 ${endActive.x} ${endActive.y} Z`;

      return { ...cat, dNormal, dActive, percentage: (percentage * 100).toFixed(0) };
    });
  }, [currentData.categories, totalCategorySpend]);

  useEffect(() => { 
    setActivePoint(null); 
    setActiveCategoryIndex(null);
    if ((timeframe === 'year' || timeframe === 'prev_year') && scrollRef.current) {
      const itemWidth = CHART_WIDTH / 11;
      const currentMonthX = (4 * itemWidth) - (VIEWPORT_WIDTH / 2);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ x: Math.max(0, currentMonthX), animated: true });
      }, 100);
    }
  }, [timeframe, CHART_WIDTH, VIEWPORT_WIDTH]);

  const handlePieTouch = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const dx = locationX - 60;
    const dy = locationY - 60;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 56) return;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    angle = angle + 90;
    if (angle < 0) angle += 360;
    
    let accumulated = 0;
    for (let i = 0; i < pieSlices.length; i++) {
      const sliceAngle = (pieSlices[i].amount / totalCategorySpend) * 360;
      if (angle >= accumulated && angle < accumulated + sliceAngle) {
        setActiveCategoryIndex(activeCategoryIndex === i ? null : i);
        break;
      }
      accumulated += sliceAngle;
    }
  };

  const renderTooltip = () => {
    if (activePoint === null || currentData.trend[activePoint].value === null) return null;
    const trend = currentData.trend[activePoint];
    
    const activeX = (activePoint / (currentData.trend.length - 1)) * CHART_WIDTH;
    const activeY = CHART_HEIGHT - ((trend.value! - minSpend) / (maxSpend - minSpend)) * CHART_HEIGHT;

    const TOOLTIP_WIDTH = 120;
    const TOOLTIP_HEIGHT = 65; 

    let left = activeX + 12; 
    let top = activeY - (TOOLTIP_HEIGHT / 2); 

    if (left + TOOLTIP_WIDTH > CHART_WIDTH) {
      left = activeX - TOOLTIP_WIDTH - 12; 
    }
    if (top < 0) top = 0; 
    else if (top + TOOLTIP_HEIGHT > CHART_HEIGHT) top = CHART_HEIGHT - TOOLTIP_HEIGHT; 

    return (
      <View style={[styles.tooltip, { backgroundColor: colors.text, top, left, width: TOOLTIP_WIDTH }]}>
        <Text style={{color: colors.background, fontSize: 10, fontWeight: '700', opacity: 0.8, textTransform: 'uppercase'}} numberOfLines={1}>
          {currentData.periodLabel} • {trend.label}
        </Text>
        <View style={{marginTop: 4}}>
          <Text style={{color: colors.background, fontSize: 14, fontWeight: '900'}}>RM {trend.value}</Text>
        </View>
        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4}}>
          <Text style={{fontSize: 12}}>{trend.value! > trend.budget ? "😢" : "😊"}</Text>
          <Text style={{color: trend.value! > trend.budget ? '#FCA5A5' : '#86EFAC', fontSize: 11, fontWeight: '800'}}>
            {trend.value! > trend.budget ? "Over Budget" : "On Track"}
          </Text>
        </View>
      </View>
    );
  };

  const renderSummaryTab = () => (
    <View>
      <View style={styles.filterContainer}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity 
            style={[styles.splitDropdown, { backgroundColor: colors.card, borderColor: timeframe.includes('month') ? colors.primary : colors.border }]}
            onPress={() => setActivePicker(activePicker === 'month' ? null : 'month')}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.dropdownLabel, { color: timeframe.includes('month') ? colors.primary : colors.secondary }]}>MONTH VIEW</Text>
              <Text style={[styles.dropdownValue, { color: colors.text }]} numberOfLines={1}>
                {timeframe.includes('month') ? monthLabels[timeframe] : "Select Month..."}
              </Text>
            </View>
            <Feather name={activePicker === 'month' ? "chevron-up" : "chevron-down"} size={18} color={colors.secondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.splitDropdown, { backgroundColor: colors.card, borderColor: timeframe.includes('year') ? colors.primary : colors.border }]}
            onPress={() => setActivePicker(activePicker === 'year' ? null : 'year')}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.dropdownLabel, { color: timeframe.includes('year') ? colors.primary : colors.secondary }]}>YEAR VIEW</Text>
              <Text style={[styles.dropdownValue, { color: colors.text }]} numberOfLines={1}>
                {timeframe.includes('year') ? yearLabels[timeframe] : "Select Year..."}
              </Text>
            </View>
            <Feather name={activePicker === 'year' ? "chevron-up" : "chevron-down"} size={18} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        {activePicker && (
          <View style={[styles.pickerDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {Object.entries(activePicker === 'month' ? monthLabels : yearLabels).map(([key, label]) => (
              <TouchableOpacity 
                key={key} 
                style={[styles.pickerItem, timeframe === key && { backgroundColor: colors.primary + '10' }]}
                onPress={() => {
                  setTimeframe(key as any);
                  setActivePicker(null);
                }}
              >
                <Text style={[styles.pickerItemText, { color: timeframe === key ? colors.primary : colors.text }]}>{label}</Text>
                {timeframe === key && <Feather name="check" size={16} color={colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      <View style={styles.chartsContainer}>
        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.chartHeader}>
             <Text style={[styles.chartTitle, { color: colors.text }]}>Spending Trend</Text>
             <Text style={{fontSize: 12, color: colors.secondary}}>Tap for details</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} ref={scrollRef} contentContainerStyle={{ width: CHART_WIDTH, paddingBottom: 10 }}>
            <View style={{ width: CHART_WIDTH }}>
              <View style={[styles.chartArea, { height: CHART_HEIGHT }]}>
                <Svg width="100%" height="100%">
                  <Path d={generateSpendLine()} fill="none" stroke={colors.primary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  {currentData.trend.map((val, index) => {
                      if (val.value === null) return null;
                      const x = (index / (currentData.trend.length - 1)) * CHART_WIDTH;
                      const y = CHART_HEIGHT - ((val.value - minSpend) / (maxSpend - minSpend)) * CHART_HEIGHT;
                      return (
                          <Circle key={index} cx={x} cy={y} r={activePoint === index ? 6 : 4} fill={colors.card} stroke={colors.primary} strokeWidth={activePoint === index ? 3 : 2} />
                      );
                  })}
                </Svg>
                <View style={styles.touchOverlay}>
                   {currentData.trend.map((val, index) => (
                     <TouchableOpacity key={index} style={styles.touchColumn} onPress={() => val.value !== null && setActivePoint(index)} activeOpacity={1} />
                   ))}
                </View>
                {renderTooltip()}
              </View>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 12}}>
                  {currentData.trend.map((val, i) => (
                     <Text key={i} style={{fontSize: 12, color: colors.secondary, fontWeight: '600'}}>{val.label}</Text>
                  ))}
              </View>
            </View>
          </ScrollView>
        </View>

        <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border, paddingVertical: 24, minHeight: 180 }]}>
          <Text style={[styles.chartTitle, { color: colors.text, marginBottom: 20 }]}>Spend Breakdown</Text>
          <View style={styles.donutRow}>
             <TouchableOpacity activeOpacity={1} onPress={handlePieTouch}>
               <Svg width="120" height="120" viewBox="0 0 120 120">
                  {pieSlices.map((slice, index) => (
                    <Path key={index} d={activeCategoryIndex === index ? slice.dActive : slice.dNormal} fill={slice.color} />
                  ))}
               </Svg>
             </TouchableOpacity>
             <View style={styles.donutSideText}>
                {activeCategoryIndex !== null ? (
                   <>
                      <Text style={[styles.donutCategoryName, { color: pieSlices[activeCategoryIndex].color }]}>{pieSlices[activeCategoryIndex].name}</Text>
                      <Text style={[styles.donutPercentage, { color: colors.text }]}>{pieSlices[activeCategoryIndex].percentage}%</Text>
                      <Text style={[styles.donutTotal, { color: colors.secondary }]}>RM {pieSlices[activeCategoryIndex].amount}</Text>
                   </>
                ) : (
                   <>
                      <Text style={[styles.donutPeriod, { color: colors.text }]}>{currentData.periodLabel}</Text>
                      <Text style={[styles.donutTotal, { color: colors.secondary, marginTop: 4 }]}>Total Spent</Text>
                      <Text style={[styles.donutPercentage, { color: colors.text }]}>RM {totalCategorySpend}</Text>
                   </>
                )}
             </View>
          </View>
        </View>
      </View>

      <View style={styles.listSection}>
        <Text style={[styles.listTitle, { color: colors.text, marginBottom: 12 }]}>Category Breakdown</Text>
        {currentData.categories.map((category, index) => (
          <TouchableOpacity key={index} style={[styles.categoryItem, { borderBottomColor: colors.border }, index === currentData.categories.length - 1 && { borderBottomWidth: 0 }, activeCategoryIndex === index && { backgroundColor: category.color + '10' }]} onPress={() => setActiveCategoryIndex(activeCategoryIndex === index ? null : index)}>
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                <View style={{width: 12, height: 12, borderRadius: 6, backgroundColor: category.color}} />
                <Text style={[styles.categoryName, { color: colors.text }]}>{category.name}</Text>
            </View>
            <Text style={[styles.categoryAmount, { color: colors.text, fontWeight: '700' }]}>RM {category.amount}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTaxTab = () => {
    const filteredTotal = filteredExemptions.reduce((sum, item) => sum + item.amount, 0);

    return (
      <View>
        <View style={[styles.totalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.totalLabel, { color: colors.secondary }]}>Potential Tax Relief (LHDN)</Text>
          <Text style={[styles.totalAmount, { color: colors.primary }]}>RM 1,550</Text>
        </View>
        <View style={[styles.listSection, { backgroundColor: colors.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.border, zIndex: 1000 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, zIndex: 1100 }}>
            <View>
              <Text style={[styles.listTitle, { color: colors.text }]}>Tracked Exemptions</Text>
              <Text style={{ fontSize: 13, color: colors.secondary, fontWeight: '600', marginTop: 2 }}>Total: RM {filteredTotal.toLocaleString()}</Text>
            </View>
            <View style={{ position: 'relative' }}>
            <TouchableOpacity 
              style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                gap: 6, 
                backgroundColor: colors.background, 
                paddingHorizontal: 12, 
                paddingVertical: 8, 
                borderRadius: 20,
                borderWidth: 1,
                borderColor: colors.border
              }}
              onPress={() => setTaxPickerVisible(!taxPickerVisible)}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: colors.text }}>{taxCategoryFilter}</Text>
              <Feather name={taxPickerVisible ? "chevron-up" : "chevron-down"} size={14} color={colors.secondary} />
            </TouchableOpacity>

            {taxPickerVisible && (
              <View style={[styles.pickerDropdown, { top: '100%', right: 0, width: 180, marginTop: 4, backgroundColor: colors.card, zIndex: 1200 }]}>
                {taxCategories.map((cat) => (
                  <TouchableOpacity 
                    key={cat} 
                    style={[styles.pickerItem, taxCategoryFilter === cat && { backgroundColor: colors.primary + '10' }]}
                    onPress={() => {
                      setTaxCategoryFilter(cat);
                      setTaxPickerVisible(false);
                    }}
                  >
                    <Text style={[styles.pickerItemText, { color: taxCategoryFilter === cat ? colors.primary : colors.text, fontSize: 13 }]}>{cat}</Text>
                    {taxCategoryFilter === cat && <Feather name="check" size={14} color={colors.primary} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {filteredExemptions.map((item, index) => (
          <View key={index} style={[styles.taxItem, { borderBottomColor: colors.border }, index === filteredExemptions.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 }]}>
            <View style={styles.taxItemLeft}>
              <Text style={[styles.taxItemName, { color: colors.text }]}>{item.name}</Text>
              <Text style={[styles.taxItemAmount, { color: colors.text }]}>RM {item.amount}</Text>
              <Text style={{ fontSize: 12, color: colors.secondary, fontWeight: '500', marginTop: 4 }}>{item.date}</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setViewingReceipt(item)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: colors.primary + '15',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Feather name="file-text" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} scrollEventThrottle={16}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Feather name="arrow-left" size={24} color={colors.text} /></TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Insights</Text>
        </View>
        <View style={[styles.tabContainer, { borderBottomColor: colors.border }]}>
          <TouchableOpacity style={[styles.tab, { borderBottomWidth: activeTab === 'summary' ? 2 : 0, borderBottomColor: colors.primary }]} onPress={() => setActiveTab('summary')}><Text style={[styles.tabText, { color: activeTab === 'summary' ? colors.primary : colors.secondary }]}>Summary</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.tab, { borderBottomWidth: activeTab === 'tax' ? 2 : 0, borderBottomColor: colors.primary }]} onPress={() => setActiveTab('tax')}><Text style={[styles.tabText, { color: activeTab === 'tax' ? colors.primary : colors.secondary }]}>Tax Relief</Text></TouchableOpacity>
        </View>
        <View style={styles.tabContent}>{activeTab === 'summary' ? renderSummaryTab() : renderTaxTab()}</View>
        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal
        visible={!!viewingReceipt}
        transparent
        animationType="fade"
        onRequestClose={() => setViewingReceipt(null)}
      >
        <View style={styles.receiptModalOverlay}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFill} 
            activeOpacity={1} 
            onPress={() => setViewingReceipt(null)} 
          />
          <Animated.View 
            entering={FadeIn.duration(200)} 
            exiting={FadeOut.duration(200)}
            style={[styles.receiptModalContent, { backgroundColor: colors.card }]}
          >
            <View style={styles.receiptModalHeader}>
              <View>
                <Text style={[styles.receiptModalTitle, { color: colors.text }]}>{viewingReceipt?.name}</Text>
                <Text style={[styles.receiptModalSubtitle, { color: colors.secondary }]}>Proof of spending • RM {viewingReceipt?.amount}</Text>
              </View>
              <TouchableOpacity onPress={() => setViewingReceipt(null)} style={styles.receiptCloseBtn}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <View style={[styles.receiptImageContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Image 
                source={require('@/assets/images/receipt.png')} 
                style={styles.receiptImage}
                resizeMode="contain"
              />
            </View>

            <TouchableOpacity style={[styles.downloadBtn, { backgroundColor: colors.primary }]}>
              <Feather name="download" size={20} color="#fff" />
              <Text style={styles.downloadBtnText}>Download Receipt</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16, flexDirection: 'row', alignItems: 'center' },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800' },
  tabContainer: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: 16 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabText: { fontSize: 14, fontWeight: '600' },
  tabContent: { paddingHorizontal: 16, paddingTop: 16 },
  filterContainer: { position: 'relative', marginBottom: 24, zIndex: 1000 },
  splitDropdown: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 14, borderWidth: 1.5 },
  dropdownLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5, marginBottom: 2 },
  dropdownValue: { fontSize: 13, fontWeight: '700' },
  pickerDropdown: { position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 8, borderRadius: 16, borderWidth: 1, overflow: 'hidden', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15 },
  pickerItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.05)' },
  pickerItemText: { fontSize: 14, fontWeight: '600' },
  chartsContainer: { gap: 16, marginBottom: 24 },
  chartCard: { borderRadius: 16, padding: 16, borderWidth: 1 },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  chartTitle: { fontSize: 16, fontWeight: '700' },
  donutRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', paddingLeft: 8 },
  donutSideText: { marginLeft: 25, flex: 1 },
  donutPeriod: { fontSize: 16, fontWeight: '800' },
  donutCategoryName: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  donutPercentage: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  donutTotal: { fontSize: 14, fontWeight: '600' },
  chartArea: { width: '100%', position: 'relative', marginTop: 8 },
  touchOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, flexDirection: 'row' },
  touchColumn: { flex: 1, height: '100%' }, 
  tooltip: { position: 'absolute', padding: 8, borderRadius: 8, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, zIndex: 100 },
  listSection: { marginBottom: 24 },
  listTitle: { fontSize: 16, fontWeight: '700' },
  categoryItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, paddingHorizontal: 8, borderRadius: 8 },
  categoryName: { fontSize: 15, fontWeight: '600' },
  categoryAmount: { fontSize: 15, fontWeight: '700' },
  totalCard: { borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, alignItems: 'center' },
  totalLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  totalAmount: { fontSize: 32, fontWeight: '800' },
  taxItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  taxItemLeft: { flex: 1 },
  taxItemName: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  taxItemAmount: { fontSize: 14, fontWeight: '700' },
  viewButton: { fontSize: 13, fontWeight: '700' },
  receiptModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  receiptModalContent: { width: '100%', borderRadius: 32, padding: 24 },
  receiptModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  receiptModalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  receiptModalSubtitle: { fontSize: 14, fontWeight: '600' },
  receiptCloseBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  receiptImageContainer: { width: '100%', height: 350, borderRadius: 20, borderWidth: 1, overflow: 'hidden', marginBottom: 24 },
  receiptImage: { width: '100%', height: '100%' },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 16, gap: 8 },
  downloadBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});