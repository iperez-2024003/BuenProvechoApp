import { motion } from 'framer-motion';
import { UtensilsCrossed, Info, Users, MapPin, Layers } from 'lucide-react';

const ZONE_LABELS = {
  interior: 'Salón Principal',
  terrace: 'Terraza / Exterior',
  vip: 'Zona VIP',
  private: 'Salón Privado',
  window: 'Frente a Ventana',
  bar: 'Área de Bar'
};

const STATUS_COLORS = {
  available: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-600', shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]' },
  occupied: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-600', shadow: 'shadow-[0_0_15px_rgba(244,63,94,0.2)]' },
  reserved: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-600', shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.2)]' },
  cleaning: { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-600', shadow: 'shadow-[0_0_15px_rgba(14,165,233,0.2)]' }
};

export const InteractiveTableMap = ({ tables, onTableClick }) => {
  // Agrupar por zonas
  const zones = [...new Set(tables.map(t => t.location || 'interior'))];

  return (
    <div className="space-y-12 pb-20">
      {/* Leyenda Estilo Cine */}
      <div className="flex flex-wrap justify-center gap-8 bg-white/50 backdrop-blur-xl p-6 rounded-[2rem] border border-[#dcc7a5]/10 shadow-sm">
        {Object.entries(STATUS_COLORS).map(([status, colors]) => (
          <div key={status} className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${colors.bg} border-2 ${colors.border} ${colors.shadow}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
              {status === 'available' ? 'Disponible' : status === 'occupied' ? 'Ocupada' : status === 'reserved' ? 'Reservada' : 'Limpieza'}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-12">
        {zones.map((zone) => {
          const zoneTables = tables.filter(t => (t.location || 'interior') === zone);
          
          return (
            <div key={zone} className="relative">
              {/* Etiqueta de Zona */}
              <div className="flex items-center gap-6 mb-8">
                 <div className="flex items-center gap-3 px-6 py-2 rounded-full bg-zinc-900 text-white border-2 border-zinc-900 shadow-gold">
                    <MapPin size={14} className="text-[#b98c52]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">{ZONE_LABELS[zone] || zone}</span>
                 </div>
                 <div className="flex-1 h-px bg-gradient-to-r from-zinc-200 to-transparent" />
              </div>

              {/* Grid de Asientos/Mesas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-6">
                {zoneTables.map((table, index) => {
                  const colors = STATUS_COLORS[table.status] || STATUS_COLORS.available;
                  
                  return (
                    <motion.button
                      key={table.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => onTableClick(table)}
                      className={`
                        group relative aspect-square rounded-[1.5rem] border-2 transition-all duration-300
                        flex flex-col items-center justify-center gap-1
                        ${colors.bg} ${colors.border} ${colors.shadow}
                        hover:scale-110 hover:z-20 hover:bg-white hover:border-[#b98c52]
                      `}
                    >
                      <UtensilsCrossed size={20} className={`${colors.text} group-hover:text-[#b98c52] transition-colors`} />
                      <span className="text-sm font-black text-zinc-900">#{table.table_number}</span>
                      
                      {/* Badge de Capacidad */}
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-white border border-[#dcc7a5] rounded-full flex items-center justify-center shadow-sm">
                         <span className="text-[8px] font-black text-zinc-800">{table.capacity}</span>
                      </div>

                      {/* Tooltip Detallado */}
                      <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none z-30">
                        <div className="bg-zinc-900 text-white px-4 py-2 rounded-xl shadow-xl flex items-center gap-3 border border-white/10">
                           <div className="text-left">
                              <p className="text-[8px] font-black text-[#b98c52] uppercase tracking-widest leading-none mb-1">Ubicación</p>
                              <p className="text-[10px] font-bold whitespace-nowrap">PISO {table.floor} • {table.location}</p>
                           </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Pantalla / Escenario Simulado (Concepto Cine) */}
      <div className="mt-20 flex flex-col items-center opacity-40">
         <div className="w-full max-w-2xl h-2 bg-gradient-to-r from-transparent via-zinc-400 to-transparent rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.2)]" />
         <p className="mt-4 text-[10px] font-black text-zinc-400 uppercase tracking-[0.5em]">Vista Panorámica del Salón</p>
      </div>
    </div>
  );
};
