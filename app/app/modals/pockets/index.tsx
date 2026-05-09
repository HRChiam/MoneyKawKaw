import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function PocketsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [pockets, setPockets] = useState([
    { id: 1, name: 'Saving', balance: 50 },
    { id: 2, name: 'Food', balance: 800 },
    { id: 3, name: 'Transport', balance: 200 },
  ]);

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

  const totalBalance = pockets.reduce((acc, curr) => acc + curr.balance, 0);

  const addPocket = () => {
    if (!newName) return;
    const id = Math.max(0, ...pockets.map(p => p.id)) + 1;
    setPockets(prev => [...prev, { id, name: newName, balance: Number(newAmount) || 0 }]);
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
    // UI Only implementation
    setMoveModal(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      {/* Custom Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Your Pockets</Text>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: colors.primary + '15' }]} onPress={() => setShowAdd(true)}>
          <Feather name="plus" size={20} color={colors.primary} />
          <Text style={[styles.addButtonText, { color: colors.primary }]}>New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.totalContainer}>
        <Text style={[styles.totalLabel, { color: colors.secondary }]}>Total Balance</Text>
        <Text style={[styles.totalAmount, { color: colors.text }]} numberOfLines={1} adjustsFontSizeToFit>
          <Text style={styles.currencyPrefix}>RM </Text>
          {totalBalance.toFixed(2)}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {pockets.map(p => (
          <View key={p.id} style={[styles.pocketRow, { backgroundColor: colors.card, borderColor: colors.border }]}> 
            
            {/* Clickable Area to route to Category Screen */}
            <TouchableOpacity 
              style={styles.pocketInfoTouchable} 
              activeOpacity={0.7}
              onPress={() => router.push(`../category/${p.name}`)}
            >
              <View style={[styles.iconWrapper, { backgroundColor: colors.primary + '10' }]}>
                <Ionicons name="folder-outline" size={24} color={colors.primary} />
              </View>
              <View style={styles.pocketTextGroup}>
                <Text style={[styles.pocketName, { color: colors.text }]}>{p.name}</Text>
                <Text style={[styles.pocketBalance, { color: colors.text }]} numberOfLines={1}>
                  <Text style={{ fontSize: 14 }}>RM </Text>{p.balance.toFixed(2)}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Independent Action Buttons */}
            <View style={styles.rowActions}>
              <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={() => startRename(p.id, p.name)}>
                <Feather name="edit-2" size={16} color={colors.secondary} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={() => startMove(p.id)}>
                <Feather name="repeat" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* --- ADD POCKET MODAL --- */}
      <Modal visible={showAdd} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardAvoiding}>
            <View style={[styles.modalSheet, { backgroundColor: colors.card }]}> 
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Create New Pocket</Text>
                <TouchableOpacity onPress={() => setShowAdd(false)}>
                  <Feather name="x" size={24} color={colors.secondary} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, { color: colors.text }]}>Pocket Name</Text>
              <TextInput placeholder="e.g. Vacation Fund" placeholderTextColor={colors.secondary} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} value={newName} onChangeText={setNewName} />
              
              <Text style={[styles.inputLabel, { color: colors.text }]}>Initial Amount (RM)</Text>
              <TextInput placeholder="0.00" placeholderTextColor={colors.secondary} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} value={newAmount} onChangeText={setNewAmount} keyboardType="decimal-pad" />
              
              <Text style={[styles.inputLabel, { color: colors.text }]}>Fund From</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
                <TouchableOpacity 
                  style={[styles.chip, sourcePocketId === 'main' ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => setSourcePocketId('main')}
                >
                  <Text style={{ color: sourcePocketId === 'main' ? '#fff' : colors.text, fontWeight: '600' }}>Main Account (RM 0.00)</Text>
                </TouchableOpacity>
                {pockets.map(p => (
                  <TouchableOpacity 
                    key={p.id}
                    style={[styles.chip, sourcePocketId === p.id ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={() => setSourcePocketId(p.id)}
                  >
                    <Text style={{ color: sourcePocketId === p.id ? '#fff' : colors.text, fontWeight: '600' }}>{p.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity style={[styles.modalPrimaryAction, { backgroundColor: colors.primary }]} onPress={addPocket}>
                <Text style={styles.modalActionTextWhite}>Create Pocket</Text>
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
              <TouchableOpacity style={[styles.modalBtnHalf, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={() => setRenameModal(false)}>
                <Text style={[styles.modalActionText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtnHalf, { backgroundColor: colors.primary }]} onPress={applyRename}>
                <Text style={styles.modalActionTextWhite}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- MOVE MONEY MODAL --- */}
      <Modal visible={moveModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardAvoiding}>
            <View style={[styles.modalSheet, { backgroundColor: colors.card }]}> 
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Move Money</Text>
                <TouchableOpacity onPress={() => setMoveModal(false)}>
                  <Feather name="x" size={24} color={colors.secondary} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, { color: colors.text }]}>From</Text>
              <View style={[styles.staticChip, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.staticChipText, { color: colors.text }]}>
                  {moveSource === 'main' ? 'Main Account' : pockets.find(p=>p.id===moveSource)?.name}
                </Text>
              </View>

              <Text style={[styles.inputLabel, { color: colors.text, marginTop: 16 }]}>To</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
                 <TouchableOpacity 
                  style={[styles.chip, moveTarget === 'main' ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => setMoveTarget('main')}
                >
                  <Text style={{ color: moveTarget === 'main' ? '#fff' : colors.text, fontWeight: '600' }}>Main Account</Text>
                </TouchableOpacity>
                {pockets.filter(p => p.id !== moveSource).map(p => (
                  <TouchableOpacity 
                    key={p.id}
                    style={[styles.chip, moveTarget === p.id ? { backgroundColor: colors.primary, borderColor: colors.primary } : { backgroundColor: colors.background, borderColor: colors.border }]}
                    onPress={() => setMoveTarget(p.id)}
                  >
                    <Text style={{ color: moveTarget === p.id ? '#fff' : colors.text, fontWeight: '600' }}>{p.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[styles.inputLabel, { color: colors.text, marginTop: 16 }]}>Amount (RM)</Text>
              <TextInput placeholder="0.00" placeholderTextColor={colors.secondary} style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]} value={moveAmount} onChangeText={setMoveAmount} keyboardType="decimal-pad" />
              
              <TouchableOpacity style={[styles.modalPrimaryAction, { backgroundColor: colors.primary, marginTop: 8 }]} onPress={applyMove}>
                <Text style={styles.modalActionTextWhite}>Confirm Transfer</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
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
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  title: { fontSize: 20, fontWeight: '800' },
  addButton: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8, 
    paddingHorizontal: 16, 
    borderRadius: 20 
  },
  addButtonText: { fontWeight: '700', fontSize: 15 },
  totalContainer: { paddingHorizontal: 20, marginBottom: 12, alignItems: 'center', width: '100%' },
  totalLabel: { fontSize: 14, fontWeight: '500', marginBottom: 4, textAlign: 'center' },
  currencyPrefix: { fontSize: 18, fontWeight: '600' },
  totalAmount: { fontSize: 36, fontWeight: '800', letterSpacing: -1, textAlign: 'center' },
  list: { paddingHorizontal: 20, paddingBottom: 120, gap: 16, width: '100%', flexGrow: 1 },
  pocketRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 16, 
    borderRadius: 20, 
    borderWidth: 1 
  },
  pocketInfoTouchable: {
    flex: 1, // Takes up remaining space pushing buttons to the right
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  pocketTextGroup: { flex: 1, paddingRight: 8 },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pocketName: { fontSize: 16, fontWeight: '600', marginBottom: 4 },
  pocketBalance: { fontSize: 18, fontWeight: '800' },
  rowActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  /* Modals */
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  keyboardAvoiding: {
    width: '100%',
  },
  modalSheet: { 
    padding: 24, 
    borderTopLeftRadius: 32, 
    borderTopRightRadius: 32,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalCenterOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalCenterCard: { width: '100%', padding: 24, borderRadius: 24, borderWidth: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  inputLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 16, padding: 16, fontSize: 16, fontWeight: '500', marginBottom: 8 },
  chipScroll: { gap: 8, paddingBottom: 8 },
  chip: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  staticChip: { paddingVertical: 16, paddingHorizontal: 16, borderRadius: 16, borderWidth: 1 },
  staticChipText: { fontSize: 16, fontWeight: '600' },
  modalPrimaryAction: { paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 24 },
  modalActionTextWhite: { color: '#fff', fontWeight: '700', fontSize: 16 },
  modalActionText: { fontWeight: '700', fontSize: 16 },
  modalRowActions: { flexDirection: 'row', gap: 12 },
  modalBtnHalf: { flex: 1, paddingVertical: 16, borderRadius: 16, alignItems: 'center', borderWidth: 1 },
});