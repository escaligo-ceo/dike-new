# Audit Service

## Obiettivi del messaggio di audit

- Tracciare chi ha effettuato l’azione (utente, servizio o sistema)
- Cosa è stato modificato (entità e attributi coinvolti)
- Quando è avvenuta la modifica (timestamp)
- Da dove è stata richiesta (servizio chiamante)
- Eventuali dettagli aggiuntivi utili per la ricostruzione dell’evento

## Esempio di struttura del messaggio di audit (formato JSON)

```JSON
{
  "eventType": "USER_PROFILE_UPDATE",
  "timestamp": "2025-06-18T17:34:00Z",
  "actor": {
    "id": "user-1234",
    "type": "user",
    "username": "mario.rossi"
  },
  "target": {
    "entityType": "user_profile",
    "entityId": "user-1234"
  },
  "source": {
    "service": "user-profile-service",
    "ip": "192.168.10.55"
  },
  "changes": [
    {
      "field": "email",
      "oldValue": "old@example.com",
      "newValue": "new@example.com"
    },
    {
      "field": "phone",
      "oldValue": "+3912345678",
      "newValue": "+3912345679"
    }
  ],
  "metadata": {
    "requestId": "abcd-1234-efgh-5678",
    "reason": "user requested update"
  }
}
```

### Descrizione campi suggeriti

- eventType: tipo di evento audit (es. USER_PROFILE_UPDATE, PASSWORD_CHANGE, LOGIN_SUCCESS, ecc.)
- timestamp: data e ora (ISO 8601, UTC)
- actor: chi ha generato l’azione
    id: identificativo univoco dell’attore (utente, servizio, ecc.)
    type: tipo di attore (user, service, system)
    username: se disponibile, lo username dell’utente
- target: oggetto/entità coinvolta
    entityType: tipo entità (user_profile, order, ecc.)
    entityId: identificativo univoco entità
- source: informazioni sul servizio e sull’origine della richiesta
    service: nome del servizio che ha generato l’azione
    ip: indirizzo IP sorgente (se disponibile)
- changes: elenco delle modifiche apportate, con campo, valore precedente e nuovo valore
- metadata: eventuali informazioni aggiuntive (es. requestId, motivazione, ecc.)
