import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Template } from './template.entity';

export enum ResourceType {
  HTML = 'HTML',
  TEXT = 'TEXT',
  SUBJECT = 'SUBJECT',
}

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    description: 'Unique identifier for the resource',
  })
  id: string;

  @ManyToOne(() => Template, template => template.resources, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'template_id' })
  @ApiProperty({
    type: () => Template,
    description: 'Template to which this resource belongs',
  })
  template: Template;

  @Column({
    name: 'template_id',
    type: 'uuid',
  })
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    description: 'ID of the template',
  })
  templateId: string;

  @Column({
    name: 'type',
    type: 'enum',
    enum: ResourceType,
    comment: 'Tipo della risorsa (HTML, TEXT, SUBJECT)',
  })
  @ApiProperty({
    enum: ResourceType,
    enumName: 'ResourceType',
    description: 'Tipo della risorsa (HTML, TEXT, SUBJECT)',
  })
  type: ResourceType;

  @Column({
    name: 'name',
    type: 'varchar',
    comment: 'Logical name of the resource',
  })
  @ApiProperty({
    type: 'string',
    description: 'Logical name of the resource',
  })
  name: string;

  @Column({
    name: 'filename',
    type: 'varchar',
    comment: 'Filename where the resource is stored',
  })
  @ApiProperty({
    type: 'string',
    description: 'Filename where the resource is stored',
  })
  filename: string;

  @Column({
    name: 'deleted_at',
    type: 'timestamp',
    nullable: true
  })
  @ApiProperty({
    type: 'string',
    format: 'date-time',
    nullable: true,
    description: 'Soft delete timestamp',
  })
  deletedAt?: Date;

  softDelete(): void {
    this.deletedAt = new Date();
  }

  restore() {
    this.deletedAt = undefined;
  }
}
