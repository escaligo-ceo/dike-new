# OnBoarding Dettagli Tecnici

## Sequenza delle chiamate API

```mermaid
sequenceDiagram
  participant User
  participant Frontend as web-site
  participant AuthService as auth-service
  participant ProfileService as profile-service
  participant TenantService as tenant-service
  participant BillingService as billing-service
  participant PRACT as practice-service
  participant INTEG as integration-service
  participant DOC as document-service
  participant NotificationService as notification-service

  %% Step 0: first login after email confirmation
  User->>Frontend: Login
  Frontend->>ApiGateway: POST api/v1/login (user credentials)
  ApiGateway->>AuthService: POST api/v1/login (user credentials)
  AuthService-->>Frontend: 301 /onboarding?page=1

  %% Step 1: Profilo Professionista (nome completo e ruolo avvocato, assistente, amministratore, altro, etc.)
  User->>Frontend: GET /onboarding?page=1
  Frontend->>ApiGateway: POST api/v1/users (insert lawyer data: fullName, role)
  ApiGateway->>ProfileService: POST api/v1/profiles/:userId (insert lawyer data: fullName, role)
  ProfileService<<->profile_db: insert lawyer data
  ProfileService-->>ApiGateway: 200 or 201 OK or CREATED
  %% segno lo stato di avanzamento della procedura di onboarding
  ApiGateway->>ProfileService: GET api/v1/onboarding/:userId/1
  ProfileService<<-->>profile_db: defaultRedirectUrl: /onboarding/2

  %% Step 2: Scelta Piano
  User->>Frontend: GET /onboarding?page=2
  ApiGateway->>BillingService: GET api/v1/plans
  BillingService-->>ApiGateway: list plans
  ApiGateway->>BillingService: POST api/v1/subscribe (choose plan, default Free)
  BillingService-->>ApiGateway: 200 Subscription active
  %% segno lo stato di avanzamento della procedura di onboarding
  ApiGateway->>ProfileService: GET api/v1/onboarding/:userId/2
  ProfileService<<-->>profile_db: defaultRedirectUrl: /onboarding/3

  %% Step 3: Configurazione Studio Legale (nome studio, indirizzo e partita iva avvocato a cui fatturare)
  User->>Frontend: GET /onboarding?page=3
  ApiGateway->>TenantService: GET api/v1/:userId (tenant and studio data)
  TenantService<<->>tenant_db: get UserTenant and studio data
  TenantService-->>ApiGateway: 200 or 201 OK or CREATED (tenant and studio data)
  ApiGateway->>ProfileService: PUT api/v1/profile/:userId (link userProfile to tentant)
  ProfileService<<->>profile_db: update UserProfile with tenant link
  %% salvataggio del logo dello studio opzionale
  ProfileService-->>ApiGateway: 200 OK (profile data)
  ApiGateway->>DOC: POST api/v1/:tenantId/logo (optional)
  DOC-->>ApiGateway: 201 Logo uploaded
  %% segno lo stato di avanzamento della procedura di onboarding
  ApiGateway->>ProfileService: GET api/v1/onboarding/:userId/3
  ProfileService<<-->>profile_db: defaultRedirectUrl: /onboarding/4

  %% Step 4: Invita membri
  User->>Frontend: GET /onboarding?page=4
  ApiGateway->>TenantService: POST api/v1/invite/:tenantId (module, e.g. e-invoicing)
  TenantService-->>ApiGateway: 200 OK
  ApiGateway->>NotificationService: POST api/v1/invite-members/:tenantId
  NotificationService-->>ApiGateway: 200 Sent
  %% segno lo stato di avanzamento della procedura di onboarding
  ApiGateway->>ProfileService: GET api/v1/onboarding/:userId/4
  ProfileService<<-->>profile_db: defaultRedirectUrl: /onboarding/5

  %% Step 5: Configurazione Pratiche e Archivi
  User->>Frontend: GET /onboarding?page=5
  ApiGateway->>PRACT: POST api/v1/setup (practice categories, archives)
  PRACT-->>ApiGateway: 200 Setup completed
  %% segno lo stato di avanzamento della procedura di onboarding
  ApiGateway->>ProfileService: GET api/v1/onboarding/:userId/5
  ProfileService<<-->>profile_db: defaultRedirectUrl: /onboarding/6

  %% Step 6: Integrazioni e Servizi Premium
  User->>Frontend: GET /onboarding?page=6
  ApiGateway->>INTEG: POST api/v1/enable (module, e.g. e-invoicing)
  INTEG->>BillingService: POST api/v1/addons (update billing)
  BillingService-->>INTEG: 200 OK
  INTEG-->>ApiGateway: 200 Integration enabled
  %% segno lo stato di avanzamento della procedura di onboarding
  ApiGateway->>ProfileService: GET api/v1/onboarding/:userId/6
  ProfileService<<-->>profile_db: defaultRedirectUrl: /onboarding/7

  %% Step 7: Email di benvenuto
  %% segno sul db che l'onboarding è terminato con successo e aggiorno la pagina di redirect
  User->>Frontend: GET /onboarding?page=7
  ApiGateway->>NotificationService: POST api/v1/welcome-email/:userId
  NotificationService-->>ApiGateway: 200 Sent
  %% segno lo stato di avanzamento della procedura di onboarding che adesso è completato e quindi posso cominciare a lavorare
  ApiGateway->>ProfileService: GET api/v1/onboarding/:userId/completed
  ProfileService<<-->>profile_db: defaultRedirectUrl: /dashboard
```
