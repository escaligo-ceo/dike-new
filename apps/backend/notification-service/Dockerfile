# Stage 1: Build
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# 1. Metadati della ROOT (Context: monorepo root)
COPY .yarnrc.yml yarn.lock package.json tsconfig.base.json ./
COPY .yarn ./.yarn

# 2. Workspace Check (Fondamentale per Yarn Berry)
COPY libs/contracts/package.json ./libs/contracts/
COPY libs/common/package.json ./libs/common/
COPY libs/communication/package.json ./libs/communication/
COPY apps/backend/notification-service/package.json ./apps/backend/notification-service/

# 3. Installazione (Sfrutta la cache se il codice cambia ma le dipendenze no)
RUN --mount=type=cache,target=/root/.yarn/berry/cache,id=yarn_cache \
    yarn install --inline-builds

# 4. Sorgenti e Build delle librerie (Risolve TS2307)
COPY libs/ ./libs
RUN yarn workspace @dike/common build || true
RUN yarn workspace @dike/communication build || true
RUN yarn workspace @dike/contracts build || true

# 5. Build del servizio specifico
COPY apps/backend/notification-service ./apps/backend/notification-service
RUN yarn workspace @dike/notification-service build

# Stage 2: Runtime (Estonia-ready)
FROM node:22-alpine
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Copiamo solo i binari e le dipendenze, niente sorgenti .ts sulla VPS
COPY --from=builder /app/.yarnrc.yml ./
COPY --from=builder /app/.yarn ./.yarn
COPY --from=builder /app/yarn.lock ./
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.pnp.* ./

# Copia package.json dei workspace necessari
COPY --from=builder /app/libs/contracts/package.json ./libs/contracts/
COPY --from=builder /app/libs/common/package.json ./libs/common/
COPY --from=builder /app/libs/communication/package.json ./libs/communication/
COPY --from=builder /app/apps/backend/notification-service/package.json ./apps/backend/notification-service/

# Copiamo le dist delle libs (necessarie per l'importazione a runtime)
COPY --from=builder /app/libs/common/dist ./libs/common/dist
COPY --from=builder /app/libs/communication/dist ./libs/communication/dist
COPY --from=builder /app/libs/contracts/dist ./libs/contracts/dist

# Copiamo la dist del servizio
COPY --from=builder /app/apps/backend/notification-service/dist ./dist

EXPOSE 8003

# Avvio pulito ed efficiente
CMD ["yarn", "node", "dist/main"]