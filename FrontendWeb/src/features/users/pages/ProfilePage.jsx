import { User, Mail, Camera, Shield, Trash2, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { ProfileForm } from '../components/ProfileForm';
import { PasswordForm } from '../components/PasswordForm';
import { useProfile } from '../hooks/useProfile';

const ProfilePage = () => {
  const {
    user,
    isLoading,
    profileData,
    passwordData,
    handleProfileChange,
    handlePasswordChange,
    submitProfile,
    submitPassword,
  } = useProfile();

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="bg-[#b98c52] text-[#1c1712] rounded-none p-8 md:p-14 shadow-[16px_16px_0px_#1c1712] border-4 border-[#1c1712] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-20 hidden md:block">
           <User className="w-48 h-48 text-[#1c1712]" />
        </div>
        <div className="relative z-10">
          <div className="mb-6 inline-flex items-center rounded-none border-2 border-[#1c1712] bg-[#fffaf3] px-4 py-2 shadow-[4px_4px_0px_#1c1712]">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1c1712]">Security & Identity</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.8] mb-8">
            Mi <span className="text-[#fffaf3]">Perfil</span>
          </h1>
          <p className="max-w-2xl text-[#1c1712] font-bold uppercase tracking-[0.2em] text-[10px] md:text-xs leading-relaxed">
            Gestiona tu identidad y seguridad en BuenProvecho. Diseño neobrutalista premium para tu cuenta personal.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Info Lateral */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white border-4 border-[#1c1712] rounded-none p-4 shadow-[10px_10px_0px_#1c1712] text-center">
            <div className="relative inline-block mb-8 group">
              <div className="w-36 h-36 rounded-none bg-[#fffaf3] border-4 border-[#1c1712] overflow-hidden shadow-[6px_6px_0px_#b98c52]">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Perfil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#1c1712]">
                    <User size={64} />
                  </div>
                )}
              </div>
              <div className="absolute -bottom-3 -right-3 w-12 h-12 bg-[#b98c52] rounded-none border-4 border-[#1c1712] flex items-center justify-center text-[#fffaf3] shadow-[4px_4px_0px_#1c1712]">
                <Camera size={20} />
              </div>
            </div>

            <h3 className="text-xl font-black text-[#1c1712] uppercase tracking-tighter leading-tight mb-2 break-words px-2">{user?.name} {user?.surname}</h3>
            <p className="text-xs font-black text-[#b98c52] uppercase tracking-[0.5em] mb-8">@{user?.username}</p>

            <div className="space-y-5 text-left">
              <div className="p-4 bg-[#fffaf3] border-4 border-[#1c1712] rounded-none shadow-[4px_4px_0px_#1c1712] flex items-center gap-4">
                <Mail size={18} className="text-[#b98c52]" />
                <div className="min-w-0">
                  <p className="text-[8px] font-black uppercase text-zinc-500 tracking-[0.3em] mb-1">Email Verificado</p>
                  <p className="text-xs font-black text-[#1c1712] truncate">{user?.email}</p>
                </div>
              </div>
              <div className="p-4 bg-[#fffaf3] border-4 border-[#1c1712] rounded-none shadow-[4px_4px_0px_#1c1712] flex items-center gap-4">
                <Shield size={18} className="text-[#b98c52]" />
                <div className="min-w-0">
                  <p className="text-[8px] font-black uppercase text-zinc-500 tracking-[0.3em] mb-1">Autorización</p>
                  <p className="text-xs font-black text-[#1c1712] uppercase tracking-tighter">{user?.role?.replace('_ROLE', '')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#1c1712] border-4 border-[#1c1712] rounded-none p-6 shadow-[10px_10px_0px_#b98c52]">
            <div className="flex items-center gap-4 text-[#fffaf3]">
              <div className="p-3 bg-[#fffaf3] rounded-none border-2 border-[#1c1712]"><Sparkles size={24} className="text-[#b98c52]" /></div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#b98c52]">Club Gourmet</p>
                <p className="text-[9px] text-[#fffaf3]/60 font-black uppercase tracking-[0.4em]">Miembro desde {new Date(user?.createdAt).getFullYear() || '2024'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-9 space-y-16">
          <ProfileForm
            profileData={profileData}
            isLoading={isLoading}
            handleProfileChange={handleProfileChange}
            submitProfile={submitProfile}
          />

          <PasswordForm
            passwordData={passwordData}
            isLoading={isLoading}
            handlePasswordChange={handlePasswordChange}
            submitPassword={submitPassword}
          />

          {/* Peligro */}
          <div className="bg-[#fffaf3] rounded-none border-4 border-[#1c1712] p-10 md:p-14 flex flex-col md:flex-row items-center justify-between gap-10 shadow-[12px_12px_0px_#ef4444]">
            <div className="flex items-center gap-8 text-center md:text-left">
              <div className="w-20 h-20 bg-[#ef4444] rounded-none border-4 border-[#1c1712] flex items-center justify-center text-[#fffaf3] shadow-[6px_6px_0px_#1c1712]"><Trash2 size={40} /></div>
              <div>
                <h4 className="text-3xl font-black text-[#1c1712] uppercase tracking-tight leading-none mb-2">Zona de Peligro</h4>
                <p className="text-[11px] text-[#ef4444] font-black uppercase tracking-[0.4em]">Eliminación permanente de la cuenta</p>
              </div>
            </div>
            <button className="w-full md:w-auto px-12 py-6 bg-[#ef4444] text-[#fffaf3] border-4 border-[#1c1712] rounded-none font-black uppercase tracking-[0.3em] text-xs shadow-[6px_6px_0px_#1c1712] transition-all hover:-translate-y-2 hover:shadow-[10px_10px_0px_#1c1712] active:translate-y-2 active:shadow-none" onClick={() => toast.error('Contacta a soporte para eliminar tu cuenta')}>
              Eliminar Cuenta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
