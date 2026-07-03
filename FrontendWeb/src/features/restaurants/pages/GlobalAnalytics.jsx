import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  getGlobalOverview 
} from '../../../shared/api/statistics';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell 
} from 'recharts';
import { 
  Building2, 
  Users, 
  DollarSign, 
  ShoppingBag, 
  Trophy,
  Activity,
  Globe,
  Loader2,
  TrendingUp,
  Award
} from 'lucide-react';

const COLORS = ['#A855F7', '#6366F1', '#8B5CF6', '#4F46E5', '#D8B4FE'];

export const GlobalAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  const fetchGlobal = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getGlobalOverview();
      setStats(res.data.data || null);
    } catch (err) {
      console.error('Error fetching global stats:', err);
      const msg = err?.response?.data?.message || err?.message || 'Error desconocido al recuperar estadísticas globales';
      setError(msg);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!mounted) return;
        await fetchGlobal();
      } catch (e) {
        // already handled in fetchGlobal
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-[70vh] font-outfit">
       <div className="relative">
         <div className="w-20 h-20 rounded-full border-4 border-[#dcc7a5]/20 border-t-[#b98c52] animate-spin" />
         <div className="absolute inset-0 flex items-center justify-center">
           <Globe className="w-8 h-8 text-[#b98c52]" />
         </div>
        </div>
        <p className="mt-8 text-zinc-500 font-black animate-pulse uppercase tracking-[0.4em] text-[10px]">Sincronizando Plataforma Global...</p>
    </div>
  );
  // If we don't have stats, render the analytics layout but show a banner with the error and actions
  const topRestaurants = stats?.topRestaurants || [];
  const totalRestaurants = stats?.totalRestaurants || 0;
  const totalUsers = stats?.totalUsers || 0;
  const totalRevenue = stats?.totalRevenue || 0;
  const totalOrders = stats?.totalOrders || 0;

  return (
    <div className="space-y-12 pb-20 font-outfit animate-in fade-in duration-700">
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center">
          <p className="font-black text-rose-700 uppercase tracking-widest">Advertencia: {error}</p>
          <div className="mt-3 flex items-center justify-center gap-3">
            {(error.toLowerCase().includes('401') || error.toLowerCase().includes('403') || /permiso|autoriz/i.test(error)) && (
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-white border border-rose-300 rounded-lg font-black text-sm"
              >
                Reingresar
              </button>
            )}
            <button
              onClick={() => fetchGlobal()}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg font-black text-sm"
            >
              Reintentar
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
           <p className="text-[10px] font-black text-[#b98c52] uppercase tracking-[0.4em] mb-2">Network intelligence</p>
           <h1 className="text-3xl md:text-5xl font-black text-zinc-900 tracking-tighter uppercase leading-none">Global <span className="text-zinc-600">Analytics</span></h1>
        </div>
        
        <div className="flex items-center gap-4 bg-white/70 backdrop-blur-xl px-6 py-3 rounded-2xl border border-[#dcc7a5]/10">
           <div className="relative">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping absolute inset-0" />
              <div className="w-2 h-2 bg-emerald-500 rounded-full relative" />
           </div>
           <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Red Activa</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {[
            { label: 'Sedes Activas', value: totalRestaurants, icon: Building2, color: 'bronze' },
            { label: 'Usuarios Red', value: totalUsers, icon: Users, color: 'blue' },
            { label: 'Volumen Total', value: `Q${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bronze' },
            { label: 'Transacciones', value: totalOrders, icon: ShoppingBag, color: 'blue' },
          ].map((kpi, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={i} 
            className="bg-white/80 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-[#dcc7a5]/5 hover:border-[#b98c52]/20 transition-all group"
          >
            <div className={`w-14 h-14 bg-[#f3e4ca] border border-[#dcc7a5]/10 text-[#b98c52] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-xl`}>
              <kpi.icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
            <p className="text-3xl font-black text-zinc-900 tracking-tighter leading-none">{kpi.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Top Restaurants Chart */}
        <div className="bg-white/80 backdrop-blur-3xl p-5 md:p-10 rounded-[3rem] border border-[#dcc7a5]/10 shadow-2xl">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <Award className="w-8 h-8 text-[#b98c52]" />
              <div>
                <p className="text-[10px] font-black text-[#b98c52] uppercase tracking-widest mb-1">Ranking de Sedes</p>
                <h3 className="text-2xl font-black text-zinc-900 tracking-tight uppercase leading-none">Top <span className="text-zinc-600">Performance</span></h3>
              </div>
            </div>
          </div>
          <div className="h-64 md:h-96">
            <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
              <BarChart data={topRestaurants}>
                <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#dcc7a5" />
                <XAxis 
                  dataKey="Restaurant.name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#52525b', fontSize: 10, fontWeight: 900 }}
                  tickFormatter={(val) => val.toUpperCase()}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#52525b', fontSize: 10, fontWeight: 900 }}
                  tickFormatter={(val) => `Q${val}`}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(185,140,82,0.05)' }}
                  contentStyle={{ 
                    backgroundColor: '#fffaf3',
                    borderRadius: '24px', 
                    border: '1px solid rgba(185,140,82,0.12)', 
                    boxShadow: '0 25px 50px -12px rgba(110,80,45,0.08)',
                    padding: '20px'
                  }}
                  itemStyle={{ fontWeight: '900', fontSize: '14px', color: '#2b2b2b' }}
                  labelStyle={{ marginBottom: '8px', color: '#b98c52', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.2em' }}
                />
                <Bar dataKey="revenue" radius={[12, 12, 0, 0]}>
                  {topRestaurants.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="bg-[#fffaf3]/60 backdrop-blur-3xl p-5 md:p-10 rounded-[3rem] border border-[#dcc7a5] shadow-2xl overflow-hidden flex flex-col">
           <div className="mb-10">
              <p className="text-[10px] font-black text-[#b98c52] uppercase tracking-widest mb-1">Auditoría Operativa</p>
              <h3 className="text-2xl font-black text-zinc-900 tracking-tight uppercase leading-none">Desempeño <span className="text-zinc-600">Detallado</span></h3>
           </div>
           <div className="overflow-x-auto flex-1">
             <table className="w-full text-left">
               <thead>
                 <tr className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] border-b border-zinc-800">
                   <th className="pb-6 px-4">Establecimiento</th>
                   <th className="pb-6 px-4">Órdenes</th>
                   <th className="pb-6 px-4 text-right">Volumen (Q)</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-zinc-800/50">
                 {topRestaurants.map((rest, i) => (
                   <tr key={i} className="group hover:bg-[#d7b77f]/5 transition-all">
                     <td className="py-6 px-4">
                        <div className="flex flex-col">
                           <span className="font-black text-zinc-900 text-sm uppercase tracking-tight">{rest.Restaurant.name}</span>
                           <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">ID: {rest.Restaurant.id?.slice(0, 8)}</span>
                        </div>
                     </td>
                     <td className="py-6 px-4">
                        <span className="px-4 py-1.5 bg-[#f3e4ca] text-[#b98c52] border border-[#dcc7a5] rounded-full text-[10px] font-black uppercase tracking-widest">
                           {rest.orders_count} Trans.
                        </span>
                     </td>
                     <td className="py-6 px-4 text-right">
                        <span className="text-lg font-black text-zinc-900 tracking-tighter">Q{parseFloat(rest.revenue).toLocaleString()}</span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalAnalytics;
