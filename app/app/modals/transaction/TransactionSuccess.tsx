import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

interface TransactionSuccessProps {
  amount: string;
  toAccount: string;
  toBank: string;
  selectedSource: string | null;
  colors: {
    background: string;
    text: string;
    secondary: string;
  };
  primaryBrand: string;
}

export const TransactionSuccess: React.FC<TransactionSuccessProps> = ({
  amount,
  toAccount,
  toBank,
  selectedSource,
  colors,
  primaryBrand,
}) => {
  const router = useRouter();

  const handleDone = () => {
    router.navigate('../(tabs)/01-home');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View 
        entering={FadeInDown.duration(600)}
        style={styles.successContainer}
      >
        <View style={[styles.successIconWrapper, { backgroundColor: '#791fff4e' }]}>
          <Ionicons name="checkmark-circle" size={100} color={primaryBrand} />
        </View>
        <Text style={[styles.successTitle, { color: colors.text }]}>Transfer Successful!</Text>
        
        <View style={[styles.receiptCard, { backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)' }]}>
          <View style={styles.receiptRow}>
            <Text style={[styles.receiptLabel, { color: colors.secondary }]}>Amount</Text>
            <Text style={[styles.receiptValue, { color: colors.text }]}>RM {parseFloat(amount).toFixed(2)}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={[styles.receiptLabel, { color: colors.secondary }]}>To Account</Text>
            <Text style={[styles.receiptValue, { color: colors.text }]}>{toAccount}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={[styles.receiptLabel, { color: colors.secondary }]}>Bank</Text>
            <Text style={[styles.receiptValue, { color: colors.text }]}>{toBank}</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={[styles.receiptLabel, { color: colors.secondary }]}>From</Text>
            <Text style={[styles.receiptValue, { color: colors.text }]}>{selectedSource} Pocket</Text>
          </View>
        </View>
        
        <TouchableOpacity onPress={handleDone} style={styles.doneButtonWrapper}>
          <View style={[styles.solidButton, { backgroundColor: primaryBrand }]}>
            <Text style={styles.doneButtonText}>Done</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successIconWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 32,
    textAlign: 'center',
    fontFamily: 'sans-serif-rounded',
    letterSpacing: -1,
  },
  receiptCard: {
    width: '100%',
    padding: 24,
    borderRadius: 28,
    borderWidth: 1.5,
    marginBottom: 40,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  receiptLabel: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'sans-serif-rounded',
  },
  receiptValue: {
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'sans-serif-rounded',
  },
  doneButtonWrapper: {
    width: '100%',
  },
  solidButton: {
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    fontFamily: 'sans-serif-rounded',
  },
});
