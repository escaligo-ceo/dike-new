export enum PlanKeys {
  FREE = "FREE",
  BASE = "BASE",
  PROFESSIONAL = "PROFESSIONAL",
  ENTERPRISE = "ENTERPRISE",
}

export const PlanKeyLabels: Record<PlanKeys, string> = {
  [PlanKeys.FREE]: "Free",
  [PlanKeys.BASE]: "Base",
  [PlanKeys.PROFESSIONAL]: "Professional",
  [PlanKeys.ENTERPRISE]: "Enterprise",
};
