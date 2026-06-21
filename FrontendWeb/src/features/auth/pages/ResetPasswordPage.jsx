import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ArrowLeft, Lock, KeyRound, ShieldAlert } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import LogoBuenProvecho from '../../../assets/img/LogoBuenProvecho.png';

export const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { resetPassword, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error('Protocolo inválido: Token no detectado.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }

    const result = await resetPassword(token, newPassword);
    if (result.success) {
      toast.success('Credenciales actualizadas exitosamente.');
      navigate('/login');
    } else toast.error(result.error);
  };

  return (
    <div className="min-h-screen bg-[#fffaf3] flex items-center justify-center p-6 overflow-hidden relative font-outfit">
      {/* Elementos Brutalistas */}
      <div className="absolute top-[-5%] left-[-5%] w-64 h-64 bg-[#1c1712] opacity-5 border-4 border-[#1c1712] -z-0 rotate-12" />
      <div className="absolute bottom-[-5%] right-[-5%] w-80 h-80 bg-[#b98c52] opacity-10 border-8 border-[#1c1712] -z-0 -rotate-6" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white border-4 border-[#1c1712] p-8 md:p-12 shadow-[16px_16px_0px_#1c1712] text-center relative">
          <div className="absolute -top-6 -right-6 bg-[#ef4444] border-4 border-[#1c1712] p-4 shadow-[4px_4px_0px_#1c1712] animate-pulse">
            <ShieldAlert size={32} className="text-white" />
          </div>

          <img src={LogoBuenProvecho} alt="Logo" className="h-24 mx-auto mb-10" />

          <div className="mb-10">
            <h1 className="text-3xl font-black text-[#1c1712] uppercase tracking-tighter leading-none mb-4">
              Reset <span className="text-[#b98c52]">Password</span>
            </h1>
            <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500">
              Define tu nueva llave de acceso para restaurar la seguridad.
            </p>
          </div>

          <form className="space-y-8 text-left" onSubmit={handleSubmit}>
            <Input
              label="Nueva Contraseña"
              icon={KeyRound}
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <Input
              label="Confirmar Nueva"
              icon={Lock}
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" isLoading={isLoading} className="w-full py-6">
              Actualizar Acceso
            </Button>
          </form>

          <div className="mt-12 pt-8 border-t-4 border-[#1c1712]">
            <Link to="/login" className="inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-[#1c1712] hover:text-[#b98c52] transition-colors">
              <ArrowLeft size={18} className="text-[#b98c52]" />
              Cancelar Operación
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
