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
};