
import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { Gender, UserRole, Sector, Level } from '../types';
import { UserPlus, Search } from 'lucide-react';
import { Navigate } from 'react-router-dom';

const Members: React.FC = () => {
  const { members, addMember, user } = useStore();
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    sector: Sector.INFO,
    level: Level.L1,
    gender: Gender.MALE,
    dossierNumber: '',
    ine: '',
    balance: 0,
  });

  // Security Check: Members cannot view the member list
  if (user?.role === UserRole.MEMBRE) {
    return <Navigate to="/" replace />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newSector = e.target.value as Sector;
      let newLevel = formData.level;
      
      // If Prepa is selected, force Level to AP. If not, if Level was AP, reset to L1
      if (newSector === Sector.PREPA) {
          newLevel = Level.AP;
      } else if (newLevel === Level.AP) {
          newLevel = Level.L1;
      }
      
      setFormData({...formData, sector: newSector, level: newLevel});
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMember(formData);
    setShowModal(false);
    setFormData({ ...formData, firstName: '', lastName: '', dossierNumber: '', ine: '' });
  };

  const filteredMembers = members.filter(m => 
    m.lastName.toLowerCase().includes(filter.toLowerCase()) || 
    m.firstName.toLowerCase().includes(filter.toLowerCase()) ||
    m.uniqueId.includes(filter)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Gestion des Membres</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
        >
          <UserPlus size={18} />
          <span>Nouveau Membre</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="text-slate-400" size={20} />
        <input 
            type="text" 
            placeholder="Rechercher par nom, prénom ou matricule..." 
            className="w-full outline-none text-slate-600 placeholder-slate-400"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
             <div className="p-6 border-b bg-slate-50 flex justify-between items-center">
               <h3 className="text-lg font-bold text-slate-800">Ajouter un membre</h3>
               <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
             </div>
             <form onSubmit={handleSubmit} className="p-6 space-y-4">
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Prénom</label>
                    <input required name="firstName" value={formData.firstName} onChange={handleChange} className="w-full border p-2 rounded" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                    <input required name="lastName" value={formData.lastName} onChange={handleChange} className="w-full border p-2 rounded" />
                 </div>
               </div>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date de Naissance</label>
                    <input required type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full border p-2 rounded" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Sexe</label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full border p-2 rounded">
                        <option value={Gender.MALE}>Masculin</option>
                        <option value={Gender.FEMALE}>Féminin</option>
                    </select>
                 </div>
               </div>
               
               {/* Sectors and Levels */}
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Filière</label>
                  <select name="sector" value={formData.sector} onChange={handleSectorChange} className="w-full border p-2 rounded">
                      {Object.values(Sector).map(s => (
                          <option key={s} value={s}>{s}</option>
                      ))}
                  </select>
               </div>

               {formData.sector !== Sector.PREPA && (
                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Niveau</label>
                      <select name="level" value={formData.level} onChange={handleChange} className="w-full border p-2 rounded">
                          <option value={Level.L1}>Licence 1 (L1)</option>
                          <option value={Level.L2}>Licence 2 (L2)</option>
                          <option value={Level.L3}>Licence 3 (L3)</option>
                      </select>
                   </div>
               )}

               <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">N° Dossier</label>
                    <input required name="dossierNumber" value={formData.dossierNumber} onChange={handleChange} className="w-full border p-2 rounded" placeholder="00000" />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">INE</label>
                    <input required name="ine" value={formData.ine} onChange={handleChange} className="w-full border p-2 rounded" />
                 </div>
               </div>
               <div className="pt-4 flex justify-end gap-3">
                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Annuler</button>
                    <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-slate-800">Créer</button>
               </div>
             </form>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredMembers.map(member => (
            <div key={member.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl ${member.gender === Gender.MALE ? 'bg-blue-500' : 'bg-pink-500'}`}>
                    {member.firstName.charAt(0)}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-slate-800">{member.firstName} {member.lastName}</h3>
                            <p className="text-xs text-slate-500">{member.sector}</p>
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1 rounded inline-block mt-1">
                                {member.level === Level.AP ? 'Année Préparatoire' : member.level}
                            </span>
                        </div>
                        <span className="bg-slate-100 text-slate-600 text-xs font-mono px-2 py-1 rounded">
                            {member.uniqueId}
                        </span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500">
                        <div>
                            <span className="block text-slate-400">INE</span>
                            {member.ine}
                        </div>
                        <div>
                            <span className="block text-slate-400">Solde</span>
                            <span className={member.balance >= 0 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                                {member.balance} FCFA
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default Members;
