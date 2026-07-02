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

            /* Cambio de contraseña */
            <Modal visible={passModalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Seguridad</Text>
                            <TouchableOpacity
                                style={styles.modalCloseBtn}
                                onPress={() => setPassModalVisible(false)}
                            >
                                <Text style={styles.modalCloseText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.modalSubtitle}>Modifica tu clave de acceso</Text>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Contraseña Actual</Text>
                                <TextInput
                                    style={styles.input}
                                    secureTextEntry
                                    value={currentPassword}
                                    onChangeText={setCurrentPassword}
                                    placeholder="••••••••"
                                    placeholderTextColor={COLORS.textMuted}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Nueva Contraseña</Text>
                                <TextInput
                                    style={styles.input}
                                    secureTextEntry
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="••••••••"
                                    placeholderTextColor={COLORS.textMuted}
                                />
                            </View>

                            <View style={styles.formGroup}>
                                <Text style={styles.label}>Confirmar Contraseña</Text>
                                <TextInput
                                    style={styles.input}
                                    secureTextEntry
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="••••••••"
                                    placeholderTextColor={COLORS.textMuted}
                                />
                            </View>
                        </ScrollView>

                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalCancelBtn]}
                                onPress={() => setPassModalVisible(false)}
                            >
                                <Text style={styles.modalCancelBtnText}>Cancelar</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.modalBtn, styles.modalSaveBtn]}
                                onPress={handleChangePassword}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color={COLORS.surface} />
                                ) : (
                                    <Text style={styles.modalSaveBtnText}>Modificar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        backgroundColor: COLORS.secondary,
        paddingTop: 60,
        paddingBottom: SPACING.xl,
        alignItems: 'center',
        borderBottomWidth: 4,
        borderColor: COLORS.secondary,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        borderWidth: 3,
        borderColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.sm,
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
    },
    avatarText: {
        fontSize: 28,
        fontWeight: '950',
        color: COLORS.secondary,
    },
    profileName: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '900',
        color: COLORS.surface,
        textTransform: 'uppercase',
        letterSpacing: -0.5,
    },
    profileEmail: {
        fontSize: FONT_SIZE.xs,
        color: COLORS.primaryLight,
        fontWeight: '600',
        marginTop: SPACING.xxs,
    },
    scrollView: {
        flex: 1,
        padding: SPACING.md,
    },
    vipCard: {
        backgroundColor: COLORS.surface,
        borderWidth: 3,
        borderColor: COLORS.secondary,
        borderRadius: 16,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
        marginTop: SPACING.xs,
    },
    vipRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    vipBadge: {
        fontSize: 10,
        fontWeight: '950',
        color: COLORS.primaryDark,
        letterSpacing: 1,
    },
    vipPoints: {
        fontSize: 13,
        fontWeight: '800',
        color: COLORS.secondary,
        textTransform: 'uppercase',
        marginTop: SPACING.xxs,
    },
    pointsNumberWrapper: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: COLORS.secondary,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: COLORS.secondary,
    },
    pointsNum: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.surface,
    },
    pointsLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: COLORS.primary,
        marginLeft: SPACING.xxs,
        textTransform: 'uppercase',
    },
    sectionCard: {
        backgroundColor: COLORS.surface,
        borderWidth: 3,
        borderColor: COLORS.secondary,
        borderRadius: 16,
        padding: SPACING.md,
        marginBottom: SPACING.md,
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.md,
        fontWeight: '900',
        color: COLORS.secondary,
        textTransform: 'uppercase',
    },
    editButton: {
        backgroundColor: COLORS.background,
        borderWidth: 1.5,
        borderColor: COLORS.secondary,
        borderRadius: 8,
        paddingHorizontal: SPACING.sm,
        paddingVertical: SPACING.xs,
    },
    editButtonText: {
        fontSize: 10,
        fontWeight: '800',
        color: COLORS.secondary,
        textTransform: 'uppercase',
    },
    infoFields: {
        gap: SPACING.sm,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: SPACING.xs,
        borderBottomWidth: 1,
        borderColor: `${COLORS.secondary}10`,
    },
    infoLabel: {
        fontSize: 12,
        fontWeight: '800',
        color: COLORS.textMuted,
        textTransform: 'uppercase',
    },
    infoVal: {
        fontSize: 13,
        fontWeight: '850',
        color: COLORS.secondary,
    },
    editForm: {
        gap: SPACING.sm,
    },
    formGroup: {
        marginBottom: SPACING.xs,
    },
    label: {
        fontSize: 10,
        fontWeight: '900',
        color: COLORS.secondary,
        textTransform: 'uppercase',
        marginBottom: SPACING.xs,
    },
    input: {
        backgroundColor: COLORS.background,
        borderWidth: 2,
        borderColor: COLORS.secondary,
        borderRadius: 8,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        fontSize: FONT_SIZE.sm,
        color: COLORS.text,
    },
    formActions: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginTop: SPACING.sm,
    },
    formBtn: {
        flex: 1,
        paddingVertical: SPACING.md,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 2,
    },
    cancelBtn: {
        backgroundColor: COLORS.background,
        borderColor: COLORS.secondary,
    },
    cancelBtnText: {
        fontSize: 11,
        fontWeight: '900',
        color: COLORS.secondary,
        textTransform: 'uppercase',
    },
    saveBtn: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary,
    },
    saveBtnText: {
        fontSize: 11,
        fontWeight: '900',
        color: COLORS.surface,
        textTransform: 'uppercase',
    },
    optionsSection: {
        gap: SPACING.sm,
        marginBottom: SPACING.xxl,
    },
    optionRow: {
        backgroundColor: COLORS.surface,
        borderWidth: 3,
        borderColor: COLORS.secondary,
        borderRadius: 14,
        padding: SPACING.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 4,
    },
    optionText: {
        fontSize: 12,
        fontWeight: '900',
        color: COLORS.secondary,
        textTransform: 'uppercase',
    },
    optionArrow: {
        fontSize: 16,
        fontWeight: '900',
        color: COLORS.secondary,
    },
    logoutRow: {
        borderColor: COLORS.error,
        backgroundColor: COLORS.surface,
        shadowColor: COLORS.error,
    },
    logoutText: {
        color: COLORS.error,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(28, 23, 18, 0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: COLORS.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        height: '65%',
        borderWidth: 4,
        borderColor: COLORS.secondary,
        borderBottomWidth: 0,
        overflow: 'hidden',
    },
    modalHeader: {
        backgroundColor: COLORS.surface,
        padding: SPACING.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 4,
        borderColor: COLORS.secondary,
    },
    modalTitle: {
        fontSize: FONT_SIZE.xl,
        fontWeight: '900',
        color: COLORS.secondary,
        textTransform: 'uppercase',
        letterSpacing: -1,
    },
    modalCloseBtn: {
        width: 36,
        height: 36,
        borderWidth: 2,
        borderColor: COLORS.secondary,
        backgroundColor: COLORS.background,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalCloseText: {
        fontSize: 16,
        fontWeight: '900',
        color: COLORS.secondary,
    },
    modalBody: {
        flex: 1,
        padding: SPACING.md,
    },
    modalSubtitle: {
        fontSize: 11,
        fontWeight: '800',
        color: COLORS.textLight,
        textTransform: 'uppercase',
        marginBottom: SPACING.md,
    },
    modalFooter: {
        flexDirection: 'row',
        gap: SPACING.sm,
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderTopWidth: 4,
        borderColor: COLORS.secondary,
    },
    modalBtn: {
        flex: 1,
        paddingVertical: SPACING.md,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    modalCancelBtn: {
        backgroundColor: COLORS.background,
        borderColor: COLORS.secondary,
    },
    modalCancelBtnText: {
        fontSize: 11,
        fontWeight: '900',
        color: COLORS.secondary,
        textTransform: 'uppercase',
    },
    modalSaveBtn: {
        backgroundColor: COLORS.secondary,
        borderColor: COLORS.secondary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 1,
        shadowRadius: 0,
        elevation: 3,
    },
    modalSaveBtnText: {
        fontSize: 11,
        fontWeight: '900',
        color: COLORS.surface,
        textTransform: 'uppercase',
    },
});

export default ProfileScreen;