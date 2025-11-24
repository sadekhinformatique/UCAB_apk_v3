import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Transaction, Member, TransactionType, Gender, Budget, AppSettings, ExpenseCategory, CommunityMessage, Sector, Level } from '../types';
import { ADMIN_EMAIL, ADMIN_PASS } from '../constants';

interface StoreContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id' | 'status' | 'signature'>) => Promise<void>;
  approveTransaction: (id: string) => Promise<void>;
  rejectTransaction: (id: string) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  
  members: Member[];
  addMember: (m: Omit<Member, 'id' | 'uniqueId'>) => Promise<void>;
  deleteMember: (id: string) => Promise<void>;

  budgets: Budget[];
  updateBudget: (id: string, amount: number, category: string) => Promise<void>;

  settings: AppSettings;
  updateSettings: (s: AppSettings) => Promise<void>;

  messages: CommunityMessage[];
  addMessage: (content: string) => Promise<void>;
  deleteMessage: (id: string) => Promise<void>;
  
  stats: {
    balance: number;
    totalIncome: number;
    totalExpense: number;
    pendingCount: number;
  };
  isLoading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// API Helper
const API_URL = '/.netlify/functions/api';

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    associationName: 'A.E.U.C.A.B.DK',
    currency: 'FCFA',
    logoUrl: ''
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load Data from DB on Mount
  const refreshData = async () => {
    try {
      const res = await fetch(`${API_URL}?action=init`);
      if (res.ok) {
        const data = await res.json();
        
        // Map DB fields to Frontend Types (snake_case to camelCase correction if needed, 
        // strictly speaking postgres.js returns columns as is, usually snake_case in DB)
        // For simplicity, we assume the API handles mapping or we map here.
        // To be safe, let's map manually given the schema.sql uses snake_case
        
        const mapMember = (m: any): Member => ({
            id: m.id, uniqueId: m.unique_id, firstName: m.first_name, lastName: m.last_name,
            dob: m.dob, sector: m.sector as Sector, level: m.level as Level, gender: m.gender as Gender,
            dossierNumber: m.dossier_number, ine: m.ine, balance: parseFloat(m.balance)
        });

        const mapTransaction = (t: any): Transaction => ({
            id: t.id, type: t.type as TransactionType, category: t.category, amount: parseFloat(t.amount),
            date: t.date, description: t.description, performedBy: t.performed_by, matricule: t.matricule,
            function: t.function, receiptNumber: t.receipt_number, status: t.status, responsible: t.responsible, signature: t.signature,
            proofUrl: t.proof_url
        });

        const mapBudget = (b: any): Budget => ({
            id: b.id, category: b.category, allocatedAmount: parseFloat(b.allocated_amount), spentAmount: 0, year: b.year
        });
        
        const mapMessage = (m: any): CommunityMessage => ({
            id: m.id, userId: m.user_id, userName: m.user_name, userRole: m.user_role as UserRole,
            content: m.content, timestamp: m.timestamp,
            memberInfo: m.member_info_json ? JSON.parse(m.member_info_json) : undefined
        });

        if (data.members) setMembers(data.members.map(mapMember));
        if (data.transactions) setTransactions(data.transactions.map(mapTransaction));
        if (data.messages) setMessages(data.messages.map(mapMessage));
        
        // Settings
        if (data.settings && data.settings.association_name) {
            setSettings({
                associationName: data.settings.association_name,
                currency: data.settings.currency,
                logoUrl: data.settings.logo_url || ''
            });
        }

        // Handle Budgets (Merge with defaults if empty)
        let dbBudgets = data.budgets ? data.budgets.map(mapBudget) : [];
        if (dbBudgets.length === 0) {
            dbBudgets = Object.values(ExpenseCategory).map((cat, index) => ({
                id: `b-${index}`, category: cat, allocatedAmount: 0, spentAmount: 0, year: new Date().getFullYear()
            }));
        }
        setBudgets(dbBudgets);
      }
    } catch (e) {
      console.error("Failed to fetch initial data", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Calculate spent amounts for budgets locally
  useEffect(() => {
    const newBudgets = budgets.map(b => {
      const spent = transactions
        .filter(t => t.type === TransactionType.EXPENSE && t.category === b.category && t.status === 'APPROVED')
        .reduce((acc, t) => acc + t.amount, 0);
      return { ...b, spentAmount: spent };
    });
    // Deep compare to avoid infinite loop
    if (JSON.stringify(newBudgets) !== JSON.stringify(budgets)) {
      setBudgets(newBudgets);
    }
  }, [transactions]); // removed budgets from dependency to avoid loop

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
        const res = await fetch(`${API_URL}?action=login`, {
            method: 'POST',
            body: JSON.stringify({ email, password: pass })
        });
        if (res.ok) {
            const data = await res.json();
            const u = data.user;
            setUser({
                email: u.email,
                name: u.name,
                role: u.role as UserRole,
                memberId: u.member_id
            });
            return true;
        }
    } catch(e) { console.error(e); }
    return false;
  };

  const logout = () => setUser(null);

  const addTransaction = async (t: Omit<Transaction, 'id' | 'status' | 'signature'>) => {
    const newTx: Transaction = {
      ...t,
      id: Math.random().toString(36).substr(2, 9),
      status: (user?.role === UserRole.TRESORIER) ? 'APPROVED' : 'PENDING',
      signature: `SIG-${Date.now()}`,
      receiptNumber: t.type === TransactionType.INCOME ? `REC-${Date.now()}` : undefined
    };
    
    // Optimistic UI
    setTransactions(prev => [newTx, ...prev]);

    await fetch(`${API_URL}?action=add_transaction`, {
        method: 'POST', body: JSON.stringify(newTx)
    });
  };

  const approveTransaction = async (id: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'APPROVED' } : t));
    await fetch(`${API_URL}?action=update_transaction_status`, {
        method: 'POST', body: JSON.stringify({ id, status: 'APPROVED' })
    });
  };

  const rejectTransaction = async (id: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'REJECTED' } : t));
    await fetch(`${API_URL}?action=update_transaction_status`, {
        method: 'POST', body: JSON.stringify({ id, status: 'REJECTED' })
    });
  };

  const deleteTransaction = async (id: string) => {
      setTransactions(prev => prev.filter(t => t.id !== id));
      await fetch(`${API_URL}?action=delete_transaction`, {
          method: 'POST', body: JSON.stringify({ id })
      });
  }

  const addMember = async (m: Omit<Member, 'id' | 'uniqueId'>) => {
    const prefix = m.gender === Gender.MALE ? 'A' : 'B';
    const randomSuffix = Math.floor(10000000000 + Math.random() * 90000000000).toString();
    const uniqueId = `${prefix}${randomSuffix}`;

    const newMember: Member = {
      ...m,
      id: Math.random().toString(36).substr(2, 9),
      uniqueId
    };
    setMembers(prev => [...prev, newMember]);

    await fetch(`${API_URL}?action=add_member`, {
        method: 'POST', body: JSON.stringify(newMember)
    });
  };

  const deleteMember = async (id: string) => {
      setMembers(prev => prev.filter(m => m.id !== id));
      await fetch(`${API_URL}?action=delete_member`, {
          method: 'POST', body: JSON.stringify({ id })
      });
  }

  const updateBudget = async (id: string, amount: number, category: string) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, allocatedAmount: amount } : b));
    await fetch(`${API_URL}?action=update_budget`, {
        method: 'POST', 
        body: JSON.stringify({ id, amount, category, year: new Date().getFullYear() })
    });
  };

  const updateSettings = async (s: AppSettings) => {
      setSettings(s);
      await fetch(`${API_URL}?action=update_settings`, {
          method: 'POST', body: JSON.stringify(s)
      });
  };

  // Community
  const addMessage = async (content: string) => {
      if (!user) return;
      
      let memberInfo = undefined;
      if (user.memberId) {
          const m = members.find(mem => mem.id === user.memberId);
          if (m) {
              memberInfo = { sector: m.sector, level: m.level };
          }
      }

      const newMsg: CommunityMessage = {
          id: Math.random().toString(36).substr(2, 9),
          userId: user.email,
          userName: user.name,
          userRole: user.role,
          memberInfo,
          content,
          timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, newMsg]);

      await fetch(`${API_URL}?action=add_message`, {
          method: 'POST', body: JSON.stringify(newMsg)
      });
  };

  const deleteMessage = async (id: string) => {
      setMessages(prev => prev.filter(m => m.id !== id));
      await fetch(`${API_URL}?action=delete_message`, {
          method: 'POST', body: JSON.stringify({ id })
      });
  }

  const totalIncome = transactions
    .filter(t => t.type === TransactionType.INCOME && t.status === 'APPROVED')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === TransactionType.EXPENSE && t.status === 'APPROVED')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = totalIncome - totalExpense;
  const pendingCount = transactions.filter(t => t.status === 'PENDING').length;

  return (
    <StoreContext.Provider value={{
      user,
      login,
      logout,
      transactions,
      addTransaction,
      approveTransaction,
      rejectTransaction,
      deleteTransaction,
      members,
      addMember,
      deleteMember,
      budgets,
      updateBudget,
      settings,
      updateSettings,
      messages,
      addMessage,
      deleteMessage,
      stats: { balance, totalIncome, totalExpense, pendingCount },
      isLoading
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
