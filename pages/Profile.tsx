
import React, { useState, useRef, useEffect } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../services/supabase';

interface ProfileProps {
  user: User;
  onUpdate: (user: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  // Inicializa o estado com os dados do usuário
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    bio: user.bio || '',
    avatarUrl: user.avatarUrl || ''
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Atualiza o formulário se o usuário mudar (ex: recarregamento externo)
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      name: user.name || prev.name,
      avatarUrl: user.avatarUrl || prev.avatarUrl,
      bio: user.bio || prev.bio,
      phone: user.phone || prev.phone
    }));
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      // Preview imediato
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (userId: string, file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      // Nome único com timestamp para evitar cache do navegador
      const fileName = `avatar-${userId}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return data.publicUrl;
    } catch (error) {
      console.error("Erro detalhado no upload:", error);
      alert("Erro ao enviar imagem para o servidor.");
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      let finalAvatarUrl = user.avatarUrl; // Começa com a URL atual do usuário (não o preview)

      // Se há um novo arquivo, faz o upload e pega a nova URL
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar(user.id, avatarFile);
        if (uploadedUrl) {
          finalAvatarUrl = uploadedUrl;
        }
      }

      // Atualiza o banco de dados
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
          bio: formData.bio,
          avatar_url: finalAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;

      // Atualiza o estado global da aplicação
      onUpdate({
        ...user,
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
        avatarUrl: finalAvatarUrl // URL real do Supabase
      });
      
      setAvatarFile(null);
      // Força a atualização do form local com a URL final (remove o base64 de preview)
      setFormData(prev => ({ ...prev, avatarUrl: finalAvatarUrl || '' }));
      
      alert('Perfil atualizado com sucesso!');

    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      alert(`Erro ao salvar: ${error.message || 'Verifique sua conexão.'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-4xl font-black text-black">Teu Perfil</h1>
          <p className="text-slate-400 font-medium mt-1">Gere as tuas informações e como apareces na comunidade.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Avatar Section */}
          <div className="emaus-card p-8 rounded-[2.5rem] flex flex-col items-center gap-6 h-fit bg-white border-2">
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2.5rem] bg-slate-100 border-4 border-slate-50 overflow-hidden flex items-center justify-center shadow-xl">
                {formData.avatarUrl ? (
                  <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <i className="fa-solid fa-user text-6xl text-slate-300"></i>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
              <button 
                type="button"
                className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#3533cd] text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-all active:scale-95"
                onClick={() => fileInputRef.current?.click()}
              >
                <i className="fa-solid fa-camera"></i>
              </button>
            </div>
            <div className="text-center">
              <h3 className="font-black text-black text-lg">{formData.name}</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                {user.role === UserRole.ADMIN ? 'GESTOR' : 'USUÁRIO'}
              </p>
            </div>
            <p className="text-[10px] text-center text-slate-400 font-medium leading-relaxed">
              Dica: Clica na câmara para escolher uma foto da tua galeria.
            </p>
          </div>

          {/* Form Fields Section */}
          <div className="lg:col-span-2 emaus-card p-8 rounded-[2.5rem] bg-white border-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-[#3533cd] focus:outline-none transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Principal</label>
                <input 
                  type="email" 
                  value={formData.email}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-2xl px-5 py-4 text-sm text-slate-500 cursor-not-allowed font-medium"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefone / WhatsApp</label>
                <input 
                  type="tel" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  placeholder="+351 900 000 000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-[#3533cd] focus:outline-none transition-all font-medium"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Breve Biografia</label>
                <textarea 
                  value={formData.bio}
                  onChange={e => setFormData({...formData, bio: e.target.value})}
                  placeholder="Conta um pouco sobre a tua jornada espiritual..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-[#3533cd] focus:outline-none transition-all font-medium h-32 resize-none leading-relaxed"
                ></textarea>
              </div>
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={isSaving}
                className="w-full md:w-auto bg-[#3533cd] text-white font-black px-12 py-4 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <i className="fa-solid fa-spinner animate-spin"></i>
                ) : (
                  <i className="fa-solid fa-save"></i>
                )}
                {isSaving ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;
