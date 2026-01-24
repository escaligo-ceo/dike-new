import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Notification } from './notification.entity';

@Entity('preferences')
export abstract class Preference {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  @ApiProperty({ type: 'string', format: 'uuid' })
  id: string;

  @Column({ name: 'user_id' })
  @ApiProperty({ type: 'string', format: 'uuid' })
  userId: string;

  @ManyToOne(() => Notification, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'notification_id' })
  notification: Notification;

  @Column({ name: 'notification_id' })
  @ApiProperty({ type: 'string', format: 'uuid' })
  notificationId: string;

  @Column({ name: 'is_read', default: false })
  @ApiProperty({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  readAt?: Date;

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
