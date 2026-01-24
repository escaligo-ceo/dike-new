import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('csv_mappings')
export class CsvMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  tenantId: string; // tenant di appartenenza

  @Column()
  entityType: string; // es.: "contact", "practice"

  @Column({ type: 'jsonb' })
  mapping: Record<string, string>; 
  // es.: { "first_name": "firstName", "mail": "email", "street_1": "addresses[0].street" }

  @Column({ default: false })
  isDefault: boolean; // indica se è la mappatura predefinita

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

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  @ApiProperty({
    type: "string",
    format: "date-time",
  })
  updatedAt!: Date;
}
