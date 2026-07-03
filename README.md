# 🍽️ BuenProvecho — Gestión Inteligente de Restaurantes

**BuenProvecho** es una plataforma integral de gestión gastronómica que unifica la operación de restaurantes, pedidos, reservaciones, eventos y un sistema de lealtad (puntos + cupones) en una sola experiencia móvil y backend modular.

---

## ✦ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Frontend Móvil** | React Native 0.83 + Expo SDK 55 |
| **Navegación** | React Navigation 7 (Stack + Bottom Tabs) |
| **Estado** | Zustand 5 |
| **Iconos** | Lucide React Native + Ionicons |
| **Fuente** | Outfit (Bold 700, Black 900) |
| **Backend** | Node.js + Express |
| **ORM** | Sequelize (PostgreSQL — AuthService) |
| **ODM** | Mongoose 8 (MongoDB — servicios restantes) |
| **Autenticación** | JWT (access + refresh tokens) |
| **HTTP Client** | Axios (frontend) / fetch nativo (backend cross-service) |
| **Almacenamiento** | AsyncStorage (sesión), PostgreSQL (usuarios), MongoDB (restaurantes, pedidos, eventos, lealtad) |

---

## ✦ Arquitectura

```
┌─────────────────────────────────────────────────────┐
│                   Frontend App                       │
│              (React Native / Expo)                   │
├─────────────────────────────────────────────────────┤
│                     Axios                             │
│        ┌──────────┬──────────┬──────────┐            │
│        ▼          ▼          ▼          ▼            │
│   Auth      Rest.    Pedidos   Eventos               │
│   :3006     :3007    :3008     :3009                 │
│                                                     │
│   Auth ─── llama a AuthService (PostgreSQL)          │
│   Eventos ─── llama a AuthService vía HTTP          │
│   (para descontar puntos al canjear)                │
└─────────────────────────────────────────────────────┘
```

Los microservicios se comunican por **HTTP/REST** sincrónico:
- El frontend habla con cada servicio vía Axios con JWT en el header `Authorization`
- `EventosReportesService` (puerto 3009) llama a `AuthService` (puerto 3006) para operaciones de saldo de puntos
- Cada servicio tiene su propia base de datos y esquema

---

## ✦ Guía de Instalación

### Requisitos

- Node.js 18+
- pnpm 9+
- PostgreSQL 14+ (AuthService)
- MongoDB 7+ (resto de servicios)
- Expo CLI (`npm install -g expo-cli`)
- Android Studio / Xcode (para emulador)

### Backend

```bash
# 1. Autenticación (PostgreSQL)
cd BackendApp/AuthService
pnpm install
# Configurar BackendApp/AuthService/.env (DB, JWT_SECRET, etc.)
pnpm start        # http://localhost:3006

# 2. Restaurantes (MongoDB)
cd BackendApp/RestaurantesService
pnpm install
pnpm start        # http://localhost:3007

# 3. Pedidos y Reservaciones
cd BackendApp/PedidosReservacionesService
pnpm install
pnpm start        # http://localhost:3008

# 4. Eventos, Reportes y Lealtad
cd BackendApp/EventosReportesService
pnpm install
pnpm start        # http://localhost:3009
```

### Frontend

```bash
cd FrontendApp
pnpm install
pnpm start    # Escanea QR con Expo Go o presiona 'a' para Android
```

---

## ✦ Flujo de Características

### 🔐 Autenticación
- Registro con verificación por email
- Login con JWT (access token + refresh token rotativo)
- Recuperación de contraseña por email
- Detección de cuentas no verificadas con mensaje claro al usuario

### 🛒 Pedidos y Reservaciones
- Creación de pedidos con carrito modal
- Validación de stock en tiempo real
- Reservaciones con verificación de disponibilidad
- Historial de pedidos por usuario

### 🎟️ Eventos
- Catálogo de eventos con filtros por tipo
- Registro de participantes con cupo máximo
- Sincronización con restaurantes

### ⭐ Puntos y Lealtad
- Los usuarios acumulan puntos al realizar pedidos
- Catálogo de recompensas (`Descuento Q10`, `Descuento Q20`, `Descuento Q40`)
- **Canje**: el frontend envía `{ cost, prize_name }` → EventosReportesService → AuthService descuenta puntos → se genera cupón `BP-VIP-XXXX` en MongoDB con `used: false`
- **Historial**: cada canje crea automáticamente un registro `PointTransaction` (`type: 'redeemed'`)
- **Validación**: endpoint `POST /coupons/validate` que verifica pertenencia y marca `used: true` — un cupón solo funciona una vez
- **Degradación gradual**: si el servicio de lealtad falla, la UI muestra "Información no disponible" con botón Reintentar, sin bloquear el perfil

### 🧭 Notificaciones UX
- Sistema de Toast global (success / error / info) con auto-dismiss
- Todos los errores técnicos se traducen a mensajes humanos
- Sin códigos de error visibles para el usuario final

---

## ✦ Licencia

Proyecto académico — **Gastronomía & Tecnología**
