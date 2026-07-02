import { UserPlus, ShieldCheck, Mail, Phone, Lock, Building2, User, Rocket } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';

export const ManagerForm = ({ formData, restaurants, loading, handleChange, handleSubmit }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-8 md:p-12">
        <div className="flex items-center gap-6 mb-10">
          <div className="w-16 h-16 bg-[#fffaf3] text-[#1c1712] rounded-none flex items-center justify-center border-2 border-[#1c1712] shadow-[4px_4px_0px_#b98c52]">
            <UserPlus size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#1c1712] uppercase tracking-tight">Dar de Alta Gerente</h2>
            <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em]">Asignación de administrador de sede oficial</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Sección 1: Identidad */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Nombre" name="name" value={formData.name} onChange={handleChange} required icon={User} />
            <Input label="Apellido" name="surname" value={formData.surname} onChange={handleChange} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Nombre de Usuario" name="username" value={formData.username} onChange={handleChange} required placeholder="ej: mario_chef" />
            <Input label="Teléfono Móvil" name="phone" value={formData.phone} onChange={handleChange} required icon={Phone} placeholder="12345678" />
          </div>

          {/* Sección 2: Credenciales */}
          <div className="space-y-6">
            <Input label="Email Institucional" name="email" type="email" value={formData.email} onChange={handleChange} required icon={Mail} placeholder="gerente@buenprovecho.com" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input label="Contraseña Temporal" name="password" type="password" value={formData.password} onChange={handleChange} required icon={Lock} placeholder="••••••••" />
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest ml-1">Rango del Perfil</label>
                <div className="h-11 px-4 bg-[#fffaf3] rounded-none border-2 border-[#1c1712] text-[#1c1712] text-xs font-black flex items-center gap-3 uppercase tracking-widest">
                  <ShieldCheck size={18} className="text-[#b98c52]" /> Gerente de Sede
                </div>
              </div>
            </div>
          </div>

          {/* Sección 3: Asignación */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-muted-brown tracking-widest ml-1">Sede de Operación</label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-400" size={18} />
              <select
                name="restaurant_id" value={formData.restaurant_id} onChange={handleChange} required
                className="w-full h-11 pl-12 pr-4 bg-white border-2 border-[#1c1712] rounded-none text-sm font-bold text-[#1c1712] outline-none focus:shadow-[4px_4px_0px_#b98c52] transition-all appearance-none cursor-pointer uppercase tracking-widest"
              >
                <option value="">Seleccionar Sede...</option>
                {restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            {restaurants.length === 0 && (
              <p className="text-[10px] text-red-500 font-black uppercase tracking-widest mt-2 px-1 flex items-center gap-2">
                ⚠️ Debes crear una sede primero
              </p>
            )}
          </div>

          <div className="pt-8 border-t border-primary-100">
            <Button type="submit" isLoading={loading} className="w-full py-6 text-xs tracking-[0.2em]">
              {loading ? 'Dando de Alta...' : <><Rocket size={18} className="mr-2" /> Activar Credenciales de Gerencia</>}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
