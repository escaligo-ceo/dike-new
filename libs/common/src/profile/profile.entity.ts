import { ApiProperty } from "@nestjs/swagger";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Plan } from "../subscription/plan.entity.js";
import { Membership } from "../tenant/membership.entity.js";
import { Tenant } from "../tenant/tenant.entity.js";
import { JobRole } from "./job-role.enum.js";

export const profileTableName = "profiles";

@Entity({
  name: profileTableName,
})
export class Profile {
  @PrimaryGeneratedColumn("uuid", { name: "id" })
  id!: string;

  @Column({
    type: "uuid",
    unique: true,
    name: "user_id",
  })
  userId!: string;

  @Column({ name: "tenant_id", type: "uuid", nullable: true })
  tenantId!: string | null;

  @Column({
    type: "varchar",
    nullable: true,
    default: null,
    name: "first_name",
  })
  firstName?: string;

  @Column({
    type: "varchar",
    nullable: true,
    default: null,
    name: "last_name",
  })
  lastName?: string;

  @Column({
    type: "varchar",
    nullable: true,
    default: null,
    name: "full_name",
  })
  fullName?: string | null;

  @Column({
    type: "varchar",
    nullable: true,
    default: null,
    name: "email",
  })
  email?: string;

  @Column({
    type: "varchar",
    nullable: true,
    default: null,
    name: "phone_number",
  })
  phoneNumber?: string;

  @Column({
    type: "varchar",
    nullable: true,
    default: null,
    name: "piva",
  })
  piva?: string;

  @Column({
    type: "date",
    nullable: true,
    default: null,
    name: "date_of_birth",
  })
  dateOfBirth?: Date;

  @Column({
    type: "varchar",
    nullable: true,
    default: null,
    name: "avatar_url",
  })
  avatarUrl?: string;

  @Column({
    type: "varchar",
    nullable: true,
    default: null,
    name: "background_url",
  })
  backgroundUrl?: string;

  @Column({
    type: "varchar",
    nullable: true,
    default: null,
    name: "bio",
  })
  bio?: string;

  @Column({
    type: "varchar",
    nullable: true,
    default: "/onboarding/user",
    name: "redirect_url",
  })
  redirectUrl?: string;

  /**
   * Codice numerico del ruolo professionale dell'utente (vedi enum JobRole).
   *
   * 0 = Avvocato, 1 = Praticante, 2 = Assistente, 3 = Amministratore di Sistema, 4 = Custom.
   */
  @Column({
    type: "int",
    nullable: true,
    default: null,
    name: "job_role",
    comment:
      "Codice numerico del ruolo professionale (0=Avvocato, 1=Praticante, 2=Assistente, 3=Amministratore di Sistema, 4=Custom)",
  })
  jobRole?: JobRole;

  /**
   * Etichetta/descrizione del ruolo professionale.
   *
   * - Se jobRole è CUSTOM (4), questo campo è obbligatorio e contiene il valore custom inserito dall'utente.
   * - Per gli altri ruoli, può essere null o valorizzato con la descrizione standard.
   */
  @Column({
    type: "varchar",
    nullable: true,
    name: "job_role_text",
  })
  jobRoleText?: string;

  @Column({
    type: "uuid",
    nullable: true,
    default: null,
    name: "plan_id",
    comment: "ID del piano/abbonamento attivo dell’utente",
  })
  planId?: string;

  /**
   * Relazione al piano/abbonamento attivo tramite la FK `plan_id`.
   */
  @ManyToOne(() => Plan, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "plan_id" })
  plan?: Plan;

  @Column({
    type: "int",
    nullable: true,
    default: null,
    name: "last_completed_on_boarding_step",
    comment:
      "Ultimo step numerico della procedura di onboarding completato con successo",
  })
  @ApiProperty({
    description:
      "Ultimo step numerico della procedura di onboarding completato con successo",
    example: 2,
    required: false,
    nullable: true,
  })
  lastCompletedOnBoardingStep?: number;

  @Column({
    type: "jsonb",
    nullable: true,
    default: () => "'{}'::jsonb",
    name: "visibility",
    comment:
      "Mappa delle impostazioni di visibilità per i campi del profilo (es. fullName, email, jobTitle)",
  })
  visibility?: Record<string, "public" | "tenant" | "team" | "private">;

  @OneToMany(() => Membership, (member) => member.profile)
  memberships: Membership[];

  // @ManyToOne(() => Tenant, { nullable: true, onDelete: "SET NULL" })
  // @JoinColumn({ name: "tenant_id" })
  // @ApiProperty({
  //   type: () => Tenant,
  //   nullable: true,
  //   description: "Tenant associato al profilo",
  // })
  // tenant!: Tenant;
}
