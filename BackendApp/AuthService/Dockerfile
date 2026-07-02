# ==============================================================
# STAGE 1: Build dependencies (native C++ compilation for argon2)
# ==============================================================
FROM node:22-alpine AS deps

RUN apk add --no-cache python3 make g++ && \
    corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# pnpm-workspace.yaml con allowBuilds reemplaza a .npmrc y a
# package.json#pnpm — pnpm v11 solo lee settings de workspace.
# Autoriza el postinstall de argon2 (compilación nativa C++).
RUN echo "allowBuilds:" > pnpm-workspace.yaml && \
    echo "  argon2: true" >> pnpm-workspace.yaml && \
    pnpm install --prod --no-frozen-lockfile && \
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
