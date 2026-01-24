import { ApiProperty } from '@nestjs/swagger';
import { Column, CreateDateColumn, Entity, Index, MoreThan, PrimaryGeneratedColumn, Repository } from 'typeorm';

@Entity('email_verification_tokens')
export class EmailVerificationToken {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  userId: string;

  @Column({
    name: 'email',
    type: 'varchar',
  })
  @Index()
  email: string;

  @Column({
    name: 'token',
    type: 'varchar',
    unique: true,
  })
  @Index({ unique: true })
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
    nullable: true,
  })
  ip: string;

  @Column({
    name: 'user_agent',
    type: 'varchar',
    nullable: true,
  })
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
}
