# User Registration

## Description

L'utente si registra nel sistema.

Fornisce `email`, `username` e `password`, il sistema controlla che non ci siano doppiani su Keycloak e in caso non ve ne siano salva l'utenza sul db di Keycloak.

Restituisce `access_token` e `refresh_token` associati all'utente e il relativo `userId`.

L'utente viene creato con email da verificare.

Viene a questo punto coinvolto il `servizio di notifiche` dall'`ApiGateway` il quale invierà la mail di verifica all'utente.

Il token di verifica viene generato dal `servizio di autenticazione`.

## Diagram Registration

```mermaid
  sequenceDiagram
    participant User
    participant Frontend
    participant ApiGateway
    participant AuthService
    participant Keycloak
    participant AuditService
    participant NotificationService
    participant keycloak_db
    participant audit_db
    participant SMTPServer

    User->>Frontend: GET /register
    Frontend->>ApiGateway: POST /api/v1/auth/register
    ApiGateway->>AuthService: POST /api/v1/auth/register
    AuthService->>Keycloak: POST /realms/master/protocol/openid-connect/token
    Keycloak->>AuthService: adminAccessToken
    AuthService->>Keycloak: POST /admin/realms/master/users
    Keycloak<<->>keycloak_db: INSERT INTO users (email, password, fullName)
    Keycloak->>AuthService: { email, username, usereId }
    AuthService->>AuthService: Genero il token di verifica per la mail
    AuthService->>ApiGateway: 201 Created  { userId, access_token, refresh_token, link: emailVerificationToken }
    ApiGateway->>NotificationService: POST /api/v1/notifications/email
    NotificationService->>SMTPServer: Send email to user
    ApiGateway->>AuditService: POST /api/v1/audit
    AuditService->>audit_db: INSERT INTO events (log data)
    ApiGateway->>Frontend: 201 Created { userId, email, username? }
    Frontend->>User: 301 /verify-email-pending

    box Database
        participant keycloak_db
        participant audit_db
    end
    box SMTP Server
        participant SMTPServer
    end
```
