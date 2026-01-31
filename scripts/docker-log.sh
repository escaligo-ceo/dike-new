#!/bin/bash

# Controllo se è stato passato il nome del servizio
if [ -z "$1" ]; then
    echo "Errore: Devi specificare il nome del servizio (es: ./docker-log.sh app)"
    exit 1
fi

SERVICE=$1

echo "--- Log in tempo reale (Premi Ctrl+C per uscire) ---"
docker compose logs -f $SERVICE