import { Key, Loader2 } from 'lucide-react';
import { Input } from '../../../shared/components/ui/Input';

export const PasswordForm = ({ passwordData, isLoading, handlePasswordChange, submitPassword }) => {
  return (
    <div className="bg-white border-4 border-[#1c1712] rounded-none p-10 md:p-14 shadow-[12px_12px_0px_#1c1712]">
      <div className="flex items-center gap-5 mb-14">
        <div className="w-14 h-14 bg-[#fffaf3] border-4 border-[#1c1712] rounded-none flex items-center justify-center text-[#1c1712] shadow-[4px_4px_0px_#1c1712]">
          <Key size={32} />
        </div>
        <h3 className="text-4xl font-black text-[#1c1712] uppercase tracking-tighter">Seguridad de la Cuenta</h3>
      </div>

      <form onSubmit={submitPassword} className="space-y-10">
        <Input label="Contraseña Actual" name="currentPassword" type="password" value={passwordData.currentPassword} onChange={handlePasswordChange} required placeholder="••••••••" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Input label="Nueva Contraseña" name="newPassword" type="password" value={passwordData.newPassword} onChange={handlePasswordChange} required placeholder="Mín. 8 caracteres" />
          <Input label="Confirmar Nueva" name="confirmPassword" type="password" value={passwordData.confirmPassword} onChange={handlePasswordChange} required placeholder="Repite contraseña" />
        </div>
        <div className="flex justify-end pt-8">
          <button type="submit" disabled={isLoading} className="w-full md:w-auto px-12 py-6 bg-[#fffaf3] text-[#1c1712] border-4 border-[#1c1712] rounded-none font-black uppercase tracking-[0.3em] text-xs shadow-[8px_8px_0px_#1c1712] transition-all hover:-translate-y-2 hover:shadow-[12px_12px_0px_#1c1712] active:translate-y-2 active:shadow-none disabled:opacity-50">
            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Actualizar Contraseña'}
          </button>
        </div>
      </form>
    </div>
  );
};
