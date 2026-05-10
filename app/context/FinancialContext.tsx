import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Pocket {
  id: number;
  name: string;
  balance: number;
  icon: string;
  color: string;
}

interface FinancialContextType {
  income: number;
  setIncome: (val: number) => void;
  expenses: Record<string, number>;
  setExpenses: (val: Record<string, number>) => void;
  pockets: Pocket[];
  setPockets: (val: Pocket[]) => void;
  syncPocketsWithExpenses: () => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

const defaultExpenses = {
  'Room Rental': 1200,
  'PTPTN': 200,
  'Car Loan': 800,
  'Insurance': 300,
  'Groceries': 600,
  'Utilities': 250,
  'Other': 0
};

const pocketColors: Record<string, string> = {
  'Room Rental': '#771FFF',
  'PTPTN': '#60A5FA',
  'Car Loan': '#FBBF24',
  'Insurance': '#34D399',
  'Groceries': '#FB7185',
  'Utilities': '#F472B6',
  'Other': '#94A3B8',
};

const pocketIcons: Record<string, string> = {
  'Room Rental': 'home-outline',
  'PTPTN': 'school-outline',
  'Car Loan': 'car-outline',
  'Insurance': 'shield-check-outline',
  'Groceries': 'cart-outline',
  'Utilities': 'flash-outline',
  'Other': 'folder-outline',
};

export const FinancialProvider = ({ children }: { children: ReactNode }) => {
  const [income, setIncome] = useState(5000);
  const [expenses, setExpenses] = useState<Record<string, number>>(defaultExpenses);
  const [pockets, setPockets] = useState<Pocket[]>([
    { id: 1, name: 'Saving', balance: 50, icon: 'safe', color: '#15fabd' },
    { id: 2, name: 'Food', balance: 800, icon: 'food-fork-drink', color: '#FB7185' },
    { id: 3, name: 'Transport', balance: 200, icon: 'car-side', color: '#60A5FA' },
  ]);

  const syncPocketsWithExpenses = () => {
    const newPockets: Pocket[] = Object.entries(expenses).map(([name, amount], index) => ({
      id: index + 100, // Offset to avoid collisions with manual pockets
      name,
      balance: amount,
      icon: pocketIcons[name] || 'folder-outline',
      color: pocketColors[name] || '#771FFF',
    }));

    // Keep the 'Saving' pocket if it exists
    const savingPocket = pockets.find(p => p.name === 'Saving');
    const finalPockets = savingPocket ? [savingPocket, ...newPockets] : newPockets;
    
    setPockets(finalPockets);
  };

  return (
    <FinancialContext.Provider value={{
      income, setIncome,
      expenses, setExpenses,
      pockets, setPockets,
      syncPocketsWithExpenses
    }}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
