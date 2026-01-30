# Stage 1: Build
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# 1. Metadati monorepo
COPY .yarnrc.yml yarn.lock package.json tsconfig.base.json ./
COPY .yarn ./.yarn

# 2. Workspace check
COPY libs/contracts/package.json ./libs/contracts/
COPY libs/common/package.json ./libs/common/
COPY libs/communication/package.json ./libs/communication/
COPY apps/frontend/www/package.json ./apps/frontend/www/

# 3. Installazione dipendenze
RUN yarn install --inline-builds

# 4. Sorgenti e Build
COPY libs/ ./libs
COPY apps/frontend/www ./apps/frontend/www
RUN yarn workspace @dike/www build

# Stage 2: Runtime (Software della Madonna Edition)
FROM node:22-alpine
WORKDIR /app

# Copiamo solo il necessario per l'esecuzione
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Se il sito usa le libs a runtime, copiamo le loro dist
COPY --from=builder /app/libs/common/dist ./libs/common/dist
COPY --from=builder /app/libs/communication/dist ./libs/communication/dist

# Copiamo la build del sito
COPY --from=builder /app/apps/frontend/www/dist ./dist

EXPOSE 5172

# Verifica se l'entrypoint è effettivamente dist/main.js o dist/src/main.js
CMD ["node", "dist/main"]