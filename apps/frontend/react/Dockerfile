# Stage 1: Build
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Riferimenti alla ROOT (Lanciare build da root!)
COPY .yarnrc.yml yarn.lock package.json tsconfig.base.json ./
COPY .yarn ./.yarn

# Copia libs e il workspace react
COPY libs/ ./libs
COPY apps/frontend/react ./apps/frontend/react

RUN yarn install --inline-builds
RUN yarn workspace @dike/react build

# Stage 2: Runtime
FROM node:22-alpine
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Copia solo il necessario (node_modules e dist)
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/frontend/react/dist ./apps/frontend/react/dist

EXPOSE 3001

# Nota: Assicurati che 'dist/main' sia effettivamente l'entrypoint per servire la SPA
CMD ["node", "apps/frontend/react/dist/main"]