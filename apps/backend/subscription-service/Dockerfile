# Stage 1: Build
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Copia i file globali (Docker li vedrà se il context è '.')
COPY .yarnrc.yml yarn.lock package.json tsconfig.base.json ./
COPY .yarn ./.yarn

# Copia libs e il servizio specifico
COPY libs/ ./libs
COPY apps/backend/subscription-service ./apps/backend/subscription-service

RUN yarn install --inline-builds
RUN yarn workspace @dike/subscription-service build

# Stage 2: Runtime
FROM node:22-alpine
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Immagine snella per la VPS
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/libs ./libs
COPY --from=builder /app/apps/backend/subscription-service/dist ./apps/backend/subscription-service/dist

EXPOSE 8004
CMD ["node", "apps/backend/subscription-service/dist/main"]