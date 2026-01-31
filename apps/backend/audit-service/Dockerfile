# Stage 1: Build
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# 1. Metadati (non cambiano spesso)
COPY .yarnrc.yml yarn.lock package.json tsconfig.base.json ./
COPY .yarn ./.yarn

# 2. Package.json dei workspace (fondamentale per Yarn Berry)
COPY libs/contracts/package.json ./libs/contracts/
COPY libs/common/package.json ./libs/common/
COPY libs/communication/package.json ./libs/communication/
COPY apps/backend/audit-service/package.json ./apps/backend/audit-service/

# 3. Installazione (Layer pesante, ora protetto dalla cache se cambi il codice)
RUN --mount=type=cache,target=/root/.yarn/berry/cache,id=yarn_cache \
    yarn install --inline-builds

# 4. Sorgenti (Cambiano spesso)
COPY libs/ ./libs
COPY apps/backend/audit-service ./apps/backend/audit-service

# 5. Build (Risolve TS2307 e genera le dist)
RUN yarn workspace @dike/common build || true
RUN yarn workspace @dike/communication build || true
RUN yarn workspace @dike/contracts build || true
RUN yarn workspace @dike/audit-service build

# Stage 2: Runtime
FROM node:22-alpine
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
# Copiamo le libs buildate (servono a runtime)
COPY --from=builder /app/libs ./libs 
COPY --from=builder /app/apps/backend/audit-service/dist ./dist

EXPOSE 8001
# Path pulito
CMD ["node", "dist/main"]