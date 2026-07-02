# ==============================================================
# STAGE 1: Build dependencies (native C++ compilation for argon2)
# ==============================================================
FROM node:22-alpine AS deps

RUN apk add --no-cache python3 make g++ && \
    corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# --allow-build=argon2: pnpm v10 bloquea postinstall scripts por defecto,
#                       argon2 necesita compilar C++ nativo para el binding.
# --no-frozen-lockfile: evita errores por discrepancias de lockfile entre
#                       entornos Windows/Linux.
RUN pnpm install --prod --no-frozen-lockfile --allow-build=argon2 && \
    pnpm store prune

# ==============================================================
# STAGE 2: Minimal production runtime
# ==============================================================
FROM node:22-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser appgroup

COPY --from=deps --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --chown=appuser:appgroup . .

USER appuser

EXPOSE 3006

ENV NODE_ENV=production \
    NODE_OPTIONS="--max-old-space-size=384"

CMD ["node", "index.js"]
