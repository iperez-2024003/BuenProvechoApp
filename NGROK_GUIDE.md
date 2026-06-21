# Guía Rápida de Comandos para Ngrok

## Configuración de Túneles Públicos Seguros para Backend

### Paso 1: Iniciar túnel de ngrok para AuthService (Puerto 3006)

Abre una terminal y ejecuta:
```bash
ngrok http 3006
```

### Paso 2: Iniciar túnel de ngrok para RestaurantesService (Puerto 3007)

Abre una segunda terminal y ejecuta:
```bash
ngrok http 3007
```

### Paso 3: Copiar las URLs HTTPS generadas

ngrok mostrará URLs públicas similares a:
```
Terminal 1 (AuthService):
Forwarding  https://abc123.ngrok-free.app -> http://localhost:3006

Terminal 2 (RestaurantesService):
Forwarding  https://def456.ngrok-free.app -> http://localhost:3007
```

Copia las URLs HTTPS de ambos túneles

### Paso 4: Actualizar el archivo .env

Edita `FrontendApp/.env` con las URLs de ngrok:
```env
EXPO_PUBLIC_AUTH_URL=https://abc123.ngrok-free.app/api/v1/auth
EXPO_PUBLIC_RESTAURANT_URL=https://def456.ngrok-free.app/api/v1/restaurants
EXPO_PUBLIC_ORDER_URL=http://localhost:3008/api/v1/orders
EXPO_PUBLIC_REPORT_URL=http://localhost:3009/api/v1/stats
```

### Paso 5: Iniciar Metro Bundler en modo túnel

```bash
cd FrontendApp
pnpm start --clear
```

### Paso 6: Escanear QR y probar

- Escanea el código QR con Expo Go en tu teléfono
- La app se cargará desde internet (modo túnel)
- Las peticiones de autenticación y restaurantes irán a través de túneles HTTPS seguros de ngrok
- Los demás servicios usarán localhost temporalmente

## Comandos Adicionales

### Verificar que los servicios estén corriendo
```bash
netstat -ano | findstr ":3006"
netstat -ano | findstr ":3007"
```

### Probar los túneles desde navegador
Abre en navegador:
- `https://TU_TUNEL_AUTH.ngrok-free.app/api/v1/auth/health`
- `https://TU_TUNEL_RESTAURANT.ngrok-free.app/api/v1/restaurants`

### Detener túneles ngrok
Presiona `Ctrl+C` en cada terminal de ngrok

## Ventajas de esta Configuración

- ✅ HTTPS automático con certificados SSL de ngrok
- ✅ Cumple con políticas de seguridad de Expo SDK 55
- ✅ Acceso desde cualquier red (laboratorios, trabajo, compañeros)
- ✅ Evita restricciones de firewall/router local
- ✅ Simula entorno de producción real
