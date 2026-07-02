# ==============================================================
# STAGE 1: Build dependencies (native C++ compilation for argon2)
# ==============================================================
FROM node:22-alpine AS deps

RUN apk add --no-cache python3 make g++ && \
    corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# .npmrc con sufijo [] para que pnpm v11 interprete
# only-built-dependencies como array y autorice el postinstall
# de argon2 (compilación nativa C++).
RUN echo 'only-built-dependencies[]=argon2' > .npmrc && \
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
