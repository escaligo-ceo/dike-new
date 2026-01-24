# Stage 1: Build
FROM node:22-alpine AS builder

RUN corepack enable && corepack prepare yarn@4.9.4 --activate

WORKDIR /app

COPY .yarnrc.yml ./
COPY .yarn ./.yarn
COPY yarn.lock ./
COPY package.json ./
COPY tsconfig.base.json ./

# Copia solo i workspace necessari
COPY libs/ ./libs
COPY apps/backend/api-gateway ./apps/backend/api-gateway

RUN yarn install --inline-builds
RUN yarn workspace @dike/api-gateway build

# Stage 2: Runtime
FROM node:22-alpine

RUN corepack enable && corepack prepare yarn@4.9.4 --activate

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 3000

CMD ["node", "apps/backend/api-gateway/dist/main"]
