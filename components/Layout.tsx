
import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { User, UserRole } from '../types';

interface LayoutProps {
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, onLogout }) => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { path: '/home', label: 'Início', shortLabel: 'Início', icon: 'fa-house' },
    { path: '/mentor', label: 'Mentor', shortLabel: 'Mentor', icon: 'fa-dove' },
    { path: '/courses', label: 'Cursos', shortLabel: 'Cursos', icon: 'fa-book-open' },
    { path: '/community', label: 'Comunidade', shortLabel: 'Chat', icon: 'fa-users' },
  ];

  const pageTitles: Record<string, string> = {
    '/home': 'Página Inicial',
    '/mentor': 'Mentor Emaús',
    '/courses': 'Cursos',
    '/community': 'Comunidade',
    '/profile': 'Meu Perfil',
    '/admin': 'Gestão Davi'
  };

  if (user.role === UserRole.ADMIN) {
    menuItems.push({ path: '/admin', label: 'Gestão Davi', shortLabel: 'Gestão', icon: 'fa-shield-halved' });
  }

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className="flex flex-col md:flex-row h-full md:h-screen bg-white overflow-hidden relative">
      {/* Overlay for Desktop/Mobile Drawer */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar / Drawer */}
      <aside 
        className={`fixed md:absolute inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col shrink-0 z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex items-center justify-between">
          <Link to="/home" onClick={closeMenu} className="flex items-center gap-3 active:scale-95 transition-transform">
            <div className="w-10 h-10 bg-[#3533cd] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <i className="fa-solid fa-cross text-white text-xl"></i>
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-black">EMAÚS</h1>
          </Link>
          <button onClick={closeMenu} className="text-slate-400 hover:text-black transition-colors">
            <i className="fa-solid fa-xmark text-xl"></i>
          </button>
        </div>

        <nav className="flex-1 mt-6 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMenu}
                className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 active:scale-95 ${
                  isActive 
                    ? 'bg-[#3533cd] text-white shadow-lg shadow-blue-500/20' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-[#3533cd]'
                }`}
              >
                <i className={`fa-solid ${item.icon} text-xl`}></i>
                <span className="font-bold">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => {
              closeMenu();
              onLogout();
            }}
            className="w-full flex items-center gap-4 p-4 text-slate-400 hover:text-red-500 transition-colors active:scale-95"
          >
            <i className="fa-solid fa-right-from-bracket text-xl"></i>
            <span className="font-bold">Sair da Conta</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0 bg-white relative">
        {/* Header */}
        <header className="h-16 md:h-20 border-b border-slate-100 flex items-center justify-between px-4 md:px-8 bg-white/80 backdrop-blur-md shrink-0 z-30">
          <div className="flex items-center gap-4">
            {/* Hamburger Button */}
            <button 
              onClick={toggleMenu}
              className="w-10 h-10 flex items-center justify-center text-slate-600 hover:text-[#3533cd] transition-colors rounded-xl hover:bg-slate-50 active:scale-90"
            >
              <i className="fa-solid fa-bars text-xl"></i>
            </button>
            
            <Link to="/home" className="flex items-center gap-3 md:hidden">
              <div className="w-8 h-8 bg-[#3533cd] rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-cross text-white text-sm"></i>
              </div>
              <h1 className="text-lg font-black tracking-tighter text-black">EMAÚS</h1>
            </Link>
            
            <h2 className="hidden md:block text-2xl font-black text-[#3533cd]">
              {pageTitles[location.pathname] || 'Bem-vindo'}
            </h2>
          </div>

          <Link to="/profile" className="flex items-center gap-3 hover:bg-slate-50 p-2 rounded-2xl transition-all active:scale-95">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-black leading-none">{user.name}</p>
              <p className="text-[10px] text-slate-400 uppercase">{user.role === UserRole.ADMIN ? 'Gestor' : 'Usuário'}</p>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-[#3533cd] overflow-hidden">
               {user.avatarUrl ? (
                 <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
               ) : (
                 <i className="fa-solid fa-user text-sm"></i>
               )}
            </div>
          </Link>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-white scroll-smooth-mobile min-h-0">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
