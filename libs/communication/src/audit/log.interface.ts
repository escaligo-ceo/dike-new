import { DikeServiceName } from "@dike/common";
import { AuditEventActorType, AuditEventTargetEntityType, AuditEventType } from "./log.enum";

export interface IAuditDataChange {
  field: string,
  oldValue: string,
  newValue: string,
};

export interface IAuditDataActor {
  token?: string, // authentication userJwt token
  type: AuditEventActorType,
  id?: string,
  username?: string,
  service: DikeServiceName,
  ip?: string,
  userAgent?: string,
  location?: string,
  [key: string]: any; // Allow additional actor properties
};

export interface IAuditDataTarget {
  type?: AuditEventTargetEntityType,
  id?: string,
  reason?: string,
  error?: boolean,
};

export interface IAuditDataSource {
  service: DikeServiceName,
  ip?: string,
  userAgent?: string,
  location?: string,
  [key: string]: any; // Allow additional source properties
}

export interface IAuditDataMetadata {
  requestId: string,
  reason: string,
  [key: string]: any; // Allow additional metadata properties
};

export interface IAuditData {
  eventType: AuditEventType,
  timestamp: string, // ISO 8601 format,
  actor: IAuditDataActor,
  target: IAuditDataTarget,
  source: IAuditDataSource,
  changes: IAuditDataChange[],
  metadata: IAuditDataMetadata,
}

export interface IAuditDataHow {
  headers?: Record<string, string>, // Optional headers
  changes?: IAuditDataChange[], // Optional changes made during the event
  method?: string, // e.g., 'POST', 'GET', etc.
  token?: string, // Optional authentication token
  url?: string, // The URL of the request
  body?: any, // Optional request body
  query?: Record<string, string>, // Optional query parameters
  params?: Record<string, string>, // Optional route parameters
  [key: string]: any; // Allow additional properties
}

export interface IEventParams {
  eventType: AuditEventType,
  actor: IAuditDataActor,
  target: IAuditDataTarget,
  source?: IAuditDataSource,
  metadata?: IAuditDataMetadata,
  changes?: IAuditDataChange[],
  token?: string,
}

export interface IAuditEventParams {
  who: IAuditDataActor,
  what: IAuditDataTarget,
  where?: IAuditDataSource,
  how?: IAuditDataHow,
}

export interface IAuditEventType {
  id: string;
  type: string;
}

export interface IAuditEventContext {
  [key: string]: any; // Dati aggiuntivi (email, IP, user-agent, ecc.)
}

export interface IAuditEventInput {
  event: string;
  performedBy: string;
  target: IAuditEventType;
  context: IAuditEventContext;
}
