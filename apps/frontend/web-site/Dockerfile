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
COPY apps/frontend/web-site ./apps/frontend/web-site

RUN yarn install --inline-builds
RUN yarn workspace @dike/web-site build

# Stage 2: Runtime
FROM node:22-alpine

RUN corepack enable && corepack prepare yarn@4.9.4 --activate

WORKDIR /app

COPY --from=builder /app /app

EXPOSE 5172

CMD ["node", "apps/frontend/web-site/dist/src/main"]
