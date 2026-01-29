# Stage 1: Build
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Metadati dalla root
COPY .yarnrc.yml yarn.lock package.json tsconfig.base.json ./
COPY .yarn ./.yarn

# Workspace check per Yarn Berry
COPY libs/contracts/package.json ./libs/contracts/
COPY libs/common/package.json ./libs/common/
COPY libs/communication/package.json ./libs/communication/
COPY apps/backend/flow-manager/package.json ./apps/backend/flow-manager/

RUN yarn install --inline-builds

# Sorgenti e Build delle dipendenze interne
COPY libs/ ./libs
RUN yarn workspace @dike/common build || true
RUN yarn workspace @dike/communication build || true
RUN yarn workspace @dike/contracts build || true

# Build del servizio
COPY apps/backend/flow-manager ./apps/backend/flow-manager
RUN yarn workspace @dike/flow-manager build

# Stage 2: Runtime (Estonia-ready)
FROM node:22-alpine
WORKDIR /app

# Copiamo solo il necessario per l'esecuzione
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copiamo le dist delle libs (indispensabili per i riferimenti incrociati)
COPY --from=builder /app/libs/common/dist ./libs/common/dist
COPY --from=builder /app/libs/communication/dist ./libs/communication/dist
COPY --from=builder /app/libs/contracts/dist ./libs/contracts/dist

# Copiamo la dist del servizio
COPY --from=builder /app/apps/backend/flow-manager/dist ./dist

EXPOSE 3001
# Avvio pulito
CMD ["node", "dist/main"]