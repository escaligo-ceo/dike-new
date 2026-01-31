# Changelog

## [0.1.1] - 2025-07-07

- loading PORT from env vars fixed

## [0.1.2] - 2025-07-07

- fixes on resitration test

## [0.1.3] - 2025-08-09

- fix on login procedure

## [0.1.4] - 2025-08-11

- notification adapter added

## [0.1.5] - 2025-08-12

- http error handling upgraded

## [0.1.6] - 2025-08-12

- call notification-service to send varification email

## [0.1.7] - 2025-08-14

- route to verify user email added

## [0.1.8] - 2025-08-15

- http services baseUrl build method rationalized

## [0.1.9] - 2025-08-16

- user registration procedure cleaned

## [0.1.10] - 2025-08-16

- fixed communitation to authService in order to verify user email

## [0.1.11] - 2025-08-16

- fixed url to send token in p profileSerice

## [0.2.0] - 2025-08-16

- email verification works!

## [0.2.1] - 2025-08-17

- email ferification rationalized

## [0.2.2] - 2025-08-18

- forwarded-headers middleware added and controller updated accordingly

## [0.2.3] - 2025-08-18

- notification-service http module upgrade

## [0.2.4] - 2025-08-18

- rimossi riferimenti a HttpAuditService e sostuiti con AuditService

## [0.2.5] - 2025-08-18

- audit service integrated in api-gateway

## [0.2.7] - 2025-08-26

- refactored due to merge between team and tenant services

## [0.2.8] - 2025-08-30

- new servce link added to subscription-service

## [0.2.9] - 2025-08-31

- new methods added to communicate with subscribe service

## [0.2.10] - 2025-09-03

- profile and audit refactorred

## [0.2.11] - 2025-09-04

- refactoring audit and this service rebuilded

## [0.2.12] - 2025-09-07

- refactoring for userId API param replacing with JWT tokenus age

## [0.2.13] - 2025-09-09

- onboarding service fixed with new functions

## [0.2.14] - 2025-09-09

- onboarding service fixed with new functions

## [0.2.15] - 2025-09-11

- onboarding step refinment

## [0.2.16] - 2025-09-15

- onboarding proc goes to step 2

## [0.2.17] - 2025-09-17

- refacto4ing per rezionalizzazione e nomenclaturea dei paramentri ->> DTO

## [0.2.18] - 2025-09-23

- fixed DTO refactoring

## [0.2.19] - 2025-09-25

- onboarding procedure finally restarted to work

## [0.2.20] - 2025-09-27

- refactor from TokenDto to Token

## [0.2.21] - 2025-10-25

- fixed env vars values to login user

## [0.2.22] - 2025-11-19

- import contacts api added

## [0.2.23] - 2025-11-20

- api mapping find-or-create added

## [0.2.24] - 2025-12-20

- moved mapping controller into import folder

## [0.2.25] - 2025-12-20

- moved mapping controller into import folder

## [0.2.26] - 2025-12-21

- importType moved

## [0.2.27] - 2025-12-21

- contact bulk import api added

## [0.2.28] - 2025-12-22

- upgraded usign loggedUser props

## [0.2.29] - 2025-12-22

- onboarding controller ripulito

## [0.2.30] - 2025-12-22

- contacts/import route added

## [0.2.31] - 2025-12-22

- from loggedUser.getToken().toOriginDto() to loggedUser.token.originDto

## [0.2.32] - 2025-12-22

- get mapping api added

## [0.2.33] - 2025-12-22

- updateMappingRules endpoint added

## [0.2.34] - 2025-12-23

- endpoint to update mapping rules added

## [0.2.35] - 2025-12-24

- getContact endpoint with queryParams

## [0.2.36] - 2025-12-25

- getContactsTrash endpoint added

## [0.2.37] - 2025-12-25

- syntatctic fix

## [0.2.38] - 2026-01-02

- allineati i dto dei contatti

## [0.2.39] - 2026-01-02

- swagger doc added

## [0.2.41] - 2026-01-03

- impiego dei nuovi dt0

## [0.2.42] - 2026-01-03

- plan showing restored

## [0.2.43] - 2026-01-04

- logging improving

## [0.2.44] - 2026-01-04

- fix on dto for office

## [0.2.45] - 2026-01-04

- upgrade/downgrade aubscription endpoint added

## [0.2.46] - 2026-01-04

- aggiunta autenticazione per gli amministratori

## [0.2.47] - 2026-01-05

- initializeViewEngine function introduced

## [0.2.48] - 2026-01-31

- clean up