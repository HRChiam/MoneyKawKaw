import React, { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from 'react';

export interface Pocket {
  id: string;
  name: string;
  balance: number;
  icon: string;
  color: string;
  isFixed: boolean;
}

interface FinancialContextType {
  username: string;
  mainBalance: number;
  dailyLimit: number;
  todaySpent: number;
  refreshUserProfile: () => Promise<void>;
  income: number;
  setIncome: (val: number) => void;
  expenses: Record<string, number>;
  setExpenses: (val: Record<string, number>) => void;
  pockets: Pocket[];
  setPockets: Dispatch<SetStateAction<Pocket[]>>;
  syncPocketsWithExpenses: () => void;
  loading: boolean;
  streak: number;
  refreshPockets: () => Promise<void>;
  addNewPocket: (name: string, isFixed: boolean) => Promise<boolean>;
  renameUserPocket: (id: string, name: string) => Promise<boolean>;
  deleteUserPocket: (id: string) => Promise<boolean>;
  transferFunds: (sourceId: string, destId: string, amount: number) => Promise<boolean>;
  updateSalary: (amount: number) => Promise<boolean>;
  refreshAllData: () => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';
export const MOCK_USER_ID = 'de458832-a0c0-45a6-a9b3-471db31a2f7e';

const pocketColors: Record<string, string> = {
  'Loan': '#FBBF24',
  'F&B': '#FB7185',
  'Food': '#FB7185',
  'Drinks': '#60A5FA',
  'Transport': '#60A5FA',
  'Groceries': '#34D399',
  'Entertainment': '#F472B6',
  'Savings': '#15fabd',
  'Saving': '#15fabd',
  'Insurance': '#3b82f6',
  'Rental/House Loan': '#A78BFA',
  'PTPTN': '#F87171',
  'Car Loan': '#34D399',
  'Shopping': '#F472B6',
  'Other': '#94A3B8',
};

const pocketIcons: Record<string, string> = {
  'Loan': 'bank-outline',
  'F&B': 'food-fork-drink',
  'Food': 'food-fork-drink',
  'Drinks': 'coffee-outline',
  'Transport': 'car-side',
  'Groceries': 'cart-outline',
  'Entertainment': 'controller-classic-outline',
  'Savings': 'safe',
  'Saving': 'safe',
  'Insurance': 'shield-check-outline',
  'Rental/House Loan': 'home-outline',
  'PTPTN': 'school-outline',
  'Car Loan': 'car-outline',
  'Shopping': 'shopping-outline',
  'Other': 'folder-outline',
};

export const FinancialProvider = ({ children }: { children: ReactNode }) => {
  const [username, setUsername] = useState('User');
  const [mainBalance, setMainBalance] = useState(0.00);
  const [dailyLimit, setDailyLimit] = useState(100.00);
  const [todaySpent, setTodaySpent] = useState(0.00);
  const [income, setIncome] = useState(5000);
  const [expenses, setExpenses] = useState<Record<string, number>>({});
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  
  const refreshUserProfile = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/${MOCK_USER_ID}`);
      if (res.ok) {
        const data = await res.json();
        setUsername(data.username || 'Xuan Wei');
        setMainBalance(data.main_balance || 0.0);
        setIncome(data.monthly_income || 0);
        setStreak(data.current_streak || 0);
        
        // Also fetch daily summary for limit and spent
        const summaryRes = await fetch(`${API_BASE_URL}/api/users/${MOCK_USER_ID}/daily-summary`);
        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          setDailyLimit(summaryData.daily_limit || 250.00);
          setTodaySpent(summaryData.today_spent || 50.50);
        }
      }
    } catch (e) {
      console.error("Error fetching daily status metadata payload:", e);
    }
  };

  // GET: Fetch context payload
  const refreshPockets = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/users/${MOCK_USER_ID}/pockets`);
      const data = await res.json();

      if (data.pockets) {
        const transformed: Pocket[] = data.pockets.map((p: any) => {
          // 1. Defensively look for balance across all field naming variants
          const rawBalance =
            p.current_balance !== undefined ? p.current_balance :
              p.current_pocket_balance !== undefined ? p.current_pocket_balance :
                p.balance !== undefined ? p.balance : 0;

          // 2. Parse cleanly, fallback to 0 if parsing evaluates to NaN
          const parsedBalance = typeof rawBalance === 'string' ? parseFloat(rawBalance) : rawBalance;
          const typeString = (p.pocket_type || p.type || '').toLowerCase();

          return {
            id: p.pocket_id || p.id,
            name: p.pocket_name || p.name || 'Unnamed Pocket',
            balance: isNaN(parsedBalance) ? 0 : parsedBalance,
            isFixed: typeString === 'fixed',
            icon: pocketIcons[p.pocket_name || p.name] || 'folder-outline',
            color: pocketColors[p.pocket_name || p.name] || '#771FFF'
          };
        });
        setPockets(transformed);
      }
    } catch (e) {
      console.error("Error synchronizing tracking store states: ", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refreshPockets(); }, []);

  // Backwards compatibility layer for older code blocks
  const syncPocketsWithExpenses = () => {
    console.log("Pockets are directly backed by the Supabase engine now.");
  };

  // POST: Add new item resource
  const addNewPocket = async (name: string, isFixed: boolean) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users/${MOCK_USER_ID}/pockets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pocket_name: name,
          pocket_type: isFixed ? 'FIXED' : 'VARIABLE'
        })
      });
      if (res.ok) {
        await refreshPockets();
        return true;
      }
    } catch (e) { console.error("Error creating new pocket structural node:", e); }
    return false;
  };

  // PUT: Mutation logic transformation handler
  const renameUserPocket = async (id: string, name: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/pockets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pocket_name: name })
      });
      if (res.ok) {
        await refreshPockets();
        return true;
      }
    } catch (e) { console.error(e); }
    return false;
  };

  // DELETE: Removal tracking handler configuration
  const deleteUserPocket = async (id: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/pockets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshPockets();
        return true;
      }
    } catch (e) { console.error(e); }
    return false;
  };

  // POST: Funds routing executor operation mapping
  const transferFunds = async (sourceId: string, destId: string, amount: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/pocket-transfers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: MOCK_USER_ID,
          source_pocket_id: sourceId,
          destination_pocket_id: destId,
          amount
        })
      });
      if (res.ok) {
        await refreshPockets();
        return true;
      }
    } catch (e) { console.error(e); }
    return false;
  };

  const updateSalary = async (amount: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/${MOCK_USER_ID}/salary`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthly_income: amount })
      });
      if (res.ok) {
        await refreshUserProfile();
        return true;
      }
    } catch (e) { console.error("Error updating salary state payload:", e); }
    return false;
  };

  const refreshAllData = async () => {
    setLoading(true);
    // Fires fetch operations sequentially
    await refreshPockets();
    await refreshUserProfile();
    setLoading(false);
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  return (
    <FinancialContext.Provider value={{
      username,
      mainBalance,
      dailyLimit,
      todaySpent,
      refreshUserProfile,
      income,
      setIncome,
      expenses,
      setExpenses,
      pockets,
      setPockets,                 // Securely exported context token property
      syncPocketsWithExpenses,    // Securely exported context token property
      loading,
      streak,
      refreshPockets,
      addNewPocket,
      renameUserPocket,
      deleteUserPocket,
      transferFunds,
      updateSalary,
      refreshAllData
    }}>
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) throw new Error('useFinancial must be configured inside structured boundaries');
  return context;
};