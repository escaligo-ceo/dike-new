import { ApiProperty } from "@nestjs/swagger";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PlanFeature } from "./plan-feature.entity.js";
import { Subscription } from "./subscription.entity.js";

export const planTableName = "plans";
@Entity(planTableName)
export class Plan {
  @ApiProperty({
    description: "ID univoco del piano",
    example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  })
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ApiProperty({
    description: "Chiave univoca del piano",
    example: "pro",
  })
  @Column({ unique: true })
  key!: string;

  @ApiProperty({
    description: "Nome del piano",
    example: "Pro",
  })
  @Column()
  name!: string;

  @ApiProperty({
    description: "Descrizione del piano",
    example: "Piano Pro con funzionalità avanzate",
  })
  @Column()
  description!: string;

  @ApiProperty({
    description: "Prezzo mensile in euro",
    example: 9.99,
  })
  @Column("decimal", { name: "price_monthly", precision: 10, scale: 2, comment: "Prezzo mensile in euro" })
  priceMonthly!: number;

  @ApiProperty({
    description: "Prezzo annuale in euro (priceMonthly x 10)",
    example: 99.99,
  })
  @Column("decimal", { name: "price_yearly", precision: 10, scale: 2, comment: "Prezzo annuale in euro" })
  priceYearly!: number;

  @ApiProperty({
    description: "Data a partire dalla quale il piano può essere acquistato",
    example: "2024-01-01T00:00:00Z",
  })
  @Column({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
    comment: "Data a partire dalla quale il piano può essere acquistato",
    name: "since",
  })
  since!: Date;

  @Column({
    type: "timestamptz",
    nullable: true,
    comment: "Data oltre la quale il piano non può più essere acquistato",
    name: "to",
    default: null,
  })
  to?: Date | null;

  @OneToMany(() => PlanFeature, (planFeature) => planFeature.plan, {
    cascade: true,
  })
  features: PlanFeature[];

  @OneToMany(() => Subscription, (subscription) => subscription.plan)
  subscriptions: Subscription[];
}
