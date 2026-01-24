import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Invite } from './invite.entity.js';
import { Member } from './member.entity.js';
import { Team } from './team.entity.js';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Team, (team) => team.roles, { onDelete: 'CASCADE' })
  team: Team;

  @Column()
  name: string;

  @Column({ type: 'jsonb', default: [] })
  permissions: string[];

  @OneToMany(() => Member, (member) => member.role)
  members: Member[];

  @OneToMany(() => Invite, (invite) => invite.role)
  invites: Invite[];
}
