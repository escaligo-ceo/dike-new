#!/bin/bash
# Script per terminare tutte le connessioni appese su Postgres


# Estrai parametri dalla connection string
CONN_STR=${POSTGRES_CONNECTION_STR}


# Parsing robusto della connection string
# Supporta caratteri speciali in username/password/host/dbname
if [[ "$CONN_STR" =~ ^postgres:\/\/([^:]+):([^@]+)@([^:]+):([0-9]+)\/(.+)$ ]]; then
	DB_USER="${BASH_REMATCH[1]}"
	DB_PASSWORD="${BASH_REMATCH[2]}"
	DB_HOST="${BASH_REMATCH[3]}"
	DB_PORT="${BASH_REMATCH[4]}"
	DB_NAME="${BASH_REMATCH[5]}"
else
	echo "Connection string non valida: $CONN_STR"
	exit 1
fi



# Log dei parametri estratti (stdout e stderr)
echo "Parametri di connessione estratti:" >&2
echo "  Host: $DB_HOST" >&2
echo "  Porta: $DB_PORT" >&2
echo "  Utente: $DB_USER" >&2
echo "  Password: $DB_PASSWORD" >&2
echo "  Database: $DB_NAME" >&2

# Usa la password se presente
export PGPASSWORD="$DB_PASSWORD"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$DB_NAME' AND pid <> pg_backend_pid();"

echo "Connessioni terminate su database $DB_NAME."
