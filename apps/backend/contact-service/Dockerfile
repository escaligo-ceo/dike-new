# Stage 1: Build
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Partiamo dalla ROOT (Context)
COPY .yarnrc.yml ./
COPY .yarn ./.yarn
COPY yarn.lock ./
COPY package.json ./
COPY tsconfig.base.json ./

# Copia le dipendenze interne
COPY libs/ ./libs
COPY apps/backend/contact-service ./apps/backend/contact-service

RUN yarn install --inline-builds
RUN yarn workspace @dike/contact-service build

# Stage 2: Runtime
FROM node:22-alpine
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Copia solo il necessario dallo Stage 1
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/libs ./libs
COPY --from=builder /app/apps/backend/contact-service/dist ./apps/backend/contact-service/dist

EXPOSE 8006
CMD ["node", "apps/backend/contact-service/dist/main"]