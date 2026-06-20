export const COLORS = {
  // Brand Colors
  primary: "#E25C3D",        // Terracota cálido (gastronómico/marca)
  primaryDark: "#C44528",    // Terracota oscuro para estados activos
  secondary: "#1A2530",      // Slate oscuro para headers/destacados
  accent: "#FBBF24",         // Amarillo/Dorado para valoraciones/estrellas

  // Neutral Colors
  background: "#FDFDFD",     // Blanco roto limpio para el fondo general
  surface: "#FFFFFF",        // Blanco puro para tarjetas y contenedores
  border: "#EAEAEF",         // Gris claro sutil para divisiones limpias

  // Text Colors
  text: "#1F2937",           // Slate 800 principal para legibilidad óptima
  textLight: "#6B7280",      // Gris 500 para descripciones secundarias
  textMuted: "#9CA3AF",      // Gris 400 para placeholders

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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2.0,
    elevation: 2,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6.0,
    elevation: 4,
  },
};
