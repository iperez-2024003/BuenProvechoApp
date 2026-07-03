import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { restaurantesApi as api, eventosApi } from '../../../shared/api/axios';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { useRestaurantStore } from '../store/useRestaurantStore';
import { AnalyticsCard } from '../../../shared/components/ui/AnalyticsCard';
import { Card } from '../../../shared/components/ui/Card';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { 
  Utensils, Users, LayoutDashboard, Rocket, DollarSign, 
  ShoppingBag, ChevronRight, PlusCircle, ClipboardList, 
  Flame, Calendar, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export const RestaurantDashboard = () => {
  const { id } = useParams();
  const location = useLocation();
  const { restaurants } = useRestaurantStore();
  const { user, role } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isStaff = role === 'STAFF_ROLE';

  const normalizeRestaurantId = (value) => {
    if (!value) return '';
    if (typeof value === 'object') {
      return String(value.id || value._id || '').trim().toLowerCase();
    }
    return String(value).trim().toLowerCase();
  };

  const restaurant = restaurants.find(r => r.id === id);

  useEffect(() => {
    const roleHasFixedRestaurant = role === 'STAFF_ROLE' || role === 'RESTAURANT_ADMIN_ROLE';
    const currentId = normalizeRestaurantId(id);
    const userRestaurantId = normalizeRestaurantId(user?.restaurantId);

    if (roleHasFixedRestaurant && userRestaurantId && currentId && currentId !== userRestaurantId) {
       const targetPath = `/dashboard/restaurants/${userRestaurantId}`;
       if (location.pathname !== targetPath) {
         navigate(targetPath, { replace: true });
       }
       return;
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await eventosApi.get(`/statistics/restaurant/${id}/overview`);
        const backendData = res.data.data;
        
        // Mapear datos del backend al formato esperado por el componente
        setStats({
          salesToday: backendData?.today?.revenue || 0,
          activeOrders: backendData?.today?.orders || 0,
          upcomingReservations: backendData?.today?.reservations || 0,
          staffCount: backendData?.summary?.staff || 0,
          recentStaff: backendData?.recentStaff || []
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError('No se pudieron cargar las estadísticas actuales.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchStats();
  }, [id, role, user?.restaurantId, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-12 h-12 border-4 border-primary-100 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-brown">Sincronizando Datos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 w-full min-w-0 overflow-x-hidden">
      {/* Header de Sede */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge variant="primary">Sede Activa</Badge>
            <span className="text-[10px] font-black text-muted-brown uppercase tracking-widest">ID: {id?.slice(-6)}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-ink tracking-tighter uppercase leading-none">
            {restaurant?.name || 'Restaurante'}
          </h1>
          <p className="text-muted-brown font-medium mt-2 flex items-center gap-2">
            <Sparkles size={16} className="text-primary-500" />
            Panel de control operativo y analítico.
          </p>
        </div>
        
        <div className="flex gap-3 flex-wrap">
          <Button variant="ghost" className="w-full sm:w-auto" onClick={() => navigate(`/dashboard/restaurants/${id}/menu`)}>
            <Utensils size={18} /> Menú
          </Button>
          {!isStaff && (
            <Button variant="secondary" className="w-full sm:w-auto" onClick={() => navigate(`/dashboard/restaurants/${id}/analytics`)}>
              <LayoutDashboard size={18} /> Analytics
            </Button>
          )}
          <Button variant="primary" className="w-full sm:w-auto" onClick={() => navigate(`/dashboard/restaurants/${id}/orders`)}>
            <ClipboardList size={18} /> Ver Órdenes
          </Button>
        </div>
      </div>

      {/* Grid de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard 
          title="Ventas Hoy" 
          value={`Q${stats?.salesToday?.toFixed(2) || '0.00'}`} 
          icon={DollarSign} 
          trend="up" trendValue={12} color="gold"
        />
        <AnalyticsCard 
          title="Órdenes Activas" 
          value={stats?.activeOrders || '0'} 
          icon={ShoppingBag} 
          color="blue"
        />
        <AnalyticsCard 
          title="Reservas" 
          value={stats?.upcomingReservations || '0'} 
          icon={Calendar} 
          color="bronze"
        />
        <AnalyticsCard 
          title="Staff en Turno" 
          value={stats?.staffCount || '0'} 
          icon={Users} 
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Acciones de Turno */}
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <h3 className="text-xl font-black text-ink uppercase tracking-tight">Gestión Operativa</h3>
            <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
              <Rocket size={20} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'Órdenes', icon: PlusCircle, to: `/dashboard/restaurants/${id}/orders` },
              { label: 'Reservas', icon: Calendar, to: `/dashboard/restaurants/${id}/reservations` },
              { label: 'Cocina', icon: Flame, to: `/dashboard/restaurants/${id}/kitchen` },
              { label: 'Mesas', icon: LayoutDashboard, to: `/dashboard/restaurants/${id}/tables` },
            ].map((action, i) => (
              <Link key={i} to={action.to} className="group">
                <div className="flex flex-col items-center p-4 md:p-6 bg-primary-50/30 border border-primary-100 rounded-[2rem] group-hover:bg-primary-500 group-hover:text-white group-hover:border-primary-500 transition-all duration-300">
                  <action.icon size={28} className="mb-3 text-primary-500 group-hover:text-white transition-colors" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-center">{action.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </Card>

        {/* Resumen Staff */}
        <Card>
          <h3 className="text-xl font-black text-ink uppercase tracking-tight mb-6">Staff Activo</h3>
          <div className="space-y-4">
            {stats?.recentStaff?.length > 0 ? stats.recentStaff.map((member, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-primary-100">
                <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 font-black">
                  {member.name[0]}
                </div>
                <div>
                  <p className="text-xs font-black text-ink uppercase">{member.name}</p>
                  <p className="text-[9px] text-muted-brown font-bold uppercase tracking-widest">{member.role}</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 opacity-40 grayscale">
                <Users size={32} className="mx-auto mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest">Sin personal activo</p>
              </div>
            )}
          </div>
          {!isStaff && (
            <Button variant="ghost" className="w-full mt-6 text-[10px]" onClick={() => navigate(`/dashboard/restaurants/${id}/staff`)}>
              Ver Todo el Equipo <ChevronRight size={14} />
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
};

export default RestaurantDashboard;
