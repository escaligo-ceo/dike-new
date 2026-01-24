#!/bin/bash

set -e

echo "🚀 Avvio Keycloak con configurazione SMTP automatica..."

# Avvia Keycloak in background
echo "⏳ Avvio Keycloak..."
/opt/keycloak/bin/kc.sh start-dev --hostname=${KC_BOOTSTRAP_ADMIN_URL} --hostname-admin=${KC_BOOTSTRAP_ADMIN_URL} &
KEYCLOAK_PID=$!

echo "📍 Keycloak avviato con PID: $KEYCLOAK_PID"

# Funzione per cleanup quando il container viene fermato
cleanup() {
    echo "🛑 Arresto Keycloak..."
    kill $KEYCLOAK_PID 2>/dev/null || true
    wait $KEYCLOAK_PID 2>/dev/null || true
    echo "✅ Keycloak arrestato"
    exit 0
}

# Gestisci segnali di terminazione
trap cleanup SIGTERM SIGINT

# Attendi che Keycloak sia pronto
echo "⏳ Attendo che Keycloak sia completamente avviato..."
while ! curl -s http://admin:admin@localhost:8080/admin/master/console/ > /dev/null 2>&1; do
    if ! kill -0 $KEYCLOAK_PID 2>/dev/null; then
        echo "❌ Keycloak si è fermato inaspettatamente"
        exit 1
    fi
    sleep 5
    echo "   ... ancora in attesa ..."
done

echo "✅ Keycloak è pronto!"

# Esegui la configurazione SMTP
echo "📧 Eseguo configurazione SMTP..."
if /app/configure-smtp.sh; then
    echo "✅ Configurazione SMTP completata!"
else
    echo "⚠️  Configurazione SMTP fallita, ma Keycloak continua a funzionare"
fi

# Mantieni il container in vita
echo "🎉 Keycloak configurato e pronto!"
echo "📡 In attesa di richieste su http://admin:admin@localhost:8080"

# Attendi che Keycloak finisca
wait $KEYCLOAK_PID
