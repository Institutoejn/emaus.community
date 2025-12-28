
import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../services/supabase';

interface ChatGroup {
  id: number;
  name: string;
  description: string;
  icon: string;
  type: 'public' | 'private';
}

interface ChatMessage {
  id: number;
  content: string;
  user_id: string;
  created_at: string;
  profiles: {
    name: string;
    avatar_url: string;
  } | null; // Profile pode ser null se o usuário foi deletado
}

const Community: React.FC<{ user: User }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'groups' | 'users'>('groups');
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [isChatVisibleMobile, setIsChatVisibleMobile] = useState(false);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupSearchQuery, setGroupSearchQuery] = useState('');
  
  // Real Data State
  const [groups, setGroups] = useState<ChatGroup[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [creatingDm, setCreatingDm] = useState(false);

  // Form Data
  const [groupFormData, setGroupFormData] = useState({ 
    name: '', 
    description: '', 
    icon: 'fa-users', 
    type: 'public' as 'public' | 'private' 
  });
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Groups & Members on Mount
  useEffect(() => {
    fetchGroups();
    fetchMembers();

    // Polling de segurança para grupos (caso realtime falhe)
    const interval = setInterval(fetchGroups, 10000); 
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch Messages & Realtime Subscription
  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
      
      const channel = supabase
        .channel(`chat_room:${activeChatId}`)
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages', 
          filter: `group_id=eq.${activeChatId}` 
        }, 
        (payload) => {
           // Opcional: Adicionar mensagem localmente antes do fetch para velocidade
           fetchMessages(activeChatId);
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    }
  }, [activeChatId]);

  // Auto-scroll inteligente
  useEffect(() => {
    if (scrollRef.current) {
      // Pequeno delay para garantir que o DOM renderizou as novas mensagens
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages, isChatVisibleMobile, loadingMessages]);

  const fetchGroups = async () => {
    const { data, error } = await supabase.from('chat_groups').select('*').order('created_at', { ascending: true });
    if (error) console.error("Erro grupos:", error);
    if (data) {
      setGroups(data);
      if (!activeChatId && data.length > 0) {
        // Only set default if not already set, to avoid jumping
        // setActiveChatId(data[0].id); 
      }
    }
  };

  const fetchMembers = async () => {
    const { data } = await supabase.from('profiles').select('*');
    if (data) {
      const mapped: User[] = data.map((u: any) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: new Date(u.created_at).getTime(),
        avatarUrl: u.avatar_url,
        bio: u.bio
      }));
      setMembers(mapped);
    }
  };

  const fetchMessages = async (groupId: number) => {
    if (messages.length === 0) setLoadingMessages(true);
    
    // JOIN correto com a tabela profiles
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        id, 
        content, 
        created_at, 
        user_id,
        profiles ( name, avatar_url )
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: true })
      .limit(100);
      
    if (error) {
      console.error("Erro RLS ou SQL ao buscar mensagens:", error);
    } else if (data) {
      setMessages(data as unknown as ChatMessage[]);
    }
    setLoadingMessages(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !activeChatId) return;

    const text = input.trim();
    setInput('');
    setSending(true);

    try {
      // Importante: Não enviamos 'created_at', deixamos o banco gerar
      const { error } = await supabase.from('chat_messages').insert([
        { group_id: activeChatId, user_id: user.id, content: text }
      ]);

      if (error) throw error;
      await fetchMessages(activeChatId);
      
    } catch (error: any) {
      console.error('Erro ao enviar:', error);
      alert(`Erro: ${error.message}`);
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const handleSaveGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.from('chat_groups').insert([{
      name: groupFormData.name,
      description: groupFormData.description,
      icon: groupFormData.icon,
      type: groupFormData.type,
      created_by: user.id
    }]).select().single();

    if (error) {
      alert('Erro ao criar grupo. Verifique permissões.');
    } else {
      await fetchGroups();
      setShowGroupModal(false);
      setGroupFormData({ name: '', description: '', icon: 'fa-users', type: 'public' });
      if (data) {
        handleSelectChat(data.id);
      }
    }
  };

  // Lógica para Criar ou Abrir Chat Privado
  const handleStartDirectChat = async (targetUser: User) => {
    if (targetUser.id === user.id) return;
    setCreatingDm(true);

    try {
      // 1. Tenta encontrar um grupo privado existente com nome padrão "A & B" ou "B & A"
      // Nota: Em uma app real, teríamos uma tabela 'chat_members', mas usaremos convenção de nome para simplificar este MVP
      const chatName1 = `${user.name} & ${targetUser.name}`;
      const chatName2 = `${targetUser.name} & ${user.name}`;

      const existingGroup = groups.find(g => 
        g.type === 'private' && (g.name === chatName1 || g.name === chatName2)
      );

      if (existingGroup) {
        handleSelectChat(existingGroup.id);
        setSelectedMember(null);
        setActiveTab('groups');
      } else {
        // 2. Cria novo grupo privado
        const { data, error } = await supabase.from('chat_groups').insert([{
          name: chatName1,
          description: 'Conversa Privada',
          icon: 'fa-comments',
          type: 'private',
          created_by: user.id
        }]).select().single();

        if (error) throw error;

        if (data) {
          await fetchGroups(); // Atualiza lista
          handleSelectChat(data.id); // Abre o chat
          setSelectedMember(null);
          setActiveTab('groups');
        }
      }
    } catch (error: any) {
      console.error("Erro ao criar DM:", error);
      alert("Não foi possível iniciar o chat.");
    } finally {
      setCreatingDm(false);
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (window.confirm('Excluir este grupo e todas as mensagens?')) {
      const { error } = await supabase.from('chat_groups').delete().eq('id', groupId);
      if (!error) {
        setGroups(groups.filter(g => g.id !== groupId));
        if (activeChatId === groupId) setActiveChatId(null);
      }
    }
  };

  const handleSelectChat = (id: number) => {
    setActiveChatId(id);
    setIsChatVisibleMobile(true);
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(groupSearchQuery.toLowerCase()) ||
    g.description.toLowerCase().includes(groupSearchQuery.toLowerCase())
  );

  const currentChatInfo = groups.find(g => g.id === activeChatId);

  return (
    <div className="h-full flex emaus-card rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-500/5 bg-white border-2 border-[#3533cd] relative">
      
      {/* Sidebar */}
      <div className={`flex flex-col w-full lg:w-80 border-r border-slate-100 bg-slate-50/50 shrink-0 ${isChatVisibleMobile ? 'hidden lg:flex' : 'flex'}`}>
        <div className="p-6 bg-white border-b border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-black">Comunidade</h2>
            
            {user.role === UserRole.ADMIN && activeTab === 'groups' && (
              <button 
                onClick={() => { setGroupFormData({ name: '', description: '', icon: 'fa-users', type: 'public' }); setShowGroupModal(true); }}
                className="w-10 h-10 rounded-xl bg-[#3533cd] text-white flex items-center justify-center hover:scale-110 transition-all shadow-lg active:scale-95"
                title="Criar Grupo Público"
              >
                <i className="fa-solid fa-plus text-sm"></i>
              </button>
            )}
          </div>
          
          <div className="flex p-1 bg-slate-100 rounded-xl mb-4">
            <button onClick={() => setActiveTab('groups')} className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'groups' ? 'bg-white text-[#3533cd] shadow-sm' : 'text-slate-400'}`}>Grupos</button>
            <button onClick={() => setActiveTab('users')} className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${activeTab === 'users' ? 'bg-white text-[#3533cd] shadow-sm' : 'text-slate-400'}`}>Membros</button>
          </div>

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
                    activeChatId === chat.id ? 'bg-white border-[#3533cd]' : 'border-transparent opacity-70'
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
                      {chat.type === 'private' && <i className="fa-solid fa-lock text-[8px] text-[#3533cd]" title="Privado"></i>}
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
            members.map((member) => (
              <button
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className={`w-full flex items-center gap-4 p-4 transition-all hover:bg-white border-l-4 border-transparent opacity-70`}
              >
                <div className="relative shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-white shadow-md bg-[#3533cd] overflow-hidden`}>
                    {member.avatarUrl ? <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" /> : member.name[0]}
                  </div>
                  {member.id === user.id && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>}
                </div>
                <div className="flex-1 text-left overflow-hidden">
                  <h4 className="text-sm font-black text-black truncate">{member.name} {member.id === user.id && '(Você)'}</h4>
                  <p className="text-xs text-slate-500 truncate font-medium mt-0.5">{member.role === UserRole.ADMIN ? 'Gestor Davi' : 'Discípulo'}</p>
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

            {currentChatInfo ? (
              <>
                <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center shadow-lg shrink-0 bg-[#3533cd] rounded-xl">
                    <i className={`fa-solid ${currentChatInfo.icon} text-white text-lg`}></i>
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-black text-sm md:text-base truncate flex items-center gap-2">
                    {currentChatInfo.name}
                    {currentChatInfo.type === 'private' && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Privado</span>}
                  </h3>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] md:text-xs font-bold text-green-500 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      Online
                    </p>
                    <button 
                      onClick={() => activeChatId && fetchMessages(activeChatId)}
                      className="text-[10px] text-slate-400 hover:text-[#3533cd] font-bold"
                      title="Forçar atualização"
                    >
                      <i className="fa-solid fa-rotate-right ml-1"></i>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <h3 className="font-black text-slate-400">Selecione um grupo</h3>
            )}
          </div>

          {user.role === UserRole.ADMIN && activeTab === 'groups' && activeChatId && (
            <div className="flex gap-2">
              <button 
                onClick={() => handleDeleteGroup(activeChatId)}
                className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-all shadow-sm active:scale-95"
                title="Apagar Grupo"
              >
                <i className="fa-solid fa-trash-can text-sm"></i>
              </button>
            </div>
          )}
        </div>

        {/* Message Container */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4" ref={scrollRef} style={{ backgroundImage: 'radial-gradient(#3533cd15 1px, transparent 0)', backgroundSize: '24px 24px' }}>
          {!activeChatId ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-400">
               <i className="fa-solid fa-comments text-4xl mb-4 text-slate-300"></i>
               <p className="font-bold text-sm">Escolha um grupo para começar</p>
             </div>
          ) : loadingMessages ? (
             <div className="text-center py-10 text-slate-400 font-bold text-xs flex flex-col items-center gap-2">
               <i className="fa-solid fa-circle-notch animate-spin text-xl text-[#3533cd]"></i>
               Carregando mensagens...
             </div>
          ) : messages.length === 0 ? (
             <div className="text-center py-10 text-slate-400 font-bold text-xs">
               <p>Nenhuma mensagem ainda.</p>
               <p className="text-[10px] mt-1 opacity-70">Seja o primeiro a escrever!</p>
             </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.user_id === user.id ? 'justify-end' : 'justify-start'}`}>
                 <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[70%] ${msg.user_id === user.id ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className="w-6 h-6 rounded-full bg-slate-200 shrink-0 overflow-hidden hidden md:block border border-slate-300">
                        {msg.profiles?.avatar_url ? (
                          <img src={msg.profiles.avatar_url} className="w-full h-full object-cover" alt="avatar" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-slate-400">?</div>
                        )}
                    </div>

                    <div className={`flex flex-col ${msg.user_id === user.id ? 'items-end' : 'items-start'}`}>
                      {msg.user_id !== user.id && (
                        <span className="text-[10px] font-black text-[#3533cd] mb-1 ml-2">
                          {msg.profiles?.name || 'Membro Desconhecido'}
                        </span>
                      )}
                      <div className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-medium shadow-sm border ${
                        msg.user_id === user.id ? 'bg-[#3533cd] text-white border-[#3533cd] rounded-tr-none' : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'
                      }`}>
                        {msg.content}
                        <div className={`mt-1 flex items-center justify-end gap-1 text-[9px] font-bold ${msg.user_id === user.id ? 'text-white/70' : 'text-slate-400'}`}>
                          {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                        </div>
                      </div>
                    </div>
                 </div>
              </div>
            ))
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 md:p-6 bg-white border-t border-slate-100">
          <form onSubmit={handleSend} className="flex items-center gap-2 md:gap-4 bg-slate-50 p-2 md:p-3 rounded-[1.5rem] border border-slate-200">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={activeChatId ? "Digite uma mensagem..." : "Selecione um grupo..."}
              disabled={!activeChatId}
              className="flex-1 bg-transparent border-none outline-none focus:ring-0 font-medium text-black text-sm px-2 disabled:cursor-not-allowed"
            />
            <button 
              type="submit" 
              disabled={!input.trim() || !activeChatId || sending} 
              className={`${input.trim() && activeChatId ? 'bg-[#3533cd]' : 'bg-slate-200'} text-white w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 disabled:active:scale-100`}
            >
              {sending ? <i className="fa-solid fa-spinner animate-spin text-sm"></i> : <i className="fa-solid fa-paper-plane text-sm"></i>}
            </button>
          </form>
        </div>
      </div>

      {/* Modais mantidos iguais, sem alteração */}
      {showGroupModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#3533cd] flex items-center justify-center text-2xl">
                  <i className={`fa-solid ${groupFormData.icon}`}></i>
               </div>
               <div>
                  <h3 className="text-2xl font-black text-black">Novo Grupo Bíblico</h3>
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Descrição</label>
                  <textarea 
                    required
                    value={groupFormData.description}
                    onChange={e => setGroupFormData({...groupFormData, description: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-sm focus:ring-2 focus:ring-[#3533cd] focus:outline-none h-24 resize-none"
                    placeholder="Objetivo do grupo..."
                  ></textarea>
                </div>

                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Ícone</label>
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

                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Tipo</label>
                   <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => setGroupFormData({...groupFormData, type: 'public'})}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border ${groupFormData.type === 'public' ? 'bg-[#3533cd] text-white border-[#3533cd]' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                      >
                        Público
                      </button>
                      <button 
                        type="button"
                        onClick={() => setGroupFormData({...groupFormData, type: 'private'})}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border ${groupFormData.type === 'private' ? 'bg-[#3533cd] text-white border-[#3533cd]' : 'bg-slate-50 text-slate-400 border-slate-200'}`}
                      >
                        Privado
                      </button>
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
                  Criar Grupo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              <p className="text-[10px] font-black text-[#3533cd] uppercase tracking-widest mt-1">
                 {selectedMember.role === UserRole.ADMIN ? 'Gestor Davi' : 'Discípulo'}
              </p>
              <div className="mt-6 p-4 bg-slate-50 rounded-2xl">
                <p className="text-xs text-slate-600 font-medium leading-relaxed italic">"{selectedMember.bio || 'Sem biografia disponível.'}"</p>
              </div>
              
              {/* Botão de Enviar Mensagem (NOVO) */}
              {selectedMember.id !== user.id && (
                <div className="mt-6">
                  <button 
                    onClick={() => handleStartDirectChat(selectedMember)}
                    disabled={creatingDm}
                    className="w-full bg-[#3533cd] text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-500/20 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {creatingDm ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-paper-plane"></i>}
                    Enviar Mensagem
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Community;
