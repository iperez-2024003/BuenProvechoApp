import { useState, useEffect } from 'react';
import { useAuthStore } from '../../auth/store/useAuthStore';
import { toast } from 'react-hot-toast';

export const useProfile = () => {
  const { user, getProfile, updateProfile, changePassword, isLoading } = useAuthStore();

  const [profileData, setProfileData] = useState({ name: '', surname: '', phone: '', profilePicture: null });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      const result = await getProfile();
      if (result.success && result.data) {
        setProfileData({
          name: result.data.name || '',
          surname: result.data.surname || '',
          phone: result.data.phone || '',
          profilePicture: null,
        });
      }
    };
    fetchProfile();
  }, [getProfile]);

  const handleProfileChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'profilePicture') setProfileData({ ...profileData, [name]: files[0] });
    else setProfileData({ ...profileData, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
  };

  const submitProfile = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', profileData.name);
    formData.append('surname', profileData.surname);
    formData.append('phone', profileData.phone);
    if (profileData.profilePicture) formData.append('profilePicture', profileData.profilePicture);

    const result = await updateProfile(formData);
    if (result.success) {
      toast.success('Perfil actualizado');
      if (document.getElementById('profilePicture')) document.getElementById('profilePicture').value = '';
      setProfileData(prev => ({ ...prev, profilePicture: null }));
    } else toast.error(result.error);
  };

  const submitPassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) return toast.error('Las contraseñas no coinciden');
    const result = await changePassword(
      passwordData.currentPassword,
      passwordData.newPassword,
      passwordData.confirmPassword
    );
    if (result.success) {
      toast.success('Contraseña actualizada');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else toast.error(result.error);
  };

  return {
    user,
    isLoading,
    profileData,
    passwordData,
    handleProfileChange,
    handlePasswordChange,
    submitProfile,
    submitPassword,
  };
};
