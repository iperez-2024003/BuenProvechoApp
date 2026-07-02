import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Alert,
    Modal,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import useAuthStore from '../store/useAuthStore';

const ProfileScreen = ({ navigation }) => {
    const { user, logout, updateProfile, changePassword, isLoading } = useAuthStore();

    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || user?.username || '');
    const [phone, setPhone] = useState(user?.phone || '');

    const [passModalVisible, setPassModalVisible] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleUpdateProfile = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'El nombre es obligatorio.');
            return;
        }

        try {
            const result = await updateProfile({
                name: name.trim(),
                phone: phone.trim(),
            });
            if (result.success) {
                Alert.alert('Éxito', 'Perfil actualizado correctamente.');
                setIsEditing(false);
            } else {
                Alert.alert('Error', result.error || 'No se pudo actualizar.');
            }
        } catch (error) {
            Alert.alert('Error', 'Ocurrió un error inesperado.');
        }
    };

    const handleChangePassword = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Todos los campos de contraseña son obligatorios.');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Las nuevas contraseñas no coinciden.');
            return;
        }

        try {
            const result = await changePassword(currentPassword, newPassword, confirmPassword);
            if (result.success) {
                Alert.alert('Éxito', 'Contraseña modificada correctamente.');
                setPassModalVisible(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                Alert.alert('Error', result.error || 'No se pudo modificar la contraseña.');
            }
        } catch (error) {
            Alert.alert('Error', 'Ocurrió un error inesperado.');
        }
    };

    const handleLogout = async () => {
        Alert.alert('Cerrar Sesión', '¿Estás seguro de que deseas salir del panel?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Cerrar Sesión',
                style: 'destructive',
                onPress: async () => {
                    await logout();
                    navigation.reset({
                        index: 0,
                        routes: [{ name: 'Auth' }],
                    });
                },
            },
        ]);
    };

    const getInitials = () => {
        const rawName = user?.name || user?.username || 'U';
        return rawName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
    };

};