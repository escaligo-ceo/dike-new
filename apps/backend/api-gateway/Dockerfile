# Stage 1: Build
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# 1. Basi del monorepo
COPY .yarnrc.yml ./
COPY .yarn ./.yarn
COPY yarn.lock ./
COPY package.json ./
COPY tsconfig.base.json ./

# 2. Copia SOLO i package.json (fondamentale per la cache di Docker)
COPY apps/backend/api-gateway/package.json ./apps/backend/api-gateway/
COPY libs/contracts/package.json ./libs/contracts/
COPY libs/common/package.json ./libs/common/
COPY libs/communication/package.json ./libs/communication/
# Aggiungi qui anche internal se è una dipendenza
# COPY libs/internal/package.json ./libs/internal/

# 3. Installazione dipendenze
RUN yarn install --inline-builds

# 4. Copia i sorgenti (solo ora!)
COPY libs/ ./libs
COPY apps/backend/api-gateway ./apps/backend/api-gateway

# 5. Build delle librerie e del servizio
RUN yarn workspace @dike/common build || true
RUN yarn workspace @dike/communication build || true
RUN yarn workspace @dike/contracts build || true
RUN yarn workspace @dike/api-gateway build

# Stage 2: Runtime
FROM node:22-alpine
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Immagine pulita per la VPS estone
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
# Copia le dist delle libs (necessarie se i servizi le caricano a runtime)
COPY --from=builder /app/libs/common/dist ./libs/common/dist
COPY --from=builder /app/libs/communication/dist ./libs/communication/dist
COPY --from=builder /app/libs/contracts/dist ./libs/contracts/dist
# Copia la dist del gateway
COPY --from=builder /app/apps/backend/api-gateway/dist ./dist

EXPOSE 3000

# Avvio diretto dalla dist copiata nella root dello Stage 2
CMD ["node", "dist/main"]