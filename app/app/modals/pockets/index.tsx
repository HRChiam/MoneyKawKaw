import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function PocketsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  const [pockets, setPockets] = useState([
    { id: 1, name: 'Saving', balance: 50.00, icon: 'safe', color: '#771FFF' },
    { id: 2, name: 'Food', balance: 800.00, icon: 'food-fork-drink', color: '#FB7185' },
    { id: 3, name: 'Transport', balance: 200.00, icon: 'car-side', color: '#60A5FA' },
  ]);

  const labelColor = '#771FFF'; // GX Violet

  const formatBalance = (amount: string | number) => {
    return isBalanceVisible ? amount.toString() : '••••••';
  };

  // Add Pocket State
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [sourcePocketId, setSourcePocketId] = useState<number | 'main'>('main');

  // Rename Pocket State
  const [renameModal, setRenameModal] = useState(false);
  const [renameTarget, setRenameTarget] = useState<number | null>(null);
  const [renameValue, setRenameValue] = useState('');

  // Move Money State
  const [moveModal, setMoveModal] = useState(false);
  const [moveSource, setMoveSource] = useState<number | 'main' | null>(null);
  const [moveTarget, setMoveTarget] = useState<number | 'main' | null>(null);
  const [moveAmount, setMoveAmount] = useState('');

  // Delete Confirmation State
  const [deleteModal, setDeleteModal] = useState(false);
  const [pocketToDelete, setPocketToDelete] = useState<{id: number, name: string, balance: number} | null>(null);

  const totalBalance = pockets.reduce((acc, curr) => acc + curr.balance, 0);

  const addPocket = () => {
    if (!newName) return;
    const id = Math.max(0, ...pockets.map(p => p.id)) + 1;
    setPockets(prev => [...prev, { 
      id, 
      name: newName, 
      balance: Number(newAmount) || 0,
      icon: 'folder-outline',
      color: labelColor
    }]);
    setShowAdd(false);
    setNewName('');
    setNewAmount('');
    setSourcePocketId('main');
  };

  const startRename = (id: number, currentName: string) => {
    setRenameTarget(id);
    setRenameValue(currentName);
    setRenameModal(true);
  };

  const applyRename = () => {
    if (renameTarget == null || !renameValue) return;
    setPockets(prev => prev.map(p => p.id === renameTarget ? { ...p, name: renameValue } : p));
    setRenameModal(false);
  };

  const startMove = (sourceId: number) => {
    setMoveSource(sourceId);
    setMoveTarget(null); 
    setMoveAmount('');
    setMoveModal(true);
  };

  const applyMove = () => {
    setMoveModal(false);
  };

  const startDelete = (id: number, name: string, balance: number) => {
    setPocketToDelete({ id, name, balance });
    setDeleteModal(true);
  };

  const applyDelete = () => {
    if (pocketToDelete) {
      setPockets(prev => prev.filter(p => p.id !== pocketToDelete.id));
      setDeleteModal(false);
      setPocketToDelete(null);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Header Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Your Pockets</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.newBtn, { backgroundColor: colors.card, borderColor: colors.border }]} 
            onPress={() => setShowAdd(true)}
          >
            <Feather name="plus" size={18} color={labelColor} />
            <Text style={[styles.newBtnText, { color: labelColor }]}>New</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => setIsEditMode(!isEditMode)}
            style={[styles.editBtn, { backgroundColor: colors.card, borderColor: isEditMode ? colors.error : colors.border }]}
          >
            <Feather name={isEditMode ? "x" : "trash-2"} size={18} color={isEditMode ? colors.error : colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.totalContainer}>
        <Text style={[styles.totalLabel, { color: labelColor }]}>TOTAL BALANCE</Text>
        <Text style={[styles.totalAmount, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>
          <Text style={{ fontSize: 24, fontWeight: '600' }}>RM </Text>
          {formatBalance(totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 }))}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {pockets.map((p, index) => (
          <Animated.View key={p.id} entering={FadeInDown.delay(index * 50)}>
            <View style={[styles.pocketRow, { backgroundColor: colors.card, borderColor: isEditMode ? colors.error + '30' : colors.border }]}> 
              
              <TouchableOpacity 
                style={styles.pocketInfoTouchable} 
                activeOpacity={0.7}
                onPress={() => router.push(`../category/${p.name}`)}
                disabled={isEditMode}
              >
                <View style={[styles.iconWrapper, { backgroundColor: p.color + '15' }]}>
                  <MaterialCommunityIcons name={p.icon as any} size={24} color={p.color} />
                </View>
                <View style={styles.pocketTextGroup}>
                  <Text style={[styles.pocketName, { color: colors.text }]}>{p.name}</Text>
                  <Text style={[styles.pocketBalance, { color: colors.text }]} numberOfLines={1}>
                    <Text style={{ fontSize: 14, fontWeight: '500' }}>RM </Text>
                    {formatBalance(p.balance.toLocaleString(undefined, { minimumFractionDigits: 2 }))}
                  </Text>
                </View>
              </TouchableOpacity>

              <View style={styles.rowActions}>
                {isEditMode ? (
                  <TouchableOpacity 
                    style={[styles.iconBtn, { backgroundColor: colors.error + '10', borderColor: colors.error + '30' }]} 
                    onPress={() => startDelete(p.id, p.name, p.balance)}
                  >
                    <Feather name="trash-2" size={16} color={colors.error} />
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity style={[styles.iconBtn, { borderColor: colors.border }]} onPress={() => startRename(p.id, p.name)}>
                      <Feather name="edit-3" size={16} color={colors.secondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.iconBtn, { borderColor: colors.border }]} onPress={() => startMove(p.id)}>
                      <Feather name="repeat" size={16} color={labelColor} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          </Animated.View>
        ))}
      </ScrollView>

      {/* --- DELETE MODAL --- */}
      <Modal visible={deleteModal} animationType="fade" transparent={true}>
        <View style={styles.modalCenterOverlay}>
          <View style={[styles.modalCenterCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
            <Feather name="alert-triangle" size={32} color={colors.error} style={{ alignSelf: 'center', marginBottom: 16 }} />
            <Text style={[styles.modalTitle, { color: colors.text, textAlign: 'center' }]}>Delete Pocket?</Text>
            <Text style={[styles.modalSubTitle, { color: colors.secondary, textAlign: 'center', marginVertical: 16 }]}>
              "{pocketToDelete?.name}" will be removed. Funds will return to Main Account.
            </Text>
            <View style={styles.modalRowActions}>
              <TouchableOpacity style={[styles.modalBtnHalf, { borderColor: colors.border }]} onPress={() => setDeleteModal(false)}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtnHalf, { backgroundColor: colors.error }]} onPress={applyDelete}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Delete</Text>
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

              <Text style={[styles.inputLabel, { color: labelColor }]}>POCKET NAME</Text>
              <TextInput placeholder="e.g. Savings" placeholderTextColor={colors.secondary} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} value={newName} onChangeText={setNewName} />
              
              <Text style={[styles.inputLabel, { color: labelColor, marginTop: 16 }]}>INITIAL AMOUNT (RM)</Text>
              <TextInput placeholder="0.00" placeholderTextColor={colors.secondary} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} value={newAmount} onChangeText={setNewAmount} keyboardType="decimal-pad" />
              
              <TouchableOpacity style={[styles.modalPrimaryAction, { backgroundColor: labelColor }]} onPress={addPocket}>
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>Create Pocket</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* --- RENAME MODAL --- */}
      <Modal visible={renameModal} animationType="fade" transparent={true}>
        <View style={styles.modalCenterOverlay}>
          <View style={[styles.modalCenterCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
            <Text style={[styles.modalTitle, { color: colors.text, marginBottom: 16 }]}>Rename Pocket</Text>
            <TextInput style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background, marginBottom: 24 }]} value={renameValue} onChangeText={setRenameValue} autoFocus />
            <View style={styles.modalRowActions}>
              <TouchableOpacity style={[styles.modalBtnHalf, { borderColor: colors.border }]} onPress={() => setRenameModal(false)}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtnHalf, { backgroundColor: labelColor }]} onPress={applyRename}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Save</Text>
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
    paddingBottom: 16,
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800', flex: 1 },
  headerActions: { flexDirection: 'row', gap: 8 },
  newBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 4, 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    borderRadius: 12,
    borderWidth: 1,
  },
  newBtnText: { fontSize: 14, fontWeight: '700' },
  editBtn: { 
    width: 38, 
    height: 38, 
    borderRadius: 12, 
    borderWidth: 1, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  totalContainer: { paddingHorizontal: 20, marginBottom: 24, alignItems: 'center' },
  totalLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, marginBottom: 8 },
  totalAmount: { fontSize: 36, fontWeight: '800', letterSpacing: -0.5 },
  list: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  pocketRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 20, 
    borderWidth: 1 
  },
  pocketInfoTouchable: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  pocketTextGroup: { flex: 1 },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pocketName: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  pocketBalance: { fontSize: 18, fontWeight: '800' },
  rowActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { 
    width: 38, 
    height: 38, 
    borderRadius: 12, 
    borderWidth: 1,
    alignItems: 'center', 
    justifyContent: 'center'
  },
  
  /* Modals */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalCenterOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)', padding: 20 },
  modalCenterCard: { width: '100%', padding: 24, borderRadius: 24, borderWidth: 1 },
  modalSheet: { padding: 24, borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingBottom: Platform.OS === 'ios' ? 40 : 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalSubTitle: { fontSize: 15, lineHeight: 22 },
  inputLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1.2, marginBottom: 12 },
  input: { borderWidth: 1, borderRadius: 16, padding: 16, fontSize: 16, fontWeight: '600' },
  modalPrimaryAction: { paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 24 },
  modalRowActions: { flexDirection: 'row', gap: 12 },
  modalBtnHalf: { flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1 },
});