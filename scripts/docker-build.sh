#!/bin/bash
# Dike.cloud Build Script V2 - "Sequential Power"

echo "--- 1. Resetting Build Environment ---"

rm -rf /var/lib/docker/buildkit/

# Puliamo i rimasugli del crash precedente
docker builder prune -f

echo "--- 2. Starting Sequential Build (One by one) ---"

# I servizi che hanno fallito prima per primi
SERVICES=(
  "contact-service"
  "subscription-service"
  "import-service"
  "auth-service"
  "audit-service"
  "profile-service"
  "tenant-service"
  "notification-service"
  "api-gateway"
  "flow-manager"
  "app"
  "www"
)

for SERVICE in "${SERVICES[@]}"
do
    echo "--- Building: $SERVICE ---"
    # Lanciamo il build di un singolo servizio alla volta
    docker compose build "$SERVICE"
    
    # Se il build fallisce, lo script si ferma e ci dice quale
    if [ $? -ne 0 ]; then
        echo "ERRORE CRITICO sul servizio: $SERVICE"
        exit 1
    fi
done

echo "--- 3. All systems ready! ---"
echo "La Triple Threat è pronta per il decollo."