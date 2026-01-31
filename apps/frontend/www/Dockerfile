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
RUN --mount=type=cache,target=/root/.yarn/berry/cache,id=yarn_cache \
    yarn install --inline-builds

# 4. Sorgenti e Build
COPY libs/ ./libs
COPY apps/frontend/www ./apps/frontend/www
RUN yarn workspace @dike/www build

# Stage 2: Runtime
FROM node:22-alpine
WORKDIR /app

# Copia i metadati globali
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copia l'intera cartella dell'app (non solo dist) per mantenere package.json e config locali
COPY --from=builder /app/apps/frontend/www ./apps/frontend/www

# Copia le libs compilate (assicurati che il path sia coerente con tsconfig/workspace)
COPY --from=builder /app/libs ./libs

EXPOSE 5172

# Forza il working directory alla radice del monorepo per evitare ambiguità
WORKDIR /app
# CMD ["node", "apps/frontend/www/dist/main"]
CMD ["node", "apps/frontend/www/dist/src/main.js"]