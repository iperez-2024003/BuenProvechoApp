# 🍽️ BuenProvecho — Plataforma Integral de Gestión Gastronómica

**BuenProvecho** es un ecosistema Full-Stack diseñado para transformar la operación de restaurantes. Conecta a dueños, gerentes, personal y comensales en tiempo real a través de una interfaz premium y una API robusta basada en microservicios.

---

## 🏗️ Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Arquitectura** | Microservicios Autónomos (x4) |
| **Runtime** | Node.js v24 + ES Modules |
| **Framework Backend** | Express.js |
| **ORM / ODM** | Sequelize 6 / Mongoose 8 |
| **Bases de Datos** | PostgreSQL (Auth) & MongoDB (Negocio) |
| **Autenticación** | JWT + Refresh Tokens rotados |
| **Tiempo Real** | Socket.io (PedidosService) |
| **Storage** | Cloudinary |
| **Email** | Nodemailer |
| **Frontend** | React 18 + Vite |
| **Estado Global** | Zustand |
| **Orquestación** | Scripts Node personalizados |

---

## ✨ Mejoras recientes

- **Arquitectura Frontend Nivel Senior**: Implementación de Code Splitting (`React.lazy`), `<Suspense>` y `React.memo` para optimizar tiempos de carga y evitar re-renders.
- **Validaciones Robustas y Custom Hooks**: Formularios protegidos con validación estricta en tiempo real mediante `useFormValidation` y optimización de búsquedas con `useDebounce`.
- **UI/UX y Responsividad Premium**: Dashboards administrativos adaptables a cualquier dispositivo móvil de forma fluida.
- Refresh tokens persistidos en PostgreSQL, con rotación y revocación.
- Detección de reutilización de refresh token para cerrar sesiones comprometidas.
- Cookie `HttpOnly` para la sesión extendida.
- Decremento atómico de stock para evitar sobreventa.
- Validación de scope por restaurante para staff y gerentes.
- Smoke tests para validar login, roles, reportes y analíticas.

---

## 🚀 Instalación y Arranque

### 🏗️ Arquitectura de Microservicios

El sistema está dividido en 4 servicios independientes:

| Servicio | Puerto | Base Path | Responsabilidad |
|---|---|---|---|
| **AuthService** | `3006` | `/api/v1` | Usuarios, Roles, Staff y Seguridad |
| **RestaurantesService** | `3007` | `/api/v1` | Sedes, Menús, Mesas y Reseñas |
| **PedidosService** | `3008` | `/api/v1` | Órdenes, Reservas y Sockets (Real-time) |
| **EventosService** | `3009` | `/api/v1` | Eventos, Estadísticas y Reportes |

### 🛠️ Instalación y Arranque

#### Prerrequisitos
- Node.js 20+
- pnpm
- PostgreSQL & MongoDB (Locales o Docker)

#### Instalación Automática
Hemos centralizado la instalación de dependencias de todos los servicios:
```bash
# En la raíz del proyecto
pnpm install
pnpm run install:services
```

#### Ejecución en Desarrollo

##### Opción 1: Arranque Rápido (Recomendado para desarrollo)
Inicia todos los microservicios simultáneamente con un solo comando:
```bash
# En la raíz, inicia los 4 servicios backend
pnpm run dev

# En otra terminal, inicia el frontend
cd frontend
pnpm run dev
```

##### Opción 2: Microservicios en Terminales Separadas (Recomendado para producción/revisión)
Ejecuta cada servicio en su propia terminal para visualizar procesos independientes:

**Terminal 1 — AuthService (Puerto 3006)**
```bash
cd AuthService
pnpm install  # Solo la primera vez
pnpm run dev
```

**Terminal 2 — RestaurantesService (Puerto 3007)**
```bash
cd RestaurantesService
pnpm install  # Solo la primera vez
pnpm run dev
```

**Terminal 3 — PedidosReservacionesService (Puerto 3008)**
```bash
cd PedidosReservacionesService
pnpm install  # Solo la primera vez
pnpm run dev
```

**Terminal 4 — EventosReportesService (Puerto 3009)**
```bash
cd EventosReportesService
pnpm install  # Solo la primera vez
pnpm run dev
```

**Terminal 5 — Frontend (Puerto 5173)**
```bash
cd frontend
pnpm install  # Solo la primera vez
pnpm run dev
```

#### Scripts por Servicio
Si prefieres ejecutar un servicio específico desde la raíz:
```bash
pnpm run dev:auth        # AuthService
pnpm run dev:restaurantes # RestaurantesService
pnpm run dev:pedidos     # PedidosReservacionesService
pnpm run dev:eventos     # EventosReportesService
pnpm run dev:frontend    # Frontend
```

