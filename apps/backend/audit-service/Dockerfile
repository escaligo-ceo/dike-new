# Stage 1: Build
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Riferimenti puliti: partiamo dalla ROOT (contesto di build)
COPY .yarnrc.yml ./
COPY .yarn ./.yarn
COPY yarn.lock ./
COPY package.json ./
COPY tsconfig.base.json ./

# Carichiamo le libs e il servizio specifico
COPY libs/ ./libs
COPY apps/backend/audit-service ./apps/backend/audit-service

# Installazione e build del servizio
RUN yarn install --inline-builds
RUN yarn workspace @dike/audit-service build

# Stage 2: Runtime (Immagine pulita)
FROM node:22-alpine
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Copia selettiva per non portarsi dietro i sorgenti (Software della Madonna style)
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/libs ./libs
COPY --from=builder /app/apps/backend/audit-service/dist ./apps/backend/audit-service/dist

EXPOSE 8001
CMD ["node", "apps/backend/audit-service/dist/main"]