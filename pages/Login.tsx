
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { ShieldCheck, GraduationCap } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const { login, settings } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, pass);
    if (!success) {
      setError('Identifiants invalides. Vérifiez vos accès.');
    }
  };

  const demoLogin = (role: 'admin' | 'president' | 'member') => {
      if(role === 'admin') login('djahfarsadekh2015@gmail.com', 'Dspro1814@2027');
      if(role === 'president') login('president@asso.com', 'demo');
      if(role === 'member') login('membre@asso.com', 'membre');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-primary rounded-b-[3rem] z-0"></div>

      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-accent mb-4 shadow-lg border-4 border-primary">
            <GraduationCap size={40} className="text-accent" />
          </div>
          <h1 className="text-3xl font-black text-primary tracking-tight">{settings.associationName}</h1>
          <p className="text-secondary font-medium mt-1">Plateforme de Contrôle Financier</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-accent text-sm rounded-lg border border-red-100 flex items-center gap-2">
            <ShieldCheck size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-secondary mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="admin@asso.com"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-secondary mb-1">Mot de passe</label>
            <input
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-primary hover:bg-green-800 text-white font-bold py-3 rounded-lg transition-colors shadow-lg shadow-green-900/20"
          >
            Se connecter
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-center text-slate-400 mb-3 uppercase tracking-wider">Accès Démo</p>
            <div className="flex justify-center gap-2">
                <button onClick={() => demoLogin('admin')} className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded text-slate-600 font-medium">Trésorier</button>
                <button onClick={() => demoLogin('president')} className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded text-slate-600 font-medium">Président</button>
                <button onClick={() => demoLogin('member')} className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded text-slate-600 font-medium">Membre</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Login;