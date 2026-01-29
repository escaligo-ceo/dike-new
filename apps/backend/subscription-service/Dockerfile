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

# 2. Copia i package.json per la risoluzione dei workspace
COPY libs/contracts/package.json ./libs/contracts/
COPY libs/common/package.json ./libs/common/
COPY libs/communication/package.json ./libs/communication/
COPY libs/internal/package.json ./libs/internal/
COPY apps/backend/subscription-service/package.json ./apps/backend/subscription-service/

# 3. Installazione dipendenze
RUN yarn install --inline-builds

# 4. Sorgenti e Build delle librerie (Risolve TS2307 e logRequest)
COPY libs/ ./libs/
RUN yarn workspace @dike/common build || true
RUN yarn workspace @dike/communication build || true
RUN yarn workspace @dike/contracts build || true

# 5. Build del servizio specifico
COPY apps/backend/subscription-service ./apps/backend/subscription-service
RUN yarn workspace @dike/subscription-service build

# Stage 2: Runtime
FROM node:22-alpine
WORKDIR /app

# 6. Copia solo il necessario (Software della Madonna style)
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/libs/common/dist ./libs/common/dist
COPY --from=builder /app/libs/communication/dist ./libs/communication/dist
COPY --from=builder /app/libs/contracts/dist ./libs/contracts/dist
# Copiamo la dist nella root dello stage 2 per semplicità
COPY --from=builder /app/apps/backend/subscription-service/dist ./dist

EXPOSE 8004
CMD ["node", "dist/main"]