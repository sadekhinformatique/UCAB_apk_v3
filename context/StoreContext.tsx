
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Transaction, Member, TransactionType, Gender, Budget, AppSettings, ExpenseCategory, CommunityMessage, Sector, Level } from '../types';
import { supabase } from '../src/supabaseClient';

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

  // Mappers pour convertir snake_case (DB) -> camelCase (App)
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
      content: m.content, timestamp: m.created_at, // Supabase uses created_at
      memberInfo: m.member_info_json ? (typeof m.member_info_json === 'string' ? JSON.parse(m.member_info_json) : m.member_info_json) : undefined
  });

  // Fetch initial data
  const fetchData = async () => {
    setIsLoading(true);
    try {
        const [resM, resT, resB, resMsg, resS] = await Promise.all([
            supabase.from('members').select('*'),
            supabase.from('transactions').select('*').order('date', { ascending: false }),
            supabase.from('budgets').select('*'),
            supabase.from('messages').select('*').order('created_at', { ascending: true }),
            supabase.from('settings').select('*').limit(1)
        ]);

        if (resM.data) setMembers(resM.data.map(mapMember));
        if (resT.data) setTransactions(resT.data.map(mapTransaction));
        if (resMsg.data) setMessages(resMsg.data.map(mapMessage));
        
        if (resS.data && resS.data.length > 0) {
            const s = resS.data[0];
            setSettings({
                associationName: s.association_name,
                currency: s.currency,
                logoUrl: s.logo_url || ''
            });
        }

        let dbBudgets = resB.data ? resB.data.map(mapBudget) : [];
        if (dbBudgets.length === 0) {
            // Default budgets
            dbBudgets = Object.values(ExpenseCategory).map((cat, index) => ({
                id: `b-${index}`, category: cat, allocatedAmount: 0, spentAmount: 0, year: new Date().getFullYear()
            }));
        }
        setBudgets(dbBudgets);

    } catch (error) {
        console.error("Erreur chargement Supabase:", error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // SUBCRIPTION REALTIME POUR LES MESSAGES (renvoyer instantanément)
    const channel = supabase
    .channel('public:messages')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        const newMsg = mapMessage(payload.new);
        setMessages(prev => [...prev, newMsg]);
    })
    .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'messages' }, (payload) => {
        setMessages(prev => prev.filter(m => m.id !== payload.old.id));
    })
    .subscribe();

    return () => {
        supabase.removeChannel(channel);
    }
  }, []);

  // Recalculate spent budget locally
  useEffect(() => {
    const newBudgets = budgets.map(b => {
      const spent = transactions
        .filter(t => t.type === TransactionType.EXPENSE && t.category === b.category && t.status === 'APPROVED')
        .reduce((acc, t) => acc + t.amount, 0);
      return { ...b, spentAmount: spent };
    });
    // Simple deep compare avoid loop
    if (JSON.stringify(newBudgets) !== JSON.stringify(budgets)) {
      setBudgets(newBudgets);
    }
  }, [transactions]); // removed budgets from deps

  // --- ACTIONS ---

  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
        // Authentification simplifiée via la table 'users' existante (migration facile)
        // Note: Pour une vraie sécu, utiliser supabase.auth.signInWithPassword
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('password', pass) // Attention: En prod, hasher les MDP
            .single();

        if (data) {
            setUser({
                email: data.email,
                name: data.name,
                role: data.role as UserRole,
                memberId: data.member_id
            });
            return true;
        }
    } catch(e) { console.error(e); }
    return false;
  };

  const logout = () => setUser(null);

  const addTransaction = async (t: Omit<Transaction, 'id' | 'status' | 'signature'>) => {
    const newTx = {
      type: t.type,
      category: t.category,
      amount: t.amount,
      date: t.date,
      description: t.description,
      performed_by: t.performedBy,
      matricule: t.matricule,
      function: t.function,
      receipt_number: t.type === TransactionType.INCOME ? `REC-${Date.now()}` : null,
      status: (user?.role === UserRole.TRESORIER) ? 'APPROVED' : 'PENDING',
      responsible: t.responsible,
      signature: `SIG-${Date.now()}`,
      proof_url: t.proofUrl
    };

    const { data, error } = await supabase.from('transactions').insert([newTx]).select();
    if (data) {
        setTransactions(prev => [mapTransaction(data[0]), ...prev]);
    }
  };

  const approveTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').update({ status: 'APPROVED' }).eq('id', id);
    if (!error) {
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'APPROVED' } : t));
    }
  };

  const rejectTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').update({ status: 'REJECTED' }).eq('id', id);
    if (!error) {
        setTransactions(prev => prev.map(t => t.id === id ? { ...t, status: 'REJECTED' } : t));
    }
  };

  const deleteTransaction = async (id: string) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if(!error) setTransactions(prev => prev.filter(t => t.id !== id));
  }

  const addMember = async (m: Omit<Member, 'id' | 'uniqueId'>) => {
    const prefix = m.gender === Gender.MALE ? 'A' : 'B';
    const randomSuffix = Math.floor(10000000000 + Math.random() * 90000000000).toString();
    const uniqueId = `${prefix}${randomSuffix}`;

    const newMember = {
        unique_id: uniqueId,
        first_name: m.firstName,
        last_name: m.lastName,
        dob: m.dob,
        sector: m.sector,
        level: m.level,
        gender: m.gender,
        dossier_number: m.dossierNumber,
        ine: m.ine,
        balance: m.balance
    };

    const { data } = await supabase.from('members').insert([newMember]).select();
    if(data) setMembers(prev => [...prev, mapMember(data[0])]);
  };

  const deleteMember = async (id: string) => {
      const { error } = await supabase.from('members').delete().eq('id', id);
      if(!error) setMembers(prev => prev.filter(m => m.id !== id));
  }

  const updateBudget = async (id: string, amount: number, category: string) => {
    // Upsert needs ID
    const budgetData = {
        id: id.startsWith('b-') ? undefined : id, // Let DB handle ID if it's a temp ID
        category,
        allocated_amount: amount,
        year: new Date().getFullYear()
    };
    
    // Si l'ID est temporaire (commence par b-), on fait un insert, sinon update
    if (id.startsWith('b-')) {
         const { data } = await supabase.from('budgets').insert([budgetData]).select();
         if(data) {
             // Replace local temp budget with real one
             setBudgets(prev => prev.map(b => b.id === id ? mapBudget(data[0]) : b));
         }
    } else {
        await supabase.from('budgets').update({ allocated_amount: amount }).eq('id', id);
        setBudgets(prev => prev.map(b => b.id === id ? { ...b, allocatedAmount: amount } : b));
    }
  };

  const updateSettings = async (s: AppSettings) => {
      await supabase.from('settings').update({ 
          association_name: s.associationName, 
          currency: s.currency, 
          logo_url: s.logoUrl 
      }).eq('id', 1); // Assuming ID 1 is the singleton settings row
      setSettings(s);
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

      const newMsg = {
          user_id: user.email,
          user_name: user.name,
          user_role: user.role,
          member_info_json: memberInfo ? JSON.stringify(memberInfo) : null,
          content
      };

      // Optimistic update handled by Subscription, but fallback here if needed
      await supabase.from('messages').insert([newMsg]);
  };

  const deleteMessage = async (id: string) => {
      await supabase.from('messages').delete().eq('id', id);
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
