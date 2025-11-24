
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Transaction, Member, TransactionType, Gender, Budget, AppSettings, ExpenseCategory, CommunityMessage, Sector, Level } from '../types';
import { ADMIN_EMAIL, ADMIN_PASS } from '../constants';

interface StoreContextType {
  user: User | null;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  
  transactions: Transaction[];
  addTransaction: (t: Omit<Transaction, 'id' | 'status' | 'signature'>) => void;
  approveTransaction: (id: string) => void;
  rejectTransaction: (id: string) => void;
  deleteTransaction: (id: string) => void;
  
  members: Member[];
  addMember: (m: Omit<Member, 'id' | 'uniqueId'>) => void;
  deleteMember: (id: string) => void;

  budgets: Budget[];
  updateBudget: (id: string, amount: number) => void;

  settings: AppSettings;
  updateSettings: (s: AppSettings) => void;

  messages: CommunityMessage[];
  addMessage: (content: string) => void;
  deleteMessage: (id: string) => void;
  
  stats: {
    balance: number;
    totalIncome: number;
    totalExpense: number;
    pendingCount: number;
  };
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Mock Data
const MOCK_MEMBERS: Member[] = [
  {
    id: '1',
    dossierNumber: '0001',
    ine: 'INE123456',
    uniqueId: 'A00000000001',
    firstName: 'Jean',
    lastName: 'Dupont',
    dob: '1998-05-12',
    sector: Sector.INFO,
    level: Level.L2,
    gender: Gender.MALE,
    balance: 5000,
  },
  {
    id: '2',
    dossierNumber: '0002',
    ine: 'INE654321',
    uniqueId: 'B00000000001',
    firstName: 'Marie',
    lastName: 'Curie',
    dob: '1999-11-07',
    sector: Sector.ELEC,
    level: Level.L3,
    gender: Gender.FEMALE,
    balance: 2500,
  }
];

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    type: TransactionType.INCOME,
    category: 'Cotisation',
    amount: 15000,
    date: '2023-10-01',
    description: 'Cotisation annuelle',
    performedBy: 'Jean Dupont',
    matricule: 'A00000000001',
    function: 'Membre',
    responsible: 'Trésorier',
    status: 'APPROVED',
    signature: 'SIG-123',
    receiptNumber: 'REC-001'
  },
  {
    id: 't2',
    type: TransactionType.EXPENSE,
    category: 'Transport',
    amount: 2000,
    date: '2023-10-05',
    description: 'Taxi pour réunion préfecture',
    performedBy: 'Marie Curie',
    matricule: 'B00000000001',
    function: 'Secrétaire',
    responsible: 'Président',
    status: 'PENDING',
    signature: 'SIG-124'
  }
];

const MOCK_BUDGETS: Budget[] = Object.values(ExpenseCategory).map((cat, index) => ({
  id: `b-${index}`,
  category: cat,
  allocatedAmount: index === 0 ? 50000 : 25000, // Just some mock numbers
  spentAmount: 0,
  year: new Date().getFullYear()
}));

const MOCK_MESSAGES: CommunityMessage[] = [
    {
        id: 'm1',
        userId: 'membre@asso.com',
        userName: 'Jean Dupont',
        userRole: UserRole.MEMBRE,
        memberInfo: { sector: Sector.INFO, level: Level.L2 },
        content: "Salut à tous ! Quand aura lieu la prochaine assemblée générale ?",
        timestamp: new Date(Date.now() - 86400000).toISOString()
    }
];

export const StoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [members, setMembers] = useState<Member[]>(MOCK_MEMBERS);
  const [budgets, setBudgets] = useState<Budget[]>(MOCK_BUDGETS);
  const [messages, setMessages] = useState<CommunityMessage[]>(MOCK_MESSAGES);
  const [settings, setSettings] = useState<AppSettings>({
    associationName: 'A.E.U.C.A.B.DK',
    currency: 'FCFA',
    logoUrl: ''
  });

  // Calculate spent amounts for budgets automatically
  useEffect(() => {
    const newBudgets = budgets.map(b => {
      const spent = transactions
        .filter(t => t.type === TransactionType.EXPENSE && t.category === b.category && t.status === 'APPROVED')
        .reduce((acc, t) => acc + t.amount, 0);
      return { ...b, spentAmount: spent };
    });
    // Only update if changed to avoid infinite loop - simplistic check
    if (JSON.stringify(newBudgets) !== JSON.stringify(budgets)) {
      setBudgets(newBudgets);
    }
  }, [transactions]);

  const login = (email: string, pass: string): boolean => {
    if (email === ADMIN_EMAIL && pass === ADMIN_PASS) {
      setUser({
        email,
        name: 'Administrateur (Djahfar)',
        role: UserRole.TRESORIER 
      });
      return true;
    }
    // Demo President
    if (email === 'president@asso.com') {
       setUser({
        email,
        name: 'Président Association',
        role: UserRole.PRESIDENT
      });
      return true;
    }
    // Demo Member
    if (email === 'membre@asso.com') {
       // In a real app, we check if the member exists in the DB here
       setUser({
        email,
        name: 'Jean Dupont',
        role: UserRole.MEMBRE,
        memberId: '1' // Linked to Jean Dupont in Mock Data
      });
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  const addTransaction = (t: Omit<Transaction, 'id' | 'status' | 'signature'>) => {
    const newTx: Transaction = {
      ...t,
      id: Math.random().toString(36).substr(2, 9),
      status: (user?.role === UserRole.TRESORIER) ? 'APPROVED' : 'PENDING',
      signature: `SIG-${Date.now()}`,
      receiptNumber: t.type === TransactionType.INCOME ? `REC-${Date.now()}` : undefined
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const approveTransaction = (id: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'APPROVED' } : t));
  };

  const rejectTransaction = (id: string) => {
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'REJECTED' } : t));
  };

  const deleteTransaction = (id: string) => {
      setTransactions(prev => prev.filter(t => t.id !== id));
  }

  const addMember = (m: Omit<Member, 'id' | 'uniqueId'>) => {
    const prefix = m.gender === Gender.MALE ? 'A' : 'B';
    const randomSuffix = Math.floor(10000000000 + Math.random() * 90000000000).toString();
    const uniqueId = `${prefix}${randomSuffix}`;

    const newMember: Member = {
      ...m,
      id: Math.random().toString(36).substr(2, 9),
      uniqueId
    };
    setMembers(prev => [...prev, newMember]);
  };

  const deleteMember = (id: string) => {
      setMembers(prev => prev.filter(m => m.id !== id));
  }

  const updateBudget = (id: string, amount: number) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, allocatedAmount: amount } : b));
  };

  const updateSettings = (s: AppSettings) => setSettings(s);

  // Community
  const addMessage = (content: string) => {
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
  };

  const deleteMessage = (id: string) => {
      setMessages(prev => prev.filter(m => m.id !== id));
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
      stats: { balance, totalIncome, totalExpense, pendingCount }
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