# Stage 1: Build
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Riferimenti alla root (Context di build deve essere la root del monorepo)
COPY .yarnrc.yml ./
COPY .yarn ./.yarn
COPY yarn.lock ./
COPY package.json ./
COPY tsconfig.base.json ./

# 1. Copia i package.json per la risoluzione dei workspace
COPY apps/backend/auth-service/package.json ./apps/backend/auth-service/
COPY libs/contracts/package.json ./libs/contracts/
COPY libs/common/package.json ./libs/common/
COPY libs/communication/package.json ./libs/communication/

# 2. Installazione dipendenze (Layer protetto da cache)
RUN yarn install --inline-builds

# 3. Copia sorgenti e build
COPY libs/ ./libs
RUN yarn workspace @dike/common build || true
RUN yarn workspace @dike/communication build || true
RUN yarn workspace @dike/contracts build || true

COPY apps/backend/auth-service ./apps/backend/auth-service
RUN yarn workspace @dike/auth-service build

# Stage 2: Runtime (Immagine Snella)
FROM node:22-alpine
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Copiamo solo il necessario per l'esecuzione
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
# Copia le libs buildate (indispensabili per l'importazione a runtime)
COPY --from=builder /app/libs/common/dist ./libs/common/dist
COPY --from=builder /app/libs/communication/dist ./libs/communication/dist
COPY --from=builder /app/libs/contracts/dist ./libs/contracts/dist
# Copia il servizio buildato
COPY --from=builder /app/apps/backend/auth-service/dist ./dist

EXPOSE 8000

# Avvio diretto dalla dist (pulito ed efficiente)
CMD ["node", "dist/main"]