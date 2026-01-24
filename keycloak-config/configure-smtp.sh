#!/bin/bash

# Script per configurare SMTP in Keycloak via API
# Questo script viene eseguito dopo l'avvio di Keycloak

set -e

echo "🔧 Configurazione SMTP per Keycloak..."

# Attendiamo che Keycloak sia pronto
echo "⏳ Attendo che Keycloak sia pronto..."
until curl -s http://localhost:8080/realms/master/.well-known/openid_configuration > /dev/null; do
  sleep 2
  echo "   ... ancora in attesa ..."
done

echo "✅ Keycloak è pronto!"

# Otteniamo il token admin
echo "🔑 Ottengo token di amministrazione..."
ADMIN_TOKEN=$(curl -s -X POST http://localhost:8080/realms/master/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=${KEYCLOAK_ADMIN:-admin}" \
  -d "password=${KEYCLOAK_ADMIN_PASSWORD:-admin}" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r '.access_token')

if [ "$ADMIN_TOKEN" = "null" ] || [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Errore: Non riesco ad ottenere il token admin"
  exit 1
fi

echo "✅ Token ottenuto!"

# Configuriamo l'SMTP
echo "📧 Configuro server SMTP..."
curl -s -X PUT "http://localhost:8080/admin/realms/master" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"smtpServer\": {
      \"host\": \"${KC_SPI_EMAIL_TEMPLATE_HOST:-smtps.aruba.it}\",
      \"port\": \"${KC_SPI_EMAIL_TEMPLATE_PORT:-465}\",
      \"from\": \"${KC_SPI_EMAIL_TEMPLATE_FROM:-noreply@dike.cloud}\",
      \"fromDisplayName\": \"${KC_SPI_EMAIL_TEMPLATE_FROM_DISPLAY_NAME:-Servizio Clienti}\",
      \"replyTo\": \"${KC_SPI_EMAIL_TEMPLATE_REPLY_TO:-supporto@escaligo.it}\",
      \"replyToDisplayName\": \"${KC_SPI_EMAIL_TEMPLATE_REPLY_TO_DISPLAY_NAME:-Supporto}\",
      \"starttls\": \"${KC_SPI_EMAIL_TEMPLATE_STARTTLS:-true}\",
      \"auth\": \"${KC_SPI_EMAIL_TEMPLATE_AUTH:-true}\",
      \"user\": \"${KC_SPI_EMAIL_TEMPLATE_USER:-noreply@escaligo.it}\",
      \"password\": \"${KC_SPI_EMAIL_TEMPLATE_PASSWORD}\",
      \"ssl\": \"true\"
    },
    \"verifyEmail\": true,
    \"resetPasswordAllowed\": true
  }"

if [ $? -eq 0 ]; then
  echo "✅ Configurazione SMTP completata con successo!"
else
  echo "❌ Errore nella configurazione SMTP"
  exit 1
fi

echo "🎉 Configurazione Keycloak completata!"
