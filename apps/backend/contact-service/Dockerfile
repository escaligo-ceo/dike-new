# Stage 1: Build (Identico al tuo, con ordine ottimizzato)
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

COPY .yarnrc.yml yarn.lock package.json tsconfig.base.json ./
COPY .yarn ./.yarn

# Copiamo i package.json per fissare i workspace prima della install
COPY libs/contracts/package.json ./libs/contracts/
COPY libs/common/package.json ./libs/common/
COPY libs/communication/package.json ./libs/communication/
COPY apps/backend/contact-service/package.json ./apps/backend/contact-service/

RUN --mount=type=cache,target=/root/.yarn/berry/cache,id=yarn_cache \
    yarn install --inline-builds

# Ora i sorgenti e i build
COPY libs/ ./libs
RUN yarn workspace @dike/common build || true
RUN yarn workspace @dike/communication build || true
RUN yarn workspace @dike/contracts build || true

COPY apps/backend/contact-service ./apps/backend/contact-service
RUN yarn workspace @dike/contact-service build

# Stage 2: Runtime (Software della Madonna Edition)
FROM node:22-alpine
WORKDIR /app

# Copia solo l'indispensabile
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copiamo le cartelle dist delle libs buildate
COPY --from=builder /app/libs/common/dist ./libs/common/dist
COPY --from=builder /app/libs/communication/dist ./libs/communication/dist
COPY --from=builder /app/libs/contracts/dist ./libs/contracts/dist

# Copiamo la dist del servizio direttamente in una cartella piatta
COPY --from=builder /app/apps/backend/contact-service/dist ./dist

EXPOSE 8006
# Eseguiamo dalla cartella piatta
CMD ["node", "dist/main"]