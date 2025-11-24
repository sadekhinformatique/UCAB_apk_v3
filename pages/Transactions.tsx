
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { TransactionType, IncomeCategory, ExpenseCategory, Transaction, UserRole } from '../types';
import { Plus, ArrowUpCircle, ArrowDownCircle, CheckCircle, FileText, XCircle, Eye, Printer } from 'lucide-react';

const Transactions: React.FC = () => {
  const { transactions, addTransaction, approveTransaction, rejectTransaction, user, settings } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [txType, setTxType] = useState<TransactionType>(TransactionType.INCOME);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null); // For Receipt/Details Modal

  // Form State
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    description: '',
    performedBy: '',
    matricule: '',
    function: '',
    responsible: '',
  });

  // Filter transactions based on role
  // Members only see transactions where performedBy matches their name
  const displayedTransactions = user?.role === UserRole.MEMBRE
    ? transactions.filter(t => t.performedBy === user.name)
    : transactions;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTransaction({
      type: txType,
      amount: Number(formData.amount),
      date: formData.date,
      category: formData.category || 'Autre',
      description: formData.description,
      performedBy: formData.performedBy,
      matricule: formData.matricule,
      function: formData.function,
      responsible: formData.responsible,
    });
    setShowForm(false);
    setFormData({ ...formData, amount: '', description: '' });
  };

  const openReceipt = (tx: Transaction) => {
    setSelectedTx(tx);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">
            {user?.role === UserRole.MEMBRE ? 'Mes Transactions' : 'Gestion des Transactions'}
        </h2>
        {user?.role !== UserRole.MEMBRE && (
            <div className="flex gap-2">
                <button 
                onClick={() => { setTxType(TransactionType.INCOME); setShowForm(true); }}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                >
                <ArrowUpCircle size={18} />
                <span>Nouv. Entrée</span>
                </button>
                <button 
                onClick={() => { setTxType(TransactionType.EXPENSE); setShowForm(true); }}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                <ArrowDownCircle size={18} />
                <span>Nouv. Dépense</span>
                </button>
            </div>
        )}
      </div>

      {/* RECEIPT MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
             <div className="bg-white w-full max-w-md p-0 rounded-2xl overflow-hidden shadow-2xl">
                 <div className="bg-primary text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold flex items-center gap-2"><ReceiptIcon /> REÇU DE PAIEMENT</h3>
                    <button onClick={() => setSelectedTx(null)} className="hover:text-red-300">✕</button>
                 </div>
                 <div className="p-8 bg-white" id="printable-receipt">
                     <div className="text-center mb-6 pb-6 border-b border-dashed border-slate-300">
                        <h2 className="text-xl font-bold text-slate-800 uppercase">{settings.associationName}</h2>
                        <p className="text-xs text-slate-500">Reçu N°: {selectedTx.receiptNumber || selectedTx.id}</p>
                        <p className="text-xs text-slate-500">Date: {selectedTx.date}</p>
                     </div>
                     
                     <div className="space-y-4 mb-6">
                        <div className="flex justify-between">
                            <span className="text-slate-500 text-sm">De la part de:</span>
                            <span className="font-bold text-slate-800">{selectedTx.performedBy}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500 text-sm">Matricule:</span>
                            <span className="font-mono text-slate-800">{selectedTx.matricule}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-slate-500 text-sm">Objet:</span>
                            <span className="text-slate-800">{selectedTx.description}</span>
                        </div>
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-slate-100">
                            <span className="text-slate-800 font-bold">MONTANT PERÇU</span>
                            <span className="text-2xl font-bold text-emerald-600">{selectedTx.amount.toLocaleString()} {settings.currency}</span>
                        </div>
                     </div>

                     <div className="bg-slate-50 p-4 rounded text-center mb-4">
                        <p className="text-xs text-slate-400 mb-1">Signature Caisse</p>
                        <p className="font-script text-lg text-slate-600 font-bold italic">{selectedTx.signature}</p>
                     </div>
                     <div className="text-center text-[10px] text-slate-400">
                        Ce reçu est généré électroniquement et fait foi de paiement.
                     </div>
                 </div>
                 <div className="p-4 bg-slate-50 border-t flex justify-center">
                    <button onClick={() => window.print()} className="flex items-center gap-2 text-primary hover:text-slate-800 font-bold">
                        <Printer size={18} /> Imprimer
                    </button>
                 </div>
             </div>
        </div>
      )}

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className={`p-6 border-b ${txType === TransactionType.INCOME ? 'bg-emerald-50' : 'bg-red-50'} flex justify-between items-center`}>
              <h3 className={`text-xl font-bold ${txType === TransactionType.INCOME ? 'text-emerald-700' : 'text-red-700'}`}>
                Enregistrer une {txType === TransactionType.INCOME ? 'Entrée' : 'Sortie'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-slate-700">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Common Fields */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input required type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full border p-2 rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Montant (FCFA)</label>
                    <input required type="number" name="amount" value={formData.amount} onChange={handleInputChange} className="w-full border p-2 rounded" />
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Libellé</label>
                    <input required type="text" name="description" value={formData.description} onChange={handleInputChange} className="w-full border p-2 rounded" placeholder="Ex: Cotisation mensuelle" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
                    <select required name="category" value={formData.category} onChange={handleInputChange} className="w-full border p-2 rounded">
                        <option value="">Sélectionner...</option>
                        {txType === TransactionType.INCOME 
                         ? Object.values(IncomeCategory).map(c => <option key={c} value={c}>{c}</option>)
                         : Object.values(ExpenseCategory).map(c => <option key={c} value={c}>{c}</option>)
                        }
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Responsable (Validation)</label>
                     <input required type="text" name="responsible" value={formData.responsible} onChange={handleInputChange} className="w-full border p-2 rounded" placeholder="Ex: Trésorier" />
                </div>

                {/* User Details */}
                <div className="md:col-span-2 border-t pt-4 mt-2">
                    <p className="text-sm font-bold text-slate-500 mb-3">Informations Tiers</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nom et Prénom</label>
                    <input required type="text" name="performedBy" value={formData.performedBy} onChange={handleInputChange} className="w-full border p-2 rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Matricule</label>
                    <input required type="text" name="matricule" value={formData.matricule} onChange={handleInputChange} className="w-full border p-2 rounded" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Fonction</label>
                    <input required type="text" name="function" value={formData.function} onChange={handleInputChange} className="w-full border p-2 rounded" />
                </div>

                {txType === TransactionType.EXPENSE && (
                    <div className="md:col-span-2">
                         <label className="block text-sm font-medium text-slate-700 mb-1">Justificatif (Photo/Reçu)</label>
                         <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 flex flex-col items-center text-slate-400">
                             <FileText size={32} className="mb-2" />
                             <span className="text-sm">Cliquer pour télécharger (Simulation)</span>
                         </div>
                    </div>
                )}
                
                <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                    <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Annuler</button>
                    <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-slate-800">Enregistrer</button>
                </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
            <tr>
              <th className="px-6 py-3">Date</th>
              <th className="px-6 py-3">Réf/Reçu</th>
              <th className="px-6 py-3">Libellé</th>
              <th className="px-6 py-3">Tiers</th>
              <th className="px-6 py-3 text-right">Montant</th>
              <th className="px-6 py-3 text-center">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayedTransactions.length > 0 ? (
                displayedTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">{t.date}</td>
                        <td className="px-6 py-4">
                            <button onClick={() => openReceipt(t)} className="flex items-center gap-1 text-accent hover:underline">
                                <FileText size={12}/> {t.receiptNumber || 'Voir'}
                            </button>
                        </td>
                        <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{t.description}</div>
                        <div className="text-xs text-slate-400">{t.category}</div>
                        </td>
                        <td className="px-6 py-4">
                        <div>{t.performedBy}</div>
                        <div className="text-xs text-slate-400">{t.matricule}</div>
                        </td>
                        <td className={`px-6 py-4 text-right font-bold ${
                        t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                        {t.type === TransactionType.INCOME ? '+' : '-'}{t.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                            {t.status === 'PENDING' && user?.role !== UserRole.MEMBRE ? (
                                <div className="flex justify-center gap-1">
                                    <button 
                                        onClick={() => approveTransaction(t.id)}
                                        title="Valider"
                                        className="text-emerald-600 hover:bg-emerald-50 p-1 rounded transition-colors"
                                    >
                                        <CheckCircle size={18} />
                                    </button>
                                    <button 
                                        onClick={() => rejectTransaction(t.id)}
                                        title="Rejeter"
                                        className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                                    >
                                        <XCircle size={18} />
                                    </button>
                                </div>
                            ) : (
                                <span className={`px-2 py-1 rounded-full text-xs flex justify-center items-center gap-1 w-fit mx-auto ${
                                    t.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' : 
                                    t.status === 'REJECTED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                    {t.status === 'APPROVED' && <CheckCircle size={12} />}
                                    {t.status === 'REJECTED' && <XCircle size={12} />}
                                    {t.status === 'PENDING' && <Eye size={12} />}
                                    {t.status === 'APPROVED' ? 'Validé' : t.status === 'REJECTED' ? 'Rejeté' : 'En attente'}
                                </span>
                            )}
                        </td>
                    </tr>
                ))
            ) : (
                 <tr><td colSpan={6} className="p-8 text-center text-slate-400">Aucune transaction trouvée.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Helper component
const ReceiptIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17V7"/></svg>
);

export default Transactions;
