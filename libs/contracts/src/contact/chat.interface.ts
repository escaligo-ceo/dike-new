export interface IChat {
  id: string;
  label: string;
  value: string;
  type?: string;
  isPreferred?: boolean;
  tenantId?: string;
  contactId?: string;
}
