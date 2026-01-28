# Stage 1: Build
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Copia i file dalla ROOT (Assicurati che il context nel compose sia '.')
COPY .yarnrc.yml yarn.lock package.json tsconfig.base.json ./
COPY .yarn ./.yarn

# Copia le librerie (indispensabili per le interfacce Tenant) e il servizio
COPY libs/ ./libs
COPY apps/backend/tenant-service ./apps/backend/tenant-service

RUN yarn install --inline-builds
RUN yarn workspace @dike/tenant-service build

# Stage 2: Runtime
FROM node:22-alpine
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Pulizia per la VPS estone: solo il necessario per l'esecuzione
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/libs ./libs
COPY --from=builder /app/apps/backend/tenant-service/dist ./apps/backend/tenant-service/dist

EXPOSE 8005
CMD ["node", "apps/backend/tenant-service/dist/main"]