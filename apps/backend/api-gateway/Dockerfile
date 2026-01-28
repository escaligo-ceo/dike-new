# Stage 1: Build
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare yarn@4.9.4 --activate

WORKDIR /app

# Ora copiamo i file partendo dalla ROOT (perché cambieremo il contesto nel compose)
COPY .yarnrc.yml ./
COPY .yarn ./.yarn
COPY yarn.lock ./
COPY package.json ./
COPY tsconfig.base.json ./

# Copia le librerie comuni (indispensabile per @dike/communication)
COPY libs/ ./libs
# Copia il gateway
COPY apps/backend/api-gateway ./apps/backend/api-gateway

# Configurazione timeout e installazione
RUN yarn config set httpTimeout 300000 && \
    yarn install --inline-builds

# Build del gateway
RUN yarn workspace @dike/api-gateway build

# Stage 2: Runtime
FROM node:22-alpine
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Copiamo solo quello che serve per far girare l'app, senza i sorgenti pesanti
COPY --from=builder /app/package.json ./
COPY --from=builder /app/.yarn ./.yarn
COPY --from=builder /app/.yarnrc.yml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/libs ./libs
COPY --from=builder /app/apps/backend/api-gateway/dist ./apps/backend/api-gateway/dist
COPY --from=builder /app/apps/backend/api-gateway/package.json ./apps/backend/api-gateway/package.json

EXPOSE 3000

# Path corretto verso la dist
CMD ["node", "apps/backend/api-gateway/dist/main"]