
import React, { useState, useEffect } from 'react';
import { User, UserRole, Course } from '../types';
import { supabase } from '../services/supabase';

interface DashboardProps {
  courses: Course[];
  onAddCourse: (course: Course) => void;
  refreshCourses?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ courses, onAddCourse, refreshCourses }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newCourse, setNewCourse] = useState({ title: '', description: '', url: '' });
  
  // Announcements State
  const [announcement, setAnnouncement] = useState({ title: '', content: '' });
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) {
        const mappedUsers: User[] = data.map((u: any) => ({
          id: u.id,
          name: u.name,
          username: u.username,
          email: u.email,
          interest: u.interest,
          role: u.role as UserRole,
          createdAt: new Date(u.created_at).getTime(),
          avatarUrl: u.avatar_url,
          phone: u.phone,
          bio: u.bio
        }));
        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handlePublishAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcement.title || !announcement.content) return;
    
    // Deactivate old announcements (simple logic)
    await supabase.from('announcements').update({ active: false }).neq('id', 0);
    
    const { error } = await supabase.from('announcements').insert([{
      title: announcement.title,
      content: announcement.content,
      author: 'Gestor Davi',
      active: true
    }]);

    if (!error) {
      alert('Aviso publicado na Home!');
      setAnnouncement({ title: '', content: '' });
    } else {
      alert('Erro ao publicar aviso.');
    }
  };

  const handleAddCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('courses')
        .insert([
          {
            title: newCourse.title,
            description: newCourse.description,
            youtube_url: newCourse.url,
            thumbnail: `https://picsum.photos/seed/${Date.now()}/600/400`
          }
        ])
        .select();

      if (error) throw error;

      if (data) {
        const createdCourse: Course = {
          id: data[0].id.toString(),
          title: data[0].title,
          description: data[0].description,
          youtubeUrl: data[0].youtube_url,
          thumbnail: data[0].thumbnail
        };
        onAddCourse(createdCourse);
        if (refreshCourses) refreshCourses();
        setNewCourse({ title: '', description: '', url: '' });
        alert('Curso publicado com sucesso!');
      }
    } catch (error) {
      console.error("Erro ao adicionar curso:", error);
      alert("Erro ao publicar curso.");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (window.confirm('Atenção Gestor Davi: Tens a certeza que queres remover permanentemente este discípulo da plataforma?')) {
      try {
        const { error } = await supabase.from('profiles').delete().eq('id', id);
        if (error) throw error;
        setUsers(users.filter(u => u.id !== id));
      } catch (error) {
        console.error("Erro ao deletar usuário:", error);
        alert("Erro ao remover usuário.");
      }
    }
  };

  const openEditModal = (user: User) => {
    setEditingUser({ ...user });
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editingUser.name,
          username: editingUser.username,
          interest: editingUser.interest,
        })
        .eq('id', editingUser.id);
      if (error) throw error;
      setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
      setIsEditModalOpen(false);
      setEditingUser(null);
      alert('Perfil do discípulo atualizado com sucesso!');
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      alert("Erro ao atualizar perfil.");
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || 
    (u.username?.toLowerCase() || '').includes(searchTerm.toLowerCase())
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

        <div className="md:col-span-2 emaus-card p-6 rounded-[1.5rem] flex flex-col justify-center gap-2">
           <h4 className="text-sm font-black text-black uppercase tracking-widest">Publicar Aviso na Home</h4>
           <form onSubmit={handlePublishAnnouncement} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Título" 
                className="w-1/3 bg-slate-50 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#3533cd]"
                value={announcement.title}
                onChange={e => setAnnouncement({...announcement, title: e.target.value})}
              />
              <input 
                type="text" 
                placeholder="Mensagem" 
                className="flex-1 bg-slate-50 rounded-lg px-3 py-2 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#3533cd]"
                value={announcement.content}
                onChange={e => setAnnouncement({...announcement, content: e.target.value})}
              />
              <button type="submit" className="bg-[#3533cd] text-white px-4 rounded-lg font-black text-xs hover:bg-blue-700">
                Enviar
              </button>
           </form>
        </div>
      </div>

      {/* Course Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="col-span-full emaus-card p-8 rounded-[2rem] bg-white">
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
          {loadingUsers ? (
            <div className="p-8 text-center text-slate-400 font-bold">Carregando discípulos...</div>
          ) : (
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
                        <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-[#3533cd] border border-slate-200 shrink-0 group-hover:scale-110 transition-transform overflow-hidden">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            u.name ? u.name[0] : '?'
                          )}
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
          )}
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
