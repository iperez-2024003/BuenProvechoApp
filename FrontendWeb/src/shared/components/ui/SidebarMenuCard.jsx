import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Settings, LogOut } from 'lucide-react';

export const SidebarMenuCard = ({ onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-[#fffaf3]/60 backdrop-blur-3xl p-4 border border-[#dcc7a5] rounded-3xl shadow-2xl shadow-[rgba(185,140,82,0.05)]">
      <ul className="w-full flex flex-col gap-3">
        <li className="w-full">
          <button 
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-4 p-4 font-black rounded-2xl text-zinc-700 hover:bg-[#fff1df] hover:text-[#b98c52] focus:bg-gradient-to-r from-[#d7b77f] to-[#b98c52] focus:text-white transition-all duration-300 group"
          >
            <LayoutDashboard className="w-6 h-6 group-focus:text-white transition-colors" />
            <span className="uppercase tracking-widest text-[10px]">Panel General</span>
          </button>
        </li>
        <li className="w-full">
          <button 
            onClick={() => navigate('/dashboard/profile')}
            className="w-full flex items-center gap-4 p-4 font-black rounded-2xl text-zinc-700 hover:bg-[#fff1df] hover:text-[#b98c52] focus:bg-gradient-to-r from-[#d7b77f] to-[#b98c52] focus:text-white transition-all duration-300 group"
          >
            <Settings className="w-6 h-6 group-focus:text-white transition-colors" />
            <span className="uppercase tracking-widest text-[10px]">Configuración</span>
          </button>
        </li>
        <li className="w-full">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 p-4 font-black rounded-2xl text-zinc-700 hover:bg-[#fff1df] hover:text-[#b98c52] focus:bg-gradient-to-r from-[#d7b77f] to-[#b98c52] focus:text-white transition-all duration-300 group"
          >
            <LogOut className="w-6 h-6 group-focus:text-white transition-colors" />
            <span className="uppercase tracking-widest text-[10px]">Cerrar Sesión</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
