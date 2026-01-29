# Stage 1: Build
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# 1. Blueprint del monorepo
COPY .yarnrc.yml yarn.lock package.json tsconfig.base.json ./
COPY .yarn ./.yarn

# 2. Workspace check (Fondamentale per la risoluzione dei tipi @dike/...)
COPY libs/contracts/package.json ./libs/contracts/
COPY libs/common/package.json ./libs/common/
COPY libs/communication/package.json ./libs/communication/
COPY apps/backend/tenant-service/package.json ./apps/backend/tenant-service/

# 3. Installazione (Layer protetto da cache: se non cambi i package, non scarica nulla)
RUN yarn install --inline-builds

# 4. Build delle librerie (Risolve TS2307 e i metodi dell'Audit)
COPY libs/ ./libs/
RUN yarn workspace @dike/common build || true
RUN yarn workspace @dike/communication build || true
RUN yarn workspace @dike/contracts build || true

# 5. Build del servizio specifico
COPY apps/backend/tenant-service ./apps/backend/tenant-service
RUN yarn workspace @dike/tenant-service build

# Stage 2: Runtime (Software della Madonna Edition)
FROM node:22-alpine
WORKDIR /app

# Copiamo solo i binari e le dipendenze, niente sorgenti .ts sulla VPS
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copiamo le dist delle libs (necessarie per l'importazione a runtime)
COPY --from=builder /app/libs/common/dist ./libs/common/dist
COPY --from=builder /app/libs/communication/dist ./libs/communication/dist
COPY --from=builder /app/libs/contracts/dist ./libs/contracts/dist

# Copiamo la dist del servizio
COPY --from=builder /app/apps/backend/tenant-service/dist ./dist

# Nota: Assicurati che la porta 8007 sia libera (l'8005 era dell'import)
EXPOSE 8007
CMD ["node", "dist/main"]