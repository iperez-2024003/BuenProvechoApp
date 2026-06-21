import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, SPACING, FONT_SIZE } from '../../../shared/constants/theme';
import useEventsStore from '../store/useEventsStore';

const EVENT_TYPE_LABELS = {
  promotion: { label: 'Promo 🏷️', bg: '#fef08a', color: '#854d0e' },
  event: { label: 'Social 🎟️', bg: '#bbf7d0', color: '#166534' },
  special: { label: 'Especial ✨', bg: '#fbcfe8', color: '#9d174d' },
};

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600';

const EventsScreen = ({ navigation }) => {
  const { events, loading, fetchEvents, participateInEvent } = useEventsStore();
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [activeType, setActiveType] = useState('all'); // 'all', 'event', 'promotion', 'special'

  const loadUser = useCallback(async () => {
    try {
      const userDataJson = await AsyncStorage.getItem('userData');
      if (userDataJson) {
        setUser(JSON.parse(userDataJson));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error loading user in EventsScreen:', error);
    }
  }, []);

  const loadData = useCallback(async () => {
    await Promise.all([fetchEvents(), loadUser()]);
    setRefreshing(false);
  }, [fetchEvents, loadUser]);

  useEffect(() => {
    setLoadingState();
    loadData();
  }, [loadData]);

  const setLoadingState = () => {
    // Initial load state
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleParticipate = async (event) => {
    if (!user) {
      Alert.alert('Acceso Requerido', 'Inicia sesión para poder participar en este evento.', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Ir a Login',
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            }),
        },
      ]);
      return;
    }

    try {
      const userId = user.id || user._id;
      await participateInEvent(event.id || event._id, userId);
      Alert.alert('¡Excelente!', `Te has registrado correctamente en "${event.name}".`);
      onRefresh(); // Reload events
    } catch (error) {
      Alert.alert('Registro', error.message || 'No se pudo completar el registro.');
    }
  };

  const filteredEvents = activeType === 'all'
    ? events
    : events.filter((e) => e.type === activeType);

  const renderEventItem = ({ item }) => {
    const userId = user?.id || user?._id;
    const isParticipating = item.participants?.some(
      (p) => p.userId === userId || p.user_id === userId
    );

    const typeInfo = EVENT_TYPE_LABELS[item.type] || {
      label: item.type?.toUpperCase() || 'PROMO',
      bg: COLORS.surface,
      color: COLORS.secondary,
    };

    const formattedDate = item.date
      ? new Date(item.date).toLocaleDateString('es-GT', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'Fecha especial';

    return (
      <View style={styles.eventCard}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: item.image_url || FALLBACK_IMAGE }}
            style={styles.eventImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay} />
          <View style={[styles.typeBadge, { backgroundColor: typeInfo.bg }]}>
            <Text style={[styles.typeBadgeText, { color: typeInfo.color }]}>
              {typeInfo.label}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.cardBody}>
          <Text style={styles.eventTitle}>{item.name}</Text>
          <Text style={styles.eventDate}>📅 {formattedDate}</Text>
          <Text style={styles.eventDesc}>{item.description}</Text>

          {item.type === 'event' && (
            <View style={styles.participantsContainer}>
              <Text style={styles.participantsCount}>
                Cupos: {item.currentParticipants || 0} / {item.maxParticipants || 100} participantes
              </Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(
                        100,
                        (((item.currentParticipants || 0) / (item.maxParticipants || 1)) * 100)
                      )}%`,
                    },
                  ]}
                />
              </View>
            </View>
          )}

          {/* Action button */}
          {item.type === 'event' ? (
            <TouchableOpacity
              style={[
                styles.actionButton,
                isParticipating && styles.actionButtonActive,
                (item.currentParticipants >= item.maxParticipants && !isParticipating) && styles.actionButtonFull,
              ]}
              onPress={() => !isParticipating && handleParticipate(item)}
              disabled={isParticipating || (item.currentParticipants >= item.maxParticipants)}
              activeOpacity={0.8}
            >
              <Text style={[styles.actionButtonText, isParticipating && styles.actionButtonTextActive]}>
                {isParticipating
                  ? 'Registrado ✅'
                  : item.currentParticipants >= item.maxParticipants
                  ? 'Cupo Lleno ⏳'
                  : 'Participar ✨'}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.promoButton]}
              onPress={() =>
                Alert.alert('Promoción Activa', '¡Visítanos hoy mismo en nuestra sede para reclamar esta oferta!')
              }
              activeOpacity={0.8}
            >
              <Text style={styles.promoButtonText}>Reclamar Oferta 🏷️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderFilterTab = (typeKey, label) => {
    const active = activeType === typeKey;
    return (
      <TouchableOpacity
        key={typeKey}
        style={[styles.tabButton, active && styles.tabButtonActive]}
        onPress={() => setActiveType(typeKey)}
      >
        <Text style={[styles.tabButtonText, active && styles.tabButtonTextActive]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading && events.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando Eventos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Title */}
      <View style={styles.header}>
        <Text style={styles.title}>Eventos & Promos</Text>
        <Text style={styles.subtitle}>Las mejores experiencias del club</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        {renderFilterTab('all', 'Todos')}
        {renderFilterTab('event', 'Eventos')}
        {renderFilterTab('promotion', 'Promos')}
        {renderFilterTab('special', 'Especial')}
      </View>

      {/* Events List */}
      <FlatList
        data={filteredEvents}
        keyExtractor={(item) => item.id || item._id}
        renderItem={renderEventItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text style={styles.emptyTitle}>Sin Novedades</Text>
            <Text style={styles.emptySubtitle}>
              No hay eventos o promociones activas en esta categoría por el momento.
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 50,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 4,
    borderColor: COLORS.secondary,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: SPACING.xxs,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: COLORS.textLight,
    marginTop: SPACING.md,
  },
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.xs,
  },
  tabButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    borderRadius: 8,
    paddingVertical: SPACING.sm - 2,
    alignItems: 'center',
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  tabButtonActive: {
    backgroundColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  tabButtonText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  tabButtonTextActive: {
    color: COLORS.surface,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  eventCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 3,
    borderColor: COLORS.secondary,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: SPACING.md,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 6,
  },
  imageContainer: {
    height: 150,
    position: 'relative',
  },
  eventImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28, 23, 18, 0.2)',
  },
  typeBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xxs,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.secondary,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '950',
    textTransform: 'uppercase',
  },
  cardBody: {
    padding: SPACING.md,
  },
  eventTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xxs,
  },
  eventDate: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.primaryDark,
    marginBottom: SPACING.sm,
  },
  eventDesc: {
    fontSize: 12,
    color: COLORS.textLight,
    lineHeight: 18,
    marginBottom: SPACING.md,
  },
  participantsContainer: {
    marginBottom: SPACING.md,
  },
  participantsCount: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: SPACING.xxs,
    textTransform: 'uppercase',
  },
  progressBar: {
    height: 6,
    backgroundColor: `${COLORS.secondary}15`,
    borderRadius: 3,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  actionButton: {
    width: '100%',
    paddingVertical: SPACING.md,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  actionButtonActive: {
    backgroundColor: COLORS.background,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  actionButtonFull: {
    backgroundColor: COLORS.textMuted,
    borderColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  actionButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.surface,
    textTransform: 'uppercase',
  },
  actionButtonTextActive: {
    color: COLORS.secondary,
  },
  promoButton: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.secondary,
  },
  promoButtonText: {
    fontSize: 11,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    padding: SPACING.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '900',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
});

export default EventsScreen;
