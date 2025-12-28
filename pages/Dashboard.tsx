
import React, { useState } from 'react';
import { User, UserRole, Course } from '../types';

interface DashboardProps {
  courses: Course[];
  onAddCourse: (course: Course) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ courses, onAddCourse }) => {
  // Dados simulando o retorno da coleção 'users' do Firestore
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'João Silva', username: '@joaosilva', email: 'joao@example.com', role: UserRole.USER, interest: 'Parábolas de Jesus', createdAt: Date.now() - 86400000 },
    { id: '2', name: 'Maria Santos', username: '@maria_fe', email: 'maria@example.com', role: UserRole.USER, interest: 'Salmos e Poesia', createdAt: Date.now() - 43200000 },
    { id: '3', name: 'Gestor Davi', username: '@davi_gestor', email: 'admin@emaus.com', role: UserRole.ADMIN, interest: 'Liderança Cristã', createdAt: Date.now() - 172800000 },
    { id: '4', name: 'Pedro Miguel', username: '@pedro_miguel', email: 'pedro@example.com', role: UserRole.USER, interest: 'Cartas de Paulo', createdAt: Date.now() },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [newCourse, setNewCourse] = useState({ title: '', description: '', url: '' });
  
  // Estados para Edição de Usuário
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const trendingTopics = [
    { topic: 'Ansiedade e Paz', count: '45%', icon: 'fa-heart-pulse' },
    { topic: 'Propósito de Vida', count: '32%', icon: 'fa-compass' },
    { topic: 'Perdão Familiar', count: '23%', icon: 'fa-hands-holding-child' }
  ];

  const handleAddCourseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const course: Course = {
      id: Date.now().toString(),
      title: newCourse.title,
      description: newCourse.description,
      youtubeUrl: newCourse.url,
      thumbnail: `https://picsum.photos/seed/${Date.now()}/600/400`
    };
    onAddCourse(course);
    setNewCourse({ title: '', description: '', url: '' });
    alert('Curso publicado com sucesso!');
  };

  // Funções de Gestão de Usuários
  const handleDeleteUser = (id: string) => {
    if (window.confirm('Atenção Gestor Davi: Tens a certeza que queres remover permanentemente este discípulo da plataforma?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser({ ...user });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    
    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    setIsEditModalOpen(false);
    setEditingUser(null);
    alert('Perfil do discípulo atualizado com sucesso!');
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-black tracking-tight">Gestão Davi</h1>
          <p className="text-slate-400 font-medium mt-1">Central de comando e insights da Comunidade Emaús.</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-black text-green-500 bg-green-50 px-4 py-2 rounded-full border border-green-100 shadow-sm">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
          SISTEMA ONLINE
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="emaus-card p-6 rounded-[1.5rem] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#3533cd] flex items-center justify-center text-xl">
            <i className="fa-solid fa-users"></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Discípulos</p>
            <h4 className="text-2xl font-black text-black">{users.length}</h4>
          </div>
        </div>
        
        <div className="emaus-card p-6 rounded-[1.5rem] flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl">
            <i className="fa-solid fa-book-open"></i>
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cursos Ativos</p>
            <h4 className="text-2xl font-black text-black">{courses.length}</h4>
          </div>
        </div>

        <div className="md:col-span-2 emaus-card p-6 rounded-[1.5rem] flex flex-col justify-between">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Crescimento (7 dias)</p>
              <h4 className="text-2xl font-black text-black">+12%</h4>
            </div>
            <i className="fa-solid fa-chart-line text-[#3533cd]"></i>
          </div>
          <div className="h-12 w-full">
             <svg viewBox="0 0 100 20" className="w-full h-full overflow-visible">
                <path 
                  d="M0,20 Q15,18 25,12 T50,15 T75,5 T100,2" 
                  fill="none" 
                  stroke="#3533cd" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                />
                <path 
                  d="M0,20 Q15,18 25,12 T50,15 T75,5 T100,2 L100,20 L0,20" 
                  fill="url(#gradient)" 
                  className="opacity-20"
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#3533cd', stopOpacity:1}} />
                    <stop offset="100%" style={{stopColor:'#3533cd', stopOpacity:0}} />
                  </linearGradient>
                </defs>
             </svg>
          </div>
        </div>
      </div>

      {/* Course Form & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 emaus-card p-8 rounded-[2rem] bg-white">
          <h3 className="text-xl font-black text-black mb-6 flex items-center gap-3">
            <i className="fa-solid fa-plus-circle text-[#3533cd]"></i>
            Lançar Novo Conteúdo
          </h3>
          <form onSubmit={handleAddCourseSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block ml-1">Título do Curso</label>
              <input 
                type="text" 
                required
                value={newCourse.title}
                onChange={e => setNewCourse({...newCourse, title: e.target.value})}
                placeholder="Ex: O Sermão da Montanha"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#3533cd] focus:outline-none font-medium" 
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block ml-1">Descrição Curta</label>
              <textarea 
                required
                value={newCourse.description}
                onChange={e => setNewCourse({...newCourse, description: e.target.value})}
                placeholder="Breve resumo para o jovem..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm h-20 focus:ring-2 focus:ring-[#3533cd] focus:outline-none resize-none font-medium"
              ></textarea>
            </div>
            <div className="md:col-span-1">
              <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block ml-1">URL YouTube (Embed)</label>
              <input 
                type="text" 
                required
                value={newCourse.url}
                onChange={e => setNewCourse({...newCourse, url: e.target.value})}
                placeholder="https://youtube.com/embed/..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#3533cd] focus:outline-none font-medium" 
              />
            </div>
            <div className="md:col-span-1 flex items-end">
              <button 
                type="submit"
                className="w-full bg-[#3533cd] text-white font-black py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/20"
              >
                Publicar Agora
              </button>
            </div>
          </form>
        </div>

        <div className="emaus-card p-8 rounded-[2rem] bg-[#3533cd] text-white border-none relative overflow-hidden flex flex-col justify-center">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                <i className="fa-solid fa-fire-flame-curved text-orange-400"></i>
              </div>
              <h3 className="text-lg font-black uppercase tracking-tighter">Termômetro de IA</h3>
            </div>
            <div className="space-y-6">
              {trendingTopics.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 group cursor-default">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all">
                    <i className={`fa-solid ${item.icon} text-white`}></i>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs font-black mb-1.5">
                      <span>{item.topic}</span>
                      <span>{item.count}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: item.count }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
        </div>
      </div>

      {/* User Table */}
      <div className="emaus-card rounded-[2.5rem] overflow-hidden border-2 border-slate-100 bg-white shadow-xl shadow-blue-500/5">
        <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-black text-2xl text-black tracking-tight">Membros da Comunidade</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Gestão de Perfis de Usuários</p>
          </div>
          <div className="relative w-full md:w-auto">
             <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
             <input 
               type="text" 
               placeholder="Buscar discípulo..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full md:w-64 bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold text-black focus:ring-2 focus:ring-[#3533cd] focus:outline-none transition-all" 
             />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-50 bg-slate-50/10">
                <th className="px-8 py-6">Nome Completo / Username</th>
                <th className="px-8 py-6">Interesse Bíblico</th>
                <th className="px-8 py-6">Status / Cargo</th>
                <th className="px-8 py-6">Data de Ingresso</th>
                <th className="px-8 py-6 text-center">Gestão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-[#3533cd] border border-slate-200 shrink-0 group-hover:scale-110 transition-transform">
                        {u.name[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-black text-sm truncate">{u.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                       <p className="text-xs font-black text-slate-600 italic">"{u.interest || 'Geral'}"</p>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider shadow-sm border ${
                      u.role === UserRole.ADMIN 
                        ? 'bg-indigo-50 text-indigo-600 border-indigo-100' 
                        : 'bg-blue-50 text-[#3533cd] border-blue-100'
                    }`}>
                      {u.role === UserRole.ADMIN ? 'GESTOR DAVI' : 'JOVEM DISCÍPULO'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-slate-400 text-xs font-bold">
                    {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-center gap-2">
                       <button 
                        onClick={() => openEditModal(u)}
                        className="w-9 h-9 bg-white border border-slate-200 rounded-xl text-[#3533cd] hover:border-[#3533cd] hover:bg-blue-50 transition-all active:scale-90 flex items-center justify-center shadow-sm"
                        title="Editar Perfil"
                       >
                         <i className="fa-solid fa-pen-to-square text-xs"></i>
                       </button>
                       <button 
                        onClick={() => handleDeleteUser(u.id)}
                        className="w-9 h-9 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-600 hover:text-white transition-all active:scale-90 flex items-center justify-center shadow-sm"
                        title="Remover Discípulo"
                       >
                         <i className="fa-solid fa-trash-can text-xs"></i>
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-center">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fim da Lista de Membros • Total: {filteredUsers.length}</p>
        </div>
      </div>

      {/* Modal de Edição de Usuário */}
      {isEditModalOpen && editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200 border-2 border-[#3533cd]">
            <div className="flex items-center gap-4 mb-8">
               <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#3533cd] flex items-center justify-center text-2xl">
                  <i className="fa-solid fa-user-pen"></i>
               </div>
               <div>
                  <h3 className="text-2xl font-black text-black">Editar Discípulo</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ajuste de Credenciais e Perfil</p>
               </div>
            </div>

            <form onSubmit={handleUpdateUser} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Nome Completo</label>
                  <input 
                    type="text" 
                    required
                    value={editingUser.name}
                    onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-sm focus:ring-2 focus:ring-[#3533cd] focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Username (@)</label>
                  <input 
                    type="text" 
                    required
                    value={editingUser.username}
                    onChange={e => setEditingUser({...editingUser, username: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-sm focus:ring-2 focus:ring-[#3533cd] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Interesse Bíblico</label>
                  <select 
                    value={editingUser.interest}
                    onChange={e => setEditingUser({...editingUser, interest: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-sm focus:ring-2 focus:ring-[#3533cd] focus:outline-none"
                  >
                    <option value="Parábolas de Jesus">Parábolas de Jesus</option>
                    <option value="Profecias Bíblicas">Profecias Bíblicas</option>
                    <option value="Vida de Jesus (Evangelhos)">Vida de Jesus</option>
                    <option value="Cartas de Paulo">Cartas de Paulo</option>
                    <option value="Salmos e Poesia">Salmos e Poesia</option>
                    <option value="Liderança Cristã">Liderança Cristã</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2 ml-1">Email</label>
                  <input 
                    type="email" 
                    required
                    value={editingUser.email}
                    onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 font-bold text-sm focus:ring-2 focus:ring-[#3533cd] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t border-slate-50">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 font-black text-slate-400 py-4 hover:text-black transition-all active:scale-95"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-[#3533cd] text-white font-black py-4 rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                >
                  Salvar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
