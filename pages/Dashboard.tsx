
import React from 'react';
import { useStore } from '../context/StoreContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Download, CheckCircle, Clock, AlertCircle, Landmark } from 'lucide-react';
import { TransactionType, UserRole } from '../types';

const StatCard: React.FC<{ title: string; amount: number; icon: React.ReactNode; color: string; subtext?: string }> = ({ title, amount, icon, color, subtext }) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className={`text-2xl font-bold ${color}`}>{amount.toLocaleString()} FCFA</h3>
      {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
    </div>
    <div className={`p-3 rounded-full opacity-20 ${color.replace('text-', 'bg-')}`}>
      {React.cloneElement(icon as React.ReactElement, { className: color })}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { stats, transactions, user, settings, members } = useStore();

  const handleExportPDF = () => {
    window.print();
  };

  // --- MEMBER VIEW ---
  if (user?.role === UserRole.MEMBRE) {
    // Find linked member data
    const myMemberData = members.find(m => m.id === user.memberId);
    const myTransactions = transactions.filter(t => t.performedBy === user.name);

    return (
      <div className="space-y-6">
         <div className="bg-gradient-to-r from-primary to-slate-800 rounded-2xl p-8 text-white shadow-lg">
            <h1 className="text-3xl font-bold mb-2">Bonjour, {user.name}</h1>
            <p className="opacity-80">Bienvenue sur votre espace personnel {settings.associationName}.</p>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard 
              title="Mon Solde" 
              amount={myMemberData?.balance || 0} 
              icon={<Wallet size={24} />} 
              color="text-blue-600" 
              subtext="Disponible pour retrait"
            />
            {/* Added Global Balance Card as per request */}
             <StatCard 
              title="Solde Association" 
              amount={stats.balance} 
              icon={<Landmark size={24} />} 
              color="text-emerald-600" 
              subtext="Trésorerie Globale"
            />
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center cursor-pointer hover:bg-slate-50 transition-colors">
               <Download size={32} className="text-slate-400 mb-2" />
               <h3 className="font-bold text-slate-700">Mes Reçus</h3>
               <p className="text-xs text-slate-400">Télécharger l'historique</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center cursor-pointer hover:bg-slate-50 transition-colors">
               <AlertCircle size={32} className="text-amber-400 mb-2" />
               <h3 className="font-bold text-slate-700">Réclamation</h3>
               <p className="text-xs text-slate-400">Signaler un problème</p>
            </div>
         </div>

         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4 text-slate-800">Mes dernières transactions</h3>
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Motif</th>
                  <th className="px-6 py-3 text-right">Montant</th>
                  <th className="px-6 py-3 text-center">Statut</th>
                </tr>
              </thead>
              <tbody>
                {myTransactions.slice(0, 5).map(t => (
                   <tr key={t.id} className="border-b">
                      <td className="px-6 py-4">{t.date}</td>
                      <td className="px-6 py-4">{t.description}</td>
                      <td className={`px-6 py-4 text-right font-bold ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-red-600'}`}>
                         {t.type === TransactionType.INCOME ? '+' : '-'}{t.amount}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs ${t.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                            {t.status}
                        </span>
                      </td>
                   </tr>
                ))}
                {myTransactions.length === 0 && (
                    <tr><td colSpan={4} className="p-4 text-center text-slate-400">Aucune transaction trouvée.</td></tr>
                )}
              </tbody>
            </table>
         </div>
      </div>
    );
  }

  // --- PRESIDENT VIEW ---
  if (user?.role === UserRole.PRESIDENT) {
    const pendingTransactions = transactions.filter(t => t.status === 'PENDING');
    
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Tableau de Bord Exécutif</h2>
            <div className="flex gap-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded flex items-center">
                    <Clock size={12} className="mr-1"/> {new Date().toLocaleDateString()}
                </span>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-primary text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <p className="text-blue-200 text-sm font-medium mb-1">Trésorerie Globale</p>
                    <h3 className="text-3xl font-bold">{stats.balance.toLocaleString()} {settings.currency}</h3>
                    <p className="text-xs text-blue-200 mt-2 flex items-center gap-1">
                        <CheckCircle size={12} /> Mise à jour en temps réel
                    </p>
                </div>
                <Wallet className="absolute right-4 bottom-4 text-white opacity-10 w-24 h-24" />
            </div>

            <StatCard 
                title="En attente de validation" 
                amount={stats.pendingCount} 
                icon={<Clock size={24} />} 
                color="text-amber-500" 
                subtext="Transactions requièrent votre attention"
            />
            
            <StatCard 
                title="Membres Actifs" 
                amount={members.length} 
                icon={<CheckCircle size={24} />} 
                color="text-emerald-500" 
            />
        </div>

        {/* Approval Queue */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <AlertCircle size={20} className="text-amber-500" />
                    Flux d'approbation
                </h3>
                <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600">
                    {pendingTransactions.length} demande(s)
                </span>
            </div>
            
            {pendingTransactions.length > 0 ? (
                <div className="grid gap-4">
                    {pendingTransactions.map(t => (
                        <div key={t.id} className="border border-slate-100 rounded-lg p-4 flex flex-col md:flex-row justify-between items-center hover:bg-slate-50 transition-colors">
                            <div className="mb-2 md:mb-0">
                                <p className="font-bold text-slate-800">{t.description}</p>
                                <p className="text-sm text-slate-500">{t.performedBy} • {t.date} • {t.category}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-bold text-lg text-slate-700">
                                    {t.amount.toLocaleString()} {settings.currency}
                                </span>
                                <div className="flex gap-2">
                                     {/* In a real app, these would trigger approval logic */}
                                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">En attente</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-slate-400">
                    <CheckCircle size={48} className="mx-auto mb-2 opacity-20" />
                    <p>Tout est à jour. Aucune validation en attente.</p>
                </div>
            )}
        </div>
      </div>
    );
  }

  // --- TREASURER VIEW (Original Dashboard) ---
  const data = [
    { name: 'Global', Entrées: stats.totalIncome, Sorties: stats.totalExpense },
  ];
  const pieData = [
    { name: 'Entrées', value: stats.totalIncome },
    { name: 'Sorties', value: stats.totalExpense },
  ];
  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Tableau de bord Trésorier</h2>
        <button 
          onClick={handleExportPDF}
          className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
        >
          <Download size={18} />
          <span className="hidden sm:inline">Exporter Rapport</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Solde Actuel" 
          amount={stats.balance} 
          icon={<Wallet size={24} />} 
          color="text-blue-600" 
        />
        <StatCard 
          title="Total Entrées" 
          amount={stats.totalIncome} 
          icon={<TrendingUp size={24} />} 
          color="text-emerald-600" 
        />
        <StatCard 
          title="Total Dépenses" 
          amount={stats.totalExpense} 
          icon={<TrendingDown size={24} />} 
          color="text-red-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Aperçu Financier</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Entrées" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Sorties" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-slate-800">Répartition</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-sm text-slate-600">Entrées</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-sm text-slate-600">Sorties</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold mb-4 text-slate-800">Dernières Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Libellé</th>
                <th className="px-6 py-3">Catégorie</th>
                <th className="px-6 py-3">Auteur</th>
                <th className="px-6 py-3 text-right">Montant</th>
                <th className="px-6 py-3 text-center">Statut</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((t) => (
                <tr key={t.id} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{t.date}</td>
                  <td className="px-6 py-4">{t.description}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      t.type === TransactionType.INCOME 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {t.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">{t.performedBy}</td>
                  <td className={`px-6 py-4 text-right font-bold ${
                    t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {t.type === TransactionType.INCOME ? '+' : '-'}{t.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-center">
                     <span className={`px-2 py-1 rounded-full text-xs ${
                       t.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                     }`}>
                       {t.status === 'APPROVED' ? 'Validé' : 'En attente'}
                     </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
