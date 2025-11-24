
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { Save, AlertTriangle, CheckCircle } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { UserRole } from '../types';

const Budget: React.FC = () => {
  const { budgets, updateBudget, settings, user } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  // Security Check
  if (user?.role === UserRole.MEMBRE) {
    return <Navigate to="/" replace />;
  }

  const startEdit = (id: string, currentVal: number) => {
    setEditingId(id);
    setEditValue(currentVal);
  };

  const saveEdit = (id: string) => {
    updateBudget(id, editValue);
    setEditingId(null);
  };

  const totalBudget = budgets.reduce((acc, b) => acc + b.allocatedAmount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spentAmount, 0);
  
  const chartData = budgets.map(b => ({
      name: b.category,
      value: b.allocatedAmount
  }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-slate-800">Planification Budgétaire {new Date().getFullYear()}</h2>
            <div className="bg-slate-100 px-4 py-2 rounded-lg text-sm text-slate-600">
                Budget Total: <span className="font-bold text-slate-900">{totalBudget.toLocaleString()} {settings.currency}</span>
            </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="bg-slate-50 border-b text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-6 py-4">Catégorie</th>
                            <th className="px-6 py-4 text-right">Budget Alloué</th>
                            <th className="px-6 py-4 text-right">Dépensé</th>
                            <th className="px-6 py-4 text-right">Reste</th>
                            <th className="px-6 py-4 text-center">État</th>
                            <th className="px-6 py-4 text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {budgets.map((b) => {
                            const remaining = b.allocatedAmount - b.spentAmount;
                            const percent = b.allocatedAmount > 0 ? (b.spentAmount / b.allocatedAmount) * 100 : 0;
                            const isOver = remaining < 0;

                            return (
                                <tr key={b.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{b.category}</td>
                                    <td className="px-6 py-4 text-right">
                                        {editingId === b.id ? (
                                            <input 
                                                type="number" 
                                                value={editValue} 
                                                onChange={(e) => setEditValue(Number(e.target.value))}
                                                className="w-24 border rounded p-1 text-right"
                                                autoFocus
                                            />
                                        ) : (
                                            <span>{b.allocatedAmount.toLocaleString()}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right text-slate-500">
                                        {b.spentAmount.toLocaleString()}
                                    </td>
                                    <td className={`px-6 py-4 text-right font-bold ${isOver ? 'text-red-600' : 'text-emerald-600'}`}>
                                        {remaining.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-full bg-slate-200 rounded-full h-2.5 mb-1">
                                            <div className={`h-2.5 rounded-full ${isOver ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(percent, 100)}%` }}></div>
                                        </div>
                                        <div className="text-[10px] text-center text-slate-400">{percent.toFixed(1)}%</div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {editingId === b.id ? (
                                            <button onClick={() => saveEdit(b.id)} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded">
                                                <Save size={18} />
                                            </button>
                                        ) : (
                                            <button onClick={() => startEdit(b.id, b.allocatedAmount)} className="text-slate-400 hover:text-blue-600 text-xs underline">
                                                Modifier
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
           </div>

           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
                <h3 className="font-semibold text-slate-800 mb-4">Répartition Allouée</h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2 w-full">
                    {totalSpent > totalBudget && (
                        <div className="bg-red-50 border border-red-200 p-3 rounded-lg flex items-center gap-3 text-red-700 text-sm">
                            <AlertTriangle size={20} />
                            <span>Attention : Dépenses globales supérieures au budget alloué.</span>
                        </div>
                    )}
                    {totalSpent <= totalBudget && (
                        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg flex items-center gap-3 text-emerald-700 text-sm">
                            <CheckCircle size={20} />
                            <span>Situation saine : Dépenses sous contrôle.</span>
                        </div>
                    )}
                </div>
           </div>
       </div>
    </div>
  );
};

export default Budget;
