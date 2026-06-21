import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import Restaurante1 from '../../../assets/img/Restaurante1.webp';
import Restaurante2 from '../../../assets/img/Restaurante2.webp';
import Restaurante3 from '../../../assets/img/Restaurante3.webp';
import LogoBuenProvecho from '../../../assets/img/LogoBuenProvecho.png';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';

const uploadImages = [Restaurante1, Restaurante2, Restaurante3];

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % uploadImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFieldErrors({ email: '', password: '' });
    if (!email || !password) {
      setFieldErrors({
        email: !email ? 'Ingresa tu usuario o correo' : '',
        password: !password ? 'Ingresa tu contraseña' : '',
      });
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      toast.success('¡Bienvenido de nuevo!');
      const loggedUser = useAuthStore.getState().user;
      navigate(loggedUser?.restaurantId ? `/dashboard/restaurants/${loggedUser.restaurantId}` : '/dashboard');
      return;
    }

    if (result.code === 'USER_NOT_FOUND') {
      setFieldErrors({ email: 'Usuario no encontrado', password: '' });
      return;
    }

    if (result.code === 'INVALID_PASSWORD') {
      setFieldErrors({ email: '', password: 'Contraseña incorrecta' });
      return;
    }

    toast.error(result.error);
  };

  return (
    <div className="min-h-screen bg-[#fffaf3] flex items-center justify-center p-6 overflow-hidden relative font-outfit">
      {/* Decoración sutil */}
      <div className="absolute top-[-5%] right-[-5%] w-72 h-72 bg-[#b98c52] opacity-5 border-4 border-[#1c1712] -z-0 rotate-12" />

      <div className="relative z-10 w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch border-4 border-[#1c1712] shadow-[20px_20px_0px_#1c1712] bg-white overflow-hidden">
        {/* Lado Izquierdo: Formulario */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-5 p-8 md:p-12 flex flex-col justify-center border-b-4 lg:border-b-0 lg:border-r-4 border-[#1c1712]"
        >
          <div className="mb-10 text-center">
            <img src={LogoBuenProvecho} alt="Logo" className="h-32 mb-8 mx-auto" />
            <h1 className="text-3xl font-black text-[#1c1712] uppercase tracking-tighter leading-none mb-2">
              Acceso <span className="text-[#b98c52]">VIP</span>
            </h1>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
              Panel de Control Gastronómico
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Usuario / Email"
              icon={Mail}
              type="text"
              placeholder="admin@buenprovecho.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
            />

            <div className="relative">
              <Input
                label="Contraseña"
                icon={Lock}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={fieldErrors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-10 text-[#1c1712]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-[9px] font-black uppercase tracking-widest text-[#b98c52] hover:underline">
                ¿Olvidaste tu acceso?
              </Link>
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full py-5 text-xs">
              Entrar al Sistema <ArrowRight size={18} className="ml-2" />
            </Button>
          </form>

          <div className="mt-10 pt-8 border-t-2 border-[#1c1712]/10 flex flex-col items-center gap-4">
            <span className="text-[10px] font-black uppercase text-zinc-400">¿Nuevo Restaurante?</span>
            <Link to="/register" className="text-[10px] font-black uppercase tracking-widest text-[#1c1712] px-6 py-2 border-2 border-[#1c1712] shadow-[4px_4px_0px_#b98c52] hover:-translate-y-1 transition-all">
              Registrar Cuenta
            </Link>
          </div>
        </motion.div>

        {/* Lado Derecho: Showcase Ampliado */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="hidden lg:block lg:col-span-7 relative bg-[#1c1712]"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              src={uploadImages[currentImage]}
              className="absolute inset-0 w-full h-full object-cover opacity-90"
              alt={`Restaurante Showcase ${currentImage + 1}`}
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-t from-[#1c1712] via-transparent to-transparent opacity-40" />

          {/* Indicadores de imagen minimalistas */}
          <div className="absolute bottom-10 right-10 flex gap-3 z-30">
            {uploadImages.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 border border-[#1c1712] transition-all duration-500 ${i === currentImage ? 'w-12 bg-[#b98c52]' : 'w-3 bg-white/30'}`}
              />
            ))}
          </div>

          <div className="absolute top-10 right-10">
            <div className="w-16 h-16 bg-[#fffaf3] border-4 border-[#1c1712] flex items-center justify-center shadow-[6px_6px_0px_#b98c52]">
              <Sparkles size={32} className="text-[#b98c52]" />
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default LoginPage;
