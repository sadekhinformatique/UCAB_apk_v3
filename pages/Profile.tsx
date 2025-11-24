
import React from 'react';
import { useStore } from '../context/StoreContext';
import { UserRole, Gender, TransactionType } from '../types';
import { UserCircle, Mail, Shield, GraduationCap, Calendar, Wallet } from 'lucide-react';

const Profile: React.FC = () => {
  const { user, members, transactions, settings } = useStore();

  if (!user) return <div>Chargement...</div>;

  // Find linked member data if applicable
  const memberData = user.memberId ? members.find(m => m.id === user.memberId) : null;
  
  // Calculate user's activity
  const myTransactions = transactions.filter(t => t.performedBy === user.name);
  const totalContributed = myTransactions
    .filter(t => t.type === TransactionType.INCOME)
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Mon Profil</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Identity Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-4xl font-bold mb-4">
                {user.name.charAt(0)}
            </div>
            <h3 className="text-xl font-bold text-slate-800">{user.name}</h3>
            <span className="mt-2 inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
                <Shield size={12} /> {user.role}
            </span>
            <div className="mt-6 w-full space-y-3 text-left">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                    <Mail size={16} className="text-slate-400" />
                    <span>{user.email}</span>
                </div>
            </div>
        </div>

        {/* Member Specific Details (If linked) */}
        {memberData ? (
             <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <GraduationCap className="text-accent" /> Informations Académiques & Membre
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-slate-50 rounded-lg">
                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Matricule Unique</span>
                        <span className="font-mono text-lg font-bold text-slate-700">{memberData.uniqueId}</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">INE</span>
                        <span className="font-mono text-lg font-bold text-slate-700">{memberData.ine}</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Filière</span>
                        <span className="font-bold text-slate-700">{memberData.sector}</span>
                    </div>
                     <div className="p-4 bg-slate-50 rounded-lg">
                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Niveau</span>
                        <span className="font-bold text-slate-700">{memberData.level === 'AP' ? 'Année Préparatoire' : memberData.level}</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Date de Naissance</span>
                        <span className="font-bold text-slate-700 flex items-center gap-2">
                            <Calendar size={16} className="text-slate-400" /> {memberData.dob}
                        </span>
                    </div>
                     <div className="p-4 bg-slate-50 rounded-lg border-l-4 border-emerald-500">
                        <span className="text-xs text-slate-400 uppercase tracking-wider block mb-1">Solde Personnel</span>
                        <span className="font-bold text-xl text-emerald-600 flex items-center gap-2">
                            <Wallet size={20} /> {memberData.balance.toLocaleString()} {settings.currency}
                        </span>
                    </div>
                </div>
             </div>
        ) : (
             <div className="lg:col-span-2 bg-slate-50 p-6 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400">
                 <p>Ce compte utilisateur n'est pas lié à une fiche membre.</p>
             </div>
        )}

        {/* Activity Summary */}
        <div className="lg:col-span-3 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <h3 className="font-bold text-slate-800 mb-4">Activité Financière</h3>
             <div className="flex flex-col md:flex-row gap-8">
                 <div className="flex-1">
                     <p className="text-sm text-slate-500 mb-1">Total Versé à l'association</p>
                     <p className="text-2xl font-bold text-emerald-600">{totalContributed.toLocaleString()} {settings.currency}</p>
                 </div>
                 <div className="flex-1">
                     <p className="text-sm text-slate-500 mb-1">Nombre de transactions</p>
                     <p className="text-2xl font-bold text-slate-700">{myTransactions.length}</p>
                 </div>
             </div>
             
             <h4 className="font-medium text-slate-700 mt-6 mb-3 text-sm">Dernières opérations</h4>
             <div className="space-y-2">
                {myTransactions.slice(0, 3).map(t => (
                    <div key={t.id} className="flex justify-between items-center p-3 hover:bg-slate-50 rounded border border-slate-100 text-sm">
                        <span className="text-slate-600">{t.date} - {t.description}</span>
                        <span className={t.type === TransactionType.INCOME ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                            {t.amount}
                        </span>
                    </div>
                ))}
                {myTransactions.length === 0 && <p className="text-sm text-slate-400 italic">Aucune transaction.</p>}
             </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
