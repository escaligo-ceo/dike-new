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
COPY apps/frontend/react/package.json ./apps/frontend/react/

# 3. Installazione
RUN yarn install --inline-builds

# 4. Copia librerie e sorgenti frontend
COPY libs/ ./libs
COPY apps/frontend/react ./apps/frontend/react

# 5. Build (Qui React genera la cartella /dist con gli statici)
RUN yarn workspace @dike/react build

# Stage 2: Runtime (Software della Madonna Style)
FROM node:22-alpine
WORKDIR /app

# Non serve corepack enable qui se usiamo 'serve' o node direttamente
# Installiamo 'serve' globalmente (metodo veloce)
RUN npm install -g serve

# Copiamo SOLO la cartella dist (il risultato del build)
# Non copiare node_modules qui! Sono 500MB+ inutili per il browser
COPY --from=builder /app/apps/frontend/react/dist ./dist

EXPOSE 5173

# Avviamo il server statico
CMD ["serve", "-s", "dist", "-l", "5173"]