# Stage 1: Build
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# 1. Copia i file di configurazione della ROOT (Blueprint)
COPY .yarnrc.yml ./
COPY .yarn ./.yarn
COPY yarn.lock ./
COPY package.json ./
COPY tsconfig.base.json ./

# 2. Copia i package.json per la risoluzione dei workspace (Prima della install!)
COPY apps/backend/import-service/package.json ./apps/backend/import-service/
COPY libs/contracts/package.json ./libs/contracts/
COPY libs/common/package.json ./libs/common/
COPY libs/communication/package.json ./libs/communication/

# 3. Installazione dipendenze (Layer pesante, protetto da cache)
RUN yarn install --inline-builds

# 4. Copia i sorgenti delle librerie e buildale (Risolve TS2307 e logRequest)
COPY libs/ ./libs
RUN yarn workspace @dike/common build || true
RUN yarn workspace @dike/communication build || true
RUN yarn workspace @dike/contracts build || true

# 5. Copia i sorgenti del servizio e builda
COPY apps/backend/import-service ./apps/backend/import-service
RUN yarn workspace @dike/import-service build

# Stage 2: Runtime (Immagine snella per la produzione)
FROM node:22-alpine
WORKDIR /app

# Copiamo solo il necessario per l'esecuzione
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copiamo le dist delle libs (indispensabili per i riferimenti incrociati)
COPY --from=builder /app/libs/common/dist ./libs/common/dist
COPY --from=builder /app/libs/communication/dist ./libs/communication/dist
COPY --from=builder /app/libs/contracts/dist ./libs/contracts/dist

# Copiamo la dist del servizio direttamente in root/dist
COPY --from=builder /app/apps/backend/import-service/dist ./dist

EXPOSE 8005

# Avvio pulito: punta alla dist nella root dello Stage 2
CMD ["node", "dist/main"]