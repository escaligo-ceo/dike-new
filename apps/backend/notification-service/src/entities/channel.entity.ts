import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum ChannelType {
  EMAIL = 'email',
  SMS = 'sms',
  TELEGRAM = 'telegram',
  WHATSAPP = 'whatsapp',
  SYSTEM = 'system',
  SLACK = 'slack',
  TEAMS = 'teams',
  OTHER = 'other',
}

@Entity('channels')
export abstract class Channel {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  @ApiProperty({
    type: 'string',
    format: 'uuid',
  })
  id: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: ChannelType,
  })
  @ApiProperty({
    enum: ChannelType,
    enumName: 'ChannelType',
  })
  type: ChannelType;

  @Column('json', { name: 'config', nullable: true })
  @ApiProperty({
    type: 'object',
    nullable: true,
    additionalProperties: true,
  })
  config?: Record<string, any>;

  @Column({ name: 'is_active', default: true })
  @ApiProperty({
    type: 'boolean',
    default: true,
  })
  isActive: boolean;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
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
