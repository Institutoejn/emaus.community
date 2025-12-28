
import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../types';

const Home: React.FC<{ user: User }> = ({ user }) => {
  const verseOfTheDay = {
    text: "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.",
    reference: "Salmos 119:105"
  };

  const weeklyWord = {
    title: "A Perseverança no Caminho",
    author: "Gestor Davi",
    content: "Querida juventude, esta semana meditamos na importância de manter o foco em Cristo, mesmo quando as distrações do mundo tentam nos afastar. Lembrem-se que Ele caminha ao nosso lado, assim como fez com os discípulos a caminho de Emaús."
  };

  const shortcuts = [
    { path: '/mentor', label: 'Mentor Emaús', icon: 'fa-dove', color: 'bg-blue-50 text-[#3533cd]' },
    { path: '/courses', label: 'Meus Cursos', icon: 'fa-book-open', color: 'bg-purple-50 text-purple-600' },
    { path: '/community', label: 'Comunidade', icon: 'fa-users', color: 'bg-green-50 text-green-600' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-10">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-black p-8 md:p-12 text-white shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-5xl font-black tracking-tight">
            Olá, <span className="text-[#3533cd]">{user.name.split(' ')[0]}</span>!
          </h1>
          <p className="mt-4 text-lg md:text-xl text-slate-300 font-medium max-w-xl">
            Que bom ter você aqui no <span className="font-black italic">Caminho de Emaús</span>. Vamos descobrir o que Deus tem para você hoje?
          </p>
        </div>
        {/* Background Accent */}
        <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#3533cd] rounded-full blur-[120px] opacity-40"></div>
        <div className="absolute bottom-4 right-8 opacity-10">
           <i className="fa-solid fa-cross text-9xl"></i>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Verse of the Day Card */}
          <div className="emaus-card rounded-[2.5rem] p-8 md:p-10 bg-white border-2 border-slate-100 flex flex-col items-center text-center shadow-xl shadow-blue-500/5">
            <div className="w-16 h-16 bg-[#3533cd]/5 text-[#3533cd] rounded-2xl flex items-center justify-center mb-6">
              <i className="fa-solid fa-quote-left text-2xl"></i>
            </div>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Versículo do Dia</h3>
            <p className="text-2xl md:text-3xl font-black text-black leading-tight max-w-lg italic">
              "{verseOfTheDay.text}"
            </p>
            <p className="mt-6 text-[#3533cd] font-black text-lg">
              {verseOfTheDay.reference}
            </p>
          </div>

          {/* Shortcuts Grid */}
          <div>
            <h3 className="text-sm font-black text-black uppercase tracking-widest mb-6 ml-2">Acesso Rápido</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {shortcuts.map((s) => (
                <Link 
                  key={s.path}
                  to={s.path}
                  className="emaus-card group p-6 rounded-[2rem] bg-white border-2 border-slate-100 hover:border-[#3533cd] transition-all active:scale-95 flex flex-col items-center justify-center gap-4 text-center"
                >
                  <div className={`w-14 h-14 ${s.color} rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-sm`}>
                    <i className={`fa-solid ${s.icon}`}></i>
                  </div>
                  <span className="font-black text-black text-sm">{s.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Aviso do Gestor Card */}
          <div className="emaus-card rounded-[2.5rem] p-8 bg-[#3533cd] text-white border-none shadow-2xl shadow-blue-500/20 relative overflow-hidden h-full">
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                   <i className="fa-solid fa-envelope-open-text"></i>
                </div>
                <h3 className="font-black text-lg uppercase tracking-tighter">Palavra da Semana</h3>
              </div>
              
              <div className="flex-1">
                <h4 className="font-black text-xl mb-3 text-blue-200">{weeklyWord.title}</h4>
                <p className="text-white/80 text-sm leading-relaxed font-medium">
                  {weeklyWord.content}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-black text-white text-xs border border-white/20">
                  {weeklyWord.author[0]}
                </div>
                <div>
                  <p className="text-xs font-black">{weeklyWord.author}</p>
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Gestor da Plataforma</p>
                </div>
              </div>
            </div>
            {/* Decoration */}
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
