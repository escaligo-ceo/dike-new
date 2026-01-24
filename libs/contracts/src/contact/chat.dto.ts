import { IChat } from "./chat.interface.js";

export class ChatDto implements IChat {
  id: string;
  label: string;
  value: string;
  type?: string;
  isPreferred?: boolean;
  tenantId?: string;
  contactId?: string;
}
