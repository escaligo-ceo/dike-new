# Notificaion Service

```mermaid
erDiagram
    NotificationType ||--o{ Notification : "instanzia"
    NotificationType ||--o{ NotificationTemplate : "definisce"

    Notification ||--o{ NotificationDelivery : "invia tramite"

    NotificationType {
      string id
      string name
      string category
      int priority
    }

    NotificationTemplate {
      string id
      string channel
      string language
      string content
      int version
    }

    Notification {
      string id
      string type_id
      string recipient_id
      json data
      string status
      datetime created_at
    }

    NotificationDelivery {
      string id
      string notification_id
      string channel
      string status
      int retries
      string error_details
      datetime sent_at
    }
```

## In pratica

NotificationType = la regola.

NotificationTemplate = la forma.

Notification = il messaggio specifico per un utente.

NotificationDelivery = il tracking di ogni invio.

## Modello concettuale

```mermaid
erDiagram
    Tenant ||--o{ NotificationType : "possiede"
    Tenant ||--o{ NotificationTemplate : "possiede"
    Tenant ||--o{ Notification : "possiede"
    Tenant ||--o{ NotificationDelivery : "possiede"
    Tenant ||--o{ UserNotificationPrefs : "possiede"

    NotificationType ||--o{ NotificationTemplate : "ha"
    NotificationType ||--o{ Notification : "instanzia"

    Notification ||--o{ NotificationDelivery : "traccia invii"

    NotificationType {
      uuid id
      uuid tenant_id
      string code
      string name
      string category
      int priority
      bool is_active
      jsonb default_channels
      timestamptz created_at
      timestamptz updated_at
    }

    NotificationTemplate {
      uuid id
      uuid tenant_id
      uuid type_id
      string channel
      string locale
      int version
      text subject
      text body
      jsonb metadata
      bool is_active
      timestamptz created_at
    }

    Notification {
      uuid id
      uuid tenant_id
      uuid type_id
      uuid recipient_id
      jsonb data
      string status
      string idempotency_key
      jsonb channels_requested
      timestamptz scheduled_at
      timestamptz created_at
      timestamptz updated_at
    }

    NotificationDelivery {
      uuid id
      uuid tenant_id
      uuid notification_id
      string channel
      string status
      int retries
      text error_details
      jsonb provider_response
      timestamptz queued_at
      timestamptz sent_at
      timestamptz completed_at
    }

    UserNotificationPrefs {
      uuid id
      uuid tenant_id
      uuid user_id
      string type_code
      bool enabled
      jsonb channels_overrides
      timestamptz updated_at
    }
```
