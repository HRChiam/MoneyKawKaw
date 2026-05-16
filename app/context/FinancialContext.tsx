import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

export interface Pocket {
  id: number;
  name: string;
  balance: number;
  icon: string;
  color: string;
  isFixed: boolean;
}

interface FinancialContextType {
  income: number;
  setIncome: (val: number) => void;
  expenses: Record<string, number>;
  setExpenses: (val: Record<string, number>) => void;
  pockets: Pocket[];
  setPockets: Dispatch<SetStateAction<Pocket[]>>;
  syncPocketsWithExpenses: () => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

const defaultExpenses = {
  'Loan': 1000,
  'F&B': 800,
  'Transport': 400,
  'Groceries': 800,
  'Entertainment': 800,
};

const fixedPocketNames = ['Saving', 'Loan', 'Insurance'];

const pocketColors: Record<string, string> = {
  'Loan': '#FBBF24',
  'F&B': '#FB7185',
  'Transport': '#60A5FA',
  'Groceries': '#34D399',
  'Entertainment': '#F472B6',
  'Saving': '#15fabd',
  'Insurance': '#3b82f6',
  'Other': '#94A3B8',
};

const pocketIcons: Record<string, string> = {
  'Loan': 'bank-outline',
  'F&B': 'food-fork-drink',
  'Transport': 'car-side',
  'Groceries': 'cart-outline',
  'Entertainment': 'controller-classic-outline',
  'Saving': 'safe',
  'Insurance': 'shield-check-outline',
  'Other': 'folder-outline',
};

export const FinancialProvider = ({ children }: { children: ReactNode }) => {
  const [income, setIncome] = useState(5000);
  const [expenses, setExpenses] = useState<Record<string, number>>(defaultExpenses);
  const [pockets, setPockets] = useState<Pocket[]>([
    { id: 1, name: 'Saving', balance: 1200, icon: 'safe', color: '#15fabd', isFixed: true },
    { id: 2, name: 'F&B', balance: 800, icon: 'food-fork-drink', color: '#FB7185', isFixed: false },
    { id: 3, name: 'Transport', balance: 400, icon: 'car-side', color: '#60A5FA', isFixed: false },
    { id: 4, name: 'Loan', balance: 1000, icon: 'bank-outline', color: '#FBBF24', isFixed: true },
    { id: 5, name: 'Groceries', balance: 800, icon: 'cart-outline', color: '#34D399', isFixed: false },
    { id: 6, name: 'Entertainment', balance: 800, icon: 'controller-classic-outline', color: '#F472B6', isFixed: false },
    { id: 7, name: 'Insurance', balance: 600, icon: 'shield-check-outline', color: '#3b82f6', isFixed: true },
  ]);

  const syncPocketsWithExpenses = () => {
    const newPockets: Pocket[] = Object.entries(expenses).map(([name, amount], index) => ({
      id: index + 100, // Offset to avoid collisions with manual pockets
      name,
      balance: amount,
      icon: pocketIcons[name] || 'folder-outline',
      color: pocketColors[name] || '#771FFF',
      isFixed: fixedPocketNames.includes(name),
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