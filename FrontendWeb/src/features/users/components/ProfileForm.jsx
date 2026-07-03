import { User, Phone, Save, Loader2 } from 'lucide-react';
import { Input } from '../../../shared/components/ui/Input';

export const ProfileForm = ({ profileData, isLoading, handleProfileChange, submitProfile }) => {
  return (
    <div className="bg-white border-4 border-[#1c1712] rounded-none p-10 md:p-14 shadow-[12px_12px_0px_#1c1712]">
      <div className="flex items-center gap-5 mb-14">
        <div className="w-14 h-14 bg-[#fffaf3] border-4 border-[#1c1712] rounded-none flex items-center justify-center text-[#1c1712] shadow-[4px_4px_0px_#1c1712]">
          <User size={32} />
        </div>
        <h3 className="text-4xl font-black text-[#1c1712] uppercase tracking-tighter">Datos Personales</h3>
      </div>

      <form onSubmit={submitProfile} className="space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Input label="Nombre" name="name" value={profileData.name} onChange={handleProfileChange} required />
          <Input label="Apellido" name="surname" value={profileData.surname} onChange={handleProfileChange} required />
        </div>
        <Input label="Teléfono Móvil" name="phone" value={profileData.phone} onChange={handleProfileChange} required icon={Phone} placeholder="12345678" />

        <div className="space-y-4">
          <label className="text-[11px] font-black text-[#1c1712] uppercase tracking-[0.4em] block">Subir Avatar</label>
          <input type="file" id="profilePicture" name="profilePicture" accept="image/*" onChange={handleProfileChange} className="w-full text-[10px] text-[#1c1712] font-black file:mr-8 file:py-4 file:px-8 file:rounded-none file:border-4 file:border-[#1c1712] file:text-[11px] file:font-black file:uppercase file:bg-[#fffaf3] file:text-[#1c1712] file:shadow-[4px_4px_0px_#1c1712] hover:file:shadow-[6px_6px_0px_#1c1712] file:cursor-pointer transition-all" />
        </div>

        <div className="flex justify-end pt-8">
          <button type="submit" disabled={isLoading} className="w-full md:w-auto px-12 py-6 bg-[#1c1712] text-[#fffaf3] border-4 border-[#1c1712] rounded-none font-black uppercase tracking-[0.3em] text-xs shadow-[8px_8px_0px_#b98c52] transition-all hover:-translate-y-2 hover:shadow-[12px_12px_0px_#b98c52] active:translate-y-2 active:shadow-none disabled:opacity-50">
            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : <><Save size={24} className="mr-4" /> Guardar Cambios</>}
          </button>
        </div>
      </form>
    </div>
  );
};
