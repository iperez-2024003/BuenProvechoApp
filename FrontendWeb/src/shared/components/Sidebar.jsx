import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Utensils, ClipboardList, Calendar,
  BarChart3, UserCircle, LogOut, Flame, Settings, Star,
  ChevronLeft, ChevronRight, Menu, LayoutGrid
} from 'lucide-react';
import { getImageUrl } from '../utils/getImageUrl';
import { BrandLogo } from './ui/BrandLogo';
import { Badge } from './ui/Badge';

export const Sidebar = ({ isMobileDrawer = false }) => {
  const { role, user, logout } = useAuthStore();
  const location = useLocation();
  const { id: urlId } = useParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const id = urlId || user?.restaurantId;

  const roleMapper = {
    'SUPER_ADMIN_ROLE': 'Admin Global',
    'RESTAURANT_ADMIN_ROLE': 'Gerente',
    'STAFF_ROLE': 'Staff',
    'CLIENT_ROLE': 'Cliente'
  };

  const friendlyRole = roleMapper[role] || 'Usuario';

  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.includes(path)) return true;
    return false;
  };

  const NavLink = ({ to, icon: Icon, children }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        className={`
          flex items-center gap-4 px-3 py-2.5 rounded-xl transition-all duration-300 group relative
          ${active
            ? 'bg-primary-500 text-white shadow-gold'
            : 'text-muted-brown hover:bg-primary-100/50 hover:text-ink'
          }
        `}
      >
        <Icon className={`w-5 h-5 shrink-0 transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}`} />
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap"
          >
            {children}
          </motion.span>
        )}
        {active && !isCollapsed && (
          <motion.div layoutId="active-pill" className="absolute left-[-12px] w-1 h-6 bg-primary-500 rounded-r-full" />
        )}
      </Link>
    );
  };

  return (
    <motion.aside
      animate={{ width: isMobileDrawer ? '100%' : (isCollapsed ? 80 : 280) }}
      className={`${isMobileDrawer ? 'flex' : 'hidden md:flex'} ${isMobileDrawer ? 'h-full' : 'h-screen'} bg-white/80 backdrop-blur-2xl border-r border-primary-200/50 flex-col relative z-40 shadow-premium`}
    >
      {/* Botón de Colapso */}
      {!isMobileDrawer && (
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-24 w-6 h-6 bg-white border border-primary-200 rounded-full flex items-center justify-center text-primary-600 shadow-sm hover:bg-primary-50 transition-colors z-50"
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      )}

      <div className={`flex items-center justify-center ${isCollapsed ? 'pt-8 pb-2 px-2' : 'pt-10 pb-2 px-6'} overflow-hidden`}>
        <BrandLogo size={isCollapsed ? 'sm' : 'lg'} className="transition-all duration-300 mx-auto" />
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2 scrollbar-hide">
        <NavLink to="/dashboard" icon={LayoutDashboard}>Inicio</NavLink>

        <div className="space-y-4 mt-6">
          {!isCollapsed && <p className="px-3 text-[9px] font-black text-primary-600/50 uppercase tracking-[0.2em]">Menú Principal</p>}

          {role === 'SUPER_ADMIN_ROLE' && (
            <div className="space-y-1">
              <NavLink to="/dashboard/analytics" icon={BarChart3}>Estadísticas</NavLink>
              <NavLink to="/dashboard/restaurants" icon={Utensils}>Restaurantes</NavLink>
              <NavLink to="/dashboard/users" icon={Users}>Usuarios</NavLink>
              <NavLink to="/dashboard/vip-clients" icon={Star}>Clientes VIP</NavLink>
            </div>
          )}

          {(role === 'RESTAURANT_ADMIN_ROLE' || role === 'STAFF_ROLE') && id && (
            <div className="space-y-1">
              <NavLink to={`/dashboard/restaurants/${id}`} icon={LayoutDashboard}>Resumen</NavLink>
              <NavLink to={`/dashboard/restaurants/${id}/menu`} icon={Utensils}>Menú</NavLink>
              <NavLink to={`/dashboard/restaurants/${id}/orders`} icon={ClipboardList}>Órdenes</NavLink>
              <NavLink to={`/dashboard/restaurants/${id}/reservations`} icon={Calendar}>Reservaciones</NavLink>
              {role === 'RESTAURANT_ADMIN_ROLE' && (
                <NavLink to={`/dashboard/restaurants/${id}/analytics`} icon={BarChart3}>Reportes</NavLink>
              )}
              <NavLink to={`/dashboard/restaurants/${id}/kitchen`} icon={Flame}>Cocina</NavLink>
              {role === 'RESTAURANT_ADMIN_ROLE' && (
                <>
                  <NavLink to={`/dashboard/restaurants/${id}/staff`} icon={Users}>Empleados</NavLink>
                  <NavLink to={`/dashboard/restaurants/${id}/tables`} icon={LayoutGrid}>Mesas</NavLink>
                  <NavLink to={`/dashboard/restaurants/${id}/events`} icon={Star}>Eventos</NavLink>
                </>
              )}
            </div>
          )}

          {role === 'CLIENT_ROLE' && (
            <div className="space-y-1">
              <NavLink to="/dashboard/history" icon={ClipboardList}>Mis Pedidos</NavLink>
              <NavLink to="/dashboard/events" icon={Calendar}>Eventos</NavLink>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-primary-100 bg-primary-50/50">
        <Link
          to="/dashboard/profile"
          className={`flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-all group ${isCollapsed ? 'justify-center' : ''}`}
        >
          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center border border-primary-200 overflow-hidden shrink-0">
            {user?.profilePicture ? (
              <img src={getImageUrl(user.profilePicture)} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-black text-primary-600">{user?.name?.charAt(0) || 'U'}</span>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-ink truncate uppercase tracking-tighter">{user?.name || user?.username}</p>
              <Badge variant="primary" className="mt-0.5 text-[8px]">{friendlyRole}</Badge>
            </div>
          )}
        </Link>

        <button
          onClick={logout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 mt-2 rounded-xl text-red-600 hover:bg-red-50 transition-all font-black uppercase tracking-widest text-[10px] ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!isCollapsed && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </motion.aside>
  );
};
