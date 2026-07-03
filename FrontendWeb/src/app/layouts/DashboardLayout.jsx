import { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Sidebar } from '../../shared/components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Menu, X, Radio, LogOut, Home, History, Calendar, UserCircle } from 'lucide-react';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { Button } from '../../shared/components/ui/Button';
import StaggeredMenu from '../../shared/components/ui/StaggeredMenu';
import LogoBuenProvecho from '../../assets/img/LogoBuenProvecho.png';

export const DashboardLayout = () => {
  const { role, user } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const clientMenuItems = [
    { label: 'Inicio', link: '/dashboard', icon: Home, ariaLabel: 'Ir al inicio' },
    { label: 'Mis Pedidos', link: '/dashboard/history', icon: History, ariaLabel: 'Ver mis pedidos' },
    { label: 'Eventos', link: '/dashboard/events', icon: Calendar, ariaLabel: 'Ver eventos' },
    { label: 'Perfil', link: '/dashboard/profile', icon: UserCircle, ariaLabel: 'Ver mi perfil' },
    { label: 'Cerrar Sesión', link: '#', icon: LogOut, onClick: () => useAuthStore.getState().logout(), ariaLabel: 'Cerrar sesión' },
  ];

  const quickAccess = (() => {
    if (role === 'SUPER_ADMIN_ROLE') return { to: '/dashboard/restaurants', label: 'Gestionar Sedes' };
    return null;
  })();

  const getHeaderInfo = () => {
    const roles = {
      'SUPER_ADMIN_ROLE': { label: 'Administración Global', title: 'Global <span>Console</span>' },
      'RESTAURANT_ADMIN_ROLE': { label: 'Gestión Operativa', title: 'Sede <span>Dashboard</span>' },
      'STAFF_ROLE': { label: 'Panel de Turno', title: 'Operational <span>Station</span>' },
      'CLIENT_ROLE': { label: 'BuenProvecho Club', title: `Hola, <span class="text-primary-500">${user?.name?.split(' ')[0] || 'Gourmet'}</span>` }
    };
    return roles[role] || { label: 'Panel Central', title: 'BuenProvecho <span>Core</span>' };
  };

  const info = getHeaderInfo();
  const isClient = role === 'CLIENT_ROLE';

  const socialItems = [
    { label: 'Instagram', link: 'https://instagram.com' },
    { label: 'WhatsApp', link: 'https://wa.me/buenprovecho' },
  ];

  return (
    <div className={`flex w-full max-w-full overflow-x-hidden bg-primary-50 font-outfit text-ink ${isClient ? 'min-h-screen' : 'min-h-screen md:h-screen md:overflow-hidden flex-col md:flex-row'}`}>
      {/* Sidebar Desktop - Solo para Staff/Admins */}
      {!isClient && <Sidebar />}

      {/* StaggeredMenu - Solo para Clientes (Fixed) */}
      {isClient && (
        <StaggeredMenu
          isFixed={true}
          position="right"
          logoUrl={LogoBuenProvecho}
          items={clientMenuItems}
          socialItems={socialItems}
          displaySocials={true}
          menuButtonColor="#2b2015"
          accentColor="#b98c52"
          colors={['#F4E7D1', '#E2C089', '#C79C54']}
        />
      )}

      {/* Sidebar Móvil (Drawer) - Solo para Staff/Admins */}
      {!isClient && (
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-[60] md:hidden"
              />
              <motion.div 
                initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-[280px] max-w-[82vw] z-[70] md:hidden"
              >
                <div className="h-full relative bg-white shadow-2xl">
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="absolute top-3 right-3 w-10 h-10 bg-white rounded-xl flex items-center justify-center text-ink shadow-lg border border-primary-200 z-50"
                  >
                    <X size={20} />
                  </button>
                  <Sidebar isMobileDrawer={true} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}
      
      <div className="flex-1 flex flex-col relative min-w-0">
        {/* Header Superior Premium - Ocultar para clientes si el StaggeredMenu ya lo cubre */}
        {!isClient && (
          <header className="h-20 md:h-24 bg-white/70 backdrop-blur-xl border-b border-primary-200/50 flex items-center justify-between px-4 sm:px-6 md:px-12 z-50 sticky top-0 md:relative">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 rounded-xl bg-primary-100 text-primary-600"
              >
                <Menu size={24} />
              </button>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-primary-500 uppercase tracking-[0.4em] mb-1 leading-none">{info.label}</span>
                <h2 
                  className="text-xl md:text-2xl font-black text-ink tracking-tighter uppercase leading-none [&>span]:text-muted-brown" 
                  dangerouslySetInnerHTML={{ __html: info.title }} 
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-4 mr-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-100/50 rounded-full border border-primary-200">
                  <div className="relative w-2 h-2">
                    <div className="absolute inset-0 bg-green-500 rounded-full animate-ping" />
                    <div className="relative w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-primary-700">Sistema Activo</span>
                </div>
              </div>

              {quickAccess && (
                <Button 
                  variant="primary" 
                  onClick={() => window.location.href = quickAccess.to}
                  className="hidden sm:flex text-[10px] px-5"
                >
                  {quickAccess.label}
                </Button>
              )}
            </div>
          </header>
        )}

        {/* Zona de Contenido */}
        <main className={`flex-1 relative z-10 w-full max-w-full ${isClient ? 'overflow-y-auto overflow-x-hidden' : 'overflow-x-hidden md:overflow-y-auto p-3 sm:p-4 md:p-8 lg:p-12 scrollbar-hide'}`}
>          style={isClient ? { WebkitOverflowScrolling: 'touch' } : undefined}>
          {/* Background Accents */}
          <div className="hidden md:block fixed top-24 right-0 w-[500px] h-[500px] bg-primary-300/10 blur-[120px] rounded-full pointer-events-none -z-10" />
          <div className="hidden md:block fixed bottom-0 left-0 w-[400px] h-[400px] bg-primary-400/5 blur-[120px] rounded-full pointer-events-none -z-10" />

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className={isClient ? 'w-full mx-auto max-w-[1600px] px-4 md:px-8 lg:px-12 pb-20' : 'w-full min-w-0'}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
