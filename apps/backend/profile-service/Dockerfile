# Stage 1: Build
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# 1. Configurazione ROOT (Blueprint)
COPY .yarnrc.yml yarn.lock package.json tsconfig.base.json ./
COPY .yarn ./.yarn

# 2. Workspace Check (Importante: copiamo il package.json prima dell'install)
COPY apps/backend/profile-service/package.json ./apps/backend/profile-service/
COPY libs/contracts/package.json ./libs/contracts/
COPY libs/common/package.json ./libs/common/
COPY libs/communication/package.json ./libs/communication/

# 3. Installazione dipendenze (Layer protetto da cache)
RUN --mount=type=cache,target=/root/.yarn/berry/cache,id=yarn_cache \
    yarn install --inline-builds

# 4. Copia sorgenti e build delle librerie (Risolve TS2307)
COPY libs/ ./libs
RUN yarn workspace @dike/common build || true
RUN yarn workspace @dike/communication build || true
RUN yarn workspace @dike/contracts build || true

# 5. Build del servizio specifico
COPY apps/backend/profile-service ./apps/backend/profile-service
RUN yarn workspace @dike/profile-service build

# Stage 2: Runtime (Pronto per la VPS)
FROM node:22-alpine
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Copia configurazione Yarn e dipendenze
COPY --from=builder /app/.yarnrc.yml ./
COPY --from=builder /app/.yarn ./.yarn
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.pnp.* ./

# Copia package.json dei workspace necessari
COPY --from=builder /app/apps/backend/profile-service/package.json ./apps/backend/profile-service/
COPY --from=builder /app/libs/common/package.json ./libs/common/
COPY --from=builder /app/libs/communication/package.json ./libs/communication/
COPY --from=builder /app/libs/contracts/package.json ./libs/contracts/

# Copiamo le dist delle libs (indispensabili)
COPY --from=builder /app/libs/common/dist ./libs/common/dist
COPY --from=builder /app/libs/communication/dist ./libs/communication/dist
COPY --from=builder /app/libs/contracts/dist ./libs/contracts/dist

# Copiamo la dist del servizio direttamente in root/dist
COPY --from=builder /app/apps/backend/profile-service/dist ./dist

EXPOSE 8002

# Avvio con Yarn (necessario per PnP)
CMD ["yarn", "node", "dist/main"]