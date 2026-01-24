import { Notification } from "../entities/notification.entity";

export interface DeliveryResult {
  success: boolean;
  error?: string;
  sentAt?: Date;
}

export abstract class BaseNotificationChannel {
  abstract send(
    notification: Notification,
    options?: Record<string, any>,
  ): Promise<DeliveryResult>;
}
