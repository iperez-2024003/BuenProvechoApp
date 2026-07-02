# ==============================================================
# STAGE 1: Build dependencies (native C++ compilation for argon2)
# ==============================================================
FROM node:22-alpine AS deps

RUN apk add --no-cache python3 make g++ && \
    corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# Inyecta pnpm.onlyBuiltDependencies en package.json usando el
# propio Node.js (sin instalar jq ni otras herramientas). Es la
# única forma que pnpm v10 acepta en CI/CD para autorizar scripts
# de compilación nativa — package.json > .npmrc > env vars.
RUN node -e "const fs=require('fs');const p=JSON.parse(fs.readFileSync('package.json','utf8'));p.pnpm={onlyBuiltDependencies:['argon2']};fs.writeFileSync('package.json',JSON.stringify(p,null,2))" && \
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
