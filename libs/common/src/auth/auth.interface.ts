export interface FullAccessTokenPayload {
  sub: string;              // userId interno
  tenantId: string;
  roles: string[];
  permissions: string[];
  profileId: string;
  email: string;
}