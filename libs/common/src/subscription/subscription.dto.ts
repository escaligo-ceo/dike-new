import { PlanKeys } from "./plan-type.enum.js";

export interface SubscriptionResponse {
  since: Date;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  planKey: PlanKeys;
}