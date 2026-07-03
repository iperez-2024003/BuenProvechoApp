'**Refresh Tokens — AuthService**'

- **Resumen:** Implementación de refresh tokens con persistencia en PostgreSQL. Soporta rotación: al usar `/auth/refresh` el refresh token recibido se revoca y se emite uno nuevo.

- **Modelo:** `refresh_tokens` (ver `src/auth/refresh-token.model.js`) con campos: `id`, `token`, `user_id`, `expires_at`, `revoked`, `created_at`.

- **Endpoints:**

- **POST /api/v1/auth/refresh**
  - Propósito: intercambiar un refresh token válido por un nuevo access token (y rotar el refresh token).
  - Autenticación: NO requiere `Authorization` (acepta `x-refresh-token` o body `{ "refreshToken": "..." }`).
  - Request headers: `Content-Type: application/json` y opcional `x-refresh-token: <token>`.
  - Request body (ejemplo):
    ```json
    { "refreshToken": "<token>" }
    ```
  - Responses:
    - 200 OK: `{ "success": true, "token": "<newAccessToken>", "refreshToken": "<newRefreshToken>", "refreshExpiresAt": "<iso>" }`
    - 400 Bad Request: falta `refreshToken`
    - 401 Unauthorized: token inválido/expirado/revocado
    - 404 Not Found: usuario no encontrado (casos raros)
  - Comportamiento: valida y revoca el refresh token usado, emite un nuevo refresh token y devuelve el nuevo access token.

- **POST /api/v1/auth/revoke**
  - Propósito: revocar un refresh token específico (logout server-side).
  - Autenticación: requiere `Authorization: Bearer <accessToken>` (se valida JWT y permisos).
  - Request body (ejemplo):
    ```json
    { "refreshToken": "<token>" }
    ```
  - Responses:
    - 200 OK: `{ "success": true, "message": "Refresh token revocado" }`
    - 400 Bad Request: falta `refreshToken`
    - 404 Not Found: token no encontrado

- **Recomendaciones de seguridad:**
  - Almacenar el `refreshToken` en cookie `HttpOnly` con `Secure` y `SameSite=Strict` cuando sea posible.
  - Implementar detección de reuse (no implementado aquí) para identificar tokens robados.
  - Mantener `refreshExpiresIn` razonable (p. ej. 7d) y soporte de revocación masiva por usuario.

- **Pruebas manuales / smoke-test:**
  - Archivo de test rápido: `scripts/smoke-refresh.js` (usa `AUTH_TEST_USER` y `AUTH_TEST_PASS`).
  - Ejecutar (PowerShell):
    ```powershell
    $env:AUTH_TEST_USER='test@ejemplo.com'; $env:AUTH_TEST_PASS='TestPass123!'; node .\scripts\smoke-refresh.js
    ```
  - Ejecutar (bash):
    ```bash
    AUTH_TEST_USER=test@ejemplo.com AUTH_TEST_PASS='TestPass123!' node ./scripts/smoke-refresh.js
    ```

- **Notas de integración:**
  - `login` ahora retorna `refreshToken` y `refreshExpiresAt` junto con el access token (`helpers/auth-operations.js`).
  - Middleware de validación: `middlewares/refresh-token.js` valida `refreshToken` antes de llegar al controlador.
  - Si necesitas tests automáticos o CI, puedo añadir un job que ejecute `node ./scripts/smoke-refresh.js` con credenciales de prueba en variables de entorno.
