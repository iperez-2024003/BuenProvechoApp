import { Crown, Loader2 } from 'lucide-react';
import { VipClientsTable } from '../components/VipClientsTable';
import { VipStatsCards } from '../components/VipStatsCards';
import { useVipClients } from '../hooks/useVipClients';

const GlobalClients = () => {
  const { clients, loading } = useVipClients();

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 md:py-48 gap-6 animate-pulse">
      <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-[#b98c52] animate-spin" />
      <p className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">Identificando Elite...</p>
    </div>
  );

  if (!clients || clients.length === 0) return (
    <div className="py-24 md:py-48 text-center bg-white/70 rounded-[4rem] border border-dashed border-[#dcc7a5] px-6">
      <Crown className="w-12 md:w-20 h-12 md:h-20 text-[#d7b77f] mx-auto mb-6 md:mb-8" />
      <h3 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">Sin Historial VIP</h3>
      <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-2">Los clientes con más actividad aparecerán aquí.</p>
    </div>
  );

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <div className="mb-10">
        <h1 className="text-5xl font-black text-zinc-900 tracking-tighter uppercase leading-[1.1] mb-2">
           Clientes <span className="text-[#b98c52]">Elite</span>
        </h1>
        <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">
           Análisis global de usuarios con mayor valor comercial
        </p>
      </div>

      <VipClientsTable clients={clients} />

      <VipStatsCards clients={clients} />
    </div>
  );
};

export default GlobalClients;
