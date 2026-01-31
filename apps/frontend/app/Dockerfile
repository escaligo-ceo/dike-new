# Stage 1: Build
FROM node:22-alpine AS builder
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# 1. Configurazione ROOT
COPY .yarnrc.yml yarn.lock package.json tsconfig.base.json ./
COPY .yarn ./.yarn

# 2. Workspace Check (Aggiungiamo il package del frontend)
COPY libs/contracts/package.json ./libs/contracts/
COPY libs/common/package.json ./libs/common/
COPY libs/communication/package.json ./libs/communication/
COPY apps/frontend/app/package.json ./apps/frontend/app/

# 3. Installazione
RUN --mount=type=cache,target=/root/.yarn/berry/cache,id=yarn_cache \
    yarn install --inline-builds

# 4. Copia librerie e sorgenti frontend
COPY libs/ ./libs
COPY apps/frontend/app ./apps/frontend/app

# 5. Build (Qui React genera la cartella /dist con gli statici)
RUN yarn workspace @dike/app build

# Stage 2: Sviluppo (Software della Madonna - Dev Edition)
FROM node:22-alpine
RUN corepack enable && corepack prepare yarn@4.9.4 --activate
WORKDIR /app

# Copiamo le dipendenze dallo stage builder (per non rifare yarn install)
COPY --from=builder /app ./ 

EXPOSE 5173

# Avviamo VITE in modalità development
# Puntiamo al workspace corretto
CMD ["yarn", "workspace", "@dike/app", "dev", "--host", "0.0.0.0"]