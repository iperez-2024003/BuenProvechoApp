FROM node:22-alpine AS deps

RUN corepack enable

WORKDIR /app

COPY package.json ./

RUN pnpm install --prod --frozen-lockfile

FROM node:22-alpine AS runner

WORKDIR /app

RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser appgroup

COPY --from=deps --chown=appuser:appgroup /app/node_modules ./node_modules

COPY --chown=appuser:appgroup . .

USER appuser

EXPOSE 3007

ENV NODE_ENV=production

CMD ["node", "index.js"]
