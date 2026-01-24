#!/bin/bash

# Script per copiare tutti i file .env.docker in .env
# Usage: ./copy-env-docker.sh

# Colori per l'output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🔍 Ricerca di tutti i file .env.docker..."

# Trova tutti i file .env.docker nella directory corrente e nelle sottodirectory
found_files=$(find . -name ".env.docker" -type f)

if [ -z "$found_files" ]; then
    echo -e "${RED}❌ Nessun file .env.docker trovato${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Trovati $(echo "$found_files" | wc -l) file .env.docker${NC}"
echo ""

# Contatori
copied=0
skipped=0
errors=0

# Copia ogni file .env.docker in .env
while IFS= read -r docker_env_file; do
    # Salta righe vuote
    [ -z "$docker_env_file" ] && continue
    
    # Ottieni il percorso della directory
    dir=$(dirname "$docker_env_file")
    # Percorso del file .env di destinazione
    env_file="$dir/.env"
    
    echo -e "📁 Processando: ${YELLOW}$docker_env_file${NC}"
    
    # Verifica se il file .env esiste già
    if [ -f "$env_file" ]; then
        echo -e "   ⚠️  Il file $env_file esiste già"
        read -p "   Sovrascrivere? (s/n): " -n 1 -r </dev/tty
        echo
        if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
            echo -e "   ${YELLOW}⏭️  Saltato${NC}"
            ((skipped++))
            echo ""
            continue
        fi
    fi
    
    # Copia il file
    if cp "$docker_env_file" "$env_file"; then
        echo -e "   ${GREEN}✅ Copiato in $env_file${NC}"
        ((copied++))
    else
        echo -e "   ${RED}❌ Errore durante la copia${NC}"
        ((errors++))
    fi
    echo ""
done <<< "$found_files"

# Riepilogo
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Copiati: $copied${NC}"
if [ $skipped -gt 0 ]; then
    echo -e "${YELLOW}⏭️  Saltati: $skipped${NC}"
fi
if [ $errors -gt 0 ]; then
    echo -e "${RED}❌ Errori: $errors${NC}"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
