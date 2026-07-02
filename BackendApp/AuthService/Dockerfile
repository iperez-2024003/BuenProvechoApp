# ==============================================================
# STAGE 1: Install production dependencies + build native modules
# ==============================================================
FROM node:22-alpine AS deps

RUN apk add --no-cache python3 make g++ && \
    corepack enable

WORKDIR /app

COPY package.json ./

# Open Code: Forzamos la instalación limpia ignorando bloqueos de Git index
RUN pnpm install --prod --no-frozen-lockfile

# ==============================================================
# STAGE 2: Minimal production runtime
# ==============================================================
FROM node:22-alpine AS runner

WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser appgroup

# Copy production node_modules from builder stage
COPY --from=deps --chown=appuser:appgroup /app/node_modules ./node_modules

# Copy application source
COPY --chown=appuser:appgroup . .

# Switch to non-root user
USER appuser

EXPOSE 3006

ENV NODE_ENV=production

CMD ["node", "index.js"]