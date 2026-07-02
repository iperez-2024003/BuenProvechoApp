# ==============================================================
# STAGE 1: Build dependencies (native C++ compilation for argon2)
# ==============================================================
FROM node:22-alpine AS deps

RUN apk add --no-cache python3 make g++ && \
    corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# PNPM_ONLY_BUILT_DEPENDENCIES: variable de entorno nativa de pnpm v10.
# Autoriza únicamente a argon2 a ejecutar su postinstall (compilar
# binding C++). No depende de .npmrc, CLI flags ni comandos interactivos.
ENV PNPM_ONLY_BUILT_DEPENDENCIES=argon2

RUN pnpm install --prod --no-frozen-lockfile && \
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
