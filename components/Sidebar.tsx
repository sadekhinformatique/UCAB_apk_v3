
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, Users, LogOut, BrainCircuit, Settings, PieChart, ShieldCheck, MessageCircle, UserCircle, GraduationCap } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { UserRole } from '../types';

const Sidebar: React.FC = () => {
  const { user, logout, settings } = useStore();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Updated navigation classes for the Green background
  const navClass = (path: string) => `
    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
    ${isActive(path) 
      ? 'bg-white text-primary font-bold shadow-md' 
      : 'text-green-100 hover:bg-green-800 hover:text-white'}
  `;

  return (
    <aside className="w-64 bg-primary h-screen flex flex-col fixed left-0 top-0 z-20 shadow-xl border-r border-green-800">
      {/* Logo Section */}
      <div className="p-6 border-b border-green-700 bg-primary/50">
        <div className="flex items-center gap-3 mb-2">
            <div className="bg-white p-2 rounded-full shadow-md">
                <GraduationCap className="text-accent" size={24} />
            </div>
            <div>
                 <h1 className="text-xl font-black text-white tracking-tighter leading-none">
                    <span className="text-accent">A.E.U.</span>C.A.B<span className="text-xs align-top">.DK</span>
                </h1>
                <p className="text-[10px] text-green-200 uppercase tracking-widest font-semibold">Amicale des Etudiants</p>
            </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        <Link to="/" className={navClass('/')}>
          <LayoutDashboard size={20} />
          <span>Tableau de bord</span>
        </Link>

         {/* Common for all logged users */}
        <Link to="/profile" className={navClass('/profile')}>
            <UserCircle size={20} />
            <span>Mon Profil</span>
        </Link>

        <Link to="/community" className={navClass('/community')}>
            <MessageCircle size={20} />
            <span>Communauté</span>
        </Link>

        {user?.role !== UserRole.MEMBRE && (
            <>
                <Link to="/transactions" className={navClass('/transactions')}>
                <Receipt size={20} />
                <span>Transactions</span>
                </Link>

                <Link to="/members" className={navClass('/members')}>
                <Users size={20} />
                <span>Membres</span>
                </Link>

                <Link to="/budget" className={navClass('/budget')}>
                <PieChart size={20} />
                <span>Budget</span>
                </Link>

                <Link to="/assistant" className={navClass('/assistant')}>
                <BrainCircuit size={20} />
                <span>Assistant IA</span>
                </Link>
            </>
        )}
        
        {user?.role === UserRole.MEMBRE && (
             <Link to="/transactions" className={navClass('/transactions')}>
             <Receipt size={20} />
             <span>Mes Transactions</span>
             </Link>
        )}

        {/* Admin Link for Treasurer and President to access full settings */}
        {(user?.role === UserRole.TRESORIER || user?.role === UserRole.PRESIDENT) && (
             <Link to="/admin" className={navClass('/admin')}>
             <Settings size={20} />
             <span>Paramètres Admin</span>
             </Link>
        )}
      </nav>

      <div className="p-4 border-t border-green-700 bg-green-900/20">
        <div className="flex items-center gap-3 px-4 py-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white font-bold border border-green-600">
            {user?.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <div className="flex items-center gap-1 text-xs text-green-200">
                <ShieldCheck size={10} />
                <span className="truncate">{user?.role}</span>
            </div>
          </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2 text-red-200 hover:bg-red-500/20 hover:text-white rounded-lg transition-colors text-sm"
        >
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;