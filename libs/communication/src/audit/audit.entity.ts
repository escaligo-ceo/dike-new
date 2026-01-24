import { ApiProperty } from "@nestjs/swagger";
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity({ name: "audit_events" })
export class AuditLog {
  @ApiProperty({
    type: "string",
    format: "uuid",
    description: "Unique identifier for the audit log entry",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ApiProperty({
    type: "object",
    description: "IP di origine della richiesta e user-agent",
    example: { ip: "192.168.1.1", userAgent: "Mozilla/5.0" },
    additionalProperties: false,
  })
  @Column({
    type: "jsonb",
    nullable: false,
    comment: "IP di origine della richiesta e user-agent",
    name: "source",
  })
  source!: { ip: string; userAgent: string };

  @ApiProperty({
    type: "string",
    description: "The ID of the user who performed the action",
    example: "user-123",
  })
  @Column({
    type: "varchar",
    nullable: false,
    comment: "The ID of the user who performed the action",
    name: "performed_by",
  })
  performedBy!: string;

  @ApiProperty({
    type: "string",
    format: "date-time",
    description: "Data e ora dell'evento di log",
    example: "2024-01-01T12:00:00Z",
  })
  @CreateDateColumn({
    type: "timestamptz",
    nullable: false,
    default: () => "CURRENT_TIMESTAMP",
    comment: "Data e ora dell'evento di log",
    name: "event_date",
  })
  eventDate!: Date;

  @ApiProperty({
    type: "string",
    description: 'The name of the event, e.g., "user.created", "user.updated"',
    example: "user.created",
  })
  @Column({
    type: "varchar",
    nullable: false,
    comment: 'The name of the event, e.g., "user.created", "user.updated"',
    name: "event_type",
  })
  eventType!: string;

  @Column({
    type: "jsonb",
    nullable: true,
    name: "data",
  })
  @ApiProperty({
    type: 'object',
    description: 'Additional data related to the event',
    example: { key1: 'value1', key2: 'value2' },
    additionalProperties: true,
  })
  data!: {
    [key: string]: any;
  };

  @Column({
    type: "text",
    nullable: true,
    comment: "A descriptive message about the event",
    name: "message",
  })
  @ApiProperty({
    type: "string",
    description: "A descriptive message about the event",
    example: "User account created successfully",
  })
  message!: string;
}
