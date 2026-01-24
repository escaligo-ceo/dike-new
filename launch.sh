#!/bin/bash

# Colori per output migliorato
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funzione per mostrare l'help
show_help() {
    echo -e "${BLUE}Uso: $0 [OPZIONI]${NC}"
    echo ""
    echo "Opzioni disponibili:"
    echo "  all              - Esegue tutto il setup (default)"
    echo "  libs             - Compila solo le librerie"
    echo "  docker           - Avvia solo i container Docker"
    echo "  backend          - Compila solo i servizi backend"
    echo "  frontend         - Compila solo i servizi frontend"
    echo "  compile          - Compila solo librerie + backend + frontend (senza docker)"
    echo "  help, -h, --help - Mostra questo messaggio"
    echo ""
    echo "Esempi:"
    echo "  $0               # Esegue tutto"
    echo "  $0 libs          # Compila solo le librerie"
    echo "  $0 backend       # Compila solo i servizi backend"
    echo "  $0 compile       # Compila tutto senza avviare docker"
    echo ""
}

# Funzione per stampare separatori
print_separator() {
    echo "=========================================="
}

# Funzione per stampare header di step
print_step() {
    local step_num=$1
    local step_name=$2
    echo ""
    echo -e "${BLUE}STEP $step_num: $step_name${NC}"
    print_separator
}

# Funzione per stampare messaggi di successo
print_success() {
    local message=$1
    echo -e "${GREEN}✓ $message${NC}"
}

# Funzione per stampare messaggi di errore
print_error() {
    local message=$1
    echo -e "${RED}✗ $message${NC}"
}

# Funzione per compilare una libreria
compile_library() {
    local lib_name=$1
    local lib_path=$2
    
    echo -e "${YELLOW}- $lib_name...${NC}"
    cd "$lib_path" || { print_error "Impossibile accedere alla cartella $lib_path"; return 1; }
    
    if yarn launch; then
        cd - > /dev/null
        return 0
    else
        print_error "Errore durante la compilazione di $lib_name"
        cd - > /dev/null
        return 1
    fi
}

# Funzione per compilare un servizio
compile_service() {
    local service_name=$1
    local service_path=$2
    
    echo -e "${YELLOW}- $service_name...${NC}"
    cd "$service_path" || { print_error "Impossibile accedere alla cartella $service_path"; return 1; }
    
    if yarn && yarn launch; then
        cd - > /dev/null
        return 0
    else
        print_error "Errore durante la compilazione di $service_name"
        cd - > /dev/null
        return 1
    fi
}

# Funzione per compilare tutte le librerie
compile_libraries() {
    print_step 1 "Compilazione librerie"
    
    compile_library "common" "./libs/common" || return 1
    compile_library "communication" "./libs/communication" || return 1
    compile_library "sequelize-transaction" "./libs/sequelize-transaction" || return 1
    
    print_success "Librerie compilate con successo"
    return 0
}

# Funzione per avviare i container Docker
start_docker_containers() {
    print_step 2 "Avvio container Docker (PostgreSQL e Keycloak)"
    
    if docker-compose up -d postgres keycloak; then
        print_success "Container Docker avviati con successo"
        return 0
    else
        print_error "Errore durante l'avvio dei container Docker"
        return 1
    fi
}

# Funzione per compilare tutti i servizi backend
compile_backend_services() {
    print_step 3 "Compilazione servizi backend"
    
    compile_service "api-gateway" "./apps/backend/api-gateway" || return 1
    compile_service "auth-service" "./apps/backend/auth-service" || return 1
    compile_service "audit-service" "./apps/backend/audit-service" || return 1
    compile_service "profile-service" "./apps/backend/profile-service" || return 1
    
    print_success "Servizi backend compilati con successo"
    return 0
}

# Funzione per compilare tutti i servizi frontend
compile_frontend_services() {
    print_step 4 "Compilazione servizi frontend"
    
    compile_service "web-site" "./apps/frontend/web-site" || return 1
    
    print_success "Servizi frontend compilati con successo"
    return 0
}

# Funzione principale
main() {
    local command=${1:-"all"}
    
    echo -e "${BLUE}Starting the project setup...${NC}"
    print_separator
    
    case $command in
        "all")
            echo -e "${YELLOW}Modalità: Setup completo${NC}"
            compile_libraries || { print_error "Setup fallito durante la compilazione delle librerie"; exit 1; }
            start_docker_containers || { print_error "Setup fallito durante l'avvio dei container"; exit 1; }
            compile_backend_services || { print_error "Setup fallito durante la compilazione dei servizi backend"; exit 1; }
            compile_frontend_services || { print_error "Setup fallito durante la compilazione dei servizi frontend"; exit 1; }
            ;;
        "libs")
            echo -e "${YELLOW}Modalità: Solo compilazione librerie${NC}"
            compile_libraries || { print_error "Compilazione librerie fallita"; exit 1; }
            ;;
        "docker")
            echo -e "${YELLOW}Modalità: Solo avvio container Docker${NC}"
            start_docker_containers || { print_error "Avvio container fallito"; exit 1; }
            ;;
        "backend")
            echo -e "${YELLOW}Modalità: Solo compilazione servizi backend${NC}"
            compile_backend_services || { print_error "Compilazione servizi backend fallita"; exit 1; }
            ;;
        "frontend")
            echo -e "${YELLOW}Modalità: Solo compilazione servizi frontend${NC}"
            compile_frontend_services || { print_error "Compilazione servizi frontend fallita"; exit 1; }
            ;;
        "compile")
            echo -e "${YELLOW}Modalità: Compilazione completa (senza Docker)${NC}"
            compile_libraries || { print_error "Setup fallito durante la compilazione delle librerie"; exit 1; }
            compile_backend_services || { print_error "Setup fallito durante la compilazione dei servizi backend"; exit 1; }
            compile_frontend_services || { print_error "Setup fallito durante la compilazione dei servizi frontend"; exit 1; }
            ;;
        "help"|"-h"|"--help")
            show_help
            exit 0
            ;;
        *)
            print_error "Parametro non riconosciuto: $command"
            echo ""
            show_help
            exit 1
            ;;
    esac
    
    # Messaggio finale di successo
    echo ""
    print_separator
    print_success "OPERAZIONE COMPLETATA CON SUCCESSO!"
    print_separator
}

# Esegui la funzione principale
main "$@"