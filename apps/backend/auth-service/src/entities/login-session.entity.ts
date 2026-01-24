import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('login_sessions')
export class LoginSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Id utente (Keycloak)
  @Index()
  @Column({ type: "uuid", name: "user_id" })
  userId: string;
  
  @Column({ nullable: true })
  preferredUsername: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'boolean', default: false })
  emailVerified: boolean;

  @Column({ type: 'boolean', default: false })
  successful: boolean;

  @Column({ nullable: true })
  ipAddress: string;

  @Column({ nullable: true })
  userAgent: string;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  createdAt: Date;
}
