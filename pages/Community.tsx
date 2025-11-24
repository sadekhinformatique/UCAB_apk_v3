
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Send, User as UserIcon, Trash2, MessageCircle } from 'lucide-react';
import { UserRole } from '../types';

const Community: React.FC = () => {
  const { user, messages, addMessage, deleteMessage } = useStore();
  const [newMsg, setNewMsg] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    addMessage(newMsg);
    setNewMsg('');
  };

  const handleDelete = (id: string) => {
      if(window.confirm('Supprimer ce message ?')) {
          deleteMessage(id);
      }
  }

  const canDelete = (msgUserId: string) => {
      if (!user) return false;
      // Admins can delete anything
      if (user.role === UserRole.PRESIDENT || user.role === UserRole.TRESORIER) return true;
      // Users can delete their own
      return user.email === msgUserId;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)]">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <MessageCircle className="text-primary" /> Communauté
        </h2>
        <p className="text-sm text-slate-500">Espace d'échange pour tous les membres de l'association.</p>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <MessageCircle size={48} className="mb-2 opacity-20" />
                    <p>Aucun message. Lancez la discussion !</p>
                </div>
            )}
            
            {messages.map((msg) => {
                const isMe = user?.email === msg.userId;
                return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] md:max-w-[60%] flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                             <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${isMe ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>
                                {msg.userName.charAt(0)}
                             </div>
                             
                             <div>
                                 <div className={`flex items-baseline gap-2 mb-1 ${isMe ? 'justify-end' : ''}`}>
                                    <span className="text-xs font-bold text-slate-700">{msg.userName}</span>
                                    {msg.memberInfo && (
                                        <span className="text-[10px] bg-slate-200 text-slate-600 px-1 rounded">
                                            {msg.memberInfo.sector} • {msg.memberInfo.level}
                                        </span>
                                    )}
                                     <span className="text-[10px] text-slate-400">
                                         {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                     </span>
                                 </div>
                                 
                                 <div className={`p-3 rounded-lg text-sm relative group ${isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'}`}>
                                     {msg.content}
                                     {canDelete(msg.userId) && (
                                         <button 
                                            onClick={() => handleDelete(msg.id)}
                                            className={`absolute -right-8 top-0 p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity`}
                                         >
                                             <Trash2 size={14} />
                                         </button>
                                     )}
                                 </div>
                             </div>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200">
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    placeholder="Écrivez un message..."
                    className="flex-1 border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
                <button 
                    type="submit" 
                    disabled={!newMsg.trim()}
                    className="bg-primary hover:bg-slate-800 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <Send size={18} /> 
                    <span className="hidden sm:inline">Envoyer</span>
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default Community;
