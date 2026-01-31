import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { Column, CreateDateColumn, Entity, Index, MoreThan, PrimaryGeneratedColumn, Repository } from 'typeorm';
import { EmailVerificationTokenDto } from './email-validation-token.dto.js';

export const EmailVerificationTokenTableName = 'email_verification_tokens'; 

@Entity(EmailVerificationTokenTableName)
export class EmailVerificationToken {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  @IsString()
  userId: string;

  @Column({
    name: 'email',
    type: 'varchar',
  })
  @Index()
  @IsString()
  email: string;

  @Column({
    name: 'token',
    type: 'varchar',
    unique: true,
  })
  @Index({ unique: true })
  @IsString()
  token: string;

  @Column({
    name: 'expires_at',
    type: 'timestamp',
  })
  expiresAt: Date;

  @Column({
    name: 'used',
    type: 'boolean',
    default: false,
  })
  used: boolean;

  @Column({
    name: 'ip',
    type: 'varchar',
    nullable: false,
  })
  @IsString()
  ip: string;

  @Column({
    name: 'user_agent',
    type: 'varchar',
    nullable: false,
  })
  @IsString()
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

  @Column({
    name: 'hashed_token',
    type: 'varchar',
    unique: true,
  })
  @Index({ unique: true })
  @IsString()
  hashedToken: string;

  @Column({
    name: 'revoked_at',
    type: 'timestamp',
    nullable: true,
    default: null,
  })
  @ApiProperty({
    type: "string",
    format: "date-time",
    nullable: true
  })
  revokedAt?: Date;

  static async findByEmail(email: string, repository: Repository<EmailVerificationToken>): Promise<EmailVerificationToken | null> {
    return repository.findOne({ where: { email }, order: { createdAt: 'DESC' } });
  }

  static async findValidByEmail(email: string, repository: Repository<EmailVerificationToken>): Promise<EmailVerificationToken | null> {
    const now = new Date();
    return repository.findOne({
      where: {
        email,
        used: false,
        expiresAt: MoreThan(now),
      },
      order: { createdAt: 'DESC' },
    });
  }

  toDto(): EmailVerificationTokenDto {
    const dto = new EmailVerificationTokenDto();
    dto.id = this.id;
    dto.userId = this.userId;
    dto.email = this.email;
    dto.token = this.token;
    dto.expiresAt = this.expiresAt;
    dto.ip = this.ip;
    dto.userAgent = this.userAgent;
    dto.used = this.used;
    dto.hashedToken = this.hashedToken;
    dto.revokedAt = this.revokedAt;
    return dto;
  }
}
