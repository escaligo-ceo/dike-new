import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Plan } from "./plan.entity.js";

export const featureTableName = "features";
@Entity(featureTableName)
export class Feature {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true })
  key!: string;

  @Column()
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string | null;

  @Column({ type: "int", name: "order", nullable: false })
  order!: number;

  @ManyToMany(() => Plan, (plan) => plan.features)
  @JoinTable({
    name: "plan_features",
    joinColumn: {
      name: "feature_id",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "plan_id",
      referencedColumnName: "id",
    },
  })
  plans: Plan[];
}
