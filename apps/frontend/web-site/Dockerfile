# Stage 1: Build
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Copia i file di configurazione dalla ROOT del monorepo
COPY .yarnrc.yml ./
COPY .yarn ./.yarn
COPY yarn.lock ./
COPY package.json ./
COPY tsconfig.base.json ./

# Copia TUTTE le libs e lo specifico workspace del sito
COPY libs/ ./libs
COPY apps/frontend/web-site ./apps/frontend/web-site

# Installazione e Build
RUN yarn install --inline-builds
# Buildiamo prima le libs se necessario, poi il sito
RUN yarn workspace @dike/web-site build

# Stage 2: Runtime
FROM node:22-alpine
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Copia solo il necessario per l'esecuzione
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/libs ./libs
COPY --from=builder /app/apps/frontend/web-site/dist ./apps/frontend/web-site/dist
COPY --from=builder /app/apps/frontend/web-site/package.json ./apps/frontend/web-site/package.json

EXPOSE 5172
# Correzione del path di avvio (di solito Nest compila in dist/main)
CMD ["node", "apps/frontend/web-site/dist/src/main"]