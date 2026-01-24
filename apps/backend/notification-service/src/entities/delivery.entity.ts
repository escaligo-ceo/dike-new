import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Channel } from './channel.entity';
import { Notification } from './notification.entity';

export enum DeliveryStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  RETRIED = 'retried',
}

@Entity('deliveries')
export abstract class Delivery {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  @ApiProperty({
    type: 'string',
    format: 'uuid',
  })
  id: string;

  @ManyToOne(() => Notification, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'notification_id',
  })
  notification: Notification;

  @Column({
    name: 'notification_id',
    type: 'uuid',
  })
  @ApiProperty({
    type: 'string',
    format: 'uuid',
  })
  notificationId: string;

  @ManyToOne(() => Channel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'channel_id' })
  channel: Channel;

  @Column({
    name: 'channel_id',
    type: 'uuid',
  })
  @ApiProperty({
    type: 'string',
    format: 'uuid',
  })
  channelId: string;

  @Column({
    name: 'status',
    type: 'enum',
    enum: DeliveryStatus,
    default: DeliveryStatus.PENDING,
  })
  @ApiProperty({
    enum: DeliveryStatus,
    enumName: 'DeliveryStatus',
    default: DeliveryStatus.PENDING,
  })
  status: DeliveryStatus;

  @Column({
    name: 'error',
    nullable: true,
    default: null,
  })
  @ApiProperty({
    type: 'string',
    nullable: true,
  })
  error?: string;

  @Column({
    type: 'timestamp',
    name: 'sent_at',
    nullable: true,
    default: null,
  })
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  sentAt?: Date;

  @DeleteDateColumn({
    name: "deleted_at",
    type: "timestamp",
    nullable: true,
  })
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
    description: 'Soft delete timestamp',
  })
  deletedAt?: Date | null;

  softDelete(): void {
    this.deletedAt = new Date();
  }

  restore() {
    this.deletedAt = null;
  }
}
