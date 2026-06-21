import React, { useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../auth/store/useAuthStore';
import {
  PlusCircle, Search, UserPlus, FileText, Zap,
  TrendingUp, Rocket, BookOpen, ChevronRight, Sparkles
} from 'lucide-react';
import { BrandLogo } from '../../../shared/components/ui/BrandLogo';
import { ActionButton } from '../../../shared/components/ui/ActionButton';
import { TransactionCard } from '../../../shared/components/ui/TransactionCard';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { ClientDashboard } from '../../public/pages/ClientDashboard';

const DashboardIndexComponent = () => {
  const { role, user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirección automática para Staff y Gerentes a su sede específica
    if ((role === 'STAFF_ROLE' || role === 'RESTAURANT_ADMIN_ROLE') && user?.restaurantId) {
      navigate(`/dashboard/restaurants/${user.restaurantId}`, { replace: true });
    }
  }, [role, user, navigate]);

  if (role === 'CLIENT_ROLE') {
    return <ClientDashboard />;
  }

  const restaurantId = user?.restaurantId;
  const handleQuickAction = (action) => {
    switch (action) {
      case 'orders':
        navigate(restaurantId ? `/dashboard/restaurants/${restaurantId}/orders` : '/dashboard/restaurants');
        break;
      case 'clients':
        navigate('/dashboard/vip-clients');
        break;
      case 'staff':
        navigate(restaurantId ? `/dashboard/restaurants/${restaurantId}/staff` : '/dashboard/users');
        break;
      case 'reports':
        // Navigate based on role to avoid unauthorized redirects that
        // mount/unmount analytics pages (which can trigger Recharts size warnings)
        if (role === 'SUPER_ADMIN_ROLE') {
          navigate('/dashboard/analytics');
        } else if (role === 'RESTAURANT_ADMIN_ROLE' && restaurantId) {
          navigate(`/dashboard/restaurants/${restaurantId}/analytics`);
        } else {
          // For STAFF or other roles without access, redirect to restaurant dashboard
          // to avoid bouncing to /dashboard which causes intermediate mounts.
          navigate(restaurantId ? `/dashboard/restaurants/${restaurantId}` : '/dashboard');
        }
        break;
      default:
        break;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10 px-4"
    >
      {/* Bienvenida Premium */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-600">Sistema Operativo Live</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-ink tracking-tighter leading-none">
            HOLA, <span className="text-primary-500">{user?.name?.split(' ')[0] || 'GESTO'}</span>
          </h1>
          <p className="text-muted-brown font-medium mt-3 max-w-md">
            Bienvenido al panel central de BuenProvecho. Tienes todo el control de la red gastronómica en tus manos.
          </p>
        </div>
        <BrandLogo size="lg" className="hidden lg:block opacity-40 grayscale" />
      </motion.div>

      {/* Grid de Acciones y Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card de Acciones Críticas */}
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <Card className="h-full flex flex-col p-5 md:p-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 border border-primary-100">
                <Zap size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-ink uppercase tracking-tight">Acciones Rápidas</h3>
                <p className="text-[10px] text-muted-brown font-bold uppercase tracking-widest">Optimiza tu tiempo de respuesta</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <ActionButton label="Nueva Orden" icon={PlusCircle} color="gold" onClick={() => handleQuickAction('orders')} />
              <ActionButton label="Clientes" icon={Search} color="blue" onClick={() => handleQuickAction('clients')} />
              <ActionButton label="Nuevo Staff" icon={UserPlus} color="orange" onClick={() => handleQuickAction('staff')} />
              {role !== 'STAFF_ROLE' && (
                <ActionButton label="Reportes" icon={FileText} color="cyan" onClick={() => handleQuickAction('reports')} />
              )}
            </div>

            <div className="mt-auto pt-10">
              <div className="p-6 bg-primary-50/50 rounded-2xl border border-dashed border-primary-200">
                <p className="text-xs text-muted-brown font-medium italic leading-relaxed">
                  "El éxito de un gran restaurante reside en la precisión de su gestión digital."
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Monitor de Actividad */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="px-2 flex items-center justify-between">
            <h3 className="text-[10px] font-black text-muted-brown uppercase tracking-[0.4em]">Monitor Activo</h3>
            <Sparkles size={14} className="text-primary-400" />
          </div>

          <div className="space-y-4">
            <TransactionCard label="Flujo de Transacciones" />
            <TransactionCard label="Estado de Sucursales" />
            <TransactionCard label="Alertas de Inventario" />
            <TransactionCard label="Reservas Próximas" />
          </div>

          <Button variant="ghost" className="w-full py-4 text-[10px]">
            Ver todas las métricas <ChevronRight size={14} />
          </Button>
        </motion.div>
      </div>

      {/* Banner de Soporte / Manual */}
      <motion.div variants={itemVariants}>
        <Card className="bg-ink p-8 md:p-10 border-none relative overflow-hidden group">
          <div className="hidden lg:block absolute top-0 right-0 w-[400px] h-full bg-primary-500/10 skew-x-12 translate-x-20 transition-transform group-hover:translate-x-16" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-primary-400 border border-white/10">
                <BookOpen size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-black uppercase tracking-tight">Centro de Conocimiento</h3>
                <p className="text-black text-sm font-medium">Domina la plataforma con nuestra guía avanzada para expertos.</p>
              </div>
            </div>
            <Button variant="primary" className="whitespace-nowrap px-8">
              Documentación <Rocket size={18} className="ml-2" />
            </Button>
          </div>
        </Card>
      </motion.div>
    </motion.div>
  );
};

const DashboardIndex = memo(DashboardIndexComponent);

export default DashboardIndex;
