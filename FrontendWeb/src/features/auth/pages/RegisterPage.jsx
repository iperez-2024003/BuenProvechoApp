import { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Phone, ArrowRight, ShieldCheck, UserPlus, Eye, EyeOff } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import LogoBuenProvecho from '../../../assets/img/LogoBuenProvecho.png';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    profilePicture: null
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePicture') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Nombre obligatorio";
    else if (formData.name.length > 25) errors.name = "Máx 25 caracteres";
    if (!formData.surname.trim()) errors.surname = "Apellido obligatorio";
    else if (formData.surname.length > 25) errors.surname = "Máx 25 caracteres";
    if (!formData.username.trim()) errors.username = "Usuario obligatorio";
    else if (formData.username.length > 50) errors.username = "Máx 50 caracteres";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = "Correo inválido";
    if (formData.password.length < 8) errors.password = "Mínimo 8 caracteres";
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = "No coinciden";
    if (!formData.phone.match(/^\d{8}$/)) errors.phone = "Exactamente 8 dígitos";
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error('Corrige los errores');
      return;
    }

    const data = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'confirmPassword' && formData[key]) data.append(key, formData[key]);
    });

    const result = await register(data);
    if (result.success) {
      toast.success('¡Bienvenido! Verifica tu correo.');
      navigate('/login');
    } else toast.error(result.error);
  };

  return (
    <div className="min-h-screen bg-[#fffaf3] flex items-center justify-center p-6 overflow-x-hidden relative font-outfit">
      {/* Fondo decorativo sutil */}
      <div className="absolute top-0 left-0 w-full h-24 bg-[#1c1712] border-b-4 border-[#b98c52] -z-0" />

      <div className="relative z-10 w-full max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white border-4 border-[#1c1712] p-8 md:p-12 shadow-[12px_12px_0px_#1c1712] relative">
            <div className="text-center mb-12">
              <img src={LogoBuenProvecho} alt="Logo" className="h-24 mb-6 mx-auto" />
              <h1 className="text-3xl font-black text-[#1c1712] uppercase tracking-tighter leading-none mb-2">
                Nueva <span className="text-[#b98c52]">Identidad</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">
                Únete a la elite de la gestión gastronómica.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Nombre" name="name" icon={User} value={formData.name} onChange={handleChange} required />
                <Input label="Apellido" name="surname" value={formData.surname} onChange={handleChange} required />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Usuario" name="username" value={formData.username} onChange={handleChange} required />
                <Input label="Email" name="email" icon={Mail} type="email" value={formData.email} onChange={handleChange} required error={fieldErrors.email} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input label="Teléfono" name="phone" icon={Phone} value={formData.phone} onChange={handleChange} required error={fieldErrors.phone} />
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-[#1c1712] ml-1">Avatar</label>
                  <input
                    type="file"
                    name="profilePicture"
                    onChange={handleChange}
                    className="w-full text-[9px] font-black file:mr-4 file:py-2 file:px-4 file:rounded-none file:border-2 file:border-[#1c1712] file:bg-[#fffaf3] file:text-[#1c1712] file:shadow-[3px_3px_0px_#1c1712] file:cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
                <div className="relative">
                  <Input label="Contraseña" name="password" icon={Lock} type={showPassword ? 'text' : 'password'} value={formData.password} onChange={handleChange} required error={fieldErrors.password} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-9 text-[#1c1712]">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="relative">
                  <Input label="Confirmar" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} value={formData.confirmPassword} onChange={handleChange} required error={fieldErrors.confirmPassword} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-9 text-[#1c1712]">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="pt-8 border-t-2 border-[#1c1712] flex flex-col items-center gap-6">
                <Button type="submit" isLoading={isLoading} className="w-full py-5 text-xs">
                  Crear Cuenta <ArrowRight size={18} className="ml-2" />
                </Button>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  ¿Ya tienes cuenta? <Link to="/login" className="text-[#b98c52] border-b border-[#b98c52] ml-2">Iniciar Sesión</Link>
                </p>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default RegisterPage;
