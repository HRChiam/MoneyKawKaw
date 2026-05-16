import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { useFinancial } from '@/context/FinancialContext';

export default function PocketsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { pockets, setPockets } = useFinancial();
  const [isBalanceVisible] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<'fixed' | 'variable' | null>(null);

  const primaryBrand = '#771FFF'; // GX Violet

  const formatBalance = (amount: string | number) => {
    return isBalanceVisible ? amount.toString() : '••••••';
  };

  const fixedPockets = pockets.filter(p => p.isFixed);
  const variablePockets = pockets.filter(p => !p.isFixed);

  const totalFixedBalance = fixedPockets.reduce((acc, curr) => acc + curr.balance, 0);
  const totalVariableBalance = variablePockets.reduce((acc, curr) => acc + curr.balance, 0);

  const displayedPockets = selectedGroup === 'fixed' ? fixedPockets : selectedGroup === 'variable' ? variablePockets : pockets;

  // Add Pocket State
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');

  // Rename Pocket State
  const [renameModal, setRenameModal] = useState(false);
  const [renameTarget, setRenameTarget] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Move Money State
  const [moveModal, setMoveModal] = useState(false);
  const [moveSource, setMoveSource] = useState<number | null>(null);
  const [moveTarget, setMoveTarget] = useState<number | null>(null);
  const [moveAmount, setMoveAmount] = useState('');

  // Delete Confirmation State
  const [deleteModal, setDeleteModal] = useState(false);
  const [pocketToDelete, setPocketToDelete] = useState<{id: number, name: string, balance: number} | null>(null);

  const totalBalance = pockets.reduce((acc, curr) => acc + curr.balance, 0);

  const addPocket = () => {
    if (!newName) return;
    const id = Math.max(0, ...pockets.map(p => p.id)) + 1;
    setPockets([...pockets, {
      id, 
      name: newName, 
      balance: Number(newAmount) || 0,
      icon: 'folder-outline',
      color: primaryBrand,
      isFixed: selectedGroup === 'fixed'
    }]);
    setShowAdd(false);
    setNewName('');
    setNewAmount('');
  };

  const applyRename = () => {
    if (renameTarget == null || !renameValue) return;
    setPockets(pockets.map(p => p.id === renameTarget ? { ...p, name: renameValue } : p));
    setRenameModal(false);
  };

  const startMove = (id: number) => {
    setMoveSource(id);
    setMoveTarget(null);
    setMoveAmount('');
    setMoveModal(true);
  };

  const applyMove = () => {
    const amount = parseFloat(moveAmount);
    if (!moveSource || !moveTarget || isNaN(amount) || amount <= 0) return;

    setPockets(pockets.map(p => {
      if (p.id === moveSource) return { ...p, balance: p.balance - amount };
      if (p.id === moveTarget) return { ...p, balance: p.balance + amount };
      return p;
    }));
    setMoveModal(false);
  };

  const applyDelete = () => {
    if (pocketToDelete) {
      setPockets(pockets.filter(p => p.id !== pocketToDelete.id));
      setDeleteModal(false);
      setPocketToDelete(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Header Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => selectedGroup ? setSelectedGroup(null) : router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          {selectedGroup === 'fixed' ? 'Fixed Pockets' : selectedGroup === 'variable' ? 'Variable Pockets' : 'Pockets'}
        </Text>
        
        <View style={styles.headerActions}>
          {selectedGroup !== null && (
            <>
              <TouchableOpacity 
                style={[styles.headerBtn, { backgroundColor: 'rgba(255,255,255,0.05)' }]} 
                onPress={() => setShowAdd(true)}
              >
                <Feather name="plus" size={20} color={primaryBrand} />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => setIsEditMode(!isEditMode)}
                style={[styles.headerBtn, { backgroundColor: isEditMode ? colors.error + '20' : 'rgba(255,255,255,0.05)' }]}
              >
                <Feather name={isEditMode ? "x" : "trash-2"} size={18} color={isEditMode ? colors.error : colors.secondary} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Total Balance Hero */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.heroSection}>
          <Text style={[styles.heroLabel, { color: colors.secondary }]}>TOTAL POCKETS BALANCE</Text>
          <Text style={[styles.heroAmount, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>
            <Text style={styles.heroCurrency}>RM</Text> {formatBalance(totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 }))}
          </Text>
        </Animated.View>

        <View style={styles.pocketsList}>
          {selectedGroup === null ? (
            <>
              {/* Fixed Pockets Group Card */}
              <Animated.View entering={FadeInDown.delay(0).duration(600)}>
                <TouchableOpacity 
                  activeOpacity={0.8}
                  onPress={() => setSelectedGroup('fixed')}
                  style={[
                    styles.pocketCard, 
                    { 
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      borderColor: 'rgba(255,255,255,0.08)' 
                    }
                  ]}
                > 
                  <View style={styles.cardMain}>
                    <View style={[styles.iconWrapper, { backgroundColor: '#3b82f620' }]}>
                      <MaterialCommunityIcons name="lock-outline" size={28} color="#3b82f6" />
                    </View>
                    <View style={styles.pocketInfo}>
                      <Text style={[styles.pocketName, { color: colors.text }]}>Fixed Pocket</Text>
                      <Text style={[styles.pocketBalance, { color: colors.text }]}>
                        <Text style={{ fontSize: 16, color: colors.secondary, fontWeight: '600' }}>RM</Text> {formatBalance(totalFixedBalance.toLocaleString(undefined, { minimumFractionDigits: 2 }))}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={20} color={colors.secondary} />
                  </View>
                </TouchableOpacity>
              </Animated.View>

              {/* Variable Pockets Group Card */}
              <Animated.View entering={FadeInDown.delay(100).duration(600)}>
                <TouchableOpacity 
                  activeOpacity={0.8}
                  onPress={() => setSelectedGroup('variable')}
                  style={[
                    styles.pocketCard, 
                    { 
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      borderColor: 'rgba(255,255,255,0.08)' 
                    }
                  ]}
                > 
                  <View style={styles.cardMain}>
                    <View style={[styles.iconWrapper, { backgroundColor: '#3b82f620' }]}>
                      <MaterialCommunityIcons name="lock-open-outline" size={28} color="#3b82f6" />
                    </View>
                    <View style={styles.pocketInfo}>
                      <Text style={[styles.pocketName, { color: colors.text }]}>Variable Pocket</Text>
                      <Text style={[styles.pocketBalance, { color: colors.text }]}>
                        <Text style={{ fontSize: 16, color: colors.secondary, fontWeight: '600' }}>RM</Text> {formatBalance(totalVariableBalance.toLocaleString(undefined, { minimumFractionDigits: 2 }))}
                      </Text>
                    </View>
                    <Feather name="chevron-right" size={20} color={colors.secondary} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </>
          ) : (
            displayedPockets.map((p, index) => (
              <Animated.View key={p.id} entering={FadeInDown.delay(index * 100).duration(600)}>
                <TouchableOpacity 
                  activeOpacity={0.8}
                  onPress={() => !isEditMode && router.push(`../category/${p.name}`)}
                  style={[
                    styles.pocketCard, 
                    { 
                      backgroundColor: 'rgba(255,255,255,0.03)',
                      borderColor: isEditMode ? colors.error + '40' : 'rgba(255,255,255,0.08)' 
                    }
                  ]}
                > 
                  <View style={styles.cardMain}>
                    <View style={[styles.iconWrapper, { backgroundColor: p.color + '20' }]}>
                      <MaterialCommunityIcons name={p.icon as any} size={28} color={p.color} />
                    </View>
                    <View style={styles.pocketInfo}>
                      <Text style={[styles.pocketName, { color: colors.text }]}>{p.name}</Text>
                      <Text style={[styles.pocketBalance, { color: colors.text }]}>
                        <Text style={{ fontSize: 16, color: colors.secondary, fontWeight: '600' }}>RM</Text> {formatBalance(p.balance.toLocaleString(undefined, { minimumFractionDigits: 2 }))}
                      </Text>
                    </View>
                    
                    {isEditMode ? (
                      <TouchableOpacity 
                        style={[styles.deleteBtn, { backgroundColor: colors.error + '20' }]} 
                        onPress={() => {
                          setPocketToDelete({ id: p.id, name: p.name, balance: p.balance });
                          setDeleteModal(true);
                        }}
                      >
                        <Feather name="trash-2" size={20} color={colors.error} />
                      </TouchableOpacity>
                    ) : (
                      <View style={{ flexDirection: 'row', gap: 12 }}>
                        <TouchableOpacity 
                          style={styles.moveBtn}
                          onPress={() => startMove(p.id)}
                        >
                          <Feather name="repeat" size={20} color={primaryBrand} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.moveBtn}
                          onPress={() => {
                            setRenameTarget(p.id);
                            setRenameValue(p.name);
                            setRenameModal(true);
                          }}
                        >
                          <Feather name="edit-3" size={20} color={colors.secondary} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
            ))
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* --- MOVE MONEY MODAL --- */}
      <Modal visible={moveModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
            <View style={[styles.modalSheet, { backgroundColor: colors.card }]}> 
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Transfer Funds</Text>
                <TouchableOpacity onPress={() => setMoveModal(false)}>
                  <Feather name="x" size={24} color={colors.secondary} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, { color: colors.secondary }]}>TO TARGET POCKET</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {pockets.filter(p => p.id !== moveSource).map(p => (
                    <TouchableOpacity 
                      key={p.id}
                      onPress={() => setMoveTarget(p.id)}
                      style={[
                        styles.targetOption, 
                        { 
                          backgroundColor: moveTarget === p.id ? p.color + '20' : 'rgba(255,255,255,0.05)',
                          borderColor: moveTarget === p.id ? p.color : 'rgba(255,255,255,0.1)'
                        }
                      ]}
                    >
                      <MaterialCommunityIcons name={p.icon as any} size={20} color={moveTarget === p.id ? p.color : colors.secondary} />
                      <Text style={[styles.targetName, { color: moveTarget === p.id ? colors.text : colors.secondary }]}>{p.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.secondary }]}>AMOUNT TO MOVE (RM)</Text>
                <TextInput 
                  placeholder="0.00" 
                  placeholderTextColor="rgba(255,255,255,0.2)" 
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]} 
                  value={moveAmount} 
                  onChangeText={setMoveAmount} 
                  keyboardType="decimal-pad" 
                  autoFocus
                />
              </View>
              
              <TouchableOpacity onPress={applyMove} style={styles.primaryBtnWrapper} disabled={!moveTarget || !moveAmount}>
                <LinearGradient
                  colors={!moveTarget || !moveAmount ? ['#3f3751', '#3f3751'] : ['#771FFF', '#F8326D']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.modalPrimaryAction, { opacity: !moveTarget || !moveAmount ? 0.6 : 1 }]}
                >
                  <Text style={styles.primaryBtnText}>Transfer Money</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* --- DELETE MODAL --- */}
      <Modal visible={deleteModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCenterCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
            <View style={[styles.alertIconBg, { backgroundColor: colors.error + '20' }]}>
              <Feather name="alert-triangle" size={32} color={colors.error} />
            </View>
            <Text style={[styles.modalTitle, { color: colors.text, textAlign: 'center' }]}>Delete Pocket?</Text>
            <Text style={[styles.modalSubTitle, { color: colors.secondary, textAlign: 'center' }]}>
              &quot;{pocketToDelete?.name}&quot; funds will be returned to your main account.
            </Text>
            <View style={styles.modalRowActions}>
              <TouchableOpacity style={[styles.modalBtnHalf, { borderColor: colors.border }]} onPress={() => setDeleteModal(false)}>
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtnHalf, { backgroundColor: colors.error }]} onPress={applyDelete}>
                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- ADD MODAL --- */}
      <Modal visible={showAdd} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%' }}>
            <View style={[styles.modalSheet, { backgroundColor: colors.card }]}> 
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>New Pocket</Text>
                <TouchableOpacity onPress={() => setShowAdd(false)}>
                  <Feather name="x" size={24} color={colors.secondary} />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.secondary }]}>POCKET NAME</Text>
                <TextInput 
                  placeholder="e.g. Travel Fund" 
                  placeholderTextColor="rgba(255,255,255,0.2)" 
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]} 
                  value={newName} 
                  onChangeText={setNewName} 
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.secondary }]}>INITIAL AMOUNT (RM)</Text>
                <TextInput 
                  placeholder="0.00" 
                  placeholderTextColor="rgba(255,255,255,0.2)" 
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]} 
                  value={newAmount} 
                  onChangeText={setNewAmount} 
                  keyboardType="decimal-pad" 
                />
              </View>
              
              <TouchableOpacity onPress={addPocket} style={styles.primaryBtnWrapper}>
                <LinearGradient
                  colors={['#771FFF', '#F8326D']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalPrimaryAction}
                >
                  <Text style={styles.primaryBtnText}>Create Pocket</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* --- RENAME MODAL --- */}
      <Modal visible={renameModal} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCenterCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
            <Text style={[styles.modalTitle, { color: colors.text, marginBottom: 24, textAlign: 'center' }]}>Rename Pocket</Text>
            <TextInput 
              style={[styles.input, { color: colors.text, borderColor: colors.border, marginBottom: 24 }]} 
              value={renameValue} 
              onChangeText={setRenameValue} 
              autoFocus 
            />
            <View style={styles.modalRowActions}>
              <TouchableOpacity style={[styles.modalBtnHalf, { borderColor: colors.border }]} onPress={() => setRenameModal(false)}>
                <Text style={[styles.modalBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={applyRename} style={styles.modalBtnHalfWrapper}>
                <LinearGradient
                  colors={['#771FFF', '#F8326D']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modalBtnHalfGradient}
                >
                  <Text style={[styles.modalBtnText, { color: '#fff' }]}>Save</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { 
    paddingHorizontal: 20, 
    paddingTop: 16,
    paddingBottom: 1,
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  backButton: { marginRight: 12 },
  title: { 
    fontSize: 20, 
    fontWeight: '800', 
    flex: 1,
    fontFamily: 'sans-serif-rounded',
  },
  headerActions: { flexDirection: 'row', gap: 12 },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: { paddingHorizontal: 20 },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 1,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
    fontFamily: 'sans-serif-rounded',
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '900',
    fontFamily: 'sans-serif-rounded',
    letterSpacing: -1,
  },
  heroCurrency: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
  },
  pocketsList: { gap: 16 },
  pocketCard: { 
    padding: 16, 
    borderRadius: 24, 
    borderWidth: 1.5,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  pocketInfo: { flex: 1 },
  pocketName: { 
    fontSize: 13, 
    fontWeight: '700', 
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'sans-serif-rounded',
  },
  pocketBalance: { 
    fontSize: 20, 
    fontWeight: '900',
    fontFamily: 'sans-serif-rounded',
  },
  moveBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  targetName: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'sans-serif-rounded',
  },
  
  /* Modals */
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.85)', 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 24 
  },
  modalCenterCard: { 
    width: '100%', 
    padding: 32, 
    borderRadius: 32, 
    borderWidth: 1.5 
  },
  alertIconBg: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalSheet: { 
    width: '100%',
    padding: 32, 
    borderRadius: 32, 
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  modalHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 32 
  },
  modalTitle: { 
    fontSize: 24, 
    fontWeight: '900',
    fontFamily: 'sans-serif-rounded' 
  },
  modalSubTitle: { 
    fontSize: 16, 
    lineHeight: 24, 
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 32,
    fontFamily: 'sans-serif-rounded' 
  },
  inputGroup: { marginBottom: 24 },
  inputLabel: { 
    fontSize: 11, 
    fontWeight: '800', 
    letterSpacing: 1.2, 
    marginBottom: 12,
    fontFamily: 'sans-serif-rounded' 
  },
  input: { 
    borderWidth: 1.5, 
    borderRadius: 16, 
    padding: 16, 
    fontSize: 18, 
    fontWeight: '800',
    fontFamily: 'sans-serif-rounded' 
  },
  primaryBtnWrapper: { width: '100%', marginTop: 8 },
  modalPrimaryAction: { 
    paddingVertical: 20, 
    borderRadius: 20, 
    alignItems: 'center' 
  },
  primaryBtnText: { 
    color: '#fff', 
    fontWeight: '900', 
    fontSize: 18,
    fontFamily: 'sans-serif-rounded' 
  },
  modalRowActions: { flexDirection: 'row', gap: 12 },
  modalBtnHalf: { 
    flex: 1, 
    paddingVertical: 18, 
    borderRadius: 18, 
    alignItems: 'center', 
    borderWidth: 1.5 
  },
  modalBtnHalfWrapper: { flex: 1 },
  modalBtnHalfGradient: {
    paddingVertical: 18, 
    borderRadius: 18, 
    alignItems: 'center',
  },
  modalBtnText: { 
    fontSize: 16, 
    fontWeight: '800',
    fontFamily: 'sans-serif-rounded' 
  },
});