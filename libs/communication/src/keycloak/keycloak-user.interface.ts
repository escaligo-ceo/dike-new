// Interfaccia per rappresentare uno user Keycloak
export interface IKeycloakUser {
  id: string;
  username: string;
  email: string;
  emailVerified?: boolean;
  enabled?: boolean;
  firstName?: string;
  lastName?: string;
  attributes?: Record<string, any>;
  createdTimestamp?: number;
  realmRoles?: string[];
  groups?: string[];
  [key: string]: any;
}
