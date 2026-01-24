import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { SubscriptionStatus } from "./subscription.enum.js";

type PlanChangeType = 'upgrade' | 'downgrade' | null | undefined;

export const subscriptionTableName = "subscriptions";
@Entity({ name: subscriptionTableName })
export class Subscription {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({
    name: "tenant_id",
    type: "uuid",
  })
  tenantId!: string;

  @Column({
    name: "plan_id",
    type: "uuid",
  })
  planId!: string;

  @ManyToOne("Plan", { onDelete: "SET NULL", nullable: true })
  @JoinColumn({ name: "plan_id" })
  plan?: any;

  @Column({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
    name: "since",
    comment: "Data di inizio dell'abbonamento",
  })
  since!: Date;

  @Column({
    type: "timestamptz",
    nullable: true,
    name: "to",
    comment: "Data di fine dell'abbonamento",
    default: null,
  })
  to?: Date | null;

  @Column({
    type: "varchar",
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
    name: "status",
    comment: "Stato dell'abbonamento",
  })
  status!: SubscriptionStatus;

  disable() {
    this.to = new Date();
  }

  get isActive(): boolean {
    return this.status === SubscriptionStatus.ACTIVE;
  }

  close() {
    this.to = new Date();
  }

  // lista dei piani in ordine crescente
  private static PLAN_ORDER = ['free', 'basic', 'pro', 'enterprise'];

  /**
   * Determina se la sottoscrizione può cambiare piano e di che tipo
   */
  canChangeTo(newPlanKey: string): PlanChangeType {
    const currentIndex = Subscription.PLAN_ORDER.indexOf(this.plan?.key);
    const newIndex = Subscription.PLAN_ORDER.indexOf(newPlanKey);

    if (newIndex === -1) return undefined; // piano inesistente
    if (newIndex === currentIndex) return null; // stesso piano
    if (newIndex > currentIndex) return 'upgrade'; // piano superiore
    if (newIndex < currentIndex) return 'downgrade'; // piano inferiore
  }
}
