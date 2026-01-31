#!/bin/bash

# Controllo se è stato passato il nome del servizio
if [ -z "$1" ]; then
    echo "Errore: Devi specificare il nome del servizio (es: ./docker-restart-service.sh app)"
    exit 1
fi

SERVICE=$1

echo "--- [1/4] Arresto del servizio: $SERVICE ---"
docker compose stop $SERVICE

echo "--- [2/4] Rimozione del container: $SERVICE ---"
docker compose rm -f $SERVICE

echo "--- [3/4] Rebuild dell'immagine (Cache-friendly) ---"
# Usiamo build senza --no-cache per sfruttare i layer dello Stage 1 (Yarn install)
docker compose build $SERVICE

echo "--- [4/4] Avvio del nuovo container ---"
docker compose up -d $SERVICE

echo "--- Verifica Stato ---"
docker compose ps $SERVICE

echo "--- Log in tempo reale (Premi Ctrl+C per uscire) ---"
docker compose logs -f $SERVICE