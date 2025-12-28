
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { supabase } from '../services/supabase';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [interest, setInterest] = useState('Parábolas de Jesus');
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.USER);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const interestOptions = [
    'Parábolas de Jesus',
    'Profecias Bíblicas',
    'Vida de Jesus (Evangelhos)',
    'Cartas de Paulo',
    'Antigo Testamento',
    'Salmos e Poesia',
    'Liderança Cristã'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isRegistering) {
        // REGISTRO
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        if (authData.user) {
          const newUser: User = {
            id: authData.user.id,
            email: email,
            name: name,
            username: username.startsWith('@') ? username : `@${username}`,
            interest: interest,
            role: UserRole.USER, 
            createdAt: Date.now()
          };

          const { error: profileError } = await supabase
            .from('profiles')
            .insert([
              {
                id: newUser.id,
                email: newUser.email,
                name: newUser.name,
                username: newUser.username,
                interest: newUser.interest,
                role: newUser.role
              }
            ]);

          if (profileError) throw profileError;

          onLogin(newUser);
        } else {
          setErrorMsg('Verifique seu email para confirmar o cadastro (se habilitado).');
        }

      } else {
        // LOGIN
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (authError) throw authError;

        if (authData.user) {
          // Buscar dados do perfil
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (profileError) {
             console.error('Perfil não encontrado, criando fallback...', profileError);
             const fallbackUser: User = {
                id: authData.user.id,
                name: email.split('@')[0],
                email: email,
                role: UserRole.USER,
                createdAt: Date.now()
             };
             onLogin(fallbackUser);
          } else {
            // Mapeamento DB -> App
            onLogin({
              id: profileData.id,
              name: profileData.name,
              username: profileData.username,
              email: profileData.email,
              interest: profileData.interest,
              role: profileData.role as UserRole,
              createdAt: new Date(profileData.created_at).getTime(),
              avatarUrl: profileData.avatar_url,
              phone: profileData.phone,
              bio: profileData.bio
            });
          }
        }
      }
    } catch (error: any) {
      console.error('Erro de autenticação:', error);
      setErrorMsg(error.message || 'Ocorreu um erro. Verifique seus dados.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-white p-4 overflow-hidden relative">
      <div className="w-full max-w-md emaus-card p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative z-10 max-h-[90vh] overflow-y-auto bg-white border-2 border-[#3533cd]">
        <div className="flex flex-col items-center mb-6 md:mb-8">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-[#3533cd] rounded-3xl flex items-center justify-center mb-4 md:mb-6 shadow-2xl shadow-blue-500/40">
             <i className="fa-solid fa-cross text-white text-3xl md:text-4xl"></i>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-black">EMAÚS</h1>
          <p className="text-slate-400 mt-2 text-center font-medium text-sm md:text-base px-2">
            {isRegistering ? 'Crie o seu perfil bíblico agora' : 'Bem-vindo de volta à jornada espiritual'}
          </p>
        </div>

        {/* Mensagem de Erro */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          {isRegistering && (
            <>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#3533cd] transition-all text-black font-medium text-sm"
                  placeholder="Seu nome"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nome de Usuário (@)</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#3533cd] transition-all text-black font-medium text-sm"
                  placeholder="ex: @jovem_cristao"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Interesse bíblico principal</label>
                <div className="relative">
                  <select
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#3533cd] appearance-none transition-all text-black font-bold text-sm"
                  >
                    {interestOptions.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  <i className="fa-solid fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#3533cd] transition-all text-black font-medium text-sm"
              placeholder="exemplo@emaus.com"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Palavra-passe</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#3533cd] transition-all text-black font-medium text-sm"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#3533cd] text-white font-black py-4 md:py-5 rounded-2xl hover:bg-blue-700 transition-all active:scale-95 shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 mt-2 disabled:opacity-70"
          >
            {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : (isRegistering ? 'Finalizar Cadastro' : `Entrar na Plataforma`)}
            {!loading && <i className="fa-solid fa-arrow-right text-sm"></i>}
          </button>
        </form>

        <div className="mt-6 md:mt-8 text-center">
          <button
            onClick={() => {
              setIsRegistering(!isRegistering);
              setErrorMsg('');
            }}
            className="text-sm font-bold text-[#3533cd] hover:underline transition-all active:scale-95"
          >
            {isRegistering ? 'Já tens conta? Faz Login' : 'Ainda não és membro? Regista-te aqui'}
          </button>
        </div>
      </div>
      
      {/* Background Decorativo */}
      <div className="fixed -bottom-20 -right-20 w-[20rem] md:w-[30rem] h-[20rem] md:h-[30rem] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed -top-20 -left-20 w-[20rem] md:w-[30rem] h-[20rem] md:h-[30rem] bg-black/5 rounded-full blur-[100px] pointer-events-none"></div>
    </div>
  );
};

export default Login;
