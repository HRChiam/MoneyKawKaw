import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Animated, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { StoreItem } from './GxSpaceRoom.logic';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const colors = {
  primary: '#9333EA',
  primaryEnd: '#C084FC',
  card: '#130822',
  text: '#FFFFFF',
  secondary: '#A78BFA',
  border: '#3B1A60',
  background: '#1C0D33',
};

type Props = ReturnType<typeof import('./GxSpaceRoom.logic').useGxSpaceRoom> & {
  points: number;
  setPoints: React.Dispatch<React.SetStateAction<number>>;
};

export default function GxSpaceRoomView(props: Props) {
  const {
    ownsLocker,
    ownsTable,
    ownsChair,
    ownsPlant,
    activeTab,
    isStoreOpen,
    openStore,
    closeStore,
    roomScale,
    roomTranslateY,
    storeTranslateY,
    handleIntentToBuy,
    selectedItem,
    setSelectedItem,
    executePurchase,
  } = props;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.roomContainer, { transform: [{ scale: roomScale }, { translateY: roomTranslateY }] }]}>
        <Image source={require('@/assets/images/room-bg.png')} style={styles.backgroundImage} resizeMode="contain" />
        {ownsLocker && <Image source={require('@/assets/images/locker.png')} style={[styles.item, styles.lockerPos]} />}
        {ownsTable && <Image source={require('@/assets/images/table.png')} style={[styles.item, styles.tablePos]} />}
        {ownsChair && <Image source={require('@/assets/images/chair.png')} style={[styles.item, styles.chairPos]} />}
        {ownsPlant && <Image source={require('@/assets/images/plant.png')} style={[styles.item, styles.plantPos]} />}
      </Animated.View>

      <Animated.View style={[styles.storeSheet, { transform: [{ translateY: storeTranslateY }] }]}>
        <View style={styles.tabBar}>
          <TouchableOpacity style={styles.tabIconBtn} onPress={() => (isStoreOpen && activeTab === 'furniture' ? closeStore() : openStore('furniture'))}>
            <Ionicons name={isStoreOpen && activeTab === 'furniture' ? 'chevron-down' : 'bed-outline'} size={24} color={activeTab === 'furniture' ? colors.primaryEnd : colors.secondary} />
            <Text style={[styles.tabIconText, { color: activeTab === 'furniture' ? colors.primaryEnd : colors.secondary }]}>{isStoreOpen && activeTab === 'furniture' ? 'Close' : 'Furniture'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabIconBtn} onPress={() => (isStoreOpen && activeTab === 'decor' ? closeStore() : openStore('decor'))}>
            <Ionicons name={isStoreOpen && activeTab === 'decor' ? 'chevron-down' : 'color-palette-outline'} size={24} color={activeTab === 'decor' ? colors.primaryEnd : colors.secondary} />
            <Text style={[styles.tabIconText, { color: activeTab === 'decor' ? colors.primaryEnd : colors.secondary }]}>{isStoreOpen && activeTab === 'decor' ? 'Close' : 'Decor'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.storeContent}>
          <View style={styles.grid}>
            {activeTab === 'furniture' ? (
              <>
                <TouchableOpacity style={[styles.buyCard, ownsLocker && styles.boughtCard]} onPress={() => !ownsLocker && handleIntentToBuy({ id: 'locker', name: 'Locker', cost: 400, image: require('@/assets/images/locker.png'), setter: props.setOwnsLocker as any })}>
                  <View style={styles.cardImageContainer}>
                    <Image source={require('@/assets/images/locker.png')} style={styles.cardImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.itemLabel}>Locker</Text>
                  <Text style={styles.priceLabel}>{ownsLocker ? 'Placed' : '400 pts'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.buyCard, ownsTable && styles.boughtCard]} onPress={() => !ownsTable && handleIntentToBuy({ id: 'table', name: 'Table', cost: 300, image: require('@/assets/images/table.png'), setter: props.setOwnsTable as any })}>
                  <View style={styles.cardImageContainer}>
                    <Image source={require('@/assets/images/table.png')} style={styles.cardImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.itemLabel}>Table</Text>
                  <Text style={styles.priceLabel}>{ownsTable ? 'Placed' : '300 pts'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.buyCard, ownsChair && styles.boughtCard]} onPress={() => !ownsChair && handleIntentToBuy({ id: 'chair', name: 'Chair', cost: 250, image: require('@/assets/images/chair.png'), setter: props.setOwnsChair as any })}>
                  <View style={styles.cardImageContainer}>
                    <Image source={require('@/assets/images/chair.png')} style={styles.cardImage} resizeMode="contain" />
                  </View>
                  <Text style={styles.itemLabel}>Chair</Text>
                  <Text style={styles.priceLabel}>{ownsChair ? 'Placed' : '250 pts'}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={[styles.buyCard, ownsPlant && styles.boughtCard]} onPress={() => !ownsPlant && handleIntentToBuy({ id: 'plant', name: 'Plant', cost: 150, image: require('@/assets/images/plant.png'), setter: props.setOwnsPlant as any })}>
                <View style={styles.cardImageContainer}>
                  <Image source={require('@/assets/images/plant.png')} style={styles.cardImage} resizeMode="contain" />
                </View>
                <Text style={styles.itemLabel}>Plant</Text>
                <Text style={styles.priceLabel}>{ownsPlant ? 'Placed' : '150 pts'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>

      <Modal visible={selectedItem !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationBox}>
            <View style={styles.previewContainer}>{selectedItem && <Image source={selectedItem.image} style={styles.previewImage} resizeMode="contain" />}</View>
            <Text style={styles.confirmTitle}>Purchase {selectedItem?.name}?</Text>
            <Text style={styles.confirmSub}>This will cost {selectedItem?.cost} points.</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedItem(null)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={executePurchase}>
                <Ionicons name="star" size={14} color="#FFF" style={{ marginRight: 4 }} />
                <Text style={styles.confirmText}>Buy Item</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', bottom: -70, position: 'relative', backgroundColor: 'transparent', overflow: 'hidden' },
  roomContainer: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  backgroundImage: { width: '100%', height: '100%' },
  item: { position: 'absolute', width: 120, height: 120, resizeMode: 'contain', zIndex: 50 },
  lockerPos: { top: '47%', left: '26%' },
  tablePos: { bottom: '35%', right: '21%' },
  chairPos: { bottom: '35%', left: '55%' },
  plantPos: { bottom: '36%', left: '17%' },
  storeSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 350, backgroundColor: 'rgba(19, 8, 34, 0.95)', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderBottomWidth: 0, borderColor: colors.border },
  tabBar: { height: 60, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
  tabIconBtn: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  tabIconText: { fontSize: 10, fontWeight: '600', marginTop: 2 },
  storeContent: { padding: 16, height: 290 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  buyCard: { width: (SCREEN_WIDTH - 84) / 2, backgroundColor: '#1C0D33', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  boughtCard: { opacity: 0.5, backgroundColor: '#130822' },
  cardImageContainer: { width: 50, height: 50, marginBottom: 8, justifyContent: 'center', alignItems: 'center' },
  cardImage: { width: '100%', height: '100%' },
  itemLabel: { color: colors.text, fontSize: 14, fontWeight: '600', marginBottom: 4 },
  priceLabel: { color: colors.secondary, fontSize: 11, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'center', alignItems: 'center' },
  confirmationBox: { width: '80%', backgroundColor: colors.card, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: colors.border, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 15 },
  previewContainer: { width: 100, height: 100, backgroundColor: '#1C0D33', borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  previewImage: { width: 60, height: 60 },
  confirmTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  confirmSub: { color: colors.secondary, fontSize: 14, marginBottom: 24 },
  confirmActions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.secondary, alignItems: 'center' },
  cancelText: { color: colors.secondary, fontSize: 14, fontWeight: '700' },
  confirmBtn: { flex: 1, flexDirection: 'row', backgroundColor: colors.primary, paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  confirmText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});