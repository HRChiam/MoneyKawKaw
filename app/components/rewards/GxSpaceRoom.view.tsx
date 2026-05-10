import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Animated, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { StoreItem } from './GxSpaceRoom.logic';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type Props = ReturnType<typeof import('./GxSpaceRoom.logic').useGxSpaceRoom> & {
  points: number;
  setPoints: React.Dispatch<React.SetStateAction<number>>;
};

export default function GxSpaceRoomView(props: Props) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

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
    avatarAnim,
    handleIntentToBuy,
    selectedItem,
    setSelectedItem,
    executePurchase,
  } = props;

  const floatY = avatarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.roomContainer, { transform: [{ scale: roomScale }, { translateY: roomTranslateY }] }]}>
        <Image source={require('@/assets/images/room-bg.png')} style={styles.backgroundImage} resizeMode="contain" />
        
        {/* User Avatar */}
        <Animated.View style={[styles.avatarContainer, { transform: [{ translateY: floatY }] }]}>
          <Image source={require('@/assets/images/StickMan3D.png')} style={styles.avatar} resizeMode="contain" />
        </Animated.View>

        {ownsLocker && <Image source={require('@/assets/images/locker.png')} style={[styles.item, styles.lockerPos]} />}
        {ownsTable && <Image source={require('@/assets/images/table.png')} style={[styles.item, styles.tablePos]} />}
        {ownsChair && <Image source={require('@/assets/images/chair.png')} style={[styles.item, styles.chairPos]} />}
        {ownsPlant && <Image source={require('@/assets/images/plant.png')} style={[styles.item, styles.plantPos]} />}
      </Animated.View>

      <Animated.View style={[styles.storeSheet, { backgroundColor: 'rgba(28, 13, 51, 0.94)', borderColor: 'rgba(255,255,255,0.1)', transform: [{ translateY: storeTranslateY }] }]}>
        <View style={[styles.tabBar, { borderBottomColor: 'rgba(255,255,255,0.05)' }]}>
          <TouchableOpacity style={styles.tabIconBtn} onPress={() => (isStoreOpen && activeTab === 'furniture' ? closeStore() : openStore('furniture'))}>
            <Ionicons name={isStoreOpen && activeTab === 'furniture' ? 'chevron-down' : 'bed-outline'} size={24} color={activeTab === 'furniture' ? colors.primary : colors.secondary} />
            {isStoreOpen && (
              <Text style={[styles.tabIconText, { color: activeTab === 'furniture' ? colors.primary : colors.secondary }]}>
                {activeTab === 'furniture' ? 'Close' : 'Furniture'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabIconBtn} onPress={() => (isStoreOpen && activeTab === 'decor' ? closeStore() : openStore('decor'))}>
            <Ionicons name={isStoreOpen && activeTab === 'decor' ? 'chevron-down' : 'color-palette-outline'} size={24} color={activeTab === 'decor' ? colors.primary : colors.secondary} />
            {isStoreOpen && (
              <Text style={[styles.tabIconText, { color: activeTab === 'decor' ? colors.primary : colors.secondary }]}>
                {activeTab === 'decor' ? 'Close' : 'Decor'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.storeContent}>
          <View style={styles.grid}>
            {activeTab === 'furniture' ? (
              <>
                <TouchableOpacity 
                  activeOpacity={0.7}
                  style={[styles.buyCard, { backgroundColor: colors.background, borderColor: ownsLocker ? colors.success : colors.border }]} 
                  onPress={() => !ownsLocker && handleIntentToBuy({ id: 'locker', name: 'Locker', cost: 400, image: require('@/assets/images/locker.png'), setter: props.setOwnsLocker as any })}
                >
                  <View style={styles.cardImageContainer}>
                    <Image source={require('@/assets/images/locker.png')} style={[styles.cardImage, ownsLocker && { opacity: 0.6 }]} resizeMode="contain" />
                  </View>
                  <Text style={[styles.itemLabel, { color: colors.text }]}>Locker</Text>
                  <Text style={[styles.priceLabel, { color: ownsLocker ? colors.success : colors.secondary }]}>{ownsLocker ? 'Owned' : '400 pts'}</Text>
                  {ownsLocker && (
                    <View style={styles.placedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                      <Text style={[styles.placedText, { color: colors.success }]}>PLACED</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  activeOpacity={0.7}
                  style={[styles.buyCard, { backgroundColor: colors.background, borderColor: ownsTable ? colors.success : colors.border }]} 
                  onPress={() => !ownsTable && handleIntentToBuy({ id: 'table', name: 'Table', cost: 300, image: require('@/assets/images/table.png'), setter: props.setOwnsTable as any })}
                >
                  <View style={styles.cardImageContainer}>
                    <Image source={require('@/assets/images/table.png')} style={[styles.cardImage, ownsTable && { opacity: 0.6 }]} resizeMode="contain" />
                  </View>
                  <Text style={[styles.itemLabel, { color: colors.text }]}>Table</Text>
                  <Text style={[styles.priceLabel, { color: ownsTable ? colors.success : colors.secondary }]}>{ownsTable ? 'Owned' : '300 pts'}</Text>
                  {ownsTable && (
                    <View style={styles.placedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                      <Text style={[styles.placedText, { color: colors.success }]}>PLACED</Text>
                    </View>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  activeOpacity={0.7}
                  style={[styles.buyCard, { backgroundColor: colors.background, borderColor: ownsChair ? colors.success : colors.border }]} 
                  onPress={() => !ownsChair && handleIntentToBuy({ id: 'chair', name: 'Chair', cost: 250, image: require('@/assets/images/chair.png'), setter: props.setOwnsChair as any })}
                >
                  <View style={styles.cardImageContainer}>
                    <Image source={require('@/assets/images/chair.png')} style={[styles.cardImage, ownsChair && { opacity: 0.6 }]} resizeMode="contain" />
                  </View>
                  <Text style={[styles.itemLabel, { color: colors.text }]}>Chair</Text>
                  <Text style={[styles.priceLabel, { color: ownsChair ? colors.success : colors.secondary }]}>{ownsChair ? 'Owned' : '250 pts'}</Text>
                  {ownsChair && (
                    <View style={styles.placedBadge}>
                      <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                      <Text style={[styles.placedText, { color: colors.success }]}>PLACED</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                activeOpacity={0.7}
                style={[styles.buyCard, { backgroundColor: colors.background, borderColor: ownsPlant ? colors.success : colors.border }]} 
                onPress={() => !ownsPlant && handleIntentToBuy({ id: 'plant', name: 'Plant', cost: 150, image: require('@/assets/images/plant.png'), setter: props.setOwnsPlant as any })}
              >
                <View style={styles.cardImageContainer}>
                  <Image source={require('@/assets/images/plant.png')} style={[styles.cardImage, ownsPlant && { opacity: 0.6 }]} resizeMode="contain" />
                </View>
                <Text style={[styles.itemLabel, { color: colors.text }]}>Plant</Text>
                <Text style={[styles.priceLabel, { color: ownsPlant ? colors.success : colors.secondary }]}>{ownsPlant ? 'Owned' : '150 pts'}</Text>
                {ownsPlant && (
                  <View style={styles.placedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                    <Text style={[styles.placedText, { color: colors.success }]}>PLACED</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animated.View>

      <Modal visible={selectedItem !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.confirmationBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.previewContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>{selectedItem && <Image source={selectedItem.image} style={styles.previewImage} resizeMode="contain" />}</View>
            <Text style={[styles.confirmTitle, { color: colors.text }]}>Purchase {selectedItem?.name}?</Text>
            <Text style={[styles.confirmSub, { color: colors.secondary }]}>This will cost {selectedItem?.cost} points.</Text>
            <View style={styles.confirmActions}>
              <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.secondary }]} onPress={() => setSelectedItem(null)}>
                <Text style={[styles.cancelText, { color: colors.secondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.confirmBtn, { backgroundColor: colors.primary }]} onPress={executePurchase}>
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
  container: { flex: 1, width: '100%', position: 'relative', backgroundColor: 'transparent', overflow: 'hidden' },
  roomContainer: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  backgroundImage: { width: '100%', height: '100%' },
  avatarContainer: { position: 'absolute', bottom: '38%', zIndex: 100, alignItems: 'center' },
  avatar: { width: 140, height: 140 },
  item: { position: 'absolute', width: 120, height: 120, resizeMode: 'contain', zIndex: 50 },
  lockerPos: { top: '47%', left: '26%' },
  tablePos: { bottom: '35%', right: '21%' },
  chairPos: { bottom: '35%', left: '55%' },
  plantPos: { bottom: '36%', left: '17%' },
  storeSheet: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 350, borderTopLeftRadius: 32, borderTopRightRadius: 32, borderWidth: 1, borderBottomWidth: 0, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 20 },
  tabBar: { height: 60, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center', borderBottomWidth: 1 },
  tabIconBtn: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  tabIconText: { fontSize: 10, fontWeight: '600', marginTop: 2 },
  storeContent: { padding: 16, height: 290 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  buyCard: { width: (SCREEN_WIDTH - 52) / 2, padding: 16, borderRadius: 20, borderWidth: 1.5, alignItems: 'center', position: 'relative', overflow: 'hidden' },
  cardImageContainer: { width: 60, height: 60, marginBottom: 8, justifyContent: 'center', alignItems: 'center' },
  cardImage: { width: '100%', height: '100%' },
  itemLabel: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  priceLabel: { fontSize: 12, fontWeight: '800' },
  placedBadge: { position: 'absolute', top: 8, right: 8, flexDirection: 'row', alignItems: 'center', gap: 2 },
  placedText: { fontSize: 8, fontWeight: '900' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.75)', justifyContent: 'center', alignItems: 'center' },
  confirmationBox: { width: '80%', borderRadius: 24, padding: 24, borderWidth: 1, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 15 },
  previewContainer: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 16, borderWidth: 1 },
  previewImage: { width: 60, height: 60 },
  confirmTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  confirmSub: { fontSize: 14, marginBottom: 24 },
  confirmActions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  cancelText: { fontSize: 14, fontWeight: '700' },
  confirmBtn: { flex: 1, flexDirection: 'row', paddingVertical: 14, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  confirmText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
});
