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

    return (
        <View style={styles.container}>
            {/* Header Profile */}
            <View style={styles.header}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{getInitials()}</Text>
                </View>
                <Text style={styles.profileName}>{user?.name || user?.username || 'Comensal VIP'}</Text>
                <Text style={styles.profileEmail}>{user?.email || 'sin@correo.com'}</Text>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                {/* VIP Points section */}
                <View style={styles.vipCard}>
                    <View style={styles.vipRow}>
                        <View>
                            <Text style={styles.vipBadge}>MIEMBRO GOURMET 💎</Text>
                            <Text style={styles.vipPoints}>Pasaporte BuenProvecho</Text>
                        </View>
                        <View style={styles.pointsNumberWrapper}>
                            <Text style={styles.pointsNum}>0</Text>
                            <Text style={styles.pointsLabel}>Pts</Text>
                        </View>
                    </View>
                </View>

                {/* Profile Info Form / Cards */}
                <View style={styles.sectionCard}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Datos del Perfil</Text>
                        {!isEditing ? (
                            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                                <Text style={styles.editButtonText}>Editar ✏️</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>

                    {isEditing ? (
                        <View style={styles.editForm}>
                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Nombre Completo</Text>
                                <TextInput
                                    style={styles.input}
                                    value={name}
                                    onChangeText={setName}
                                    placeholder="Tu nombre completo"
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Teléfono</Text>
                                <TextInput
                                    style={styles.input}
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder="Número telefónico"
                                    keyboardType="phone-pad"
                                />
                            </View>

                            <View style={styles.formActions}>
                                <TouchableOpacity
                                    style={[styles.formBtn, styles.cancelBtn]}
                                    onPress={() => {
                                        setName(user?.name || user?.username || '');
                                        setPhone(user?.phone || '');
                                        setIsEditing(false);
                                    }}
                                >
                                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.formBtn, styles.saveBtn]}
                                    onPress={handleUpdateProfile}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color={COLORS.surface} />
                                    ) : (
                                        <Text style={styles.saveBtnText}>Guardar</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.infoFields}>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Nombre</Text>
                                <Text style={styles.infoVal}>{user?.name || user?.username || 'N/A'}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Teléfono</Text>
                                <Text style={styles.infoVal}>{user?.phone || 'Sin número registrado'}</Text>
                            </View>
                            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                                <Text style={styles.infoLabel}>Rol de Cuenta</Text>
                                <Text style={styles.infoVal}>Cliente Final</Text>
                            </View>
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.optionsSection}>
                    <TouchableOpacity
                        style={styles.optionRow}
                        onPress={() => navigation.navigate('ClientHistory')}
                    >
                        <Text style={styles.optionText}>📋 Ver Mi Historial de Pedidos</Text>
                        <Text style={styles.optionArrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.optionRow} onPress={() => setPassModalVisible(true)}>
                        <Text style={styles.optionText}>🔒 Cambiar Contraseña</Text>
                        <Text style={styles.optionArrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.optionRow, styles.logoutRow]} onPress={handleLogout}>
                        <Text style={[styles.optionText, styles.logoutText]}>🚪 Cerrar Sesión</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );

};