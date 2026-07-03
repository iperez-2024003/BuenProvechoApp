import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle2, ShieldQuestion } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import LogoBuenProvecho from '../../../assets/img/LogoBuenProvecho.png';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSent, setIsSent] = useState(false);
  const { forgotPassword, isLoading } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await forgotPassword(email);
    if (result.success) {
      setIsSent(true);
      toast.success(result.message || 'Correo de recuperación enviado.');
    } else toast.error(result.error);
  };

  return (
    <div className="min-h-screen bg-[#fffaf3] flex items-center justify-center p-6 overflow-hidden relative font-outfit">
      {/* Elementos Brutalistas */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#b98c52] opacity-10 border-b-8 border-l-8 border-[#1c1712] -z-0" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#1c1712] opacity-5 border-t-4 border-r-4 border-[#1c1712] -z-0" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-white border-4 border-[#1c1712] p-8 md:p-12 shadow-[16px_16px_0px_#1c1712] text-center">
          <img src={LogoBuenProvecho} alt="Logo" className="h-24 mx-auto mb-10" />

          <AnimatePresence mode="wait">
            {!isSent ? (
              <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-[#fffaf3] border-4 border-[#1c1712] shadow-[6px_6px_0px_#b98c52] mb-8">
                  <ShieldQuestion size={40} className="text-[#1c1712]" />
                </div>
                <h1 className="text-3xl font-black text-[#1c1712] uppercase tracking-tighter leading-none mb-4">
                  Recuperar <span className="text-[#b98c52]">Acceso</span>
                </h1>
                <p className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-10">
                  Te enviaremos el código de restauración a tu canal de comunicación.
                </p>

                <form className="space-y-8 text-left" onSubmit={handleSubmit}>
                  <Input
                    label="Correo Electrónico"
                    icon={Mail}
                    type="email"
                    placeholder="admin@buenprovecho.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <Button type="submit" isLoading={isLoading} className="w-full py-6">
                    Enviar Instrucciones
                  </Button>
                </form>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="inline-flex items-center justify-center w-24 h-24 bg-[#22c55e] border-4 border-[#1c1712] shadow-[8px_8px_0px_#1c1712] mb-8 text-white">
                  <CheckCircle2 size={56} />
                </div>
                <h1 className="text-4xl font-black text-[#1c1712] uppercase tracking-tighter leading-none mb-6">¡Despachado!</h1>
                <p className="text-sm font-black text-[#1c1712] uppercase tracking-wider leading-relaxed mb-8">
                  Revisa tu bandeja de entrada en:<br/>
                  <span className="text-[#b98c52] text-lg">{email}</span>
                </p>
                <div className="bg-[#fffaf3] border-2 border-dashed border-[#1c1712] p-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-8">
                  No olvides revisar la carpeta de SPAM
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-12 pt-8 border-t-4 border-[#1c1712]">
            <Link to="/login" className="inline-flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-[#1c1712] hover:text-[#b98c52] transition-colors">
              <ArrowLeft size={18} className="text-[#b98c52]" />
              Volver al Inicio
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;

