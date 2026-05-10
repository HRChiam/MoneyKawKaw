import { useRef, useState, useEffect } from 'react';
import { Animated, Alert } from 'react-native';

export type StoreItem = {
  id: string;
  name: string;
  cost: number;
  image: any;
  setter: (val: boolean) => void;
};

export function useGxSpaceRoom(
  points: number, 
  setPoints: (v: number | ((n: number) => number)) => void,
  rewards: any
) {
  const {
    ownsChair, setOwnsChair,
    ownsLocker, setOwnsLocker,
    ownsPlant, setOwnsPlant,
    ownsTable, setOwnsTable,
    ownsCurtain, setOwnsCurtain
  } = rewards;

  const [activeTab, setActiveTab] = useState<'furniture' | 'decor'>('furniture');
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const storeAnim = useRef(new Animated.Value(0)).current;
  const avatarAnim = useRef(new Animated.Value(0)).current;
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(avatarAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(avatarAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const openStore = (tab: 'furniture' | 'decor') => {
    setActiveTab(tab);
    if (!isStoreOpen) {
      Animated.spring(storeAnim, { toValue: 1, useNativeDriver: true, bounciness: 6 }).start();
      setIsStoreOpen(true);
    }
  };

  const closeStore = () => {
    Animated.spring(storeAnim, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
    setIsStoreOpen(false);
  };

  const roomScale = storeAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.85] });
  const roomTranslateY = storeAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -150] });
  const storeTranslateY = storeAnim.interpolate({ inputRange: [0, 1], outputRange: [290, 0] });

  const handleIntentToBuy = (item: StoreItem) => setSelectedItem(item);

  const executePurchase = () => {
    if (!selectedItem) return;
    if (points >= selectedItem.cost) {
      // allow setPoints function or value
      if (typeof setPoints === 'function') setPoints((prev: number) => prev - selectedItem.cost);
      selectedItem.setter(true);
      setSelectedItem(null);
    } else {
      setSelectedItem(null);
      setTimeout(() => Alert.alert('Insufficient Points', 'Complete more financial missions to earn points.'), 300);
    }
  };

  return {
    // ownership
    ownsChair,
    ownsLocker,
    ownsPlant,
    ownsTable,
    ownsCurtain,
    setOwnsChair,
    setOwnsLocker,
    setOwnsPlant,
    setOwnsTable,
    setOwnsCurtain,
    // store state
    activeTab,
    isStoreOpen,
    openStore,
    closeStore,
    // animation
    roomScale,
    roomTranslateY,
    storeTranslateY,
    avatarAnim,
    // purchase
    selectedItem,
    setSelectedItem,
    handleIntentToBuy,
    executePurchase,
  } as const;
}

export default useGxSpaceRoom;
