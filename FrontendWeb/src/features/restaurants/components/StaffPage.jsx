import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useStaffStore } from '../store/useStaffStore';
import { useRestaurantStore } from '../store/useRestaurantStore';
import { UserPlus, Search, UserCircle, Mail, Phone, Calendar, ArrowLeftRight, ShieldCheck, Loader2, User, Key, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getImageUrl } from '../../../shared/utils/getImageUrl';
import { Input } from '../../../shared/components/ui/Input';
import { Button } from '../../../shared/components/ui/Button';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';

const StaffAvatar = ({ name, surname, profilePicture }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const fullName = `${name || ''} ${surname || ''}`.trim();

  if (!profilePicture || imageFailed) {
    return <span className="font-black text-primary-600">{name?.charAt(0) || 'U'}</span>;
  }

  return (
    <img
      src={getImageUrl(profilePicture)}
      alt={fullName || 'Perfil'}
      className="w-full h-full object-cover"
      onError={() => setImageFailed(true)}
    />
  );
};

const StaffPage = () => {
  const { id } = useParams();
  const { staff, loading, getStaff, updateRole, createStaff } = useStaffStore();
  const { restaurants } = useRestaurantStore();

  const [formData, setFormData] = useState({
    name: '', surname: '', username: '', email: '', password: '', phone: '', role: 'STAFF_ROLE'
  });

  const restaurant = restaurants.find(r => r.id === id);

  useEffect(() => {
    if (id) getStaff(id);
  }, [id]);

  const handleToggleRole = async (member) => {
    const newRole = member.role === 'STAFF_ROLE' ? 'RESTAURANT_ADMIN_ROLE' : 'STAFF_ROLE';
    const confirmMsg = `¿Deseas cambiar el rango de ${member.name} a ${newRole === 'RESTAURANT_ADMIN_ROLE' ? 'Administrador' : 'Staff'}?`;

    if (window.confirm(confirmMsg)) {
      await updateRole(id, member.id, newRole);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await createStaff(id, formData);
    if (success) {
      setFormData({ name: '', surname: '', username: '', email: '', password: '', phone: '', role: 'STAFF_ROLE' });
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 font-outfit">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Badge variant="primary" className="mb-2">Gestión de Talento</Badge>
          <h1 className="text-4xl md:text-5xl font-black text-ink tracking-tighter uppercase leading-none">
            Equipo de <span className="text-primary-500">Sede</span>
          </h1>
          <p className="text-muted-brown font-medium mt-2 uppercase tracking-widest text-[10px]">
            {restaurant?.name || 'Administración de Personal'}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Formulario de Registro */}
        <div className="w-full lg:w-[420px]">
          <Card className="p-8 md:p-10 shadow-gold border-primary-200">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center border border-primary-200">
                <UserPlus size={24} />
              </div>
              <h2 className="text-2xl font-black text-ink tracking-tight uppercase">Alta de Personal</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Nombre" 
                  value={formData.name} 
                  onChange={(e) => handleChange('name', e.target.value)} 
                  placeholder="Juan" 
                  required 
                  icon={User}
                />
                <Input 
                  label="Apellido" 
                  value={formData.surname} 
                  onChange={(e) => handleChange('surname', e.target.value)} 
                  placeholder="Pérez" 
                  required 
                />
              </div>

              <Input 
                label="Usuario" 
                value={formData.username} 
                onChange={(e) => handleChange('username', e.target.value)} 
                placeholder="juan_p" 
                required 
                icon={UserCircle}
              />

              <Input 
                label="Email" 
                type="email" 
                value={formData.email} 
                onChange={(e) => handleChange('email', e.target.value)} 
                placeholder="staff@correo.com" 
                required 
                icon={Mail}
              />

              <Input 
                label="Contraseña" 
                type="password" 
                value={formData.password} 
                onChange={(e) => handleChange('password', e.target.value)} 
                placeholder="••••••••" 
                required 
                icon={Key}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-ink/80 ml-1">Rol Operativo</label>
                <div className="relative group">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-brown group-focus-within:text-primary-500 transition-colors" />
                  <select 
                    value={formData.role} 
                    onChange={(e) => handleChange('role', e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#fffdf9] border border-[#dcc7a5] text-ink text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value="STAFF_ROLE">Personal de Sala</option>
                    <option value="RESTAURANT_ADMIN_ROLE">Administrador de Sede</option>
                  </select>
                </div>
              </div>

              <Button 
                type="submit" 
                isLoading={loading} 
                className="w-full py-6 rounded-[1.5rem] shadow-gold mt-4"
              >
                Registrar Miembro
              </Button>
            </form>
          </Card>
        </div>

        {/* Listado de Staff */}
        <div className="flex-1">
          {loading && staff.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6 bg-white/50 rounded-[3rem] border border-dashed border-primary-200">
              <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-brown">Cargando Plantilla...</p>
            </div>
          ) : staff.length === 0 ? (
            <div className="bg-white/50 rounded-[4rem] p-24 text-center border border-dashed border-primary-200 h-full flex flex-col justify-center items-center">
              <User className="w-20 h-20 text-primary-200 mb-8" />
              <h3 className="text-2xl font-black text-ink uppercase">Sede sin Personal</h3>
              <p className="text-muted-brown mt-2 text-[10px] font-black uppercase tracking-widest">Inicia el registro para gestionar tu equipo operativo.</p>
            </div>
          ) : (
            <Card className="overflow-hidden border-primary-100 shadow-premium">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                      <tr className="bg-primary-50 border-b border-primary-100">
                        <th className="px-4 sm:px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-ink/80">Colaborador</th>
                        <th className="px-4 sm:px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-ink/80 text-center">Rango</th>
                        <th className="px-4 sm:px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-ink/80 text-right">Mando</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary-100/50">
                      {staff.map((member) => (
                        <tr key={member.id} className="hover:bg-primary-50/30 transition-colors group">
                          <td className="px-4 sm:px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary-50 border border-primary-200 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                              <StaffAvatar name={member.name} surname={member.surname} profilePicture={member.profilePicture} />
                            </div>
                            <div className="min-w-0">
                              <div className="font-black text-ink text-xs md:text-sm tracking-tight truncate">{member.name} {member.surname}</div>
                              <div className="text-[10px] text-muted-brown font-black uppercase tracking-widest truncate">@{member.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-8 py-6 text-center">
                          <Badge variant={member.role === 'RESTAURANT_ADMIN_ROLE' ? 'primary' : 'success'} className="px-4 py-1.5 rounded-full text-[9px]">
                            {member.role === 'RESTAURANT_ADMIN_ROLE' ? '👑 Admin' : '🛡️ Staff'}
                          </Badge>
                        </td>
                        <td className="px-4 sm:px-8 py-6 text-right">
                          <Button
                            variant="ghost"
                            onClick={() => handleToggleRole(member)}
                            className="px-4 py-2.5 rounded-xl border border-primary-200 text-primary-600 hover:bg-primary-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ml-auto"
                          >
                            <ArrowLeftRight className="w-3.5 h-3.5" /> <span className="hidden md:inline">Alternar</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffPage;
