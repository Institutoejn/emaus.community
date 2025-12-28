
import React, { useState, useRef, useEffect } from 'react';
import { User, Message, UserRole } from '../types';

interface ChatGroup {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: 'public' | 'private';
  lastMsg: string;
  onlineCount: number;
}

const Community: React.FC<{ user: User }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'groups' | 'users'>('groups');
  const [activeChatId, setActiveChatId] = useState('geral');
  const [isChatVisibleMobile, setIsChatVisibleMobile] = useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ChatGroup | null>(null);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  
  // State for dynamic groups with expanded strategic fields
  const [groups, setGroups] = useState<ChatGroup[]>([
    { id: 'geral', name: 'Sala Geral Juventude', description: 'Espaço principal para integração de todos os jovens.', icon: 'fa-users', type: 'public', lastMsg: 'João Silva: Bom dia pessoal!', onlineCount: 12 },
    { id: 'oracao', name: 'Pedidos de Oração', description: 'Canal dedicado a intercessão e apoio espiritual mútuo.', icon: 'fa-hands-praying', type: 'public', lastMsg: 'Maria: Oremos pela saúde...', onlineCount: 5 },
    { id: 'avisos', name: 'Avisos da Igreja', description: 'Informações oficiais da liderança para a juventude.', icon: 'fa-bullhorn', type: 'private', lastMsg: 'Davi: Reunião no Sábado!', onlineCount: 8 },
  ]);

  const [groupFormData, setGroupFormData] = useState({ 
    name: '', 
    description: '', 
    icon: 'fa-users', 
    type: 'public' as 'public' | 'private' 
  });

  const [messages, setMessages] = useState<Message[]>([
    { id: '1', senderId: 'bot', senderName: 'Boas-Vindas', text: 'Bem-vindos ao chat da Comunidade Emaús! Sintam-se em casa para partilhar versículos e orações.', timestamp: Date.now() - 3600000 },
    { id: '2', senderId: 'u1', senderName: 'João Silva', text: 'Bom dia pessoal! Hoje li Salmos 23 e senti-me muito renovado.', timestamp: Date.now() - 1800000 }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const onlineUsers: User[] = [
    { id: 'u1', name: 'João Silva', email: 'joao@example.com', role: UserRole.USER, createdAt: Date.now() - 86400000, bio: 'Amo estudar a palavra e tocar violão no louvor.', avatarUrl: 'https://i.pravatar.cc/150?u=u1' },
    { id: 'u2', name: 'Maria Santos', email: 'maria@example.com', role: UserRole.USER, createdAt: Date.now() - 43200000, bio: 'Em busca de sabedoria todos os dias.', avatarUrl: 'https://i.pravatar.cc/150?u=u2' },
    { id: 'u3', name: 'Pedro Miguel', email: 'pedro@example.com', role: UserRole.USER, createdAt: Date.now() - 172800000, bio: 'Jovem aprendiz na fé.', avatarUrl: 'https://i.pravatar.cc/150?u=u3' },
    { id: 'u4', name: 'Ana Oliveira', email: 'ana@example.com', role: UserRole.USER, createdAt: Date.now(), bio: 'Alegria do Senhor é a minha força!', avatarUrl: 'https://i.pravatar.cc/150?u=u4' },
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isChatVisibleMobile]);

  // Filter groups based on search query
  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) ||
    g.description.toLowerCase().includes(groupSearchQuery.toLowerCase())
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Math.random().toString(),
      senderId: user.id,
      senderName: user.name,
      text: input.trim(),
      timestamp: Date.now()
    };

    setMessages([...messages, newMessage]);
    setInput('');
  };

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    setIsChatVisibleMobile(true);
  };

  const handleStartPrivateChat = (member: User) => {
    setActiveTab('users');
    setActiveChatId(member.id);
    setSelectedMember(null);
    setIsChatVisibleMobile(true);
    setMessages([{ id: 'p1', senderId: 'system', senderName: 'Sistema', text: `Conversa privada com ${member.name}.`, timestamp: Date.now() }]);
  };

  // Added missing handleSendPrayer function
  const handleSendPrayer = (member: User) => {
    alert(`Enviamos uma notificação de intercessão para ${member.name}. A comunidade está a orar contigo!`);
  };

  // Group Management Functions
  const handleSaveGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGroup) {
      setGroups(groups.map(g => g.id === editingGroup.id ? { 
        ...g, 
        name: groupFormData.name, 
        description: groupFormData.description,
        icon: groupFormData.icon,
        type: groupFormData.type
      } : g));
    } else {
      const newGroup: ChatGroup = {
        id: Math.random().toString(36).substr(2, 9),
        name: groupFormData.name,
        description: groupFormData.description,
        icon: groupFormData.icon,
        type: groupFormData.type,
        lastMsg: 'Sala estratégica criada',
        onlineCount: 0
      };
      setGroups([...groups, newGroup]);
    }
    setShowGroupModal(false);
    setEditingGroup(null);
    setGroupFormData({ name: '', description: '', icon: 'fa-users', type: 'public' });
  };

  const handleDeleteGroup = (groupId: string) => {
    if (window.confirm('Atenção Gestor: Tens a certeza que queres excluir permanentemente este grupo?')) {
      const updatedGroups = groups.filter(g => g.id !== groupId);
      setGroups(updatedGroups);
      if (activeChatId === groupId) {
        setActiveChatId('geral');
      }
      alert('Grupo removido com sucesso.');
    }
  };

  const openEditModal = (group: ChatGroup) => {
    setEditingGroup(group);
    setGroupFormData({ 
      name: group.name, 
      description: group.description,
      icon: group.icon,
      type: group.type
    });
    setShowGroupModal(true);
  };

  const currentChatInfo = activeTab === 'groups' 
    ? groups.find(c => c.id === activeChatId) 
    : onlineUsers.find(u => u.id === activeChatId);

  return (
    <div className="h-full flex emaus-card rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-500/5 bg-white border-2 border-[#3533cd] relative">
      
      {/* Sidebar - Chat & Member List */}
      <div className={`flex flex-col w-full lg:w-80 border-r border-slate-100 bg-slate-50/50 shrink-0 ${isChatVisibleMobile ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-6 bg-white border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-black">Comunidade</h2>
            
            {user.role === UserRole.ADMIN && activeTab === 'groups' && (
              <button 
                onClick={() => { setEditingGroup(null); setGroupFormData({ name: '', description: '', icon: 'fa-users', type: 'public' }); setShowGroupModal(true); }}
                className="w-10 h-10 rounded-xl bg-[#3533cd] text-white flex items-center justify-center hover:scale-110 transition-all shadow-lg active:scale-95"
                title="Novo Grupo Estratégico"
              >
                <i className="fa-solid fa-plus text-sm"></i>
              </button>
            )}
          </div>
          
          <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
            <button 
              onClick={() => setActiveTab('groups')}
              className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                activeTab === 'groups' ? 'bg-white text-[#3533cd] shadow-sm' : 'text-slate-400'
              }`}
            >
              Grupos
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                activeTab === 'users' ? 'bg-white text-[#3533cd] shadow-sm' : 'text-slate-400'
              }`}
            >
              Membros
            </button>
          </div>

          {/* Search Bar for Groups */}
          {activeTab === 'groups' && (
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
              <input 
                type="text" 
                placeholder="Buscar grupo..."
                value={groupSearchQuery}
                onChange={(e) => setGroupSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-black focus:ring-2 focus:ring-[#3533cd] focus:outline-none transition-all"
              />
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {activeTab === 'groups' ? (
            filteredGroups.length > 0 ? (
              filteredGroups.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  className={`w-full flex items-center gap-4 p-4 transition-all hover:bg-white border-l-4 ${
                    activeChatId === chat.id && activeTab === 'groups' ? 'bg-white border-[#3533cd]' : 'border-transparent opacity-70'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 ${
                    activeChatId === chat.id ? 'bg-[#3533cd]' : 'bg-slate-300'
                  }`}>
                    <i className={`fa-solid ${chat.icon}`}></i>
                  </div>
                  <div className="flex-1 text-left overflow-hidden">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-black text-black truncate">{chat.name}</h4>
                      {chat.type === 'private' && <i className="fa-solid fa-lock text-[8px] text-slate-400"></i>}
                    </div>
                    <p className="text-[10px] text-slate-500 truncate font-bold mt-0.5 uppercase tracking-tight">{chat.description}</p>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-10 text-center">
                <p className="text-xs font-bold text-slate-400">Nenhum grupo encontrado.</p>
              </div>
            )
          ) : (
            onlineUsers.map((member) => (
              <button
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className={`w-full flex items-center gap-4 p-4 transition-all hover:bg-white border-l-4 border-transparent opacity-70`}
              >
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-white shadow-md bg-[#3533cd] overflow-hidden`}>
                    {member.avatarUrl ? <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" /> : member.name[0]}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-2 border-white rounded-full bg-green-500`}></div>
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <h4 className="text-sm font-black text-black truncate">{member.name}</h4>
                  <p className="text-xs text-slate-500 truncate font-medium mt-0.5">Online agora</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-[#f8f9ff] ${!isChatVisibleMobile ? 'hidden lg:flex' : 'flex'}`}>
        
        {/* Chat Header */}
        <div className="p-4 md:p-6 bg-white border-b border-slate-100 flex items-center justify-between sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={() => setIsChatVisibleMobile(false)} className="lg:hidden w-10 h-10 flex items-center justify-center text-[#3533cd] hover:bg-slate-50 rounded-xl transition-all">
              <i className="fa-solid fa-arrow-left text-xl"></i>
            </button>

            <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shadow-lg shrink-0 ${
              activeTab === 'groups' ? 'bg-[#3533cd] rounded-xl' : 'bg-slate-100 rounded-full border border-slate-200'
            }`}>
              {activeTab === 'groups' ? (
                <i className={`fa-solid ${(currentChatInfo as any)?.icon || 'fa-users'} text-white text-lg`}></i>
              ) : (
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center">
                  {(currentChatInfo as User)?.avatarUrl ? (
                    <img src={(currentChatInfo as User).avatarUrl} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[#3533cd] font-black">{(currentChatInfo as User)?.name[0] || 'U'}</span>
                  )}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-black text-black text-sm md:text-base truncate">
                {(currentChatInfo as any)?.name || 'Conversa'}
              </h3>
              <p className={`text-[10px] md:text-xs font-bold flex items-center gap-1.5 ${
                activeTab === 'groups' || (currentChatInfo as any)?.status === 'online' ? 'text-green-500' : 'text-slate-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                   activeTab === 'groups' || activeTab === 'users' ? 'bg-green-500 animate-pulse' : 'bg-slate-300'
                }`}></span>
                {activeTab === 'groups' ? `${(currentChatInfo as any)?.onlineCount || 0} ativos` : 'Online'}
              </p>
            </div>
          </div>

          {/* Botões de Gestão do Grupo - Somente Gestor */}
          {user.role === UserRole.ADMIN && activeTab === 'groups' && activeChatId !== 'geral' && (
            <div className="flex gap-2">
              <button 
                onClick={() => openEditModal(currentChatInfo as ChatGroup)}
                className="w-10 h-10 rounded-xl bg-slate-50 text-[#3533cd] flex items-center justify-center hover:bg-slate-100 transition-all shadow-sm active:scale-95"
                title="Configurações Estratégicas"
              >
                <i className="fa-solid fa-gear text-sm"></i>
              </button>
              <button 
                onClick={() => handleDeleteGroup(activeChatId)}
                className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-all shadow-sm active:scale-95"
                title="Excluir Grupo Permanentemente"
              >
                <i className="fa-solid fa-trash-can text-sm"></i>
              </button>
            </div>
          )}
        </div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4" ref={scrollRef} style={{ backgroundImage: 'radial-gradient(#3533cd15 1px, transparent 0)', backgroundSize: '24px 24px' }}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex flex-col max-w-[85%] md:max-w-[70%] ${msg.senderId === user.id ? 'items-end' : 'items-start'}`}>
                {msg.senderId !== user.id && <span className="text-[10px] font-black text-[#3533cd] mb-1 ml-2">{msg.senderName}</span>}
                <div className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-medium shadow-sm border ${
                  msg.senderId === user.id ? 'bg-[#3533cd] text-white border-[#3533cd] rounded-tr-none' : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'
                }`}>
                  {msg.text}
                  <div className={`mt-1 flex items-center justify-end gap-1 text-[9px] font-bold ${msg.senderId === user.id ? 'text-white/70' : 'text-slate-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 md:p-6 bg-white border-t border-slate-100">
          <form onSubmit={handleSend} className="flex items-center gap-2 md:gap-4 bg-slate-50 p-2 md:p-3 rounded-[1.5rem] border border-slate-200">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite uma mensagem..."
              className="flex-1 bg-transparent border-none outline-none focus:ring-0 font-medium text-black text-sm px-2"
            />
            <button type="submit" className={`${input.trim() ? 'bg-[#3533cd]' : 'bg-slate-200'} text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95`}>
              <i className="fa-solid fa-paper-plane text-sm"></i>
            </button>
          </form>
        </div>
      </div>

      {/* Modal de Grupo Estratégico (Adicionar/Editar) - Exclusivo Gestor */}
      {showGroupModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#3533cd] flex items-center justify-center text-2xl">
                  <i className={`fa-solid ${groupFormData.icon}`}></i>
               </div>
               <div>
                  <h3 className="text-2xl font-black text-black">
                    {editingGroup ? 'Configuração Estratégica' : 'Novo Grupo Bíblico'}
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Painel do Gestor Davi</p>
               </div>
            </div>

            <form onSubmit={handleSaveGroup} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Nome do Grupo</label>
                  <input 
                    type="text" 
                    required
                    value={groupFormData.name}
                    onChange={e => setGroupFormData({...groupFormData, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-sm focus:ring-2 focus:ring-[#3533cd] focus:outline-none"
                    placeholder="Ex: Discipulado Emaús"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Descrição / Propósito Estratégico</label>
                  <textarea 
                    required
                    value={groupFormData.description}
                    onChange={e => setGroupFormData({...groupFormData, description: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-sm focus:ring-2 focus:ring-[#3533cd] focus:outline-none h-24 resize-none"
                    placeholder="Qual o objetivo deste grupo na jornada bíblica?"
                  ></textarea>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Privacidade</label>
                  <select 
                    value={groupFormData.type}
                    onChange={e => setGroupFormData({...groupFormData, type: e.target.value as 'public' | 'private'})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-sm focus:ring-2 focus:ring-[#3533cd] focus:outline-none"
                  >
                    <option value="public">Público (Todos podem ver)</option>
                    <option value="private">Privado (Apenas convidados)</option>
                  </select>
                </div>

                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Ícone Visual</label>
                   <div className="grid grid-cols-4 gap-2">
                    {['fa-users', 'fa-book-bible', 'fa-hands-praying', 'fa-guitar', 'fa-heart', 'fa-star', 'fa-sun', 'fa-leaf'].map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setGroupFormData({...groupFormData, icon})}
                        className={`aspect-square rounded-xl flex items-center justify-center border-2 transition-all ${
                          groupFormData.icon === icon ? 'border-[#3533cd] bg-blue-50 text-[#3533cd]' : 'border-slate-100 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        <i className={`fa-solid ${icon} text-sm`}></i>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-50">
                <button 
                  type="button" 
                  onClick={() => setShowGroupModal(false)}
                  className="flex-1 font-black text-slate-400 py-4 hover:text-black transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-[#3533cd] text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                >
                  {editingGroup ? 'Salvar Configurações' : 'Lançar Grupo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Profile Modal - Estratégico */}
      {selectedMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="relative h-32 bg-[#3533cd]">
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                <div className="w-24 h-24 rounded-[2rem] bg-white border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                  {selectedMember.avatarUrl ? <img src={selectedMember.avatarUrl} alt={selectedMember.name} className="w-full h-full object-cover" /> : <i className="fa-solid fa-user text-3xl text-[#3533cd]"></i>}
                </div>
              </div>
              <button onClick={() => setSelectedMember(null)} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center backdrop-blur-md">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="pt-16 pb-10 px-8 text-center">
              <h3 className="text-xl font-black text-black">{selectedMember.name}</h3>
              <p className="text-[10px] font-black text-[#3533cd] uppercase tracking-widest mt-1">Jovem Discípulo</p>
              <div className="mt-6 p-4 bg-slate-50 rounded-2xl">
                <p className="text-xs text-slate-600 font-medium leading-relaxed italic">"{selectedMember.bio || 'Sem biografia disponível.'}"</p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-3">
                <button onClick={() => handleStartPrivateChat(selectedMember)} className="flex flex-col items-center justify-center p-3 bg-blue-50 rounded-2xl group">
                  <i className="fa-solid fa-message text-[#3533cd] mb-1"></i>
                  <span className="text-[10px] font-black text-[#3533cd] uppercase">Mensagem</span>
                </button>
                <button onClick={() => handleSendPrayer(selectedMember)} className="flex flex-col items-center justify-center p-3 bg-purple-50 rounded-2xl group">
                  <i className="fa-solid fa-heart text-purple-600 mb-1"></i>
                  <span className="text-[10px] font-black text-purple-600 uppercase">Orar</span>
                </button>
              </div>
              {user.role === UserRole.ADMIN && (
                <button 
                  onClick={() => { alert(`Usuário ${selectedMember.name} removido da comunidade.`); setSelectedMember(null); }}
                  className="w-full mt-4 py-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase hover:bg-red-100 transition-all"
                >
                  Remover do Sistema
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
