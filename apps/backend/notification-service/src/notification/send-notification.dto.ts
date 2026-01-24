import { ApiProperty } from '@nestjs/swagger';
import { NotificationChannel, NotificationType } from './notification.type';

export class SendNotificationDto {
  @ApiProperty({
    description: 'Tipo di notifica',
    enum: NotificationType,
    enumName: 'NotificationType',
    example: NotificationType.ALREADY_REGISTERED,
  })
  type: NotificationType;

  @ApiProperty({
    description: 'Canali su cui inviare la notifica',
    enum: NotificationChannel,
    enumName: 'NotificationChannel',
    isArray: true,
    example: [NotificationChannel.EMAIL, NotificationChannel.SMS],
  })
  channels: NotificationChannel[];

  @ApiProperty({
    description: 'Payload della notifica',
    type: 'object',
    additionalProperties: true,
    example: { to: 'user@email.com', link: 'https://...', username: 'Mario' }
  })
  payload: Record<string, any>;
}
