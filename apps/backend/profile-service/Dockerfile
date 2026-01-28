# Stage 1: Build
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Copia i file di configurazione (Docker li troverà se il context nel compose è '.')
COPY .yarnrc.yml yarn.lock package.json tsconfig.base.json ./
COPY .yarn ./.yarn

# Copia le librerie condivise e il servizio specifico
COPY libs/ ./libs
COPY apps/backend/profile-service ./apps/backend/profile-service

RUN yarn install --inline-builds
RUN yarn workspace @dike/profile-service build

# Stage 2: Runtime
FROM node:22-alpine
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Copiamo solo la dist e le node_modules per la massima efficienza sulla VPS
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/libs ./libs
COPY --from=builder /app/apps/backend/profile-service/dist ./apps/backend/profile-service/dist

EXPOSE 8002
CMD ["node", "apps/backend/profile-service/dist/main"]