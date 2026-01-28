# Stage 1: Build
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Ora puntiamo alla ROOT del monorepo (dove stanno i file di configurazione)
COPY .yarnrc.yml ./
COPY .yarn ./.yarn
COPY yarn.lock ./
COPY package.json ./
COPY tsconfig.base.json ./

# Carichiamo le librerie comuni e il servizio specifico
COPY libs/ ./libs
COPY apps/backend/import-service ./apps/backend/import-service

RUN yarn install --inline-builds
RUN yarn workspace @dike/import-service build

# Stage 2: Runtime
FROM node:22-alpine
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Copia selettiva: manteniamo l'immagine snella per la VPS estone
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/libs ./libs
COPY --from=builder /app/apps/backend/import-service/dist ./apps/backend/import-service/dist

EXPOSE 8005
CMD ["node", "apps/backend/import-service/dist/main"]