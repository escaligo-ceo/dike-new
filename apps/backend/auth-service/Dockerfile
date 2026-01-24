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
COPY apps/backend/auth-service ./apps/backend/auth-service

RUN yarn install --inline-builds
RUN yarn workspace @dike/auth-service build

# Stage 2: Runtime
FROM node:22-alpine

RUN corepack enable && corepack prepare yarn@4.9.4 --activate

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 8000

CMD ["node", "apps/backend/auth-service/dist/main"]
