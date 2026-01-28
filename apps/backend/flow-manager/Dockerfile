# Stage 1: Build
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Ora puntiamo alla ROOT del monorepo
COPY .yarnrc.yml ./
COPY .yarn ./.yarn
COPY yarn.lock ./
COPY package.json ./
COPY tsconfig.base.json ./

# Copia le libs (necessarie per i decorator di analytics/audit)
COPY libs/ ./libs
COPY apps/backend/flow-manager ./apps/backend/flow-manager

RUN yarn install --inline-builds
RUN yarn workspace @dike/flow-manager build

# Stage 2: Runtime
FROM node:22-alpine
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Copia selettiva: pulizia e velocità per la VPS
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/libs ./libs
COPY --from=builder /app/apps/backend/flow-manager/dist ./apps/backend/flow-manager/dist

EXPOSE 3001
CMD ["node", "apps/backend/flow-manager/dist/main"]