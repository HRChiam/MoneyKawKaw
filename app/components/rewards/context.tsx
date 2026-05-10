import React, { createContext, useContext, useState, ReactNode } from 'react';

interface RewardsContextType {
  points: number;
  setPoints: React.Dispatch<React.SetStateAction<number>>;
  streak: number;
  setStreak: React.Dispatch<React.SetStateAction<number>>;
  freezeStreaks: number;
  setFreezeStreaks: React.Dispatch<React.SetStateAction<number>>;
  ownsChair: boolean;
  setOwnsChair: React.Dispatch<React.SetStateAction<boolean>>;
  ownsLocker: boolean;
  setOwnsLocker: React.Dispatch<React.SetStateAction<boolean>>;
  ownsPlant: boolean;
  setOwnsPlant: React.Dispatch<React.SetStateAction<boolean>>;
  ownsTable: boolean;
  setOwnsTable: React.Dispatch<React.SetStateAction<boolean>>;
  ownsCurtain: boolean;
  setOwnsCurtain: React.Dispatch<React.SetStateAction<boolean>>;
}

const RewardsContext = createContext<RewardsContextType | undefined>(undefined);

export const RewardsProvider = ({ children }: { children: ReactNode }) => {
  const [points, setPoints] = useState(1357);
  const [streak, setStreak] = useState(12); // Example: 12 day streak
  const [freezeStreaks, setFreezeStreaks] = useState(2); // Example: 2 freezes available
  const [ownsChair, setOwnsChair] = useState(false);
  const [ownsLocker, setOwnsLocker] = useState(false);
  const [ownsPlant, setOwnsPlant] = useState(false);
  const [ownsTable, setOwnsTable] = useState(false);
  const [ownsCurtain, setOwnsCurtain] = useState(false);

  return (
    <RewardsContext.Provider value={{
      points, setPoints,
      streak, setStreak,
      freezeStreaks, setFreezeStreaks,
      ownsChair, setOwnsChair,
      ownsLocker, setOwnsLocker,
      ownsPlant, setOwnsPlant,
      ownsTable, setOwnsTable,
      ownsCurtain, setOwnsCurtain
    }}>
      {children}
    </RewardsContext.Provider>
  );
};

export const useRewards = () => {
  const context = useContext(RewardsContext);
  if (!context) {
    throw new Error('useRewards must be used within a RewardsProvider');
  }
  return context;
};
