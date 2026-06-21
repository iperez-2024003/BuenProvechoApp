export const COLORS = {
  // Brand Colors - BuenProvecho Theme
  primary: "#caa56d",        // Dorado Principal
  primaryDark: "#a98042",    // Dorado oscuro para estados activos
  primaryLight: "#f7f0e2",   // Crema claro
  secondary: "#1c1712",      // Negro cálido para headers/destacados
  accent: "#e8c97f",         // Dorado claro para acentos

  // Neutral Colors
  background: "#fffaf3",     // Crema/beige para el fondo general
  surface: "#fefcf8",        // Blanco roto para tarjetas y contenedores
  border: "#f1e4cd",         // Beige claro para divisiones

  // Text Colors
  text: "#1c1712",           // Negro cálido principal para legibilidad
  textLight: "#6b5e4e",      // Marrón apagado para descripciones secundarias
  textMuted: "#9CA3AF",      // Gris para placeholders

  // Semantic Status Colors
  success: "#10B981",        // Verde esmeralda para entregado/pago exitoso
  warning: "#F59E0B",        // Ámbar para pendientes/alertas de preparación
  error: "#EF4444",          // Rojo para cancelado/error de pago
  info: "#3B82F6",           // Azul para información de envíos
};

export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  huge: 32,
};

export const SHADOWS = {
  sm: {
    shadowColor: "#1c1712",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4.0,
    elevation: 2,
  },
  md: {
    shadowColor: "#1c1712",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8.0,
    elevation: 4,
  },
  lg: {
    shadowColor: "#caa56d",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15.0,
    elevation: 8,
  },
  premium: {
    shadowColor: "#1c1712",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.05,
    shadowRadius: 25.0,
    elevation: 12,
  },
};
