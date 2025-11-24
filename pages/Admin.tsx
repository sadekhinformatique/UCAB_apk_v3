
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { UserRole, TransactionType, Sector, Level } from '../types';
import { Save, Building, Users, Shield, Trash2, Edit2, Database, LayoutDashboard, Receipt, UserX } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const Admin: React.FC = () => {
  const { settings, updateSettings, members, user, transactions, deleteTransaction, deleteMember, stats } = useStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'members' | 'transactions'>('overview');
  
  // Local settings state
  const [localSettings, setLocalSettings] = useState(settings);
  const [msg, setMsg] = useState('');

  // Security Check: Only Treasurer or President
  if (!user || (user.role !== UserRole.TRESORIER && user.role !== UserRole.PRESIDENT)) {
    return <Navigate to="/" replace />;
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(localSettings);
    setMsg('Paramètres enregistrés avec succès.');
    setTimeout(() => setMsg(''), 3000);
  };

  const handleDeleteTransaction = (id: string) => {
      if(window.confirm('Êtes-vous sûr de vouloir supprimer définitivement cette transaction ?')) {
          deleteTransaction(id);
      }
  }

  const handleDeleteMember = (id: string) => {
      if(window.confirm('Attention: Supprimer un membre peut affecter les transactions liées. Continuer ?')) {
          deleteMember(id);
      }
  }

  const renderOverview = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-slate-500 text-sm font-medium">Total Membres</h3>
              <p className="text-3xl font-bold text-primary mt-2">{members.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-slate-500 text-sm font-medium">Total Transactions</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{transactions.length}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-slate-500 text-sm font-medium">Solde Global</h3>
              <p className="text-3xl font-bold text-emerald-600 mt-2">{stats.balance.toLocaleString()} {settings.currency}</p>
          </div>
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-slate-500 text-sm font-medium">Admin Connecté</h3>
              <p className="text-lg font-bold text-slate-700 mt-2 truncate">{user.name}</p>
              <p className="text-xs text-slate-400">{user.role}</p>
          </div>
      </div>
  );

  const renderTransactionsControl = () => (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-700">Contrôle des Transactions (Dernières 50)</h3>
            <span className="text-xs text-red-500 flex items-center gap-1"><Shield size={12}/> Zone Danger</span>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                        <th className="px-6 py-3">Date</th>
                        <th className="px-6 py-3">Type</th>
                        <th className="px-6 py-3">Montant</th>
                        <th className="px-6 py-3">Auteur</th>
                        <th className="px-6 py-3 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.slice(0, 50).map(t => (
                        <tr key={t.id} className="border-b hover:bg-red-50/30 transition-colors">
                            <td className="px-6 py-3">{t.date}</td>
                            <td className="px-6 py-3">
                                <span className={`px-2 py-1 rounded text-xs ${t.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                    {t.type}
                                </span>
                            </td>
                            <td className="px-6 py-3 font-bold">{t.amount}</td>
                            <td className="px-6 py-3">{t.performedBy}</td>
                            <td className="px-6 py-3 text-center">
                                <button 
                                    onClick={() => handleDeleteTransaction(t.id)}
                                    className="text-red-500 hover:bg-red-100 p-2 rounded transition-colors"
                                    title="Supprimer définitivement"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
  );

  const renderMembersControl = () => (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
           <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-700">Contrôle des Membres</h3>
                <span className="text-xs text-slate-500">{members.length} inscrits</span>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">Identité</th>
                            <th className="px-6 py-3">Filière/Niveau</th>
                            <th className="px-6 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map(m => (
                            <tr key={m.id} className="border-b hover:bg-slate-50">
                                <td className="px-6 py-3 font-mono text-xs">{m.uniqueId}</td>
                                <td className="px-6 py-3">
                                    <div className="font-medium text-slate-900">{m.firstName} {m.lastName}</div>
                                    <div className="text-xs text-slate-400">{m.ine}</div>
                                </td>
                                <td className="px-6 py-3">
                                    <div className="text-xs bg-slate-100 inline-block px-1 rounded">{m.sector}</div>
                                    <div className="text-xs font-bold mt-1">{m.level}</div>
                                </td>
                                <td className="px-6 py-3 text-center">
                                     <button 
                                        onClick={() => handleDeleteMember(m.id)}
                                        className="text-red-500 hover:bg-red-100 p-2 rounded transition-colors"
                                        title="Supprimer Membre"
                                    >
                                        <UserX size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
      </div>
  );

  const renderSettings = () => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-2xl">
        <h3 className="font-bold text-lg mb-4 text-slate-800 flex items-center gap-2">
            <Building size={20} className="text-primary"/> Paramètres Généraux
        </h3>
        <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom de l'Association</label>
                <input 
                    type="text" 
                    value={localSettings.associationName}
                    onChange={(e) => setLocalSettings({...localSettings, associationName: e.target.value})}
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none" 
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Devise</label>
                <input 
                    type="text" 
                    value={localSettings.currency}
                    onChange={(e) => setLocalSettings({...localSettings, currency: e.target.value})}
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none" 
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">URL Logo (Optionnel)</label>
                <input 
                    type="text" 
                    value={localSettings.logoUrl}
                    onChange={(e) => setLocalSettings({...localSettings, logoUrl: e.target.value})}
                    className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none" 
                    placeholder="https://..."
                />
            </div>
            <div className="pt-2">
                <button type="submit" className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors">
                    <Save size={18} />
                    Enregistrer les modifications
                </button>
            </div>
        </form>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Panneau d'Administration</h2>
            <p className="text-sm text-slate-500">Contrôle total du système SAS.</p>
          </div>
          {msg && <div className="bg-emerald-100 text-emerald-800 px-4 py-2 rounded-lg text-sm animate-pulse">{msg}</div>}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${activeTab === 'overview' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-700'}`}
          >
              <LayoutDashboard size={16} /> Vue d'ensemble
          </button>
          <button 
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${activeTab === 'members' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-700'}`}
          >
              <Users size={16} /> Membres
          </button>
          <button 
            onClick={() => setActiveTab('transactions')}
            className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${activeTab === 'transactions' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-700'}`}
          >
              <Database size={16} /> Transactions
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${activeTab === 'settings' ? 'border-b-2 border-primary text-primary' : 'text-slate-500 hover:text-slate-700'}`}
          >
              <Building size={16} /> Paramètres
          </button>
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'members' && renderMembersControl()}
          {activeTab === 'transactions' && renderTransactionsControl()}
          {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
};

export default Admin;
