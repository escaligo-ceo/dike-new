# Stage 1: Build
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Riferimenti relativi alla ROOT del monorepo (Lanciare build da root!)
COPY .yarnrc.yml ./
COPY .yarn ./.yarn
COPY yarn.lock ./
COPY package.json ./
COPY tsconfig.base.json ./

# Copia libs e lo specifico servizio
COPY libs/ ./libs
COPY apps/backend/notification-service ./apps/backend/notification-service

RUN yarn install --inline-builds
RUN yarn workspace @dike/notification-service build

# Stage 2: Runtime
FROM node:22-alpine
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Copia selettiva per la VPS (Leggera e sicura)
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/libs ./libs
COPY --from=builder /app/apps/backend/notification-service/dist ./apps/backend/notification-service/dist

EXPOSE 8003

# FIX: Ora punta correttamente al notification-service
CMD ["node", "apps/backend/notification-service/dist/main"]