### Variables de entorno
Configura tu archivo `.env` con las siguientes claves:
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` — PostgreSQL
- `MONGODB_URI` — MongoDB
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `EMAIL_USER`, `EMAIL_PASS`
- `JWT_SECRET`
- `JWT_REFRESH_EXPIRES_IN` — expiración del refresh token

---

## 🔑 Credenciales por Defecto

Estas cuentas se sincronizan automáticamente al iniciar el servidor:

| Rol | Usuario / Email | Contraseña |
|---|---|---|
| Super Admin | `admin` / `admin@restaurantes.com` | `Admin123!` |
| Gerente | `gerente` / `gerente@kinal.com` | `Admin123!` |
| Staff | `staff` / `staff@kinal.com` | `Admin123!` |

---

## 🛡️ Roles y Permisos

El sistema trabaja con 4 roles conectados entre backend y frontend. La separación real de responsabilidades se apoya en `validateJWT` y en los middlewares de `helpers/require-role.js`.

| Rol | Qué hace | Cómo entra en la app |
|---|---|---|
| `SUPER_ADMIN_ROLE` | Administra toda la plataforma: restaurantes, usuarios, verificación, estadísticas globales | Entra al panel global del dashboard |
| `RESTAURANT_ADMIN_ROLE` | Administra una sede específica: menú, mesas, staff, órdenes, eventos y reportes | El frontend lo lleva directo a su `restaurantId` |
| `STAFF_ROLE` | Opera la sede asignada: cocina, órdenes y mesas | El frontend también lo dirige a su `restaurantId` |
| `CLIENT_ROLE` | Consume la experiencia: menú público, pedidos, historial, reseñas y eventos | Entra al dashboard de cliente o al menú público |

### Flujo de conexión

1. El usuario inicia sesión por `/auth/login`.
2. El backend valida credenciales y devuelve el perfil con el rol principal.
3. El frontend guarda el rol y, cuando aplica, el `restaurantId`.
4. El router del frontend redirige según el rol:
	- `CLIENT_ROLE` va al dashboard cliente.
	- `RESTAURANT_ADMIN_ROLE` y `STAFF_ROLE` van directo al restaurante asociado.
	- `SUPER_ADMIN_ROLE` entra al panel global.
5. El backend bloquea rutas sensibles con `requireRole`, evitando acceso fuera de permiso.

---

## 📡 API — Endpoints por Servicio

### 🔑 AuthService (`:3006`)
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/auth/login` | Login universal |
| POST | `/auth/register` | Registro de clientes |
| POST | `/auth/refresh` | Intercambio de refresh token por access token |
| POST | `/auth/revoke` | Revocación de refresh token |
| GET | `/restaurants/:id/staff` | Gestión de personal por sede |

### 🍴 RestaurantesService (`:3007`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/restaurants` | Listado público |
| POST | `/restaurants` | Alta de sedes (Super Admin) |
| GET | `/menus` | Gestión de platillos |

### 📦 PedidosReservacionesService (`:3008`)
| Método | Ruta | Descripción |
|---|---|---|
| POST | `/orders` | Creación de pedidos |
| GET | `/socket.io` | Conexión para KDS (Monitor de Cocina) |

### 📊 EventosReportesService (`:3009`)
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/statistics/restaurant/:id/overview` | Dashboard de analíticas |
| GET | `/statistics/global/overview` | Resumen para Super Admin |
| GET | `/statistics/restaurant/:id/export-excel` | Exportación de Excel por sede |
| GET | `/reports/daily-summary/:restaurantId` | Resumen diario por correo/JSON |
| GET | `/reports/daily-excel/:restaurantId` | Excel diario descargable |

---

## 🌊 Flujo de Trabajo Completo

### 1. Super Admin
1. Inicia sesión.
2. Crea o verifica restaurantes.
3. Asigna gerentes.
4. Revisa estadísticas globales y usuarios.

### 2. Gerente de Sede
1. Entra a su restaurante.
2. Configura menú, mesas y eventos.
3. Da de alta staff.
4. Consulta analíticas y reportes.

### 3. Staff / Mesero
1. Entra la sede asignada.
2. Atiende órdenes y cocina.
3. Gestiona mesas y reservaciones.
4. Opera solo dentro de su restaurante.

### 4. Cliente
1. Entra al menú público o inicia sesión.
2. Explora restaurantes y platillos.
3. Hace pedidos o reservaciones.
4. Revisa historial, reseñas y eventos.

---

## 📦 Estructura del Proyecto


## ✅ Estado actual

- Autenticación multi-rol con roles y scopes.
- Arquitectura de 4 microservicios con frontend React.
- KDS por sockets para órdenes de cocina.
- Exportación de Excel y analíticas.
- Refresh tokens y pruebas de humo para validar el flujo.
---

## 🔧 Notas Técnicas Importantes

> [!IMPORTANT]
> **Borrado en Cascada:** Al eliminar un restaurante, el sistema elimina físicamente todos los registros asociados en MongoDB y destruye los assets (imágenes) en Cloudinary.

> [!TIP]
> **WebSockets:** El monitor de cocina utiliza `Socket.io` sobre un servidor HTTP unificado para garantizar baja latencia en las notificaciones de nuevos pedidos.

---

## 🗺️ Roadmap

- [x] Autenticación multi-rol (Descentralizada)
- [x] Arquitectura de 4 Microservicios Autónomos
- [x] Sincronización de Sockets en PedidosService
- [x] Scripts de orquestación (pnpm run dev)
- [x] Exportación a Excel y analíticas
- [x] Diseño Premium y Responsividad Completa (Frontend UI)
- [ ] Pasarela de pagos (Stripe)
- [ ] Notificaciones push PWA

---

**BuenProvecho** — *Llevando la ingeniería de software a la mesa.*
